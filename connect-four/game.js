/* Connect Four — Main game orchestrator

   Modules loaded before this file:
   - Config    (src/config.js)    — board dimensions, colors, AI settings
   - Board     (src/board.js)     — grid state, drop, win/draw detection
   - AI        (src/ai.js)        — minimax with alpha-beta pruning
   - Renderer  (src/renderer.js)  — canvas rendering, disc drop animation

   Shared globals available:
   - Engine, Input, Shell, Audio8, Particles, etc.

   This is a canvas game — Engine.create() with canvas option.
*/

(function () {

  var wins = 0;
  var losses = 0;
  var draws = 0;
  var isPlayerTurn = true;
  var gameActive = false;
  var aiTimeout = null;
  var particles = Particles.create();

  // Mouse/touch tracking for column hover
  var mouseCol = -1;

  function getColFromX(clientX) {
    if (!game.canvas) return -1;
    var rect = game.canvas.getBoundingClientRect();
    var scaleX = Config.canvasW / rect.width;
    var localX = (clientX - rect.left) * scaleX;
    var col = Math.floor((localX - Config.boardPadding) / Config.cellSize);
    if (col < 0 || col >= Config.cols) return -1;
    return col;
  }

  function onCanvasClick(e) {
    if (!game.is('playing')) return;
    if (!gameActive || !isPlayerTurn) return;
    if (Renderer.isAnimating()) return;

    var clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : -1);
    if (clientX < 0) return;

    var col = getColFromX(clientX);
    if (col < 0 || !Board.canDrop(col)) return;

    playerDrop(col);
  }

  function onCanvasMove(e) {
    if (!game.is('playing') || !gameActive) {
      mouseCol = -1;
      return;
    }
    var clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : -1);
    if (clientX < 0) { mouseCol = -1; return; }

    var col = getColFromX(clientX);
    if (col !== mouseCol) {
      mouseCol = col;
      if (col >= 0 && isPlayerTurn && !Renderer.isAnimating()) {
        Audio8.play('click');
      }
    }
  }

  function onCanvasLeave() {
    mouseCol = -1;
  }

  function playerDrop(col) {
    var row = Board.drop(col, Config.playerDisc);
    if (row < 0) return;

    Audio8.play('drop');
    isPlayerTurn = false;
    mouseCol = -1;

    var anim = Renderer.animateDrop(col, row, Config.playerDisc);
    anim.onLand(function () {
      // Check for player win
      var winPattern = Board.checkWin(Config.playerDisc);
      if (winPattern) {
        handleWin(winPattern);
        return;
      }

      // Check for draw
      if (Board.isFull()) {
        handleDraw();
        return;
      }

      // AI turn
      startAITurn();
    });
  }

  function startAITurn() {
    aiTimeout = setTimeout(function () {
      if (!game.is('playing') || !gameActive) return;
      doAITurn();
    }, Config.aiDelay * 1000);
  }

  function doAITurn() {
    var col = AI.chooseMove();
    if (col < 0) return;

    var row = Board.drop(col, Config.aiDisc);
    if (row < 0) return;

    Audio8.play('drop');

    var anim = Renderer.animateDrop(col, row, Config.aiDisc);
    anim.onLand(function () {
      // Check for AI win
      var winPattern = Board.checkWin(Config.aiDisc);
      if (winPattern) {
        handleLoss(winPattern);
        return;
      }

      // Check for draw
      if (Board.isFull()) {
        handleDraw();
        return;
      }

      // Back to player
      isPlayerTurn = true;
    });
  }

  function handleWin(pattern) {
    gameActive = false;
    wins++;
    Shell.setStat('wins', wins);

    Audio8.play('score');
    Renderer.setWinCells(pattern);

    // Particles at each winning disc
    for (var i = 0; i < pattern.length; i++) {
      var cx = Config.boardPadding + pattern[i].col * Config.cellSize + Config.cellSize / 2;
      var cy = Config.headerHeight + Config.boardPadding + pattern[i].row * Config.cellSize + Config.cellSize / 2;
      particles.emit(cx, cy, { count: 8, color: Config.playerColor, speed: 80, life: 0.8 });
    }

    setTimeout(function () {
      game.win(wins + 'W · ' + losses + 'L · ' + draws + 'D');
    }, 1800);
  }

  function handleLoss(pattern) {
    gameActive = false;

    Audio8.play('gameover');
    Renderer.setWinCells(pattern);
    losses++;

    setTimeout(function () {
      game.gameOver(wins + 'W · ' + losses + 'L · ' + draws + 'D');
    }, 1800);
  }

  function handleDraw() {
    gameActive = false;
    draws++;
    Shell.setStat('draws', draws);

    Audio8.play('error');

    setTimeout(function () {
      game.gameOver(wins + 'W · ' + losses + 'L · ' + draws + 'D');
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
    document.getElementById('overlay-title').textContent = 'Connect Four';
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

  // --- Engine setup (canvas game) ---
  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Drop discs — get 4 in a row!',

    init: function () {
      Input.init();

      // Mouse/touch events on canvas
      game.canvas.addEventListener('click', onCanvasClick);
      game.canvas.addEventListener('touchend', function (e) {
        e.preventDefault();
        if (e.changedTouches && e.changedTouches[0]) {
          onCanvasClick({ clientX: e.changedTouches[0].clientX });
        }
      });
      game.canvas.addEventListener('mousemove', onCanvasMove);
      game.canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (e.touches && e.touches[0]) {
          onCanvasMove({ clientX: e.touches[0].clientX });
        }
      }, { passive: false });
      game.canvas.addEventListener('mouseleave', onCanvasLeave);
    },

    reset: function () {
      clearAITimeout();
      isPlayerTurn = true;
      gameActive = true;
      mouseCol = -1;

      Board.reset();
      Renderer.reset();
      particles.clear();

      Shell.setStat('wins', wins);
      Shell.setStat('draws', draws);
    },

    update: function (dt) {
      // Pause
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // Update hover column
      if (isPlayerTurn && gameActive && !Renderer.isAnimating()) {
        Renderer.setHoverCol(mouseCol);
      } else {
        Renderer.setHoverCol(-1);
      }

      Renderer.update(dt);
      particles.update(dt);

      Input.endFrame();
    },

    draw: function (ctx) {
      Renderer.draw(ctx);
      particles.draw(ctx);
    },

    onStateChange: function (from, to) {
      if (to === 'paused') {
        clearAITimeout();
      }
      // Re-trigger AI turn if it was AI's turn when we paused
      if (to === 'playing' && from === 'paused' && gameActive && !isPlayerTurn && !Renderer.isAnimating()) {
        startAITurn();
      }
    },

    onRestart: function () {
      clearAITimeout();
      showDifficultyChoice();
    },
  });

  // Boot: show difficulty selection then start Engine
  game.start();
  showDifficultyChoice();

})();
