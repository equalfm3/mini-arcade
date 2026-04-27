/* Tic-Tac-Toe — Board logic (win/draw detection, state management) */

var Board = (function () {

  // Board state: flat array of 9 cells, null = empty, 'X' or 'O'
  var cells = [];

  // Win patterns: indices of three-in-a-row
  var winPatterns = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  function reset() {
    cells = [];
    for (var i = 0; i < Config.totalCells; i++) {
      cells.push(null);
    }
  }

  /** Place a mark at index. Returns true if successful. */
  function place(index, mark) {
    if (index < 0 || index >= Config.totalCells) return false;
    if (cells[index] !== null) return false;
    cells[index] = mark;
    return true;
  }

  /** Remove a mark at index (for AI simulation). */
  function unplace(index) {
    if (index < 0 || index >= Config.totalCells) return;
    cells[index] = null;
  }

  /** Get the mark at an index (null, 'X', or 'O'). */
  function getCell(index) {
    return cells[index];
  }

  /** Get a copy of the full board state. */
  function getCells() {
    return cells.slice();
  }

  /** Get indices of all empty cells. */
  function emptyCells() {
    var result = [];
    for (var i = 0; i < cells.length; i++) {
      if (cells[i] === null) result.push(i);
    }
    return result;
  }

  /** Check if a specific mark has won. Returns winning pattern or null. */
  function checkWin(mark) {
    for (var i = 0; i < winPatterns.length; i++) {
      var p = winPatterns[i];
      if (cells[p[0]] === mark && cells[p[1]] === mark && cells[p[2]] === mark) {
        return p;
      }
    }
    return null;
  }

  /** Check if the board is a draw (all cells filled, no winner). */
  function isDraw() {
    if (checkWin(Config.playerMark) || checkWin(Config.aiMark)) return false;
    for (var i = 0; i < cells.length; i++) {
      if (cells[i] === null) return false;
    }
    return true;
  }

  /** Check if the game is over (win or draw). */
  function isGameOver() {
    return checkWin(Config.playerMark) !== null ||
           checkWin(Config.aiMark) !== null ||
           isDraw();
  }

  /** Get all win patterns (for AI use). */
  function getWinPatterns() {
    return winPatterns;
  }

  return {
    reset: reset,
    place: place,
    unplace: unplace,
    getCell: getCell,
    getCells: getCells,
    emptyCells: emptyCells,
    checkWin: checkWin,
    isDraw: isDraw,
    isGameOver: isGameOver,
    getWinPatterns: getWinPatterns,
  };
})();
