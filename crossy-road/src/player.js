/* Crossy Road — Player module
   Grid-based hop movement with smooth animation.
*/

var Player = (function () {

  // Grid position (col, row) — row 0 is start, increases upward
  var col = 0;
  var row = 0;

  // Pixel position for smooth animation
  var px = 0;
  var py = 0;

  // Hop animation
  var hopping = false;
  var hopFrom = { x: 0, y: 0 };
  var hopTo = { x: 0, y: 0 };
  var hopTimer = 0;
  var hopDir = 'up'; // last hop direction for facing

  // Input buffering — stores the next hop direction during a hop
  var bufferedDir = null;
  var bufferedLanes = null;

  // Riding a log/lily pad
  var ridingOffset = 0;

  // Landing grace — brief invulnerability after hop lands on river
  var landingGrace = 0;

  // Furthest row reached
  var furthestRow = 0;

  // Idle timer
  var idleTimer = 0;
  var eagleActive = false;
  var eagleTimer = 0;
  var alive = true;

  function gridToPixelX(c) {
    return c * Config.cellSize + Config.halfCell;
  }

  function gridToPixelY(r, cameraY) {
    // Row increases upward, but screen Y increases downward
    // Row 0 is at the bottom of the initial view
    return -r * Config.cellSize;
  }

  function reset() {
    col = Math.floor(Config.cols / 2);
    row = 0;
    px = gridToPixelX(col);
    py = gridToPixelY(row);
    hopping = false;
    hopTimer = 0;
    hopDir = 'up';
    bufferedDir = null;
    bufferedLanes = null;
    ridingOffset = 0;
    landingGrace = 0;
    furthestRow = 0;
    idleTimer = 0;
    eagleActive = false;
    eagleTimer = 0;
    alive = true;
  }

  function tryHop(dir, lanes) {
    if (!alive) return false;

    // Buffer input if currently hopping
    if (hopping) {
      bufferedDir = dir;
      bufferedLanes = lanes;
      return false;
    }

    return executeHop(dir, lanes);
  }

  function executeHop(dir, lanes) {
    var newCol = col;
    var newRow = row;

    if (dir === 'up') newRow = row + 1;
    else if (dir === 'down') newRow = row - 1;
    else if (dir === 'left') newCol = col - 1;
    else if (dir === 'right') newCol = col + 1;

    // Check if on a river lane and hopping left/right
    if ((dir === 'left' || dir === 'right')) {
      var currentLane = lanes.getLane(row);
      if (currentLane && currentLane.type === Config.RIVER) {
        // Find which log we're on
        var onLog = null;
        for (var li = 0; li < currentLane.logs.length; li++) {
          var lg = currentLane.logs[li];
          if (px > lg.x && px < lg.x + lg.w) {
            onLog = lg;
            break;
          }
        }

        if (onLog) {
          var edgeThreshold = Config.cellSize * 0.8;
          var nearRightEdge = (dir === 'right' && (onLog.x + onLog.w - px) < edgeThreshold);
          var nearLeftEdge = (dir === 'left' && (px - onLog.x) < edgeThreshold);

          if (nearRightEdge || nearLeftEdge) {
            // Near the edge — do a big hop to the adjacent log
            var target = lanes.findAdjacentLog(px, row, dir);
            if (target) {
              hopping = true;
              hopDir = dir;
              hopTimer = 0;
              hopFrom.x = px;
              hopFrom.y = py;
              hopTo.x = target.x;
              hopTo.y = py;
              col = Math.round((target.x - Config.halfCell) / Config.cellSize);
              col = Math.max(0, Math.min(Config.cols - 1, col));
              idleTimer = 0;
              return true;
            }
            // No adjacent log — block the hop
            return false;
          } else {
            // Not near edge — do a normal small hop along the log
            var hopDist = Config.cellSize;
            var targetX = px + (dir === 'right' ? hopDist : -hopDist);

            // Clamp to log bounds so we don't hop off into water
            targetX = Math.max(onLog.x + Config.playerSize / 2 + 2, targetX);
            targetX = Math.min(onLog.x + onLog.w - Config.playerSize / 2 - 2, targetX);

            // Don't hop if we're already at the edge
            if (Math.abs(targetX - px) < 4) return false;

            hopping = true;
            hopDir = dir;
            hopTimer = 0;
            hopFrom.x = px;
            hopFrom.y = py;
            hopTo.x = targetX;
            hopTo.y = py;
            col = Math.round((targetX - Config.halfCell) / Config.cellSize);
            col = Math.max(0, Math.min(Config.cols - 1, col));
            idleTimer = 0;
            return true;
          }
        }
        // Not on a log — block horizontal hop on river
        return false;
      }
    }

    // When moving left/right while drifted on a log, snap col to nearest column
    if (dir === 'left' || dir === 'right') {
      var nearestCol = Math.round((px - Config.halfCell) / Config.cellSize);
      nearestCol = Math.max(0, Math.min(Config.cols - 1, nearestCol));
      if (dir === 'left') newCol = nearestCol - 1;
      else newCol = nearestCol + 1;
      col = nearestCol;
    }

    // Bounds check
    if (newCol < 0 || newCol >= Config.cols) return false;
    if (newRow < 0) return false;

    // Check for tree obstacles on target cell
    var lane = lanes.getLane(newRow);
    if (lane && lane.type === Config.GRASS && lane.trees && lane.trees[newCol]) {
      return false;
    }

    // Start hop animation from current actual position
    hopping = true;
    hopDir = dir;
    hopTimer = 0;
    hopFrom.x = px;
    hopFrom.y = py;
    col = newCol;
    row = newRow;

    // For up/down hops: keep X the same (straight vertical)
    // For left/right hops: keep Y the same (straight horizontal)
    if (dir === 'up' || dir === 'down') {
      hopTo.x = px;  // straight vertical — no horizontal drift
      hopTo.y = gridToPixelY(newRow);
    } else {
      hopTo.x = gridToPixelX(newCol);
      hopTo.y = py;  // straight horizontal
    }

    // Reset idle timer on forward movement
    if (dir === 'up') {
      idleTimer = 0;
      eagleActive = false;
      eagleTimer = 0;
    }

    return true;
  }

  function update(dt) {
    if (!alive) return;

    // Hop animation
    if (hopping) {
      hopTimer += dt;
      var t = Math.min(hopTimer / Config.hopDuration, 1);
      // Ease out
      var ease = 1 - (1 - t) * (1 - t);
      px = hopFrom.x + (hopTo.x - hopFrom.x) * ease;
      py = hopFrom.y + (hopTo.y - hopFrom.y) * ease;

      if (t >= 1) {
        hopping = false;
        px = hopTo.x;
        py = hopTo.y;
        landingGrace = 0.15; // brief grace period for river landing

        // Process buffered input
        if (bufferedDir && bufferedLanes) {
          var dir = bufferedDir;
          var lanes = bufferedLanes;
          bufferedDir = null;
          bufferedLanes = null;
          executeHop(dir, lanes);
        }
      }
    }

    // Track furthest row
    if (row > furthestRow) {
      furthestRow = row;
    }

    // Landing grace countdown
    if (landingGrace > 0) {
      landingGrace -= dt;
    }

    // Idle timeout
    idleTimer += dt;
    if (idleTimer >= Config.idleTimeout && !eagleActive) {
      eagleActive = true;
      eagleTimer = 0;
    }
    if (eagleActive) {
      eagleTimer += dt;
      if (eagleTimer >= Config.eagleWarning) {
        alive = false;
        return;
      }
    }
  }

  function applyRiding(offsetX) {
    ridingOffset = offsetX;
    if (!hopping) {
      px += offsetX;
    }
  }

  function resetLandingGrace() {
    landingGrace = 0;
  }

  function hasLandingGrace() {
    return landingGrace > 0;
  }

  function die() {
    alive = false;
  }

  return {
    reset: reset,
    tryHop: tryHop,
    update: update,
    applyRiding: applyRiding,
    resetLandingGrace: resetLandingGrace,
    hasLandingGrace: hasLandingGrace,
    die: die,

    get col() { return col; },
    get row() { return row; },
    get px() { return px; },
    get py() { return py; },
    get hopping() { return hopping; },
    get hopDir() { return hopDir; },
    get hopTimer() { return hopTimer; },
    get furthestRow() { return furthestRow; },
    get alive() { return alive; },
    get eagleActive() { return eagleActive; },
    get eagleTimer() { return eagleTimer; },
    get idleTimer() { return idleTimer; },

    // For collision detection
    get worldX() { return px; },
    get worldY() { return py; },
  };
})();
