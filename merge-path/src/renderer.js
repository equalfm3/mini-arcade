/* Merge Path — Renderer
   Draws grid, dots with glow, paths as thick lines,
   fill progress, and completion effects.
*/

var Renderer = (function () {

  var completionTimer = 0;
  var completing = false;
  var invalidFlash = 0;

  function reset() {
    completionTimer = 0;
    completing = false;
    invalidFlash = 0;
  }

  function triggerCompletion() {
    completing = true;
    completionTimer = 0;
  }

  function triggerInvalid() {
    invalidFlash = Config.invalidFlashDuration;
  }

  function update(dt) {
    if (completing) {
      completionTimer += dt;
    }
    if (invalidFlash > 0) {
      invalidFlash -= dt;
    }
  }

  /** Get pixel position for a grid cell center */
  function cellCenter(r, c) {
    var cellTotal = Config.cellSize + Config.cellGap;
    var x = Config.padding + c * cellTotal + Config.cellSize / 2;
    var y = Config.padding + Config.headerHeight + r * cellTotal + Config.cellSize / 2;
    return { x: x, y: y };
  }

  function drawBackground(ctx, w, h) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, w, h);
  }

  function drawGrid(ctx) {
    var size = Paths.size;
    var cellTotal = Config.cellSize + Config.cellGap;
    var grid = Paths.grid;

    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        var x = Config.padding + c * cellTotal;
        var y = Config.padding + Config.headerHeight + r * cellTotal;
        var colorIdx = grid[r][c];

        if (colorIdx >= 0) {
          // Filled cell — subtle tint
          var color = Config.colors[colorIdx % Config.colors.length];
          ctx.fillStyle = Config.cellBg;
          ctx.beginPath();
          ctx.roundRect(x, y, Config.cellSize, Config.cellSize, Config.cellRadius);
          ctx.fill();

          ctx.globalAlpha = Config.fillAlpha;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(x, y, Config.cellSize, Config.cellSize, Config.cellRadius);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          // Empty cell — dark
          ctx.fillStyle = Config.cellBg;
          ctx.beginPath();
          ctx.roundRect(x, y, Config.cellSize, Config.cellSize, Config.cellRadius);
          ctx.fill();
        }
      }
    }
  }

  function drawPaths(ctx) {
    var allPaths = Paths.paths;
    for (var ci in allPaths) {
      var path = allPaths[ci];
      if (!path || path.length < 2) continue;

      var color = Config.colors[parseInt(ci) % Config.colors.length];

      ctx.strokeStyle = color;
      ctx.lineWidth = Config.pathWidth;
      ctx.lineCap = Config.pathCap;
      ctx.lineJoin = Config.pathJoin;
      ctx.globalAlpha = Config.pathAlpha;

      ctx.beginPath();
      var start = cellCenter(path[0].r, path[0].c);
      ctx.moveTo(start.x, start.y);

      for (var i = 1; i < path.length; i++) {
        var pt = cellCenter(path[i].r, path[i].c);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawDots(ctx) {
    var allDots = Paths.dots;
    var pulsePhase = completing ? completionTimer : 0;

    for (var ci in allDots) {
      var d = allDots[ci];
      var color = Config.colors[parseInt(ci) % Config.colors.length];
      var positions = [
        cellCenter(d.r1, d.c1),
        cellCenter(d.r2, d.c2),
      ];

      for (var i = 0; i < positions.length; i++) {
        var pos = positions[i];
        var dotR = Config.dotRadius;
        var glowR = Config.dotGlowRadius;

        // Completion pulse
        if (completing) {
          var pulse = Math.sin(pulsePhase * Math.PI * 2 / Config.completionPulseDuration);
          var extra = pulse * 4;
          dotR += extra;
          glowR += extra * 1.5;
        }

        // Outer glow
        var grd = ctx.createRadialGradient(pos.x, pos.y, dotR * 0.3, pos.x, pos.y, glowR);
        grd.addColorStop(0, color);
        grd.addColorStop(0.5, color);
        grd.addColorStop(1, 'transparent');
        ctx.globalAlpha = Config.dotGlowAlpha;
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, glowR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Solid dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, dotR, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(pos.x - dotR * 0.2, pos.y - dotR * 0.2, dotR * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawProgress(ctx, w) {
    var size = Paths.size;
    var total = size * size;
    var filled = Paths.filledCount();
    var pct = filled / total;

    // Progress bar at top
    var barY = Config.padding + Config.headerHeight - 14;
    var barW = w - Config.padding * 2;
    var barH = 4;

    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(Config.padding, barY, barW, barH, 2);
    ctx.fill();

    if (pct > 0) {
      var fillColor = pct >= 1 ? '#44ff66' : '#ffd700';
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.roundRect(Config.padding, barY, barW * pct, barH, 2);
      ctx.fill();
    }

    // Fill count text
    ctx.fillStyle = '#666';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(filled + '/' + total, w - Config.padding, barY - 2);
  }

  function drawCompletionOverlay(ctx, w, h) {
    if (!completing) return;

    var alpha = Math.min(completionTimer * 2, 0.15);
    var pulse = Math.sin(completionTimer * Math.PI * 2 / Config.completionPulseDuration);
    alpha += pulse * 0.05;

    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = '#44ff66';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  return {
    reset: reset,
    update: update,
    triggerCompletion: triggerCompletion,
    triggerInvalid: triggerInvalid,
    cellCenter: cellCenter,
    drawBackground: drawBackground,
    drawGrid: drawGrid,
    drawPaths: drawPaths,
    drawDots: drawDots,
    drawProgress: drawProgress,
    drawCompletionOverlay: drawCompletionOverlay,
    get completing() { return completing; },
  };
})();
