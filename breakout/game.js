/* Breakout — Main game logic

   Modules loaded before this file:
   - Config    (src/config.js)    — constants
   - Paddle    (src/paddle.js)    — paddle entity
   - Ball      (src/ball.js)      — ball entity
   - Bricks    (src/bricks.js)    — brick grid
   - Renderer  (src/renderer.js)  — background rendering

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var lives = 0;
  var best = loadHighScore('breakout');
  var particles = Particles.create();

  // --- Engine setup ---
  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Click or tap to launch ball',

    init: function () {
      Input.init();
      Input.actionBtn('LAUNCH');
      Paddle.initPointerTracking(game.canvas);
    },

    reset: function () {
      score = 0;
      lives = Config.lives;
      Paddle.reset();
      Ball.reset();
      Bricks.reset();
      particles.clear();
      Shell.setStat('score', 0);
      Shell.setStat('lives', lives);
    },

    update: function (dt) {
      // --- Input ---
      if (Input.pressed('Escape') || Input.pressed('p')) game.togglePause();

      // --- Paddle ---
      Paddle.update(dt);

      // --- Launch ball ---
      if (!Ball.active) {
        if (Input.tapped || Input.pressed(' ')) {
          Ball.launch();
        }
      }

      // --- Ball movement ---
      var ballResult = Ball.update(dt);

      if (ballResult === 'lost') {
        lives--;
        Shell.setStat('lives', lives);
        Audio8.play('hit');
        particles.emit(Ball.x, Ball.y, {
          count: 15,
          colors: [Config.ballColor, Config.paddleColor, '#ff4444'],
          speed: 100,
          life: 0.6,
        });

        if (lives <= 0) {
          Audio8.play('gameover');
          if (saveHighScore('breakout', score)) {
            best = score;
          }
          game.gameOver('Score: ' + score);
          return;
        }

        Ball.reset();
      }

      // --- Ball-paddle collision ---
      if (Ball.active) {
        var ballRect = Ball.getRect();
        var paddleRect = Paddle.getRect();

        if (collides(ballRect, paddleRect) && ballRect.y + ballRect.h > paddleRect.y) {
          // Only bounce if ball is moving downward
          var ballCenterY = ballRect.y + ballRect.h / 2;
          if (ballCenterY < paddleRect.y + paddleRect.h / 2) {
            // Calculate hit position (0.0 = left edge, 1.0 = right edge)
            var ballCenterX = ballRect.x + ballRect.w / 2;
            var hitPos = (ballCenterX - paddleRect.x) / paddleRect.w;
            hitPos = clamp(hitPos, 0, 1);

            // Map to angle: 150° (left) to 30° (right)
            var angle = Config.reflectAngleMax - hitPos * (Config.reflectAngleMax - Config.reflectAngleMin);

            // Set velocity based on angle and current speed
            var spd = Ball.speed;
            Ball.setVelocity(Math.cos(angle) * spd, -Math.sin(angle) * spd);

            Audio8.play('move');
          }
        }
      }

      // --- Ball-brick collision ---
      if (Ball.active) {
        var result = Bricks.checkCollision(Ball.getRect());
        if (result.hit) {
          // Bounce ball based on collision side
          if (result.side === 'left' || result.side === 'right') {
            Ball.bounceX();
          } else {
            Ball.bounceY();
          }

          // Score
          score += result.brick.points;
          Shell.setStat('score', score);
          Audio8.play('score');

          // Speed up
          Ball.increaseSpeed();

          // Particles at brick center
          var bk = result.brick;
          particles.emit(bk.x + bk.w / 2, bk.y + bk.h / 2, {
            count: 8,
            color: bk.color,
            speed: 80,
            life: 0.4,
            size: 3,
          });

          // Check win
          if (Bricks.remaining === 0) {
            Audio8.play('win');
            if (saveHighScore('breakout', score)) {
              best = score;
            }
            game.win('Score: ' + score);
            return;
          }
        }
      }

      // --- Animate ---
      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      Renderer.drawBackground(ctx);
      Bricks.draw(ctx);
      Paddle.draw(ctx);
      Ball.draw(ctx);
      particles.draw(ctx);
    },
  });

  game.start();

})();
