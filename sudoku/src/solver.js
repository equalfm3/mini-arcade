/* Sudoku — Solver (backtracking with constraint checking) */

var Solver = (function () {

  /**
   * Check if placing `num` at (row, col) is valid.
   * @param {number[][]} board - 9x9 grid (0 = empty)
   */
  function isValid(board, row, col, num) {
    // Check row
    for (var c = 0; c < 9; c++) {
      if (board[row][c] === num) return false;
    }
    // Check column
    for (var r = 0; r < 9; r++) {
      if (board[r][col] === num) return false;
    }
    // Check 3x3 box
    var br = Math.floor(row / 3) * 3;
    var bc = Math.floor(col / 3) * 3;
    for (var r = br; r < br + 3; r++) {
      for (var c = bc; c < bc + 3; c++) {
        if (board[r][c] === num) return false;
      }
    }
    return true;
  }

  /**
   * Solve the board in-place using backtracking.
   * Returns true if solved, false if unsolvable.
   */
  function solve(board) {
    for (var r = 0; r < 9; r++) {
      for (var c = 0; c < 9; c++) {
        if (board[r][c] !== 0) continue;
        for (var num = 1; num <= 9; num++) {
          if (isValid(board, r, c, num)) {
            board[r][c] = num;
            if (solve(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
    return true;
  }

  /**
   * Count solutions (up to `limit`).
   * Used to verify unique solution when generating puzzles.
   */
  function countSolutions(board, limit) {
    limit = limit || 2;
    var count = { n: 0 };
    _countHelper(board, count, limit);
    return count.n;
  }

  function _countHelper(board, count, limit) {
    if (count.n >= limit) return;
    for (var r = 0; r < 9; r++) {
      for (var c = 0; c < 9; c++) {
        if (board[r][c] !== 0) continue;
        for (var num = 1; num <= 9; num++) {
          if (isValid(board, r, c, num)) {
            board[r][c] = num;
            _countHelper(board, count, limit);
            board[r][c] = 0;
            if (count.n >= limit) return;
          }
        }
        return; // no valid number → dead end
      }
    }
    // All cells filled → found a solution
    count.n++;
  }

  /**
   * Check if a number conflicts with existing values.
   * Returns array of conflicting {row, col} positions.
   */
  function getConflicts(board, row, col, num) {
    var conflicts = [];
    if (num === 0) return conflicts;

    // Row conflicts
    for (var c = 0; c < 9; c++) {
      if (c !== col && board[row][c] === num) {
        conflicts.push({ row: row, col: c });
      }
    }
    // Column conflicts
    for (var r = 0; r < 9; r++) {
      if (r !== row && board[r][col] === num) {
        conflicts.push({ row: r, col: col });
      }
    }
    // Box conflicts
    var br = Math.floor(row / 3) * 3;
    var bc = Math.floor(col / 3) * 3;
    for (var r = br; r < br + 3; r++) {
      for (var c = bc; c < bc + 3; c++) {
        if (r !== row || c !== col) {
          if (board[r][c] === num) {
            conflicts.push({ row: r, col: c });
          }
        }
      }
    }
    return conflicts;
  }

  return {
    isValid: isValid,
    solve: solve,
    countSolutions: countSolutions,
    getConflicts: getConflicts,
  };
})();
