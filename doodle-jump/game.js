/* Doodle Jump — Main game logic

   Modules loaded before this file:
   - Config     (src/config.js)     — constants
   - Player     (src/player.js)     — player physics
   - Platforms   (src/platforms.js)  — platform types & generation
   - Camera     (src/camera.js)     — vertical scrolling
   - Renderer   (src/renderer.js)   — background drawing

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var best = loadHighScore('doodle-jump');
  var particles = Particles.create();

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Arrow keys to move, bounce to climb!',

    init: function () {
      Input.init();
      Input.dpad();
      Shell.setStat('best', best);
      Renderer.init();
    },

    reset: function () {
      score = 0;
      Player.reset();
      Platforms.reset();
      Platforms.generateInitial();
      Camera.reset();
      particles.clear();
      Shell.setStat('score', 0);
    },

    update: function (dt) {
      // --- Input ---
      if (Input.pressed('Escape') || Input.pressed('p')) game.togglePause();

      // --- Update player ---
      Player.update(dt);

      // --- Update platforms ---
      Platforms.update(dt);

      // --- Platform collision (only when falling) ---
      if (Player.vy >= 0) {
        var plats = Platforms.list;
        for (var i = 0; i < plats.length; i++) {
          var p = plats[i];
          if (p.broken) continue;

          if (Player.checkPlatformCollision(p.x, p.y, p.w, p.h)) {
            switch (p.type) {
              case Platforms.BREAKING:
                // Land on it, then it breaks
                Player.bounce(Config.jumpForce);
                Platforms.breakPlatform(i);
                Audio8.play('hit');
                particles.emit(p.x + p.w / 2, p.y, {
                  count: 8,
                  color: Config.breakingBroken,
                  speed: 60,
                  life: 0.4,
                  size: 3,
                  gravity: 300,
                });
                break;

              case Platforms.SPRING:
                Player.bounce(Config.springForce);
                Audio8.play('score');
                particles.emit(Player.x, p.y, {
                  count: 10,
                  color: Config.springColor,
                  speed: 100,
                  life: 0.5,
                  size: 2,
                });
                break;

              default:
                // Normal and moving
                Player.bounce(Config.jumpForce);
                Audio8.play('move');
                break;
            }
            break; // only collide with one platform per frame
          }
        }
      }

      // --- Camera ---
      Camera.update(Player.y);

      // --- Score ---
      var newScore = Camera.getScore();
      if (newScore > score) {
        score = newScore;
        Shell.setStat('score', score);
      }

      // --- Fall detection ---
      if (Camera.isPlayerBelow(Player.y)) {
        Audio8.play('gameover');
        if (saveHighScore('doodle-jump', score)) {
          best = score;
          Shell.setStat('best', best);
        }
        game.gameOver('Score: ' + score);
      }

      // --- Particles ---
      particles.update(dt);

      Input.endFrame();
    },

    draw: function (ctx) {
      // Background
      Renderer.drawBackground(ctx, Camera.y);

      // Height markers
      Renderer.drawHeightMarkers(ctx, Camera.y);

      // Platforms
      Platforms.draw(ctx, Camera.y);

      // Player
      Player.draw(ctx, Camera.y);

      // Particles
      particles.draw(ctx);
    },
  });

  game.start();

})();
