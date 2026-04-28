/* Laser Reflect — Laser tracing logic

   Traces the laser path from emitter through mirrors,
   reflecting off '/' and '\' mirrors until hitting a wall,
   edge, or target.
*/

var Laser = (function () {

  var path = []; // Array of {x, y} points the laser passes through
  var hitTarget = false;

  // Direction vectors
  var dirs = {
    right: { dx: 1, dy: 0 },
    left:  { dx: -1, dy: 0 },
    down:  { dx: 0, dy: 1 },
    up:    { dx: 0, dy: -1 },
  };

  /**
   * Reflect a direction off a mirror.
   * '/' mirror: right↔up, left↔down, down↔left, up↔right
   * '\' mirror: right↔down, left↔up, down↔right, up↔left
   */
  function reflect(dir, mirrorType) {
    if (mirrorType === '/') {
      if (dir === 'right') return 'up';
      if (dir === 'left') return 'down';
      if (dir === 'down') return 'left';
      if (dir === 'up') return 'right';
    } else { // '\'
      if (dir === 'right') return 'down';
      if (dir === 'left') return 'up';
      if (dir === 'down') return 'right';
      if (dir === 'up') return 'left';
    }
    return dir;
  }

  /**
   * Trace the laser path given the current board state.
   * board: 2D array where each cell is null, 'wall', '/', '\', 'emitter', or 'target'
   * emitter: { x, y, dir }
   * target: { x, y }
   */
  function trace(board, emitter, target) {
    path = [];
    hitTarget = false;

    var dir = emitter.dir;
    var x = emitter.x;
    var y = emitter.y;
    path.push({ x: x, y: y });

    var bounces = 0;

    while (bounces < Config.maxBounces) {
      var d = dirs[dir];
      x += d.dx;
      y += d.dy;

      // Out of bounds
      if (x < 0 || x >= Config.cols || y < 0 || y >= Config.rows) {
        // Add exit point at edge
        path.push({ x: x, y: y });
        break;
      }

      var cell = board[y][x];

      // Hit wall
      if (cell === 'wall') {
        break;
      }

      // Hit target
      if (x === target.x && y === target.y) {
        path.push({ x: x, y: y });
        hitTarget = true;
        break;
      }

      // Hit mirror
      if (cell === '/' || cell === '\\') {
        path.push({ x: x, y: y });
        dir = reflect(dir, cell);
        bounces++;
        continue;
      }

      // Empty cell — laser passes through
      path.push({ x: x, y: y });
    }

    return { path: path, hit: hitTarget };
  }

  function getPath() { return path; }
  function didHit() { return hitTarget; }

  return {
    trace: trace,
    getPath: getPath,
    didHit: didHit,
  };
})();
