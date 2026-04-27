/* Fruit Ninja — Main game logic

   Modules loaded before this file:
   - Config     (src/config.js)     — constants
   - Fruits     (src/fruits.js)     — fruit spawning, arc trajectory, slicing
   - Blade      (src/blade.js)      — swipe trail, slice detection
   - Renderer   (src/renderer.js)   — drawing fruits, halves, blade, background

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var best = loadHighScore('fruit-ninja');
  var lives = Config.lives;
  var particles = Particles.create();
  var combo = 0;
  var comboTimer = 0;
  var swipeSlices = 0;   // slices in current swipe
  var wasSwiping = false;

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Swipe across fruits to slice them — avoid bombs!',

    init: function () {
      Input.init();
      Shell.setStat('best', best);
      Blade.init(game.canvas);
    },

    reset: function () {
      score = 0;
      lives = Config.lives;
      combo = 0;
      comboTimer = 0;
      swipeSlices = 0;
      wasSwiping = false;
      Fruits.reset();
      Blade.reset();
      particles.clear();
      Shell.setStat('score', 0);
      Shell.setStat('lives', lives);
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
      }

      // --- Update blade trail ---
      Blade.update(dt);

      // --- Update fruits ---
      Fruits.update(dt, score);

      // --- Slice detection ---
      if (Blade.swiping) {
        var fruits = Fruits.active;
        for (var i = fruits.length - 1; i >= 0; i--) {
          var f = fruits[i];
          if (f.sliced) continue;

          if (Blade.checkSlice(f.x, f.y, f.radius)) {
            if (f.type === 'bomb') {
              // Hit a bomb — lose a life
              f.sliced = true;
              lives--;
              Shell.setStat('lives', lives);
              Audio8.play('hit');
              particles.emit(f.x, f.y, {
                count: 15,
                colors: ['#ff4444', '#ff8844', '#333333'],
                speed: 180,
                life: 0.6,
                size: 5,
                gravity: 200,
              });
              if (lives <= 0) {
                endGame();
                Input.endFrame();
                return;
              }
            } else {
              // Slice a fruit
              Fruits.slice(f);
              score += Config.pointsPerFruit;
              swipeSlices++;
              Shell.setStat('score', score);
              Audio8.play('score');

              // Juice particles
              particles.emit(f.x, f.y, {
                count: Config.juiceCount,
                color: f.body,
                colors: [f.body, f.highlight, f.dark],
                speed: Config.juiceSpeed,
                life: Config.juiceLife,
                size: Config.juiceSize,
                gravity: 300,
              });
            }
          }
        }

        // Play whoosh sound periodically while swiping
        if (!wasSwiping) {
          Audio8.play('whoosh');
        }
      }

      // --- Combo tracking ---
      // When swipe ends, check if we got a combo
      if (wasSwiping && !Blade.swiping) {
        if (swipeSlices >= Config.comboMinCount) {
          combo = swipeSlices;
          comboTimer = 1.5;
          score += Config.comboBonus * (swipeSlices - Config.comboMinCount + 1);
          Shell.setStat('score', score);
          Audio8.play('clear');
          Shell.toast(swipeSlices + 'x Combo! +' + (Config.comboBonus * (swipeSlices - Config.comboMinCount + 1)));
        }
        swipeSlices = 0;
      }
      wasSwiping = Blade.swiping;

      // Combo display timer
      if (comboTimer > 0) {
        comboTimer -= dt;
      }

      // --- Check missed fruits ---
      var missed = Fruits.collectMissed();
      for (var m = 0; m < missed.length; m++) {
        lives--;
        Shell.setStat('lives', lives);
        if (lives <= 0) {
          endGame();
          Input.endFrame();
          return;
        }
      }

      // --- Update particles ---
      particles.update(dt);

      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w;
      var h = game.h;

      // Background
      Renderer.drawBackground(ctx, w, h);

      // Sliced halves (behind active fruits)
      Renderer.drawHalves(ctx);

      // Active fruits
      Renderer.drawFruits(ctx);

      // Particles (juice splashes)
      particles.draw(ctx);

      // Blade trail
      Renderer.drawBlade(ctx);

      // Lives (hearts)
      Renderer.drawLives(ctx, lives, Config.lives);

      // Combo text
      Renderer.drawCombo(ctx, combo, comboTimer);
    },
  });

  function endGame() {
    if (saveHighScore('fruit-ninja', score)) {
      best = score;
      Shell.setStat('best', best);
    }
    Audio8.play('gameover');
    game.gameOver('Score: ' + score);
  }

  game.start();

})();
