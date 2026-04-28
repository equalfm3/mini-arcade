/* Sudoku — Main game orchestrator

   Modules loaded before this file:
   - Config     (src/config.js)    — difficulty presets, colors, sizes
   - Solver     (src/solver.js)    — validation, conflict detection, solution counting
   - Generator  (src/generator.js) — puzzle generation with unique solution
   - Renderer   (src/renderer.js)  — DOM grid, number pad, pencil marks

   Shared globals available:
   - Shell, Audio8, Timer, Input, Engine

   This is a DOM game — Engine.create() WITHOUT canvas.
*/

(function () {

  // ── State ──
  var difficulty = Config.defaultDifficulty;
  var puzzle = null;      // 9x9 initial givens (0 = empty)
  var solution = null;    // 9x9 solved grid
  var board = null;       // 9x9 current player state
  var givens = null;      // 9x9 boolean — true if cell is a given
  var pencil = null;      // 9x9 array of arrays — pencil marks per cell
  var selRow = -1;
  var selCol = -1;
  var pencilMode = false;
  var errors = 0;
  var history = [];       // undo stack: { row, col, prevValue, prevPencil }
  var gameActive = false;
  var timer = null;
  var timerStarted = false;

  // Engine (no canvas — DOM game) for state machine + pause
  var game = Engine.create({
    startHint: 'Fill every row, column, and box with 1-9',

    init: function () {
      Input.init();
    },

    update: function (dt) {
      if (Input.pressed('Escape')) {
        game.togglePause();
      }
      // Keyboard number input
      if (gameActive && selRow >= 0) {
        for (var n = 1; n <= 9; n++) {
          if (Input.pressed('' + n) || Input.pressed('Digit' + n) || Input.pressed('Numpad' + n)) {
            enterNumber(n);
          }
        }
        if (Input.pressed('Backspace') || Input.pressed('Delete') || Input.pressed('0')) {
          eraseCell();
        }
        // Arrow key navigation
        if (Input.pressed('ArrowUp') && selRow > 0) selectCell(selRow - 1, selCol);
        if (Input.pressed('ArrowDown') && selRow < 8) selectCell(selRow + 1, selCol);
        if (Input.pressed('ArrowLeft') && selCol > 0) selectCell(selRow, selCol - 1);
        if (Input.pressed('ArrowRight') && selCol < 8) selectCell(selRow, selCol + 1);
      }
      Input.endFrame();
    },

    onStateChange: function (from, to) {
      if (to === 'paused' && timer) timer.pause();
      if (to === 'playing' && timer && timerStarted) timer.start();
    },
  });

  // ── Game lifecycle ──

  function startGame() {
    Shell.hideOverlay();

    // Generate puzzle
    var result = Generator.generate(difficulty);
    puzzle = result.puzzle;
    solution = result.solution;

    // Initialize board state
    board = [];
    givens = [];
    pencil = [];
    for (var r = 0; r < 9; r++) {
      board[r] = [];
      givens[r] = [];
      pencil[r] = [];
      for (var c = 0; c < 9; c++) {
        board[r][c] = puzzle[r][c];
        givens[r][c] = puzzle[r][c] !== 0;
        pencil[r][c] = [];
      }
    }

    selRow = -1;
    selCol = -1;
    pencilMode = false;
    errors = 0;
    history = [];
    gameActive = true;
    timerStarted = false;

    Shell.setStat('errors', 0);
    Shell.setStat('time', '0:00');

    if (timer) timer.reset();
    timer = Timer.stopwatch(function (s) {
      Shell.setStat('time', Timer.format(s));
    });

    // Build grid
    Renderer.build(Shell.area, onCellClick, onNumPad);
    Renderer.buildPad(Shell.controls, onNumPad, onPencilToggle, onUndo, onErase);
    Renderer.setPencilActive(false);

    // Build difficulty selector above grid
    buildDiffSelector();

    renderAll();
    game.play();
  }

  function buildDiffSelector() {
    var area = Shell.area;
    var existing = area.querySelector('.diff-buttons');
    if (existing) existing.remove();

    var diffDiv = document.createElement('div');
    diffDiv.className = 'diff-buttons';
    var diffs = ['easy', 'medium', 'hard'];

    for (var i = 0; i < diffs.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'btn btn-sm' + (diffs[i] === difficulty ? ' btn-primary' : '');
      btn.textContent = Config.difficulties[diffs[i]].label;
      btn.addEventListener('click', (function (d) {
        return function () {
          difficulty = d;
          if (timer) timer.reset();
          startGame();
        };
      })(diffs[i]));
      diffDiv.appendChild(btn);
    }

    // Insert before the grid
    area.insertBefore(diffDiv, area.firstChild);
  }

  // ── Cell interaction ──

  function onCellClick(row, col) {
    if (!gameActive) return;
    selectCell(row, col);
    Audio8.play('click');
  }

  function selectCell(row, col) {
    selRow = row;
    selCol = col;
    renderAll();
  }

  function onNumPad(num) {
    if (!gameActive || selRow < 0) return;
    enterNumber(num);
  }

  function enterNumber(num) {
    if (!gameActive || selRow < 0 || selCol < 0) return;
    if (givens[selRow][selCol]) return; // can't edit givens

    // Start timer on first input
    if (!timerStarted) {
      timer.start();
      timerStarted = true;
    }

    if (pencilMode) {
      // Toggle pencil mark
      var marks = pencil[selRow][selCol];
      var prevMarks = marks.slice();
      var idx = marks.indexOf(num);
      if (idx === -1) {
        marks.push(num);
        marks.sort();
      } else {
        marks.splice(idx, 1);
      }
      // Save undo for pencil
      history.push({
        row: selRow,
        col: selCol,
        prevValue: board[selRow][selCol],
        prevPencil: prevMarks,
      });
      Audio8.play('move');
    } else {
      // Place number
      var prevValue = board[selRow][selCol];
      var prevPencil = pencil[selRow][selCol].slice();

      history.push({
        row: selRow,
        col: selCol,
        prevValue: prevValue,
        prevPencil: prevPencil,
      });

      board[selRow][selCol] = num;
      pencil[selRow][selCol] = []; // clear pencil marks when placing

      // Check for errors
      var conflicts = Solver.getConflicts(board, selRow, selCol, num);
      if (conflicts.length > 0) {
        errors++;
        Shell.setStat('errors', errors);
        Audio8.play('error');
      } else {
        Audio8.play('move');
      }

      // Remove this number from pencil marks in same row/col/box
      clearPencilMarksFor(selRow, selCol, num);

      // Check win
      if (checkWin()) {
        gameActive = false;
        timer.pause();
        Audio8.play('win');
        setTimeout(function () {
          Shell.showOverlay({
            title: 'Puzzle Complete!',
            score: 'Time: ' + Timer.format(timer.elapsed) + ' · Errors: ' + errors,
            btn: 'New Puzzle',
            onAction: startGame,
          });
        }, 600);
      }
    }

    renderAll();
  }

  function onErase() {
    eraseCell();
  }

  function eraseCell() {
    if (!gameActive || selRow < 0 || selCol < 0) return;
    if (givens[selRow][selCol]) return;

    var prevValue = board[selRow][selCol];
    var prevPencil = pencil[selRow][selCol].slice();

    if (prevValue === 0 && prevPencil.length === 0) return;

    history.push({
      row: selRow,
      col: selCol,
      prevValue: prevValue,
      prevPencil: prevPencil,
    });

    board[selRow][selCol] = 0;
    pencil[selRow][selCol] = [];
    Audio8.play('click');
    renderAll();
  }

  function onPencilToggle() {
    pencilMode = !pencilMode;
    Renderer.setPencilActive(pencilMode);
    Audio8.play('click');
  }

  function onUndo() {
    if (!gameActive || history.length === 0) return;
    var entry = history.pop();
    board[entry.row][entry.col] = entry.prevValue;
    pencil[entry.row][entry.col] = entry.prevPencil;
    Audio8.play('click');
    renderAll();
  }

  /** Remove pencil mark `num` from all cells in same row, col, and box */
  function clearPencilMarksFor(row, col, num) {
    var r, c;
    // Row
    for (c = 0; c < 9; c++) {
      var idx = pencil[row][c].indexOf(num);
      if (idx !== -1) pencil[row][c].splice(idx, 1);
    }
    // Column
    for (r = 0; r < 9; r++) {
      var idx = pencil[r][col].indexOf(num);
      if (idx !== -1) pencil[r][col].splice(idx, 1);
    }
    // Box
    var br = Math.floor(row / 3) * 3;
    var bc = Math.floor(col / 3) * 3;
    for (r = br; r < br + 3; r++) {
      for (c = bc; c < bc + 3; c++) {
        var idx = pencil[r][c].indexOf(num);
        if (idx !== -1) pencil[r][c].splice(idx, 1);
      }
    }
  }

  /** Check if all cells are filled correctly */
  function checkWin() {
    for (var r = 0; r < 9; r++) {
      for (var c = 0; c < 9; c++) {
        if (board[r][c] !== solution[r][c]) return false;
      }
    }
    return true;
  }

  // ── Rendering ──

  function renderAll() {
    var selectedNum = (selRow >= 0 && selCol >= 0) ? board[selRow][selCol] : 0;

    for (var r = 0; r < 9; r++) {
      for (var c = 0; c < 9; c++) {
        var val = board[r][c];
        var isGiven = givens[r][c];
        var isSelected = (r === selRow && c === selCol);
        var isSameNum = (selectedNum > 0 && val === selectedNum && !isSelected);
        var isError = false;

        // Check if this cell has a conflict
        if (val > 0 && !isGiven) {
          var conflicts = Solver.getConflicts(board, r, c, val);
          if (conflicts.length > 0) isError = true;
        }

        // Highlight same row/col/box as selected
        var sameGroup = false;
        if (selRow >= 0 && selCol >= 0 && !isSelected) {
          if (r === selRow || c === selCol) {
            sameGroup = true;
          }
          var selBr = Math.floor(selRow / 3) * 3;
          var selBc = Math.floor(selCol / 3) * 3;
          if (r >= selBr && r < selBr + 3 && c >= selBc && c < selBc + 3) {
            sameGroup = true;
          }
        }

        Renderer.updateCell(r, c, {
          value: val,
          given: isGiven,
          pencil: pencil[r][c],
          selected: isSelected,
          sameNum: isSameNum,
          error: isError,
          sameRow: selRow >= 0 && r === selRow,
          sameCol: selCol >= 0 && c === selCol,
          sameBox: sameGroup,
        });
      }
    }
  }

  // ── Start ──

  Shell.showOverlay({
    title: GAME.title,
    subtitle: 'Fill every row, column, and box with 1-9',
    btn: 'Start',
    onAction: startGame,
  });

  game.start();

})();
