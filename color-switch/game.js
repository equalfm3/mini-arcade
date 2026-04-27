/* Color Switch — Main game logic

   Modules loaded before this file:
   - Config     (src/config.js)     — constants
   - Ball       (src/ball.js)       — ball physics & color
   - Obstacles  (src/obstacles.js)  — rotating rings, crosses, bars, stars
   - Renderer   (src/renderer.js)   — canvas drawing

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var best = loadHighScore('color-switch');
  var particles = Particles.create();
  var cameraY = 0;
  var time = 0;

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Tap for small hops, hold for bigger jumps',

    init: function () {
      Input.init();
      Input.actionBtn('TAP');
      Shell.setStat('best', best);
      Renderer.init();
    },

    reset: function () {
      score = 0;
      cameraY = 0;
      time = 0;
      Ball.reset();
      Obstacles.reset();
      particles.clear();
      Shell.setStat('score', 0);
    },

    update: function (dt) {
      // --- Input ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
      }

      // Variable-height jump: press = small hop, hold = bigger jump
      var jumpPressed = Input.pressed(' ') || Input.pressed('ArrowUp') || Input.tapped;
      var jumpHeld = Input.held(' ') || Input.held('ArrowUp');

      if (jumpPressed && Ball.alive) {
        Ball.jumpStart();
        Audio8.play('click');
      } else if (jumpHeld && Ball.alive) {
        Ball.jumpHold(dt);
      }

      // Release detection: if not holding anymore, end the boost
      if (!jumpHeld && !Input.tapped) {
        Ball.jumpRelease();
      }

      time += dt;

      if (!Ball.alive) {
        Input.endFrame();
        return;
      }

      // --- Update ---
      Ball.update(dt);

      // Camera follows ball upward (only moves up, never down)
      var targetCamY = Ball.y - Config.canvasH * Config.cameraOffset;
      if (targetCamY < cameraY) {
        cameraY += (targetCamY - cameraY) * Config.cameraSmooth * dt;
      }

      Obstacles.update(dt, cameraY);

      // --- Collision ---
      var result = Obstacles.checkCollision(Ball.x, Ball.y, Ball.colorIndex);

      if (result === 'die') {
        Ball.die();
        Audio8.play('gameover');
        particles.emit(Ball.x, Ball.y - cameraY, {
          count: 20,
          colors: Config.colors,
          speed: 150,
          life: 0.7,
          size: 4,
        });
        if (saveHighScore('color-switch', score)) {
          best = score;
          Shell.setStat('best', best);
        }
        game.gameOver('Score: ' + score);
      } else if (result === 'pass') {
        score += Config.pointsPerObstacle;
        Shell.setStat('score', score);
        Audio8.play('score');
      } else if (result === 'star') {
        Ball.switchColor();
        Audio8.play('click');
        particles.emit(Ball.x, Ball.y - cameraY, {
          count: 12,
          colors: Config.colors,
          speed: 80,
          life: 0.4,
          size: 3,
        });
      }

      // --- Fall detection: if ball falls below camera view ---
      if (Ball.y > cameraY + Config.canvasH + 50) {
        Ball.die();
        Audio8.play('gameover');
        if (saveHighScore('color-switch', score)) {
          best = score;
          Shell.setStat('best', best);
        }
        game.gameOver('Score: ' + score);
      }

      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      // Background
      Renderer.drawBackground(ctx, cameraY);

      // Obstacles
      Renderer.drawObstacles(ctx, cameraY);

      // Color switch stars
      Renderer.drawStars(ctx, cameraY, time);

      // Ball
      Renderer.drawBall(ctx, Ball.x, Ball.y, cameraY, Ball.colorIndex);

      // Particles
      particles.draw(ctx);
    },
  });

  game.start();

})();
