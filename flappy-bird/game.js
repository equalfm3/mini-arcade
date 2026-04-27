/* Flappy Bird — Main game logic

   Modules loaded before this file:
   - Config    (src/config.js)    — constants
   - Bird      (src/bird.js)      — bird entity
   - Pipes     (src/pipes.js)     — pipe pairs
   - Renderer  (src/renderer.js)  — background & ground

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var best = loadHighScore('flappy-bird');
  var particles = Particles.create();
  var groundOffset = 0;

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Tap or press Space to flap',

    init: function () {
      Input.init();
      Shell.setStat('best', best);
      Renderer.init();
      // Tap on canvas to flap
      if (game.canvas) {
        game.canvas.addEventListener('click', function () {
          if (Bird.alive && game.is('playing')) {
            Bird.flap();
            Audio8.play('whoosh');
          }
        });
      }
    },

    reset: function () {
      score = 0;
      groundOffset = 0;
      Bird.reset();
      Pipes.reset();
      particles.clear();
      Shell.setStat('score', 0);
    },

    update: function (dt) {
      // Flap input
      if (Input.tapped || Input.pressed(' ') || Input.pressed('ArrowUp')) {
        if (Bird.alive) {
          Bird.flap();
          Audio8.play('whoosh');
        }
      }
      if (Input.pressed('Escape') || Input.pressed('p')) game.togglePause();

      if (!Bird.alive) {
        // Death animation: bird falls, then game over
        Bird.update(dt);
        particles.update(dt);
        // Bird is clamped at ground level by Bird.update — check if it reached the clamp
        var maxY = Config.canvasH - Config.groundH - Config.birdSize;
        if (Bird.y >= maxY) {
          if (saveHighScore('flappy-bird', score)) {
            best = score;
            Shell.setStat('best', best);
          }
          game.gameOver('Score: ' + score);
        }
        Input.endFrame();
        return;
      }

      // Update
      Bird.update(dt);
      Pipes.update(dt);
      groundOffset = (groundOffset + Config.pipeSpeed * dt) % 24;

      // Collision — pipes, ground, ceiling
      var hitbox = Bird.getHitbox();
      var hitGround = hitbox.y + hitbox.r >= Config.canvasH - Config.groundH;
      var hitCeiling = hitbox.y - hitbox.r <= 0;
      var hitPipe = Pipes.checkCollision(hitbox);

      if (hitPipe || hitGround || hitCeiling) {
        Bird.die();
        Audio8.play('hit');
        particles.emit(Config.birdX, Bird.y, {
          count: 15, colors: [Config.birdBody, Config.birdWing, '#fff'], speed: 120, life: 0.6
        });
      }

      // Score
      var scored = Pipes.checkScore(Config.birdX);
      if (scored > 0) {
        score += scored * Config.pointsPerPipe;
        Shell.setStat('score', score);
        Audio8.play('score');
      }

      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      Renderer.drawBackground(ctx);
      Pipes.draw(ctx);
      Bird.draw(ctx);
      particles.draw(ctx);
      Renderer.drawGround(ctx, groundOffset);
    },
  });

  game.start();

})();
