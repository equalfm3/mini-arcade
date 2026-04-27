/* Whack-a-Mole — Main game orchestrator

   Modules loaded before this file:
   - Config    (src/config.js)    — grid size, timing, scoring
   - Moles     (src/moles.js)     — mole spawn logic, whack detection
   - Renderer  (src/renderer.js)  — DOM hole grid, mole animations

   Shared globals available:
   - Engine, Input, Shell, Audio8, Timer, etc.

   This is a DOM game — no canvas needed.
   Engine is used without a canvas option to get the shared
   state machine, pause/resume, restart, and overlay management.
   Uses Timer.countdown for the 30-second round timer.
*/

(function () {

  var score = 0;
  var best = loadHighScore('whack-a-mole');
  var combo = 0;
  var lastHitTime = 0;
  var timer = null;
  var comboEl = null;

  function onHoleClick(index) {
    if (!game.is('playing')) return;

    var result = Moles.whack(index);

    if (result.hit) {
      var typeInfo = Config.moleTypes[result.type];
      var now = performance.now() / 1000;

      // Combo tracking
      if (result.type !== 'bomb' && (now - lastHitTime) < Config.comboWindow) {
        combo = Math.min(combo + 1, Config.maxCombo);
      } else {
        combo = result.type === 'bomb' ? 0 : 1;
      }
      lastHitTime = now;

      // Calculate points with combo multiplier
      var points = typeInfo.points;
      if (result.type !== 'bomb' && combo > 1) {
        var multiplier = 1 + (combo - 1) * Config.comboMultiplier;
        points = Math.round(points * multiplier);
      }

      score = Math.max(0, score + points);
      Shell.setStat('score', score);

      // Visual feedback
      var scoreText = (points >= 0 ? '+' : '') + points;
      Renderer.showScore(index, scoreText, result.type);

      // Combo display
      if (comboEl) {
        if (combo > 1 && result.type !== 'bomb') {
          comboEl.textContent = combo + 'x Combo!';
        } else {
          comboEl.textContent = '';
        }
      }

      // Sound
      if (result.type === 'bomb') {
        Audio8.play('hit');
      } else if (result.type === 'golden') {
        Audio8.play('win');
      } else {
        Audio8.play('score');
      }
    }
  }

  function endGame() {
    Audio8.play('gameover');

    var isNewBest = false;
    if (saveHighScore('whack-a-mole', score)) {
      best = score;
      isNewBest = true;
    }

    game.gameOver('Score: ' + score + (isNewBest ? ' ★ New Best!' : ''));
  }

  // --- Engine setup (no canvas) ---
  var game = Engine.create({
    startHint: 'Tap moles before they hide!',

    init: function () {
      Input.init();
    },

    reset: function () {
      score = 0;
      combo = 0;
      lastHitTime = 0;

      Shell.setStat('score', 0);
      Shell.setStat('time', Config.roundDuration);

      Moles.reset();
      Renderer.build(Shell.area, onHoleClick);

      // Add combo display inside the grid (positioned absolutely)
      comboEl = document.createElement('div');
      comboEl.className = 'combo-display';
      Renderer.gridEl.appendChild(comboEl);

      // Start countdown timer
      if (timer) timer.reset();
      timer = Timer.countdown(Config.roundDuration, function (remaining) {
        Shell.setStat('time', remaining);
        if (remaining <= 5 && remaining > 0) {
          Audio8.play('tick');
        }
      }, function () {
        endGame();
      });
      timer.start();
    },

    update: function (dt) {
      // Pause
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // Update mole logic
      Moles.update(dt);

      // Update DOM
      Renderer.update();

      Input.endFrame();
    },

    onStateChange: function (from, to) {
      // Pause/resume the countdown timer alongside Engine state
      if (to === 'paused' && timer) {
        timer.pause();
      }
      if (to === 'playing' && from === 'paused' && timer) {
        timer.start();
      }
    },
  });

  game.start();

})();
