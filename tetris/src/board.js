/* Tetris — Board (playfield grid + logic) */

var Board = (function () {

  var grid = []; // 2D array [rows][cols], 0 = empty, 1-7 = piece color index + 1

  /** Clear the grid */
  function reset() {
    grid = [];
    for (var r = 0; r < Config.rows; r++) {
      grid[r] = [];
      for (var c = 0; c < Config.cols; c++) {
        grid[r][c] = 0;
      }
    }
  }

  /** Check if a piece fits at position (no overlap, in bounds) */
  function isValid(type, x, y, rotation) {
    var shape = Pieces.getShape(type, rotation);
    var rows = shape.length;
    var cols = shape[0].length;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (shape[r][c]) {
          var gx = x + c;
          var gy = y + r;

          // Out of bounds
          if (gx < 0 || gx >= Config.cols || gy >= Config.rows) {
            return false;
          }

          // Above the board is ok (for spawning)
          if (gy < 0) continue;

          // Overlap with locked cells
          if (grid[gy][gx] !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /** Write piece cells into the grid */
  function lock(piece) {
    var shape = piece.shape;
    var rows = shape.length;
    var cols = shape[0].length;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (shape[r][c]) {
          var gy = piece.y + r;
          var gx = piece.x + c;
          if (gy >= 0 && gy < Config.rows && gx >= 0 && gx < Config.cols) {
            grid[gy][gx] = piece.color + 1; // store 1-7 (0 = empty)
          }
        }
      }
    }
  }

  /** Detect and remove full rows, return count of lines cleared */
  function clearLines() {
    var cleared = 0;

    for (var r = Config.rows - 1; r >= 0; r--) {
      var full = true;
      for (var c = 0; c < Config.cols; c++) {
        if (grid[r][c] === 0) {
          full = false;
          break;
        }
      }

      if (full) {
        // Remove this row
        grid.splice(r, 1);
        // Add empty row at top
        var emptyRow = [];
        for (var c2 = 0; c2 < Config.cols; c2++) {
          emptyRow[c2] = 0;
        }
        grid.unshift(emptyRow);
        cleared++;
        r++; // re-check this index since rows shifted down
      }
    }

    return cleared;
  }

  /** Return the grid for rendering */
  function getGrid() {
    return grid;
  }

  /** Check if any cell in top 2 rows is filled (game over condition) */
  function isTopBlocked() {
    for (var r = 0; r < 2; r++) {
      for (var c = 0; c < Config.cols; c++) {
        if (grid[r][c] !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  return {
    reset: reset,
    isValid: isValid,
    lock: lock,
    clearLines: clearLines,
    getGrid: getGrid,
    isTopBlocked: isTopBlocked
  };
})();
