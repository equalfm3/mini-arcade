/* Sudoku — Puzzle Generator

   Strategy:
   1. Build a valid solved grid by filling diagonals then solving
   2. Remove cells one at a time, checking unique solution is maintained
*/

var Generator = (function () {

  /**
   * Generate a complete valid 9x9 solved grid.
   * Fills the three diagonal 3x3 boxes (independent), then solves the rest.
   */
  function generateSolved() {
    var board = [];
    var r, c;
    for (r = 0; r < 9; r++) {
      board[r] = [];
      for (c = 0; c < 9; c++) {
        board[r][c] = 0;
      }
    }

    // Fill diagonal 3x3 boxes (they don't affect each other)
    for (var box = 0; box < 3; box++) {
      var nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      var idx = 0;
      var sr = box * 3;
      var sc = box * 3;
      for (r = sr; r < sr + 3; r++) {
        for (c = sc; c < sc + 3; c++) {
          board[r][c] = nums[idx++];
        }
      }
    }

    // Solve the rest
    Solver.solve(board);
    return board;
  }

  /**
   * Generate a puzzle with a unique solution.
   * @param {string} difficulty - 'easy', 'medium', or 'hard'
   * @returns {{ puzzle: number[][], solution: number[][] }}
   */
  function generate(difficulty) {
    var diff = Config.difficulties[difficulty] || Config.difficulties.easy;
    var givens = diff.givens;
    var toRemove = 81 - givens;

    var solution = generateSolved();

    // Copy for puzzle
    var puzzle = [];
    var r, c;
    for (r = 0; r < 9; r++) {
      puzzle[r] = [];
      for (c = 0; c < 9; c++) {
        puzzle[r][c] = solution[r][c];
      }
    }

    // Build list of all cell positions, shuffle them
    var positions = [];
    for (r = 0; r < 9; r++) {
      for (c = 0; c < 9; c++) {
        positions.push({ row: r, col: c });
      }
    }
    positions = shuffle(positions);

    var removed = 0;
    for (var i = 0; i < positions.length && removed < toRemove; i++) {
      var pos = positions[i];
      var val = puzzle[pos.row][pos.col];
      if (val === 0) continue;

      // Try removing
      puzzle[pos.row][pos.col] = 0;

      // Check unique solution
      if (Solver.countSolutions(copyBoard(puzzle), 2) === 1) {
        removed++;
      } else {
        // Put it back — removing this cell creates ambiguity
        puzzle[pos.row][pos.col] = val;
      }
    }

    return {
      puzzle: puzzle,
      solution: solution,
    };
  }

  /** Fisher-Yates shuffle */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  /** Deep copy a 9x9 board */
  function copyBoard(board) {
    var copy = [];
    for (var r = 0; r < 9; r++) {
      copy[r] = [];
      for (var c = 0; c < 9; c++) {
        copy[r][c] = board[r][c];
      }
    }
    return copy;
  }

  return {
    generate: generate,
  };
})();
