/* Endless Runner — Main game logic

   Modules loaded before this file:
   - Config     (src/config.js)     — constants
   - Player     (src/player.js)     — run/jump/duck states, physics
   - Obstacles  (src/obstacles.js)  — obstacle spawning, scrolling, collision
   - Ground     (src/ground.js)     — scrolling ground + parallax background
   - Renderer   (src/renderer.js)   — pixel art drawing

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var best = loadHighScore('endless-runner');
  var particles = Particles.create();
  var speed = Config.baseSpeed;
  var playTime = 0;
  var lastMilestone = 0;
  var duckHeld = false;

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Space / Up to jump, Down to duck',

    init: function () {
      Input.init();
      Input.actionBtn('JUMP');
      Shell.setStat('best', best);
      Ground.init();

      // Tap on canvas to jump
      if (game.canvas) {
        game.canvas.addEventListener('click', function () {
          if (Player.alive && game.is('playing')) {
            if (Player.jump()) {
              Audio8.play('move');
            }
          }
        });
      }
    },

    reset: function () {
      score = 0;
      speed = Config.baseSpeed;
      playTime = 0;
      lastMilestone = 0;
      duckHeld = false;
      Player.reset();
      Obstacles.reset();
      Ground.reset();
      particles.clear();
      Shell.setStat('score', 0);
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
      }

      if (!Player.alive) {
        particles.update(dt);
        Input.endFrame();
        return;
      }

      // --- Input ---
      // Jump
      if (Input.pressed(' ') || Input.pressed('ArrowUp') || Input.tapped) {
        if (Player.jump()) {
          Audio8.play('move');
        }
      }

      // Duck (hold)
      var duckDown = Input.held('ArrowDown') || Input.dir === 'down';
      if (duckDown && !duckHeld) {
        Player.duck();
        duckHeld = true;
      } else if (!duckDown && duckHeld) {
        Player.unduck();
        duckHeld = false;
      }

      // --- Update speed ---
      playTime += dt;
      speed = Math.min(Config.maxSpeed, Config.baseSpeed + playTime * Config.speedIncrement);

      // --- Update entities ---
      Player.update(dt);
      Obstacles.update(dt, speed);
      Ground.update(dt, speed);

      // --- Collision ---
      var hitbox = Player.getHitbox();
      var hitObs = Obstacles.checkCollision(hitbox);
      if (hitObs) {
        Player.die();
        Audio8.play('hit');
        particles.emit(hitbox.x + hitbox.w / 2, hitbox.y + hitbox.h / 2, {
          count: 20,
          colors: [Config.playerBody, Config.playerDark, '#ff4444'],
          speed: 120,
          life: 0.6,
        });
        if (saveHighScore('endless-runner', score)) {
          best = score;
          Shell.setStat('best', best);
        }
        Audio8.play('gameover');
        game.gameOver('Score: ' + score);
        Input.endFrame();
        return;
      }

      // --- Score ---
      score = Math.floor(playTime * Config.scoreRate * (speed / Config.baseSpeed));
      Shell.setStat('score', score);

      // Milestone sound
      var milestone = Math.floor(score / Config.milestoneInterval);
      if (milestone > lastMilestone) {
        lastMilestone = milestone;
        Audio8.play('score');
        Shell.toast(score + '!');
      }

      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w;
      var h = game.h;

      // Background (sky, stars, mountains, hills, clouds)
      Renderer.drawBackground(ctx, w, h);

      // Ground
      Renderer.drawGround(ctx, w);

      // Obstacles
      Renderer.drawObstacles(ctx);

      // Player
      Renderer.drawPlayer(ctx);

      // Particles
      particles.draw(ctx);

      // Night overlay
      Renderer.drawNightOverlay(ctx, w, h);
    },
  });

  game.start();

})();
