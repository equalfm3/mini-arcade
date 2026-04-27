/* Tic-Tac-Toe — AI (minimax with alpha-beta pruning)

   Three difficulty levels:
   - Easy:   picks a random empty cell
   - Medium: blocks opponent wins, takes own wins, otherwise random
   - Hard:   full minimax with alpha-beta pruning (unbeatable)
*/

var AI = (function () {

  var difficulty = Config.defaultDifficulty;

  function setDifficulty(d) {
    difficulty = d;
  }

  function getDifficulty() {
    return difficulty;
  }

  /** Pick the best move for the AI. Returns cell index. */
  function chooseMove() {
    if (difficulty === 'easy') return easyMove();
    if (difficulty === 'medium') return mediumMove();
    return hardMove();
  }

  // --- Easy: random empty cell ---
  function easyMove() {
    var empty = Board.emptyCells();
    if (empty.length === 0) return -1;
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // --- Medium: block wins, take wins, otherwise random ---
  function mediumMove() {
    var aiMark = Config.aiMark;
    var playerMark = Config.playerMark;
    var empty = Board.emptyCells();
    if (empty.length === 0) return -1;

    // 1. Take a winning move if available
    var winMove = findWinningMove(aiMark);
    if (winMove !== -1) return winMove;

    // 2. Block opponent's winning move
    var blockMove = findWinningMove(playerMark);
    if (blockMove !== -1) return blockMove;

    // 3. Take center if available
    if (Board.getCell(4) === null) return 4;

    // 4. Random from remaining
    return empty[Math.floor(Math.random() * empty.length)];
  }

  /** Find a cell that would give `mark` a win. Returns index or -1. */
  function findWinningMove(mark) {
    var empty = Board.emptyCells();
    for (var i = 0; i < empty.length; i++) {
      Board.place(empty[i], mark);
      var wins = Board.checkWin(mark);
      Board.unplace(empty[i]);
      if (wins) return empty[i];
    }
    return -1;
  }

  // --- Hard: minimax with alpha-beta pruning ---
  function hardMove() {
    var empty = Board.emptyCells();
    if (empty.length === 0) return -1;

    // If board is empty, pick a corner (optimization — skip full search)
    if (empty.length === 9) {
      var corners = [0, 2, 6, 8];
      return corners[Math.floor(Math.random() * corners.length)];
    }

    var bestScore = -Infinity;
    var bestMoves = [];

    for (var i = 0; i < empty.length; i++) {
      Board.place(empty[i], Config.aiMark);
      var score = minimax(0, false, -Infinity, Infinity);
      Board.unplace(empty[i]);

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [empty[i]];
      } else if (score === bestScore) {
        bestMoves.push(empty[i]);
      }
    }

    // Pick randomly among equally-scored best moves
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  /**
   * Minimax with alpha-beta pruning.
   * @param {number} depth - current search depth
   * @param {boolean} isMaximizing - true if AI's turn (maximizing)
   * @param {number} alpha - best score for maximizer
   * @param {number} beta - best score for minimizer
   * @returns {number} evaluation score
   */
  function minimax(depth, isMaximizing, alpha, beta) {
    // Terminal checks
    if (Board.checkWin(Config.aiMark)) return 10 - depth;
    if (Board.checkWin(Config.playerMark)) return depth - 10;
    if (Board.isDraw()) return 0;

    var empty = Board.emptyCells();

    if (isMaximizing) {
      var maxEval = -Infinity;
      for (var i = 0; i < empty.length; i++) {
        Board.place(empty[i], Config.aiMark);
        var eval1 = minimax(depth + 1, false, alpha, beta);
        Board.unplace(empty[i]);
        if (eval1 > maxEval) maxEval = eval1;
        if (maxEval > alpha) alpha = maxEval;
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      var minEval = Infinity;
      for (var j = 0; j < empty.length; j++) {
        Board.place(empty[j], Config.playerMark);
        var eval2 = minimax(depth + 1, true, alpha, beta);
        Board.unplace(empty[j]);
        if (eval2 < minEval) minEval = eval2;
        if (minEval < beta) beta = minEval;
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  return {
    setDifficulty: setDifficulty,
    getDifficulty: getDifficulty,
    chooseMove: chooseMove,
  };
})();
