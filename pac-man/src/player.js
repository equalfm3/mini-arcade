/* Pac-Man — Player Module
   
   Pac-Man movement, animation, and collision with maze.
   Uses tile-based movement — Pac-Man moves between tile centers.
*/

var Player = (function () {

  var col, row;           // current tile position
  var px, py;             // pixel position (center of Pac-Man)
  var dir;                // current direction: 'up','down','left','right'
  var nextDir;            // buffered next direction
  var moving;             // is currently moving
  var mouthAngle;         // mouth open angle for animation
  var mouthOpening;       // mouth direction (opening/closing)
  var alive;
  var deathTimer;

  var speed;              // pixels per second

  var DIRS = {
    up:    { dc: 0,  dr: -1 },
    down:  { dc: 0,  dr: 1 },
    left:  { dc: -1, dr: 0 },
    right: { dc: 1,  dr: 0 },
  };

  var DIR_ANGLES = {
    right: 0,
    down: Math.PI / 2,
    left: Math.PI,
    up: -Math.PI / 2,
  };

  function reset(level) {
    col = Config.playerStartCol;
    row = Config.playerStartRow;
    px = col * Config.cellSize + Config.cellSize / 2;
    py = row * Config.cellSize + Config.cellSize / 2;
    dir = 'left';
    nextDir = 'left';
    moving = false;
    mouthAngle = 0.25;
    mouthOpening = true;
    alive = true;
    deathTimer = 0;
    speed = Config.playerSpeed + (level || 0) * Config.levelSpeedBoost;
  }

  function setDirection(d) {
    nextDir = d;
  }

  function canMove(fromCol, fromRow, direction) {
    var d = DIRS[direction];
    var nc = fromCol + d.dc;
    var nr = fromRow + d.dr;

    // Tunnel wrapping
    if (nc < 0) nc = Config.cols - 1;
    if (nc >= Config.cols) nc = 0;

    return Maze.isWalkable(nc, nr) || Maze.isTunnel(nc, nr) || Maze.isGhostDoor(nc, nr) === false && Maze.getTile(nc, nr) !== Maze.WALL;
  }

  function isWalkableForPlayer(c, r) {
    var t = Maze.getTile(c, r);
    return t !== Maze.WALL && t !== Maze.GHOST_HOUSE && t !== Maze.GHOST_DOOR;
  }

  function canMoveDir(fromCol, fromRow, direction) {
    var d = DIRS[direction];
    var nc = fromCol + d.dc;
    var nr = fromRow + d.dr;
    if (nc < 0) nc = Config.cols - 1;
    if (nc >= Config.cols) nc = 0;
    return isWalkableForPlayer(nc, nr);
  }

  function update(dt) {
    if (!alive) {
      deathTimer += dt;
      return;
    }

    var cs = Config.cellSize;
    var half = cs / 2;
    var targetX = col * cs + half;
    var targetY = row * cs + half;
    var dist = speed * dt;

    // Check if at tile center (close enough)
    var dx = targetX - px;
    var dy = targetY - py;
    var atCenter = Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5;

    if (atCenter) {
      // Snap to center
      px = targetX;
      py = targetY;

      // Try buffered direction first
      if (nextDir && canMoveDir(col, row, nextDir)) {
        dir = nextDir;
      }

      // Try to continue in current direction
      if (canMoveDir(col, row, dir)) {
        moving = true;
        var d = DIRS[dir];
        var nc = col + d.dc;
        var nr = row + d.dr;

        // Tunnel wrapping
        if (nc < 0) nc = Config.cols - 1;
        if (nc >= Config.cols) nc = 0;

        col = nc;
        row = nr;
      } else {
        moving = false;
      }
    }

    // Move toward current target tile center
    if (moving) {
      targetX = col * cs + half;
      targetY = row * cs + half;

      // Handle tunnel wrapping in pixel space
      dx = targetX - px;
      dy = targetY - py;

      // If wrapping through tunnel, teleport
      if (Math.abs(dx) > cs * 2) {
        px = targetX;
        py = targetY;
      } else {
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          var step = Math.min(dist, len);
          px += (dx / len) * step;
          py += (dy / len) * step;
        }
      }
    }

    // Mouth animation
    if (moving) {
      if (mouthOpening) {
        mouthAngle += Config.mouthSpeed * dt;
        if (mouthAngle >= 0.35) mouthOpening = false;
      } else {
        mouthAngle -= Config.mouthSpeed * dt;
        if (mouthAngle <= 0.02) mouthOpening = true;
      }
    }
  }

  function die() {
    alive = false;
    deathTimer = 0;
  }

  function draw(ctx) {
    if (!alive) {
      // Death animation — shrinking pac-man
      var progress = Math.min(deathTimer / 1.0, 1);
      var startAngle = progress * Math.PI;
      var endAngle = Math.PI * 2 - startAngle;
      if (startAngle >= Math.PI) return; // fully gone

      var cs = Config.cellSize;
      var radius = cs / 2 - 1;

      ctx.save();
      ctx.translate(px, py);
      ctx.fillStyle = Config.playerColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle + Math.PI / 2, endAngle + Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    var cs = Config.cellSize;
    var radius = cs / 2 - 1;
    var angle = DIR_ANGLES[dir] || 0;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);

    ctx.fillStyle = Config.playerColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, mouthAngle * Math.PI, -mouthAngle * Math.PI, true);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  return {
    reset: reset,
    setDirection: setDirection,
    update: update,
    die: die,
    draw: draw,
    get col() { return col; },
    get row() { return row; },
    get px() { return px; },
    get py() { return py; },
    get dir() { return dir; },
    get alive() { return alive; },
    get moving() { return moving; },
    get deathTimer() { return deathTimer; },
  };
})();
