/* Minesweeper — Board logic (mine placement, reveal, flood fill) */

var Board = (function () {

  var grid = [];      // 2D array of cell objects
  var firstClick = true;
  var gameOver = false;
  var won = false;
  var _flagCount = 0;
  var _revealedCount = 0;

  function makeCell() {
    return { mine: false, revealed: false, flagged: false, neighbors: 0 };
  }

  /** Create empty grid, reset state */
  function reset() {
    grid = [];
    firstClick = true;
    gameOver = false;
    won = false;
    _flagCount = 0;
    _revealedCount = 0;

    for (var y = 0; y < Config.rows; y++) {
      grid[y] = [];
      for (var x = 0; x < Config.cols; x++) {
        grid[y][x] = makeCell();
      }
    }
  }

  /** Place mines randomly, excluding safeX/safeY and its 8 neighbors */
  function placeMines(safeX, safeY) {
    var placed = 0;
    var total = Config.cols * Config.rows;

    while (placed < Config.mines) {
      var idx = Math.floor(Math.random() * total);
      var mx = idx % Config.cols;
      var my = Math.floor(idx / Config.cols);

      // Skip if already a mine
      if (grid[my][mx].mine) continue;

      // Skip if in the safe zone (clicked cell + 8 neighbors)
      if (Math.abs(mx - safeX) <= 1 && Math.abs(my - safeY) <= 1) continue;

      grid[my][mx].mine = true;
      placed++;
    }

    // Calculate neighbor counts
    for (var y = 0; y < Config.rows; y++) {
      for (var x = 0; x < Config.cols; x++) {
        if (grid[y][x].mine) continue;
        var count = 0;
        for (var dy = -1; dy <= 1; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            var nx = x + dx;
            var ny = y + dy;
            if (nx >= 0 && nx < Config.cols && ny >= 0 && ny < Config.rows) {
              if (grid[ny][nx].mine) count++;
            }
          }
        }
        grid[y][x].neighbors = count;
      }
    }
  }

  /**
   * Reveal a cell. Returns { status: 'ok'|'mine'|'win', revealed: number }
   * On first click, places mines first.
   */
  function reveal(x, y) {
    if (gameOver || won) return { status: 'ok', revealed: 0 };
    if (x < 0 || x >= Config.cols || y < 0 || y >= Config.rows) return { status: 'ok', revealed: 0 };

    var cell = grid[y][x];
    if (cell.revealed || cell.flagged) return { status: 'ok', revealed: 0 };

    // First click safety
    if (firstClick) {
      placeMines(x, y);
      firstClick = false;
    }

    // Hit a mine
    if (cell.mine) {
      cell.revealed = true;
      gameOver = true;
      return { status: 'mine', revealed: 1 };
    }

    // BFS flood fill
    var count = 0;
    var queue = [{ x: x, y: y }];

    while (queue.length > 0) {
      var pos = queue.shift();
      var c = grid[pos.y][pos.x];

      if (c.revealed || c.flagged) continue;

      c.revealed = true;
      _revealedCount++;
      count++;

      // If empty cell (0 neighbors), expand to all 8 neighbors
      if (c.neighbors === 0) {
        for (var dy = -1; dy <= 1; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            var nx = pos.x + dx;
            var ny = pos.y + dy;
            if (nx >= 0 && nx < Config.cols && ny >= 0 && ny < Config.rows) {
              if (!grid[ny][nx].revealed && !grid[ny][nx].mine) {
                queue.push({ x: nx, y: ny });
              }
            }
          }
        }
      }
    }

    // Check win condition
    if (_revealedCount === Config.cols * Config.rows - Config.mines) {
      won = true;
      return { status: 'win', revealed: count };
    }

    return { status: 'ok', revealed: count };
  }

  /** Toggle flag on a hidden cell. Returns new flagged state. */
  function toggleFlag(x, y) {
    if (gameOver || won) return false;
    if (x < 0 || x >= Config.cols || y < 0 || y >= Config.rows) return false;

    var cell = grid[y][x];
    if (cell.revealed) return false;

    cell.flagged = !cell.flagged;
    _flagCount += cell.flagged ? 1 : -1;
    return cell.flagged;
  }

  /** Reveal entire board (called on game over) */
  function revealAll() {
    for (var y = 0; y < Config.rows; y++) {
      for (var x = 0; x < Config.cols; x++) {
        grid[y][x].revealed = true;
      }
    }
  }

  /** Get cell data at position */
  function getCell(x, y) {
    if (x < 0 || x >= Config.cols || y < 0 || y >= Config.rows) return null;
    return grid[y][x];
  }

  return {
    reset: reset,
    reveal: reveal,
    toggleFlag: toggleFlag,
    revealAll: revealAll,
    getCell: getCell,
    get flagCount() { return _flagCount; },
    get revealedCount() { return _revealedCount; },
    get isGameOver() { return gameOver; },
    get isWon() { return won; },
    get isFirstClick() { return firstClick; },
  };
})();
