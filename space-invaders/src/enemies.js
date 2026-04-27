/* Space Invaders — Enemies module */

var Enemies = (function () {

  var grid = [];       // 2D array [row][col] of enemy objects or null
  var offsetX = 0;     // formation x offset
  var offsetY = 0;     // formation y offset
  var direction = 1;   // 1 = right, -1 = left
  var speed = 0;
  var aliveCount = 0;
  var animFrame = 0;   // 0 or 1 for sprite animation
  var animTimer = 0;
  var wave = 0;

  function reset(waveNum) {
    wave = waveNum || 0;
    grid = [];
    offsetX = Config.enemyLeftOffset;
    offsetY = Config.enemyTopOffset;
    direction = 1;
    aliveCount = 0;
    animFrame = 0;
    animTimer = 0;

    for (var row = 0; row < Config.enemyRows; row++) {
      var rowArr = [];
      for (var col = 0; col < Config.enemyCols; col++) {
        var type = Config.enemyTypes[row];
        rowArr.push({
          alive: true,
          row: row,
          col: col,
          type: type.name,
          points: type.points,
          color: type.color,
        });
        aliveCount++;
      }
      grid.push(rowArr);
    }

    // Calculate speed based on wave
    speed = Config.enemyBaseSpeed + wave * Config.waveSpeedBonus;
  }

  function update(dt) {
    if (aliveCount <= 0) return;

    // Animation timer
    animTimer += dt;
    if (animTimer >= Config.enemyAnimInterval) {
      animTimer -= Config.enemyAnimInterval;
      animFrame = 1 - animFrame;
    }

    // Calculate current speed based on how many enemies remain
    var killed = (Config.enemyRows * Config.enemyCols) - aliveCount;
    var currentSpeed = speed + killed * Config.enemySpeedIncrease;
    currentSpeed = Math.min(currentSpeed, Config.enemyMaxSpeed);

    // Move laterally
    offsetX += direction * currentSpeed * dt;

    // Check bounds — find leftmost and rightmost alive columns
    var leftEdge = getLeftEdge();
    var rightEdge = getRightEdge();

    if (rightEdge > Config.canvasW - 10) {
      direction = -1;
      offsetX = Config.canvasW - 10 - (rightEdge - offsetX);
      offsetY += Config.enemyDropDistance;
    } else if (leftEdge < 10) {
      direction = 1;
      offsetX = 10 - (leftEdge - offsetX);
      offsetY += Config.enemyDropDistance;
    }
  }

  function getLeftEdge() {
    for (var col = 0; col < Config.enemyCols; col++) {
      for (var row = 0; row < Config.enemyRows; row++) {
        if (grid[row][col] && grid[row][col].alive) {
          return offsetX + col * (Config.enemyW + Config.enemyPadX);
        }
      }
    }
    return offsetX;
  }

  function getRightEdge() {
    for (var col = Config.enemyCols - 1; col >= 0; col--) {
      for (var row = 0; row < Config.enemyRows; row++) {
        if (grid[row][col] && grid[row][col].alive) {
          return offsetX + col * (Config.enemyW + Config.enemyPadX) + Config.enemyW;
        }
      }
    }
    return offsetX;
  }

  function getBottomEdge() {
    for (var row = Config.enemyRows - 1; row >= 0; row--) {
      for (var col = 0; col < Config.enemyCols; col++) {
        if (grid[row][col] && grid[row][col].alive) {
          return offsetY + row * (Config.enemyH + Config.enemyPadY) + Config.enemyH;
        }
      }
    }
    return offsetY;
  }

  function getEnemyRect(row, col) {
    return {
      x: offsetX + col * (Config.enemyW + Config.enemyPadX),
      y: offsetY + row * (Config.enemyH + Config.enemyPadY),
      w: Config.enemyW,
      h: Config.enemyH,
    };
  }

  function kill(row, col) {
    if (grid[row][col] && grid[row][col].alive) {
      grid[row][col].alive = false;
      aliveCount--;
      return grid[row][col];
    }
    return null;
  }

  // Get bottom-most alive enemy in each column (for shooting)
  function getShooters() {
    var shooters = [];
    for (var col = 0; col < Config.enemyCols; col++) {
      for (var row = Config.enemyRows - 1; row >= 0; row--) {
        if (grid[row][col] && grid[row][col].alive) {
          var rect = getEnemyRect(row, col);
          shooters.push({
            row: row,
            col: col,
            cx: rect.x + rect.w / 2,
            cy: rect.y + rect.h,
          });
          break;
        }
      }
    }
    return shooters;
  }

  // Check if enemies have reached the player's level
  function reachedBottom() {
    return getBottomEdge() >= Config.playerY;
  }

  // Iterate over all alive enemies
  function forEach(callback) {
    for (var row = 0; row < Config.enemyRows; row++) {
      for (var col = 0; col < Config.enemyCols; col++) {
        if (grid[row][col] && grid[row][col].alive) {
          var rect = getEnemyRect(row, col);
          callback(grid[row][col], rect, row, col);
        }
      }
    }
  }

  return {
    reset: reset,
    update: update,
    kill: kill,
    getShooters: getShooters,
    getEnemyRect: getEnemyRect,
    reachedBottom: reachedBottom,
    forEach: forEach,
    get aliveCount() { return aliveCount; },
    get animFrame() { return animFrame; },
    get grid() { return grid; },
    get wave() { return wave; },
  };
})();
