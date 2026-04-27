/* Crossy Road — Lanes module
   Procedural lane generation, obstacle spawning, movement.
*/

var Lanes = (function () {

  var lanes = {};       // keyed by row index
  var lowestRow = 0;
  var highestRow = 0;
  var consecutiveRoad = 0;
  var consecutiveRiver = 0;

  function reset() {
    lanes = {};
    lowestRow = 0;
    highestRow = 0;
    consecutiveRoad = 0;
    consecutiveRiver = 0;

    // Generate safe grass lanes below and at start to fill the whole screen
    var belowRows = Math.ceil(Config.canvasH / Config.cellSize) + 2;
    for (var r = -belowRows; r < Config.startSafeLanes; r++) {
      lanes[r] = createGrassLane(r, true);
    }
    highestRow = Config.startSafeLanes - 1;

    // Generate ahead
    generateTo(Config.startSafeLanes + Config.generateAhead);
  }

  function createGrassLane(row, safe) {
    var trees = {};
    if (!safe) {
      for (var c = 0; c < Config.cols; c++) {
        if (Math.random() < Config.treeChance) {
          trees[c] = true;
        }
      }
      // Ensure at least one path through (middle area clear)
      var mid = Math.floor(Config.cols / 2);
      delete trees[mid];
      delete trees[mid - 1];
      delete trees[mid + 1];
    }
    return {
      type: Config.GRASS,
      row: row,
      dark: row % 2 === 0,
      trees: trees,
    };
  }

  function createRoadLane(row) {
    var speed = Config.carMinSpeed + Math.random() * (Config.carMaxSpeed - Config.carMinSpeed);
    var dir = Math.random() < 0.5 ? 1 : -1;
    var cars = [];
    var gap = Config.carMinGap + Math.random() * (Config.carMaxGap - Config.carMinGap);
    var count = Math.floor((Config.canvasW + 200) / (Config.carWidth + gap)) + 1;
    var color = Config.carColors[Math.floor(Math.random() * Config.carColors.length)];

    for (var i = 0; i < count; i++) {
      cars.push({
        x: i * (Config.carWidth + gap) + (dir > 0 ? -200 : Config.canvasW + 200 - i * (Config.carWidth + gap)),
        w: Config.carWidth,
        color: color,
      });
    }

    return {
      type: Config.ROAD,
      row: row,
      speed: speed,
      dir: dir,
      cars: cars,
      dark: row % 2 === 0,
    };
  }

  function createRiverLane(row) {
    var speed = Config.logMinSpeed + Math.random() * (Config.logMaxSpeed - Config.logMinSpeed);
    var dir = Math.random() < 0.5 ? 1 : -1;
    var logs = [];
    var logW = Config.logMinWidth + Math.random() * (Config.logMaxWidth - Config.logMinWidth);
    var gap = Config.logMinGap + Math.random() * (Config.logMaxGap - Config.logMinGap);
    // Ensure enough logs to always have at least one on screen
    var totalSpan = Config.canvasW + logW + gap * 2 + 400;
    var count = Math.ceil(totalSpan / (logW + gap));
    if (count < 3) count = 3;

    for (var i = 0; i < count; i++) {
      var startX = i * (logW + gap);
      if (dir < 0) startX = Config.canvasW - startX;
      logs.push({
        x: startX,
        w: logW,
      });
    }

    return {
      type: Config.RIVER,
      row: row,
      speed: speed,
      dir: dir,
      logs: logs,
      dark: row % 2 === 0,
    };
  }

  function pickLaneType() {
    // Enforce constraints
    if (consecutiveRoad >= Config.maxConsecutiveRoad) {
      consecutiveRoad = 0;
      if (Math.random() < 0.5) {
        consecutiveRiver = 0;
        return Config.GRASS;
      }
      return Config.RIVER;
    }
    if (consecutiveRiver >= Config.maxConsecutiveRiver) {
      consecutiveRiver = 0;
      if (Math.random() < 0.5) {
        consecutiveRoad = 0;
        return Config.GRASS;
      }
      return Config.ROAD;
    }

    var r = Math.random();
    if (r < 0.35) return Config.GRASS;
    if (r < 0.7) return Config.ROAD;
    return Config.RIVER;
  }

  function generateTo(targetRow) {
    for (var r = highestRow + 1; r <= targetRow; r++) {
      var type = pickLaneType();

      if (type === Config.ROAD) {
        lanes[r] = createRoadLane(r);
        consecutiveRoad++;
        consecutiveRiver = 0;
      } else if (type === Config.RIVER) {
        lanes[r] = createRiverLane(r);
        consecutiveRiver++;
        consecutiveRoad = 0;
      } else {
        lanes[r] = createGrassLane(r, false);
        consecutiveRoad = 0;
        consecutiveRiver = 0;
      }
    }
    highestRow = Math.max(highestRow, targetRow);
  }

  function update(dt, cameraRow) {
    // Generate lanes ahead
    var targetRow = cameraRow + Config.generateAhead;
    if (targetRow > highestRow) {
      generateTo(targetRow);
    }

    // Recycle lanes well behind the camera (off-screen)
    var screenRows = Math.ceil(Config.canvasH / Config.cellSize);
    var minRow = cameraRow - screenRows - 3;
    for (var key in lanes) {
      if (lanes.hasOwnProperty(key)) {
        var r = parseInt(key);
        if (r < minRow) {
          delete lanes[key];
        }
      }
    }

    // Update moving objects
    for (var key2 in lanes) {
      if (!lanes.hasOwnProperty(key2)) continue;
      var lane = lanes[key2];

      if (lane.type === Config.ROAD) {
        for (var i = 0; i < lane.cars.length; i++) {
          var car = lane.cars[i];
          car.x += lane.speed * lane.dir * dt;
          // Wrap cars
          if (lane.dir > 0 && car.x > Config.canvasW + 100) {
            car.x = -Config.carWidth - 100;
          } else if (lane.dir < 0 && car.x < -Config.carWidth - 100) {
            car.x = Config.canvasW + 100;
          }
        }
      } else if (lane.type === Config.RIVER) {
        for (var j = 0; j < lane.logs.length; j++) {
          var log = lane.logs[j];
          log.x += lane.speed * lane.dir * dt;
          // Wrap logs
          if (lane.dir > 0 && log.x > Config.canvasW + 200) {
            log.x = -log.w - 200;
          } else if (lane.dir < 0 && log.x < -log.w - 200) {
            log.x = Config.canvasW + 200;
          }
        }
      }
    }
  }

  function getLane(row) {
    return lanes[row] || null;
  }

  // Check if player is on a log. Returns log offset per frame or null.
  function checkRiverRiding(playerX, playerRow, dt) {
    var lane = lanes[playerRow];
    if (!lane || lane.type !== Config.RIVER) return null;

    var playerLeft = playerX - Config.playerSize / 2;
    var playerRight = playerX + Config.playerSize / 2;

    for (var i = 0; i < lane.logs.length; i++) {
      var log = lane.logs[i];
      if (playerRight > log.x + 4 && playerLeft < log.x + log.w - 4) {
        // On a log — return movement offset
        return lane.speed * lane.dir * dt;
      }
    }

    // In water — not on any log
    return null;
  }

  // Check car collision using actual pixel position
  function checkCarCollision(playerX, playerRow) {
    var lane = lanes[playerRow];
    if (!lane || lane.type !== Config.ROAD) return false;

    var playerLeft = playerX - Config.playerSize / 2 + 4;
    var playerRight = playerX + Config.playerSize / 2 - 4;

    for (var i = 0; i < lane.cars.length; i++) {
      var car = lane.cars[i];
      if (playerRight > car.x && playerLeft < car.x + car.w) {
        return true;
      }
    }
    return false;
  }

  // Get all lanes in a range for rendering
  function getLanesInRange(minRow, maxRow) {
    var result = [];
    for (var r = minRow; r <= maxRow; r++) {
      if (lanes[r]) result.push(lanes[r]);
    }
    return result;
  }

  /**
   * Find the nearest log in a direction on the same river lane.
   * Returns { x: landingX } where landingX is the center of the target log,
   * or null if no reachable log found.
   */
  function findAdjacentLog(playerX, playerRow, dir) {
    var lane = lanes[playerRow];
    if (!lane || lane.type !== Config.RIVER) return null;

    // Find which log the player is currently on
    var currentLog = null;
    for (var i = 0; i < lane.logs.length; i++) {
      var log = lane.logs[i];
      if (playerX > log.x && playerX < log.x + log.w) {
        currentLog = log;
        break;
      }
    }
    if (!currentLog) return null;

    // Find the nearest log in the given direction
    var bestLog = null;
    var bestDist = Infinity;

    for (var j = 0; j < lane.logs.length; j++) {
      var candidate = lane.logs[j];
      if (candidate === currentLog) continue;

      var candidateCenter = candidate.x + candidate.w / 2;

      if (dir === 'right') {
        // Log must be to the right of current log's right edge
        if (candidate.x > currentLog.x + currentLog.w - 10) {
          var dist = candidate.x - (currentLog.x + currentLog.w);
          if (dist < bestDist && candidateCenter < Config.canvasW + 50) {
            bestDist = dist;
            bestLog = candidate;
          }
        }
      } else if (dir === 'left') {
        // Log must be to the left of current log's left edge
        if (candidate.x + candidate.w < currentLog.x + 10) {
          var distL = currentLog.x - (candidate.x + candidate.w);
          if (distL < bestDist && candidateCenter > -50) {
            bestDist = distL;
            bestLog = candidate;
          }
        }
      }
    }

    if (!bestLog) return null;

    // Land on the near edge of the target log (not the center)
    var landX;
    if (dir === 'right') {
      landX = bestLog.x + Config.playerSize / 2 + 4;
    } else {
      landX = bestLog.x + bestLog.w - Config.playerSize / 2 - 4;
    }

    return { x: landX };
  }

  return {
    reset: reset,
    update: update,
    getLane: getLane,
    checkRiverRiding: checkRiverRiding,
    checkCarCollision: checkCarCollision,
    getLanesInRange: getLanesInRange,
    findAdjacentLog: findAdjacentLog,
  };
})();
