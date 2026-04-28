/* Connect Four — Board logic (grid state, drop, win/draw detection) */

var Board = (function () {

  // 2D grid: grid[row][col], row 0 = top, row 5 = bottom
  var grid = [];

  function reset() {
    grid = [];
    for (var r = 0; r < Config.rows; r++) {
      grid[r] = [];
      for (var c = 0; c < Config.cols; c++) {
        grid[r][c] = Config.empty;
      }
    }
  }

  /** Get the cell value at (row, col). */
  function getCell(row, col) {
    if (row < 0 || row >= Config.rows || col < 0 || col >= Config.cols) return undefined;
    return grid[row][col];
  }

  /** Check if a column has room for another disc. */
  function canDrop(col) {
    if (col < 0 || col >= Config.cols) return false;
    return grid[0][col] === Config.empty;
  }

  /** Drop a disc into a column. Returns the row it lands on, or -1 if full. */
  function drop(col, disc) {
    if (!canDrop(col)) return -1;
    for (var r = Config.rows - 1; r >= 0; r--) {
      if (grid[r][col] === Config.empty) {
        grid[r][col] = disc;
        return r;
      }
    }
    return -1;
  }

  /** Remove the top disc from a column (for AI simulation). Returns the row removed, or -1. */
  function undrop(col) {
    for (var r = 0; r < Config.rows; r++) {
      if (grid[r][col] !== Config.empty) {
        grid[r][col] = Config.empty;
        return r;
      }
    }
    return -1;
  }

  /** Get all columns that can accept a disc. */
  function validColumns() {
    var result = [];
    for (var c = 0; c < Config.cols; c++) {
      if (canDrop(c)) result.push(c);
    }
    return result;
  }

  /** Find the row a disc would land on in a column (without placing it). Returns -1 if full. */
  function landingRow(col) {
    if (!canDrop(col)) return -1;
    for (var r = Config.rows - 1; r >= 0; r--) {
      if (grid[r][col] === Config.empty) return r;
    }
    return -1;
  }

  /**
   * Check if a disc type has won. Returns array of 4 winning cell coords [{row,col},...] or null.
   */
  function checkWin(disc) {
    var r, c;

    // Horizontal
    for (r = 0; r < Config.rows; r++) {
      for (c = 0; c <= Config.cols - 4; c++) {
        if (grid[r][c] === disc && grid[r][c+1] === disc &&
            grid[r][c+2] === disc && grid[r][c+3] === disc) {
          return [{row:r,col:c},{row:r,col:c+1},{row:r,col:c+2},{row:r,col:c+3}];
        }
      }
    }

    // Vertical
    for (r = 0; r <= Config.rows - 4; r++) {
      for (c = 0; c < Config.cols; c++) {
        if (grid[r][c] === disc && grid[r+1][c] === disc &&
            grid[r+2][c] === disc && grid[r+3][c] === disc) {
          return [{row:r,col:c},{row:r+1,col:c},{row:r+2,col:c},{row:r+3,col:c}];
        }
      }
    }

    // Diagonal (top-left to bottom-right)
    for (r = 0; r <= Config.rows - 4; r++) {
      for (c = 0; c <= Config.cols - 4; c++) {
        if (grid[r][c] === disc && grid[r+1][c+1] === disc &&
            grid[r+2][c+2] === disc && grid[r+3][c+3] === disc) {
          return [{row:r,col:c},{row:r+1,col:c+1},{row:r+2,col:c+2},{row:r+3,col:c+3}];
        }
      }
    }

    // Diagonal (bottom-left to top-right)
    for (r = 3; r < Config.rows; r++) {
      for (c = 0; c <= Config.cols - 4; c++) {
        if (grid[r][c] === disc && grid[r-1][c+1] === disc &&
            grid[r-2][c+2] === disc && grid[r-3][c+3] === disc) {
          return [{row:r,col:c},{row:r-1,col:c+1},{row:r-2,col:c+2},{row:r-3,col:c+3}];
        }
      }
    }

    return null;
  }

  /** Check if the board is full (draw). */
  function isFull() {
    for (var c = 0; c < Config.cols; c++) {
      if (grid[0][c] === Config.empty) return false;
    }
    return true;
  }

  /** Check if the game is over (win or draw). */
  function isGameOver() {
    return checkWin(Config.playerDisc) !== null ||
           checkWin(Config.aiDisc) !== null ||
           isFull();
  }

  /** Get a copy of the grid (for AI evaluation). */
  function getGrid() {
    var copy = [];
    for (var r = 0; r < Config.rows; r++) {
      copy[r] = grid[r].slice();
    }
    return copy;
  }

  return {
    reset: reset,
    getCell: getCell,
    canDrop: canDrop,
    drop: drop,
    undrop: undrop,
    validColumns: validColumns,
    landingRow: landingRow,
    checkWin: checkWin,
    isFull: isFull,
    isGameOver: isGameOver,
    getGrid: getGrid,
  };
})();
