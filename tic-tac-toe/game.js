/* Tic-Tac-Toe — Main game orchestrator

   Modules loaded before this file:
   - Config    (src/config.js)    — board size, AI settings, colors
   - Board     (src/board.js)     — board state, win/draw detection
   - AI        (src/ai.js)        — minimax with alpha-beta pruning
   - Renderer  (src/renderer.js)  — DOM grid, marks, win line

   Shared globals available:
   - Engine, Input, Shell, Audio8, etc.

   This is a DOM game — no canvas needed.
   Engine.create() without canvas option provides the state machine,
   pause/resume/restart, and overlay management.
*/

(function () {

  var wins = 0;
  var draws = 0;
  var streak = 0;
  var bestStreak = loadHighScore('tic-tac-toe');
  var isPlayerTurn = true;
  var gameActive = false;
  var aiTimeout = null;

  function onCellClick(index) {
    if (!game.is('playing')) return;
    if (!gameActive) return;
    if (!isPlayerTurn) return;

    var mark = Config.playerMark;
    if (!Board.place(index, mark)) return;

    Audio8.play('click');
    Renderer.update();

    // Check for player win
    var winPattern = Board.checkWin(mark);
    if (winPattern) {
      handleWin(winPattern);
      return;
    }

    // Check for draw
    if (Board.isDraw()) {
      handleDraw();
      return;
    }

    // AI turn
    isPlayerTurn = false;
    Renderer.setStatus('AI thinking...', 'thinking');
    Renderer.disableBoard();

    aiTimeout = setTimeout(function () {
      if (!game.is('playing') || !gameActive) return;
      doAITurn();
    }, Config.aiDelay * 1000);
  }

  function doAITurn() {
    var move = AI.chooseMove();
    if (move === -1) return;

    Board.place(move, Config.aiMark);
    Audio8.play('click');
    Renderer.update();

    // Check for AI win
    var winPattern = Board.checkWin(Config.aiMark);
    if (winPattern) {
      handleLoss(winPattern);
      return;
    }

    // Check for draw
    if (Board.isDraw()) {
      handleDraw();
      return;
    }

    // Back to player
    isPlayerTurn = true;
    Renderer.enableBoard();
    Renderer.setStatus('Your turn (X)', 'player');
  }

  function handleWin(pattern) {
    gameActive = false;
    wins++;
    streak++;
    Shell.setStat('wins', wins);
    Shell.setStat('streak', streak);

    if (saveHighScore('tic-tac-toe', streak)) {
      bestStreak = streak;
    }

    Audio8.play('score');
    Renderer.setStatus('You win!', 'win');
    Renderer.disableBoard();

    setTimeout(function () {
      Renderer.showWinLine(pattern);
    }, Config.winLineDelay * 1000);

    setTimeout(function () {
      game.win(wins + 'W · ' + draws + 'D · Streak ' + streak);
    }, 1500);
  }

  function handleLoss(pattern) {
    gameActive = false;
    streak = 0;
    Shell.setStat('streak', 0);

    Audio8.play('gameover');
    Renderer.setStatus('AI wins!', 'lose');
    Renderer.disableBoard();

    setTimeout(function () {
      Renderer.showWinLine(pattern);
    }, Config.winLineDelay * 1000);

    setTimeout(function () {
      game.gameOver(wins + 'W · ' + draws + 'D · Best ' + bestStreak);
    }, 1500);
  }

  function handleDraw() {
    gameActive = false;
    draws++;
    Shell.setStat('draws', draws);

    Audio8.play('error');
    Renderer.setStatus('Draw!', 'draw');
    Renderer.disableBoard();

    setTimeout(function () {
      game.gameOver(wins + 'W · ' + draws + 'D · Streak ' + streak);
    }, 1200);
  }

  function clearAITimeout() {
    if (aiTimeout) {
      clearTimeout(aiTimeout);
      aiTimeout = null;
    }
  }

  // --- Difficulty selection overlay ---
  function showDifficultyChoice() {
    var overlay = document.getElementById('overlay');
    document.getElementById('overlay-title').textContent = 'Tic-Tac-Toe';
    document.getElementById('overlay-subtitle').textContent = 'Choose AI difficulty';
    document.getElementById('overlay-score').textContent = '';

    var defaultBtn = document.getElementById('overlay-btn');
    if (defaultBtn) defaultBtn.style.display = 'none';

    // Remove old choice buttons
    var old = overlay.querySelector('.diff-choice');
    if (old) old.remove();

    var wrap = document.createElement('div');
    wrap.className = 'diff-choice';
    wrap.style.cssText = 'display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;justify-content:center;';

    var keys = ['easy', 'medium', 'hard'];
    for (var i = 0; i < keys.length; i++) {
      var d = Config.difficulties[keys[i]];
      var btn = document.createElement('button');
      btn.className = 'btn' + (keys[i] === 'medium' ? ' btn-primary' : '');
      btn.textContent = d.label;
      btn.title = d.description;
      btn.style.cssText = 'min-width:90px;padding:10px 16px;';
      btn.addEventListener('click', (function (key) {
        return function () {
          AI.setDifficulty(key);
          cleanup();
          game.play();
        };
      })(keys[i]));
      wrap.appendChild(btn);
    }

    overlay.appendChild(wrap);
    overlay.removeAttribute('hidden');
    overlay.style.display = '';

    function cleanup() {
      var w = overlay.querySelector('.diff-choice');
      if (w) w.remove();
      if (defaultBtn) defaultBtn.style.display = '';
    }
  }

  // --- Engine setup (no canvas) ---
  var game = Engine.create({
    startHint: 'You are X — tap a cell to play',

    init: function () {
      Input.init();
    },

    reset: function () {
      clearAITimeout();
      isPlayerTurn = true;
      gameActive = true;

      Board.reset();
      Renderer.build(Shell.area, onCellClick);
      Renderer.update();
      Renderer.clearWinLine();
      Renderer.enableBoard();
      Renderer.setStatus('Your turn (X)', 'player');

      Shell.setStat('wins', wins);
      Shell.setStat('draws', draws);
      Shell.setStat('streak', streak);
    },

    update: function (dt) {
      // Pause
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      Input.endFrame();
    },

    onStateChange: function (from, to) {
      // Clear AI timeout when pausing
      if (to === 'paused') {
        clearAITimeout();
      }
      // Re-trigger AI turn if it was AI's turn when we paused
      if (to === 'playing' && from === 'paused' && gameActive && !isPlayerTurn) {
        aiTimeout = setTimeout(function () {
          if (!game.is('playing') || !gameActive) return;
          doAITurn();
        }, Config.aiDelay * 1000);
      }
    },

    onRestart: function () {
      clearAITimeout();
      showDifficultyChoice();
    },
  });

  // Boot: show difficulty selection then start Engine
  game.start();
  // Override the default start overlay with difficulty choice
  showDifficultyChoice();

})();
