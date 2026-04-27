/* Crossy Road — Renderer module
   Top-down lane drawing: grass, roads, rivers, cars, logs, trees, player.
*/

var Renderer = (function () {

  function init() {
    // No-op for now; could precompute patterns
  }

  function worldToScreen(worldY, cameraY) {
    return worldY - cameraY;
  }

  function drawLanes(ctx, cameraY, w, h) {
    var cs = Config.cellSize;
    // Row increases upward (forward), worldY = -row * cs
    // Visible world Y range: [cameraY, cameraY + h]
    // So visible rows: from -floor((cameraY + h) / cs) to -floor(cameraY / cs) + 1
    var minRow = Math.floor(-cameraY / cs) - Math.ceil(h / cs) - 1;
    var maxRow = Math.floor(-cameraY / cs) + 2;
    var visibleLanes = Lanes.getLanesInRange(minRow, maxRow);

    for (var i = 0; i < visibleLanes.length; i++) {
      var lane = visibleLanes[i];
      // worldY for this lane = -lane.row * cs
      var screenY = (-lane.row * cs) - cameraY;

      if (lane.type === Config.GRASS) {
        drawGrassLane(ctx, lane, screenY, w);
      } else if (lane.type === Config.ROAD) {
        drawRoadLane(ctx, lane, screenY, w);
      } else if (lane.type === Config.RIVER) {
        drawRiverLane(ctx, lane, screenY, w);
      }
    }
  }

  function drawGrassLane(ctx, lane, screenY, w) {
    ctx.fillStyle = lane.dark ? Config.grassDark : Config.grassLight;
    ctx.fillRect(0, screenY, w, Config.cellSize);

    // Draw trees
    var cs = Config.cellSize;
    var ts = Config.treeSize;
    for (var c in lane.trees) {
      if (!lane.trees.hasOwnProperty(c)) continue;
      var cx = parseInt(c) * cs + cs / 2;
      var cy = screenY + cs / 2;

      // Trunk
      ctx.fillStyle = Config.treeTrunk;
      ctx.fillRect(cx - 3, cy - 2, 6, 10);

      // Canopy
      ctx.fillStyle = Config.treeGreen;
      ctx.fillRect(cx - ts / 2, cy - ts / 2, ts, ts * 0.7);
      // Lighter top
      ctx.fillStyle = '#3d8b3d';
      ctx.fillRect(cx - ts / 2 + 2, cy - ts / 2, ts - 4, ts * 0.3);
    }
  }

  function drawRoadLane(ctx, lane, screenY, w) {
    ctx.fillStyle = Config.roadColor;
    ctx.fillRect(0, screenY, w, Config.cellSize);

    // Road lines (dashed center)
    ctx.fillStyle = Config.roadLine;
    var cs = Config.cellSize;
    for (var x = 0; x < w; x += 24) {
      ctx.fillRect(x, screenY + cs / 2 - 1, 12, 2);
    }

    // Draw cars
    for (var i = 0; i < lane.cars.length; i++) {
      var car = lane.cars[i];
      drawCar(ctx, car, screenY, lane.dir);
    }
  }

  function drawCar(ctx, car, screenY, dir) {
    var cs = Config.cellSize;
    var ch = Config.carHeight;
    var cy = screenY + (cs - ch) / 2;

    // Car body
    ctx.fillStyle = car.color;
    ctx.fillRect(car.x, cy, car.w, ch);

    // Darker bottom
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(car.x, cy + ch - 4, car.w, 4);

    // Highlight top
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(car.x + 2, cy, car.w - 4, 4);

    // Windshield
    ctx.fillStyle = '#88ccff';
    var windX = dir > 0 ? car.x + car.w - 14 : car.x + 4;
    ctx.fillRect(windX, cy + 3, 10, ch - 8);

    // Wheels
    ctx.fillStyle = '#222';
    ctx.fillRect(car.x + 4, cy - 2, 8, 4);
    ctx.fillRect(car.x + car.w - 12, cy - 2, 8, 4);
    ctx.fillRect(car.x + 4, cy + ch - 2, 8, 4);
    ctx.fillRect(car.x + car.w - 12, cy + ch - 2, 8, 4);
  }

  function drawRiverLane(ctx, lane, screenY, w) {
    var cs = Config.cellSize;

    // Water
    ctx.fillStyle = lane.dark ? Config.riverColor : Config.riverLight;
    ctx.fillRect(0, screenY, w, cs);

    // Water ripple effect
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (var x = 0; x < w; x += 20) {
      ctx.fillRect(x + (lane.row * 7) % 20, screenY + cs / 2 - 1, 8, 2);
    }

    // Draw logs
    for (var i = 0; i < lane.logs.length; i++) {
      var log = lane.logs[i];
      drawLog(ctx, log, screenY);
    }
  }

  function drawLog(ctx, log, screenY) {
    var cs = Config.cellSize;
    var lh = Config.logHeight;
    var ly = screenY + (cs - lh) / 2;

    // Log body
    ctx.fillStyle = Config.logColor;
    ctx.fillRect(log.x, ly, log.w, lh);

    // Bark texture lines
    ctx.fillStyle = Config.logDark;
    ctx.fillRect(log.x, ly + lh / 2 - 1, log.w, 2);
    ctx.fillRect(log.x + 8, ly + 4, 2, lh - 8);
    ctx.fillRect(log.x + log.w - 10, ly + 4, 2, lh - 8);

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(log.x + 2, ly, log.w - 4, 3);

    // End caps
    ctx.fillStyle = Config.logDark;
    ctx.fillRect(log.x, ly, 3, lh);
    ctx.fillRect(log.x + log.w - 3, ly, 3, lh);
  }

  function drawPlayer(ctx, px, py, cameraY, hopTimer, hopDir, eagleActive, eagleTimer, alive) {
    var screenX = px;
    var screenY = py - cameraY;
    var cs = Config.cellSize;
    var ps = Config.playerSize;

    if (!alive) return;

    // Hop bounce (slight vertical offset during hop)
    var bounce = 0;
    if (hopTimer > 0 && hopTimer < Config.hopDuration) {
      var t = hopTimer / Config.hopDuration;
      bounce = -Math.sin(t * Math.PI) * 6;
    }

    var bx = screenX - ps / 2;
    var by = screenY + (cs - ps) / 2 + bounce - cs / 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(bx + 2, screenY + cs / 2 - cs / 2 + ps - 4, ps - 4, 4);

    // Body
    ctx.fillStyle = Config.playerBody;
    ctx.fillRect(bx, by, ps, ps);

    // Darker bottom
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(bx, by + ps - 4, ps, 4);

    // Eyes (direction-aware)
    ctx.fillStyle = Config.playerEye;
    var eyeOffX = 0;
    var eyeOffY = 0;
    if (hopDir === 'up') eyeOffY = -2;
    else if (hopDir === 'down') eyeOffY = 2;
    else if (hopDir === 'left') eyeOffX = -2;
    else if (hopDir === 'right') eyeOffX = 2;

    ctx.fillRect(bx + 5 + eyeOffX, by + 6 + eyeOffY, 4, 4);
    ctx.fillRect(bx + ps - 9 + eyeOffX, by + 6 + eyeOffY, 4, 4);

    // Beak
    ctx.fillStyle = Config.playerBeak;
    if (hopDir === 'up') {
      ctx.fillRect(bx + ps / 2 - 3, by - 2, 6, 4);
    } else if (hopDir === 'down') {
      ctx.fillRect(bx + ps / 2 - 3, by + ps - 2, 6, 4);
    } else if (hopDir === 'left') {
      ctx.fillRect(bx - 2, by + ps / 2 - 2, 4, 5);
    } else {
      ctx.fillRect(bx + ps - 2, by + ps / 2 - 2, 4, 5);
    }
  }

  function drawEagle(ctx, px, py, cameraY, eagleTimer, w) {
    var screenX = px;
    var screenY = py - cameraY - Config.cellSize / 2;

    // Eagle swoops in from top
    var progress = Math.min(eagleTimer / Config.eagleWarning, 1);
    var eagleY = screenY - 200 + progress * 200;
    var eagleX = screenX;

    // Warning flash
    if (progress < 0.5) {
      var flash = Math.sin(eagleTimer * 12) > 0;
      if (flash) {
        ctx.fillStyle = 'rgba(255,0,0,0.15)';
        ctx.fillRect(0, 0, w, ctx.canvas.height / (window.devicePixelRatio || 1));
      }
    }

    // Eagle shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(screenX - 20, screenY + 10, 40, 8);

    // Eagle body
    ctx.fillStyle = Config.eagleColor;
    ctx.fillRect(eagleX - 15, eagleY - 8, 30, 16);

    // Wings
    var wingFlap = Math.sin(eagleTimer * 15) * 6;
    ctx.fillRect(eagleX - 30, eagleY - 4 + wingFlap, 18, 8);
    ctx.fillRect(eagleX + 12, eagleY - 4 - wingFlap, 18, 8);

    // Head
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(eagleX - 5, eagleY - 14, 10, 8);

    // Beak
    ctx.fillStyle = '#ffa500';
    ctx.fillRect(eagleX - 2, eagleY - 6, 4, 4);

    // "MOVE!" text
    if (progress < 0.7) {
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MOVE!', screenX, eagleY - 24);
      ctx.textAlign = 'left';
    }
  }

  return {
    init: init,
    drawLanes: drawLanes,
    drawPlayer: drawPlayer,
    drawEagle: drawEagle,
  };
})();
