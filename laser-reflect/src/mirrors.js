/* Laser Reflect — Mirror placement and board state */

var Mirrors = (function () {

  var board = [];      // 2D grid: null, 'wall', '/', '\'
  var placed = [];     // [{x, y, type}] — player-placed mirrors
  var available = 0;   // mirrors left to place
  var fixedMirrors = []; // cannot be moved

  function reset(level) {
    board = [];
    placed = [];
    fixedMirrors = level.fixed ? level.fixed.slice() : [];
    available = level.mirrors;

    // Initialize empty board
    for (var y = 0; y < Config.rows; y++) {
      board[y] = [];
      for (var x = 0; x < Config.cols; x++) {
        board[y][x] = null;
      }
    }

    // Place walls
    for (var i = 0; i < level.walls.length; i++) {
      var w = level.walls[i];
      board[w.y][w.x] = 'wall';
    }

    // Place fixed mirrors
    for (var i = 0; i < fixedMirrors.length; i++) {
      var m = fixedMirrors[i];
      board[m.y][m.x] = m.type;
    }
  }

  /** Check if a cell is available for mirror placement */
  function canPlace(x, y, emitter, target) {
    if (x < 0 || x >= Config.cols || y < 0 || y >= Config.rows) return false;
    if (board[y][x] !== null) return false;
    if (x === emitter.x && y === emitter.y) return false;
    if (x === target.x && y === target.y) return false;
    return true;
  }

  /** Place or toggle a mirror at (x, y) */
  function toggle(x, y, emitter, target) {
    // If there's already a player-placed mirror here, cycle: / → \ → remove
    var existingIdx = -1;
    for (var i = 0; i < placed.length; i++) {
      if (placed[i].x === x && placed[i].y === y) {
        existingIdx = i;
        break;
      }
    }

    if (existingIdx >= 0) {
      var existing = placed[existingIdx];
      if (existing.type === '/') {
        // Switch to backslash
        existing.type = '\\';
        board[y][x] = '\\';
      } else {
        // Remove
        placed.splice(existingIdx, 1);
        board[y][x] = null;
        available++;
      }
      return true;
    }

    // Place new mirror
    if (available <= 0) return false;
    if (!canPlace(x, y, emitter, target)) return false;

    placed.push({ x: x, y: y, type: '/' });
    board[y][x] = '/';
    available--;
    return true;
  }

  /** Check if a cell has a fixed mirror */
  function isFixed(x, y) {
    for (var i = 0; i < fixedMirrors.length; i++) {
      if (fixedMirrors[i].x === x && fixedMirrors[i].y === y) return true;
    }
    return false;
  }

  function getBoard() { return board; }
  function getPlaced() { return placed; }
  function getAvailable() { return available; }

  return {
    reset: reset,
    toggle: toggle,
    isFixed: isFixed,
    canPlace: canPlace,
    getBoard: getBoard,
    getPlaced: getPlaced,
    get available() { return available; },
  };
})();
