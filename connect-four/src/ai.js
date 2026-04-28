/* Connect Four — AI (easy/medium/hard with minimax + alpha-beta pruning)

   Three difficulty levels:
   - Easy:   picks a random valid column
   - Medium: blocks opponent wins, takes own wins, otherwise random
   - Hard:   minimax with alpha-beta pruning, depth 6, position heuristic
*/

var AI = (function () {

  var difficulty = Config.defaultDifficulty;

  function setDifficulty(d) {
    difficulty = d;
  }

  function getDifficulty() {
    return difficulty;
  }

  /** Pick the best column for the AI. Returns column index. */
  function chooseMove() {
    if (difficulty === 'easy') return easyMove();
    if (difficulty === 'medium') return mediumMove();
    return hardMove();
  }

  // --- Easy: random valid column ---
  function easyMove() {
    var valid = Board.validColumns();
    if (valid.length === 0) return -1;
    return valid[Math.floor(Math.random() * valid.length)];
  }

  // --- Medium: block wins, take wins, prefer center, otherwise random ---
  function mediumMove() {
    var valid = Board.validColumns();
    if (valid.length === 0) return -1;

    // 1. Take a winning move
    var winCol = findWinningCol(Config.aiDisc);
    if (winCol !== -1) return winCol;

    // 2. Block opponent's winning move
    var blockCol = findWinningCol(Config.playerDisc);
    if (blockCol !== -1) return blockCol;

    // 3. Prefer center column
    var center = Math.floor(Config.cols / 2);
    if (Board.canDrop(center)) return center;

    // 4. Random from remaining
    return valid[Math.floor(Math.random() * valid.length)];
  }

  /** Find a column that would give `disc` a win. Returns col or -1. */
  function findWinningCol(disc) {
    var valid = Board.validColumns();
    for (var i = 0; i < valid.length; i++) {
      Board.drop(valid[i], disc);
      var wins = Board.checkWin(disc);
      Board.undrop(valid[i]);
      if (wins) return valid[i];
    }
    return -1;
  }

  // --- Hard: minimax with alpha-beta pruning ---

  // Column evaluation order: center first (better pruning)
  var colOrder = [3, 2, 4, 1, 5, 0, 6];

  function hardMove() {
    var valid = Board.validColumns();
    if (valid.length === 0) return -1;

    // If only one valid move, take it
    if (valid.length === 1) return valid[0];

    var bestScore = -Infinity;
    var bestCols = [];

    // Evaluate columns in center-first order
    for (var i = 0; i < colOrder.length; i++) {
      var col = colOrder[i];
      if (!Board.canDrop(col)) continue;

      Board.drop(col, Config.aiDisc);

      // Check for immediate win
      if (Board.checkWin(Config.aiDisc)) {
        Board.undrop(col);
        return col;
      }

      var score = minimax(Config.minimaxDepth - 1, false, -Infinity, Infinity);
      Board.undrop(col);

      if (score > bestScore) {
        bestScore = score;
        bestCols = [col];
      } else if (score === bestScore) {
        bestCols.push(col);
      }
    }

    // Pick randomly among equally-scored best columns
    return bestCols[Math.floor(Math.random() * bestCols.length)];
  }

  /**
   * Minimax with alpha-beta pruning.
   * @param {number} depth - remaining search depth
   * @param {boolean} isMaximizing - true if AI's turn
   * @param {number} alpha - best for maximizer
   * @param {number} beta - best for minimizer
   * @returns {number} evaluation score
   */
  function minimax(depth, isMaximizing, alpha, beta) {
    // Terminal checks
    if (Board.checkWin(Config.aiDisc)) return 100000 + depth;
    if (Board.checkWin(Config.playerDisc)) return -100000 - depth;
    if (Board.isFull()) return 0;
    if (depth === 0) return evaluate();

    if (isMaximizing) {
      var maxEval = -Infinity;
      for (var i = 0; i < colOrder.length; i++) {
        var col = colOrder[i];
        if (!Board.canDrop(col)) continue;
        Board.drop(col, Config.aiDisc);
        var score = minimax(depth - 1, false, alpha, beta);
        Board.undrop(col);
        if (score > maxEval) maxEval = score;
        if (maxEval > alpha) alpha = maxEval;
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      var minEval = Infinity;
      for (var j = 0; j < colOrder.length; j++) {
        var col2 = colOrder[j];
        if (!Board.canDrop(col2)) continue;
        Board.drop(col2, Config.playerDisc);
        var score2 = minimax(depth - 1, true, alpha, beta);
        Board.undrop(col2);
        if (score2 < minEval) minEval = score2;
        if (minEval < beta) beta = minEval;
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  /**
   * Static position evaluation heuristic.
   * Scores windows of 4 cells across the board.
   */
  function evaluate() {
    var score = 0;
    var grid = Board.getGrid();

    // Center column preference
    var centerCol = Math.floor(Config.cols / 2);
    var centerCount = 0;
    for (var r = 0; r < Config.rows; r++) {
      if (grid[r][centerCol] === Config.aiDisc) centerCount++;
    }
    score += centerCount * 3;

    // Score all windows of 4
    score += scoreAllWindows(grid);

    return score;
  }

  function scoreAllWindows(grid) {
    var total = 0;
    var r, c;

    // Horizontal windows
    for (r = 0; r < Config.rows; r++) {
      for (c = 0; c <= Config.cols - 4; c++) {
        total += scoreWindow(grid[r][c], grid[r][c+1], grid[r][c+2], grid[r][c+3]);
      }
    }

    // Vertical windows
    for (r = 0; r <= Config.rows - 4; r++) {
      for (c = 0; c < Config.cols; c++) {
        total += scoreWindow(grid[r][c], grid[r+1][c], grid[r+2][c], grid[r+3][c]);
      }
    }

    // Diagonal (top-left to bottom-right)
    for (r = 0; r <= Config.rows - 4; r++) {
      for (c = 0; c <= Config.cols - 4; c++) {
        total += scoreWindow(grid[r][c], grid[r+1][c+1], grid[r+2][c+2], grid[r+3][c+3]);
      }
    }

    // Diagonal (bottom-left to top-right)
    for (r = 3; r < Config.rows; r++) {
      for (c = 0; c <= Config.cols - 4; c++) {
        total += scoreWindow(grid[r][c], grid[r-1][c+1], grid[r-2][c+2], grid[r-3][c+3]);
      }
    }

    return total;
  }

  /** Score a window of 4 cells. */
  function scoreWindow(a, b, c, d) {
    var cells = [a, b, c, d];
    var aiCount = 0;
    var playerCount = 0;
    var emptyCount = 0;

    for (var i = 0; i < 4; i++) {
      if (cells[i] === Config.aiDisc) aiCount++;
      else if (cells[i] === Config.playerDisc) playerCount++;
      else emptyCount++;
    }

    // Only score windows that contain one player's discs (not mixed)
    if (aiCount > 0 && playerCount > 0) return 0;

    if (aiCount === 4) return 1000;
    if (aiCount === 3 && emptyCount === 1) return 5;
    if (aiCount === 2 && emptyCount === 2) return 2;

    if (playerCount === 4) return -1000;
    if (playerCount === 3 && emptyCount === 1) return -4;
    if (playerCount === 2 && emptyCount === 2) return -1;

    return 0;
  }

  return {
    setDifficulty: setDifficulty,
    getDifficulty: getDifficulty,
    chooseMove: chooseMove,
  };
})();
