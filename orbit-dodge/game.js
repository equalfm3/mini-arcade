/* Orbit Dodge — Main game logic

   Modules loaded before this file:
   - Config       (src/config.js)       — orbit rings, player, obstacle constants
   - Player       (src/player.js)       — circular motion, direction reversal, orbit hopping
   - Obstacles    (src/obstacles.js)    — projectiles, arcs (per-orbit), stars
   - Renderer     (src/renderer.js)     — orbit rings, player, obstacles, effects

   Controls:
   - Space / Tap: reverse orbit direction
   - Up / Down arrows: hop between inner and outer orbit rings
*/

(function () {

  var score = 0;
  var best = loadHighScore('orbit-dodge');
  var particles = Particles.create();
  var gameTime = 0;
  var scoreFloat = 0;

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Space to reverse, Up/Down to hop orbits',

    init: function () {
      Input.init();
      Input.actionBtn('FLIP');
      Shell.setStat('best', best);
    },

    reset: function () {
      score = 0;
      scoreFloat = 0;
      particles.clear();
      Player.reset();
      Obstacles.reset();
      Renderer.reset();
      Shell.setStat('score', 0);
    },

    update: function (dt) {
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      gameTime += dt;

      // --- Input ---
      // Reverse direction: Space or tap
      if (Input.pressed(' ') || Input.tapped) {
        Player.reverseDirection();
        Audio8.play('click');
      }

      // Hop orbits: Up = outer, Down = inner, Left/Right also hop
      if (Input.pressed('ArrowUp')) {
        Player.hopToOrbit(1); // outer
        Audio8.note(400, 0.08, 'sine', 0.1);
      }
      if (Input.pressed('ArrowDown')) {
        Player.hopToOrbit(0); // inner
        Audio8.note(250, 0.08, 'sine', 0.1);
      }
      if (Input.pressed('ArrowLeft') || Input.pressed('ArrowRight')) {
        Player.hopOrbit(); // toggle
        Audio8.note(320, 0.08, 'sine', 0.1);
      }
      // Swipe up/down for mobile
      if (Input.dir === 'up') {
        Player.hopToOrbit(1);
        Audio8.note(400, 0.08, 'sine', 0.1);
      }
      if (Input.dir === 'down') {
        Player.hopToOrbit(0);
        Audio8.note(250, 0.08, 'sine', 0.1);
      }

      // --- Update ---
      Player.update(dt);
      Obstacles.update(dt);

      // --- Collision ---
      var collision = Obstacles.checkCollision(
        Player.x, Player.y, Player.angle,
        Player.orbitIndex, Player.radius
      );

      if (collision) {
        if (collision.type === 'hit') {
          Player.kill();
          Audio8.play('hit');
          Audio8.play('gameover');
          Renderer.triggerFlash();

          particles.emit(Player.x, Player.y, {
            count: 20,
            colors: [Config.playerColor, '#ffffff', '#88ccff'],
            speed: 150,
            life: 0.8,
            size: 3,
          });

          var finalScore = Math.floor(score);
          if (saveHighScore('orbit-dodge', finalScore)) {
            best = finalScore;
            Shell.setStat('best', best);
          }
          game.gameOver('Score: ' + finalScore);
          Input.endFrame();
          return;
        } else if (collision.type === 'star') {
          score += Config.starPoints;
          Audio8.play('score');
          Shell.toast('+' + Config.starPoints);
          particles.emit(collision.x, collision.y, {
            count: 10,
            colors: [Config.starColor, '#ffffff', '#ffdd44'],
            speed: 100,
            life: 0.5,
            size: 2,
          });
        }
      }

      // --- Score ---
      scoreFloat += Config.scorePerSecond * dt;
      score = Math.floor(scoreFloat);
      Shell.setStat('score', score);

      Renderer.updateEffects(dt);
      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w;
      var h = game.h;

      Renderer.drawBackground(ctx, w, h, gameTime);
      Renderer.drawScore(ctx, w, h, Math.floor(score));
      Renderer.drawOrbitRing(ctx);
      Renderer.drawStars(ctx, gameTime);
      Renderer.drawArcs(ctx);
      Renderer.drawProjectiles(ctx);
      Renderer.drawPlayer(ctx, Player);
      particles.draw(ctx);
      Renderer.drawScreenFlash(ctx, w, h);
    },
  });

  game.start();

})();
