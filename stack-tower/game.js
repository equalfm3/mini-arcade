/* Stack Tower — Main game logic

   Modules loaded before this file:
   - Config    (src/config.js)    — constants
   - Blocks    (src/blocks.js)    — block stack, sliding, overhang
   - Renderer  (src/renderer.js)  — isometric drawing, camera

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var best = loadHighScore('stack-tower');
  var particles = Particles.create();
  var cameraY = 0;
  var perfectAlpha = 0;
  var perfectText = '';

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Tap or press Space to stack',

    init: function () {
      Input.init();
      Input.actionBtn('TAP');
      Shell.setStat('best', best);
      Renderer.init();
    },

    reset: function () {
      score = 0;
      cameraY = 0;
      perfectAlpha = 0;
      perfectText = '';
      Blocks.reset();
      particles.clear();
      Shell.setStat('score', 0);

      // Spawn first sliding block
      Blocks.spawnBlock();
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
      }

      // --- Place block on tap/space ---
      if (Input.tapped || Input.pressed(' ')) {
        if (Blocks.current) {
          var result = Blocks.place();

          if (result === 'miss') {
            // Game over
            Audio8.play('gameover');
            score = Blocks.score;
            if (saveHighScore('stack-tower', score)) {
              best = score;
              Shell.setStat('best', best);
            }
            game.gameOver('Score: ' + score);
            Input.endFrame();
            return;
          }

          if (result === 'perfect') {
            Audio8.play('score');
            perfectText = 'PERFECT!';
            perfectAlpha = 1;
            var top = Blocks.stack[Blocks.stack.length - 1];
            particles.emit(top.x + top.w / 2, top.y + cameraY, {
              count: 16,
              colors: [Config.perfectColor, '#ffffff', Config.accentColor],
              speed: 100,
              life: 0.6,
              size: 3,
            });
            if (Blocks.perfectCount >= 3) {
              Shell.toast(Blocks.perfectCount + 'x Perfect!');
            }
          } else {
            // Normal placement
            Audio8.play('move');
          }

          // Update score
          score = Blocks.score;
          Shell.setStat('score', score);

          // Spawn next block
          Blocks.spawnBlock();
        }
      }

      // --- Update sliding block ---
      Blocks.update(dt);

      // --- Camera: scroll up to keep top of tower visible ---
      if (Blocks.stack.length > Config.cameraBlockThreshold) {
        var topBlock = Blocks.stack[Blocks.stack.length - 1];
        var targetY = -(topBlock.y - Config.canvasH * 0.55);
        if (targetY > cameraY) {
          cameraY += (targetY - cameraY) * Config.cameraSmooth * dt;
        }
      }

      // --- Perfect text fade ---
      if (perfectAlpha > 0) {
        perfectAlpha -= dt * 1.5;
        if (perfectAlpha < 0) perfectAlpha = 0;
      }

      // --- Particles ---
      particles.update(dt);

      Input.endFrame();
    },

    draw: function (ctx) {
      // Background
      Renderer.drawBackground(ctx, cameraY);

      // Large score watermark
      Renderer.drawScore(ctx, score);

      // Tower stack
      Renderer.drawStack(ctx, cameraY);

      // Current sliding block
      Renderer.drawCurrent(ctx, cameraY);

      // Falling overhang pieces
      Renderer.drawFallingPieces(ctx, cameraY);

      // Perfect text
      Renderer.drawPerfectText(ctx, perfectText, perfectAlpha);

      // Particles
      particles.draw(ctx);
    },
  });

  game.start();

})();
