/* Minesweeper — Main game orchestrator

   Modules loaded before this file:
   - Config    (src/config.js)   — difficulty presets, constants
   - Board     (src/board.js)    — mine placement, reveal, flood fill
   - Renderer  (src/renderer.js) — DOM grid rendering

   Shared globals available:
   - Shell, Audio8, Timer, etc.

   This is a DOM game — no Engine.create with canvas.
*/

(function () {

  var difficulty = Config.defaultDifficulty;
  var timer = null;
  var flagMode = false;
  var gameActive = false;
  var timerStarted = false;

  function startGame() {
    Config.setDifficulty(difficulty);
    Board.reset();
    Shell.hideOverlay();
    Shell.setStat('mines', Config.mines);
    Shell.setStat('time', 0);

    if (timer) timer.reset();
    timer = Timer.stopwatch(function (s) { Shell.setStat('time', s); });
    timerStarted = false;

    gameActive = true;
    flagMode = false;

    // Build grid in game area
    Renderer.build(Shell.area, onCellClick, onCellRightClick);

    // Build controls (difficulty buttons + flag toggle)
    buildControls();
  }

  function onCellClick(x, y) {
    if (!gameActive) return;

    // In flag mode, clicking toggles flag
    if (flagMode) {
      Board.toggleFlag(x, y);
      Renderer.updateCell(x, y, Board.getCell(x, y));
      Shell.setStat('mines', Config.mines - Board.flagCount);
      Audio8.play('click');
      return;
    }

    var cell = Board.getCell(x, y);
    if (!cell || cell.revealed || cell.flagged) return;

    // Start timer on first reveal
    if (!timerStarted) {
      timer.start();
      timerStarted = true;
    }

    var result = Board.reveal(x, y);
    Renderer.updateAll();

    if (result.status === 'mine') {
      // Game over — hit a mine
      gameActive = false;
      timer.pause();
      Board.revealAll();
      Renderer.updateAll();
      Renderer.highlightMine(x, y);
      Audio8.play('gameover');
      setTimeout(function () {
        Shell.showOverlay({
          title: 'Game Over',
          subtitle: 'You hit a mine!',
          score: 'Time: ' + timer.elapsed + 's',
          btn: 'Try Again',
          onAction: startGame
        });
      }, 800);
    } else if (result.status === 'win') {
      // Win — all safe cells revealed
      gameActive = false;
      timer.pause();
      Audio8.play('win');
      // For minesweeper, lower time is better — custom save logic
      var bestKey = 'mini-arcade-minesweeper-' + difficulty + '-highscore';
      var prevBest = parseInt(localStorage.getItem(bestKey)) || 0;
      var elapsed = timer.elapsed;
      if (prevBest === 0 || elapsed < prevBest) {
        localStorage.setItem(bestKey, elapsed);
        Shell.toast('New best!');
      } else {
        Shell.toast('Cleared!');
      }
      setTimeout(function () {
        Shell.showOverlay({
          title: 'You Win!',
          score: 'Time: ' + timer.elapsed + 's',
          btn: 'Play Again',
          onAction: startGame
        });
      }, 800);
    } else {
      Audio8.play('click');
    }
  }

  function onCellRightClick(x, y) {
    if (!gameActive) return;
    var cell = Board.getCell(x, y);
    if (!cell || cell.revealed) return;

    Board.toggleFlag(x, y);
    Renderer.updateCell(x, y, Board.getCell(x, y));
    Shell.setStat('mines', Config.mines - Board.flagCount);
    Audio8.play('click');
  }

  function buildControls() {
    var controls = Shell.controls;
    controls.innerHTML = '';

    // Difficulty buttons
    var diffDiv = document.createElement('div');
    diffDiv.className = 'diff-buttons';
    var diffs = ['easy', 'medium', 'hard'];

    for (var i = 0; i < diffs.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'btn btn-sm' + (diffs[i] === difficulty ? ' btn-primary' : '');
      btn.textContent = diffs[i].toUpperCase();
      btn.addEventListener('click', (function (d) {
        return function () { difficulty = d; startGame(); };
      })(diffs[i]));
      diffDiv.appendChild(btn);
    }
    controls.appendChild(diffDiv);

    // Flag mode toggle (for mobile — no right-click)
    var flagBtn = document.createElement('button');
    flagBtn.className = 'btn flag-toggle';
    flagBtn.textContent = '🚩 Flag Mode';
    flagBtn.addEventListener('click', function () {
      flagMode = !flagMode;
      flagBtn.classList.toggle('active', flagMode);
    });
    controls.appendChild(flagBtn);
  }

  // Show start screen
  Shell.showOverlay({
    title: GAME.title,
    subtitle: 'Click to reveal, right-click to flag',
    btn: 'Start',
    onAction: startGame
  });

})();
