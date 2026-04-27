/* Color Flood — Main game orchestrator

   Modules loaded before this file:
   - Config    (src/config.js)   — grid size, colors, max moves
   - Board     (src/board.js)    — grid state, flood fill BFS, territory
   - Renderer  (src/renderer.js) — DOM grid, color picker, progress bar

   Shared globals available:
   - Engine, Input, Shell, Audio8, etc.

   This is a DOM game — Engine.create() without canvas provides
   state machine, pause/resume/restart, and overlay management.
*/

(function () {

  var streak = 0;
  var bestStreak = parseInt(localStorage.getItem(Config.streakKey)) || 0;
  var gameActive = false;

  function onColorPick(colorIndex) {
    if (!game.is('playing')) return;
    if (!gameActive) return;
    if (Renderer.isAnimating()) return;

    var currentColor = Board.getTerritoryColor();
    if (colorIndex === currentColor) return;

    Audio8.play('click');

    var result = Board.flood(colorIndex);
    if (!result) return;

    // Update HUD
    Shell.setStat('moves', Board.moves + '/' + Config.maxMoves);

    // Animate the flood
    var absorbed = result.newCells.length;

    // Play appropriate sound for absorption
    if (absorbed >= 10) {
      Audio8.play('clear');
    } else if (absorbed > 0) {
      Audio8.play('score');
    }

    Renderer.animateFlood(result.waves, colorIndex, function () {
      // After animation completes, update everything
      Renderer.updateAll();
      Shell.setStat('cells', Board.territorySize + '/' + Config.totalCells);

      if (result.won) {
        handleWin();
      } else if (result.lost) {
        handleLoss();
      }
    });

    // Immediately update the territory cells (they already changed in Board)
    // The animation handles the newly absorbed cells
    Renderer.updatePicker();
  }

  function handleWin() {
    gameActive = false;
    streak++;

    // Save streak
    if (streak > bestStreak) {
      bestStreak = streak;
      localStorage.setItem(Config.streakKey, bestStreak);
    }

    Shell.setStat('streak', streak);
    Audio8.play('win');

    var movesUsed = Board.moves;
    var scoreText = 'Flooded in ' + movesUsed + '/' + Config.maxMoves + ' moves';

    Renderer.setStatus('Board flooded!', 'win');
    Renderer.disablePicker();

    setTimeout(function () {
      game.win(scoreText + ' · Streak ' + streak);
    }, 1200);
  }

  function handleLoss() {
    gameActive = false;
    streak = 0;
    Shell.setStat('streak', 0);

    var pct = Math.round((Board.territorySize / Config.totalCells) * 100);
    Audio8.play('gameover');

    Renderer.setStatus('Out of moves!', 'lose');
    Renderer.disablePicker();

    setTimeout(function () {
      game.gameOver(pct + '% flooded · Best streak ' + bestStreak);
    }, 1000);
  }

  // --- Engine setup (no canvas — DOM game) ---
  var game = Engine.create({
    startHint: 'Pick colors to flood the board from the top-left corner',

    init: function () {
      Input.init();
    },

    reset: function () {
      gameActive = true;
      Board.reset();
      Renderer.build(Shell.area, onColorPick);
      Renderer.updateAll();

      Shell.setStat('moves', '0/' + Config.maxMoves);
      Shell.setStat('cells', Board.territorySize + '/' + Config.totalCells);
      Shell.setStat('streak', streak);
    },

    update: function (dt) {
      // Pause / restart via Esc or P
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // Keyboard shortcuts for color picking (1-6)
      if (gameActive && !Renderer.isAnimating()) {
        for (var i = 1; i <= Config.colors.length; i++) {
          if (Input.pressed(String(i))) {
            onColorPick(i - 1);
            break;
          }
        }
      }

      Input.endFrame();
    },
  });

  game.start();

})();
