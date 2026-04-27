/* Pac-Man — Ghosts Module
   
   4 ghosts with distinct AI behaviors:
   - Blinky (red): chases Pac-Man directly
   - Pinky (pink): targets 4 tiles ahead of Pac-Man
   - Inky (cyan): uses Blinky + Pac-Man position
   - Clyde (orange): chases when far, scatters when close
   
   Modes: SCATTER, CHASE, FRIGHTENED, EATEN
*/

var Ghosts = (function () {

  var SCATTER = 'scatter';
  var CHASE = 'chase';
  var FRIGHTENED = 'frightened';
  var EATEN = 'eaten';
  var IN_HOUSE = 'inhouse';

  var DIRS = {
    up:    { dc: 0,  dr: -1 },
    down:  { dc: 0,  dr: 1 },
    left:  { dc: -1, dr: 0 },
    right: { dc: 1,  dr: 0 },
  };

  var OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
  var DIR_LIST = ['up', 'left', 'down', 'right'];

  var ghosts = [];
  var globalMode = SCATTER;
  var modeIndex = 0;
  var modeTimer = 0;
  var frightenedTimer = 0;
  var ghostsEatenThisPower = 0;

  function createGhost(index) {
    return {
      index: index,
      col: Config.ghostStarts[index].col,
      row: Config.ghostStarts[index].row,
      px: 0,
      py: 0,
      dir: 'left',
      nextDir: null,
      mode: index === 0 ? SCATTER : IN_HOUSE,
      speed: Config.ghostSpeed,
      moving: true,
      releaseTimer: 0,
      released: index === 0,
      bobOffset: 0,
    };
  }

  function reset(level) {
    ghosts = [];
    for (var i = 0; i < 4; i++) {
      var g = createGhost(i);
      var cs = Config.cellSize;
      g.px = g.col * cs + cs / 2;
      g.py = g.row * cs + cs / 2;
      g.speed = Config.ghostSpeed + (level || 0) * Config.levelSpeedBoost;
      ghosts.push(g);
    }
    globalMode = SCATTER;
    modeIndex = 0;
    modeTimer = 0;
    frightenedTimer = 0;
    ghostsEatenThisPower = 0;
  }

  function getTargetTile(ghost) {
    var pCol = Player.col;
    var pRow = Player.row;
    var pDir = Player.dir;

    switch (ghost.index) {
      case 0: // Blinky — direct chase
        return { col: pCol, row: pRow };

      case 1: // Pinky — 4 tiles ahead
        var d = DIRS[pDir] || DIRS.left;
        return { col: pCol + d.dc * 4, row: pRow + d.dr * 4 };

      case 2: // Inky — uses Blinky's position
        var d2 = DIRS[pDir] || DIRS.left;
        var pivotCol = pCol + d2.dc * 2;
        var pivotRow = pRow + d2.dr * 2;
        var blinky = ghosts[0];
        return {
          col: pivotCol + (pivotCol - blinky.col),
          row: pivotRow + (pivotRow - blinky.row),
        };

      case 3: // Clyde — chase when far, scatter when close
        var distSq = (pCol - ghost.col) * (pCol - ghost.col) + (pRow - ghost.row) * (pRow - ghost.row);
        if (distSq > 64) { // > 8 tiles away
          return { col: pCol, row: pRow };
        }
        return Config.scatterTargets[3];

      default:
        return { col: pCol, row: pRow };
    }
  }

  function getSpeed(ghost) {
    if (ghost.mode === EATEN) return Config.ghostReturnSpeed;
    if (ghost.mode === FRIGHTENED) return Config.ghostFrightenedSpeed;
    if (Maze.isTunnel(ghost.col, ghost.row)) return Config.ghostTunnelSpeed;
    return ghost.speed;
  }

  function chooseDirection(ghost) {
    var target;
    var canEnterHouse = ghost.mode === EATEN || ghost.mode === IN_HOUSE;

    if (ghost.mode === SCATTER) {
      target = Config.scatterTargets[ghost.index];
    } else if (ghost.mode === CHASE) {
      target = getTargetTile(ghost);
    } else if (ghost.mode === EATEN) {
      target = { col: Config.ghostHouseExitCol, row: Config.ghostHouseExitRow };
    } else if (ghost.mode === FRIGHTENED) {
      // Random direction at intersections
      var options = [];
      for (var i = 0; i < DIR_LIST.length; i++) {
        var d = DIR_LIST[i];
        if (d === OPPOSITE[ghost.dir]) continue;
        var dd = DIRS[d];
        var nc = ghost.col + dd.dc;
        var nr = ghost.row + dd.dr;
        if (nc < 0) nc = Config.cols - 1;
        if (nc >= Config.cols) nc = 0;
        if (Maze.isWalkableForGhost(nc, nr, false)) {
          options.push(d);
        }
      }
      if (options.length > 0) {
        return options[Math.floor(Math.random() * options.length)];
      }
      return ghost.dir;
    } else {
      return ghost.dir;
    }

    // BFS to target — use Maze.bfs for best direction
    var bfsDir = Maze.bfs(ghost.col, ghost.row, target.col, target.row, canEnterHouse);
    if (bfsDir) return bfsDir;

    // Fallback: pick direction closest to target that isn't reverse
    var bestDir = ghost.dir;
    var bestDist = Infinity;

    for (var j = 0; j < DIR_LIST.length; j++) {
      var d2 = DIR_LIST[j];
      if (d2 === OPPOSITE[ghost.dir]) continue;
      var dd2 = DIRS[d2];
      var nc2 = ghost.col + dd2.dc;
      var nr2 = ghost.row + dd2.dr;
      if (nc2 < 0) nc2 = Config.cols - 1;
      if (nc2 >= Config.cols) nc2 = 0;

      if (!Maze.isWalkableForGhost(nc2, nr2, canEnterHouse)) continue;

      var dx = target.col - nc2;
      var dy = target.row - nr2;
      var dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        bestDir = d2;
      }
    }

    return bestDir;
  }

  function updateGhost(ghost, dt) {
    var cs = Config.cellSize;
    var half = cs / 2;
    var spd = getSpeed(ghost);
    var dist = spd * dt;

    // Handle in-house ghosts
    if (ghost.mode === IN_HOUSE) {
      ghost.releaseTimer += dt;
      // Bob up and down in the house
      ghost.bobOffset = Math.sin(ghost.releaseTimer * 3) * 3;
      ghost.py = ghost.row * cs + half + ghost.bobOffset;

      if (ghost.releaseTimer >= Config.ghostReleaseTimes[ghost.index]) {
        ghost.released = true;
        ghost.mode = globalMode;
        ghost.col = Config.ghostHouseExitCol;
        ghost.row = Config.ghostHouseExitRow;
        ghost.px = ghost.col * cs + half;
        ghost.py = ghost.row * cs + half;
        ghost.dir = 'left';
      }
      return;
    }

    var targetX = ghost.col * cs + half;
    var targetY = ghost.row * cs + half;
    var dx = targetX - ghost.px;
    var dy = targetY - ghost.py;
    var atCenter = Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5;

    if (atCenter) {
      ghost.px = targetX;
      ghost.py = targetY;

      // Check if eaten ghost reached the house
      if (ghost.mode === EATEN) {
        if (ghost.col === Config.ghostHouseExitCol && ghost.row === Config.ghostHouseExitRow) {
          ghost.mode = globalMode;
          ghost.col = Config.ghostHouseCol;
          ghost.row = Config.ghostHouseRow;
          ghost.px = ghost.col * cs + half;
          ghost.py = ghost.row * cs + half;
          // Move back out
          ghost.mode = globalMode;
          ghost.col = Config.ghostHouseExitCol;
          ghost.row = Config.ghostHouseExitRow;
          ghost.px = ghost.col * cs + half;
          ghost.py = ghost.row * cs + half;
          ghost.dir = 'left';
          return;
        }
      }

      // Choose next direction
      ghost.dir = chooseDirection(ghost);

      // Move to next tile
      var d = DIRS[ghost.dir];
      var nc = ghost.col + d.dc;
      var nr = ghost.row + d.dr;

      // Tunnel wrapping
      if (nc < 0) nc = Config.cols - 1;
      if (nc >= Config.cols) nc = 0;

      ghost.col = nc;
      ghost.row = nr;
    }

    // Move toward target
    targetX = ghost.col * cs + half;
    targetY = ghost.row * cs + half;
    dx = targetX - ghost.px;
    dy = targetY - ghost.py;

    // Tunnel teleport
    if (Math.abs(dx) > cs * 2) {
      ghost.px = targetX;
      ghost.py = targetY;
    } else {
      var len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        var step = Math.min(dist, len);
        ghost.px += (dx / len) * step;
        ghost.py += (dy / len) * step;
      }
    }
  }

  function update(dt) {
    // Mode timer (scatter/chase alternation)
    if (frightenedTimer > 0) {
      frightenedTimer -= dt;
      if (frightenedTimer <= 0) {
        frightenedTimer = 0;
        // Return all frightened ghosts to current global mode
        for (var i = 0; i < ghosts.length; i++) {
          if (ghosts[i].mode === FRIGHTENED) {
            ghosts[i].mode = globalMode;
          }
        }
      }
    } else {
      modeTimer += dt;
      if (modeIndex < Config.modeTimes.length && modeTimer >= Config.modeTimes[modeIndex]) {
        modeTimer = 0;
        modeIndex++;
        globalMode = (modeIndex % 2 === 0) ? SCATTER : CHASE;

        // Switch all active ghosts and reverse direction
        for (var j = 0; j < ghosts.length; j++) {
          if (ghosts[j].mode === SCATTER || ghosts[j].mode === CHASE) {
            ghosts[j].mode = globalMode;
            ghosts[j].dir = OPPOSITE[ghosts[j].dir] || ghosts[j].dir;
          }
        }
      }
    }

    // Update each ghost
    for (var k = 0; k < ghosts.length; k++) {
      updateGhost(ghosts[k], dt);
    }
  }

  function startFrightened() {
    frightenedTimer = Config.frightenedDuration;
    ghostsEatenThisPower = 0;

    for (var i = 0; i < ghosts.length; i++) {
      if (ghosts[i].mode === SCATTER || ghosts[i].mode === CHASE) {
        ghosts[i].mode = FRIGHTENED;
        ghosts[i].dir = OPPOSITE[ghosts[i].dir] || ghosts[i].dir;
      }
    }
  }

  /** Check collision with Pac-Man. Returns ghost index or -1. */
  function checkCollision(playerCol, playerRow, playerPx, playerPy) {
    var cs = Config.cellSize;
    var hitDist = cs * 0.8;

    for (var i = 0; i < ghosts.length; i++) {
      var g = ghosts[i];
      if (g.mode === IN_HOUSE || g.mode === EATEN) continue;

      var dx = playerPx - g.px;
      var dy = playerPy - g.py;
      if (Math.abs(dx) < hitDist && Math.abs(dy) < hitDist) {
        return i;
      }
    }
    return -1;
  }

  /** Eat a frightened ghost. Returns score. */
  function eatGhost(index) {
    ghosts[index].mode = EATEN;
    ghostsEatenThisPower++;
    return Config.ghostScoreBase * Math.pow(2, ghostsEatenThisPower - 1);
  }

  function isFlashing() {
    return frightenedTimer > 0 && frightenedTimer <= Config.frightenedFlashTime;
  }

  function draw(ctx) {
    var cs = Config.cellSize;
    var half = cs / 2;
    var radius = half - 1;
    var flashing = isFlashing();
    var flashOn = flashing ? Math.floor(frightenedTimer * 6) % 2 === 0 : false;

    for (var i = 0; i < ghosts.length; i++) {
      var g = ghosts[i];
      if (g.mode === IN_HOUSE && !g.released) {
        // Draw ghost bobbing in house
        drawGhostBody(ctx, g.px, g.py, radius, Config.ghostColors[i]);
        drawGhostEyes(ctx, g.px, g.py, radius, g.dir);
        continue;
      }

      if (g.mode === EATEN) {
        // Just draw eyes
        drawGhostEyes(ctx, g.px, g.py, radius, g.dir);
        continue;
      }

      var color;
      if (g.mode === FRIGHTENED) {
        color = (flashing && flashOn) ? Config.frightenedFlashColor : Config.frightenedColor;
      } else {
        color = Config.ghostColors[i];
      }

      drawGhostBody(ctx, g.px, g.py, radius, color);

      if (g.mode === FRIGHTENED) {
        drawFrightenedFace(ctx, g.px, g.py, radius, flashing && flashOn);
      } else {
        drawGhostEyes(ctx, g.px, g.py, radius, g.dir);
      }
    }
  }

  function drawGhostBody(ctx, x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    // Top half — semicircle
    ctx.arc(x, y - 1, radius, Math.PI, 0);
    // Bottom — wavy edge
    var bottom = y + radius - 1;
    var left = x - radius;
    var waveW = radius * 2 / 3;
    ctx.lineTo(x + radius, bottom);
    // Three waves
    for (var w = 0; w < 3; w++) {
      var wx = x + radius - w * waveW;
      ctx.quadraticCurveTo(wx - waveW / 4, bottom - 3, wx - waveW / 2, bottom);
      ctx.quadraticCurveTo(wx - waveW * 3 / 4, bottom + 3, wx - waveW, bottom);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawGhostEyes(ctx, x, y, radius, dir) {
    var eyeOffX = radius * 0.3;
    var eyeOffY = -radius * 0.15;
    var eyeR = radius * 0.3;
    var pupilR = radius * 0.15;

    // Direction offset for pupils
    var pdx = 0, pdy = 0;
    if (dir === 'left') pdx = -pupilR * 0.6;
    if (dir === 'right') pdx = pupilR * 0.6;
    if (dir === 'up') pdy = -pupilR * 0.6;
    if (dir === 'down') pdy = pupilR * 0.6;

    // Left eye
    ctx.fillStyle = Config.ghostEyeColor;
    ctx.beginPath();
    ctx.arc(x - eyeOffX, y + eyeOffY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = Config.ghostPupilColor;
    ctx.beginPath();
    ctx.arc(x - eyeOffX + pdx, y + eyeOffY + pdy, pupilR, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = Config.ghostEyeColor;
    ctx.beginPath();
    ctx.arc(x + eyeOffX, y + eyeOffY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = Config.ghostPupilColor;
    ctx.beginPath();
    ctx.arc(x + eyeOffX + pdx, y + eyeOffY + pdy, pupilR, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFrightenedFace(ctx, x, y, radius, white) {
    var eyeR = radius * 0.15;
    var eyeY = y - radius * 0.15;
    var color = white ? '#ff0000' : '#ffcccc';

    // Simple dot eyes
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - radius * 0.25, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + radius * 0.25, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // Wavy mouth
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    var mouthY = y + radius * 0.3;
    var mouthW = radius * 0.7;
    ctx.moveTo(x - mouthW, mouthY);
    for (var i = 0; i < 4; i++) {
      var mx = x - mouthW + (mouthW * 2 / 4) * (i + 0.5);
      var my = mouthY + (i % 2 === 0 ? -2 : 2);
      ctx.lineTo(mx, my);
    }
    ctx.lineTo(x + mouthW, mouthY);
    ctx.stroke();
  }

  return {
    SCATTER: SCATTER,
    CHASE: CHASE,
    FRIGHTENED: FRIGHTENED,
    EATEN: EATEN,
    reset: reset,
    update: update,
    startFrightened: startFrightened,
    checkCollision: checkCollision,
    eatGhost: eatGhost,
    draw: draw,
    get list() { return ghosts; },
    get frightenedTimer() { return frightenedTimer; },
  };
})();
