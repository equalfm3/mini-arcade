/* Pixel Painter — Canvas Renderer

   Draws the 8×8 pixel grid, color palette, timer bar,
   phase labels, comparison view, and submit button.
*/

var Renderer = (function () {

  // Cached layout
  var gridX = 0;
  var gridY = 0;

  /** Compute grid X offset to center it */
  function computeLayout(canvasW) {
    gridX = Math.floor((canvasW - Config.gridW) / 2);
    gridY = Config.gridY;
  }

  // ---- Background ----

  function drawBackground(ctx, w, h) {
    ctx.fillStyle = '#0a0a16';
    ctx.fillRect(0, 0, w, h);
  }

  // ---- Grid drawing ----

  /** Draw an 8×8 grid with given data at the standard position */
  function drawGrid(ctx, data, canvasW, opts) {
    opts = opts || {};
    var x0 = opts.x !== undefined ? opts.x : gridX;
    var y0 = opts.y !== undefined ? opts.y : gridY;
    var size = opts.cellSize || Config.cellSize;
    var gap = opts.gap !== undefined ? opts.gap : Config.cellGap;
    var pad = opts.padding !== undefined ? opts.padding : Config.gridPadding;
    var radius = opts.radius !== undefined ? opts.radius : Config.cellRadius;
    var totalW = Config.cols * (size + gap) - gap + pad * 2;
    var totalH = Config.rows * (size + gap) - gap + pad * 2;

    // Grid background
    ctx.fillStyle = Config.gridBg;
    roundRect(ctx, x0, y0, totalW, totalH, 6);
    ctx.fill();
    ctx.strokeStyle = Config.gridBorder;
    ctx.lineWidth = 2;
    roundRect(ctx, x0, y0, totalW, totalH, 6);
    ctx.stroke();

    // Cells
    for (var row = 0; row < Config.rows; row++) {
      for (var col = 0; col < Config.cols; col++) {
        var val = data[row][col];
        var cx = x0 + pad + col * (size + gap);
        var cy = y0 + pad + row * (size + gap);

        if (val > 0 && val <= Config.colors.length) {
          ctx.fillStyle = Config.colors[val - 1];
        } else {
          ctx.fillStyle = Config.emptyColor;
        }

        roundRect(ctx, cx, cy, size, size, radius);
        ctx.fill();

        // Empty cell border
        if (val === 0) {
          ctx.strokeStyle = Config.emptyStroke;
          ctx.lineWidth = 1;
          roundRect(ctx, cx, cy, size, size, radius);
          ctx.stroke();
        }
      }
    }

    // Highlight for comparison
    if (opts.highlight) {
      for (var hy = 0; hy < Config.rows; hy++) {
        for (var hx = 0; hx < Config.cols; hx++) {
          var hv = opts.highlight[hy][hx];
          if (hv) {
            var hcx = x0 + pad + hx * (size + gap);
            var hcy = y0 + pad + hy * (size + gap);
            ctx.strokeStyle = hv === 'correct' ? Config.textSuccess : Config.textFail;
            ctx.lineWidth = 2;
            roundRect(ctx, hcx, hcy, size, size, radius);
            ctx.stroke();
          }
        }
      }
    }
  }

  // ---- Comparison view (side by side) ----

  function drawComparison(ctx, target, player, canvasW, canvasH, result) {
    var size = Config.compareGridSize;
    var gap = Config.compareGap;
    var pad = 3;
    var gridW = Config.cols * (size + gap) - gap + pad * 2;
    var gridH = Config.rows * (size + gap) - gap + pad * 2;
    var spacing = 20;
    var totalW = gridW * 2 + spacing;
    var startX = Math.floor((canvasW - totalW) / 2);
    var startY = Config.gridY + 20;

    // Labels
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = Config.textDim;
    ctx.fillText('TARGET', startX + gridW / 2, startY - 6);
    ctx.fillText('YOURS', startX + gridW + spacing + gridW / 2, startY - 6);

    // Build highlight map
    var highlight = [];
    for (var y = 0; y < Config.rows; y++) {
      highlight[y] = [];
      for (var x = 0; x < Config.cols; x++) {
        if (target[y][x] !== 0) {
          highlight[y][x] = player[y][x] === target[y][x] ? 'correct' : 'wrong';
        } else {
          highlight[y][x] = null;
        }
      }
    }

    // Draw target grid
    drawGrid(ctx, target, canvasW, {
      x: startX, y: startY, cellSize: size, gap: gap, padding: pad, radius: 2,
    });

    // Draw player grid with highlights
    drawGrid(ctx, player, canvasW, {
      x: startX + gridW + spacing, y: startY, cellSize: size, gap: gap, padding: pad, radius: 2,
      highlight: highlight,
    });

    // Accuracy text
    var accY = startY + gridH + 24;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = result.passed ? Config.textSuccess : Config.textFail;
    ctx.fillText(result.accuracy + '% Accuracy', canvasW / 2, accY);

    // Pass/fail message
    ctx.font = '12px monospace';
    ctx.fillStyle = result.passed ? Config.textSuccess : Config.textFail;
    var msg = result.passed ? (result.accuracy === 100 ? 'PERFECT!' : 'PASSED!') : 'NOT QUITE...';
    ctx.fillText(msg, canvasW / 2, accY + 20);

    // Detail
    ctx.font = '10px monospace';
    ctx.fillStyle = Config.textDim;
    ctx.fillText(result.correct + '/' + result.total + ' cells correct', canvasW / 2, accY + 38);
  }

  // ---- Color palette ----

  function drawPalette(ctx, canvasW, selectedColor) {
    var count = Config.colors.length;
    var totalW = count * Config.paletteSize + (count - 1) * Config.paletteGap;
    var startX = Math.floor((canvasW - totalW) / 2);
    var y = Config.paletteY;

    for (var i = 0; i < count; i++) {
      var x = startX + i * (Config.paletteSize + Config.paletteGap);

      ctx.fillStyle = Config.colors[i];
      roundRect(ctx, x, y, Config.paletteSize, Config.paletteSize, Config.paletteRadius);
      ctx.fill();

      // Selected indicator
      if (i === selectedColor) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        roundRect(ctx, x - 2, y - 2, Config.paletteSize + 4, Config.paletteSize + 4, Config.paletteRadius + 1);
        ctx.stroke();
      }

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      roundRect(ctx, x, y + Config.paletteSize - 6, Config.paletteSize, 6, Config.paletteRadius);
      ctx.fill();
    }

    return { startX: startX, y: y, totalW: totalW };
  }

  /** Get palette button rects for hit testing */
  function getPaletteRects(canvasW) {
    var count = Config.colors.length;
    var totalW = count * Config.paletteSize + (count - 1) * Config.paletteGap;
    var startX = Math.floor((canvasW - totalW) / 2);
    var y = Config.paletteY;
    var rects = [];
    for (var i = 0; i < count; i++) {
      rects.push({
        x: startX + i * (Config.paletteSize + Config.paletteGap),
        y: y,
        w: Config.paletteSize,
        h: Config.paletteSize,
      });
    }
    return rects;
  }

  // ---- Submit button ----

  function drawSubmitBtn(ctx, canvasW, hover) {
    var x = Math.floor((canvasW - Config.submitBtnW) / 2);
    var y = Config.submitY;

    ctx.fillStyle = hover ? '#9b6ddb' : Config.textAccent;
    roundRect(ctx, x, y, Config.submitBtnW, Config.submitBtnH, 6);
    ctx.fill();

    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0a0a16';
    ctx.fillText('SUBMIT', canvasW / 2, y + Config.submitBtnH / 2);
    ctx.textBaseline = 'alphabetic';
  }

  /** Get submit button rect for hit testing */
  function getSubmitRect(canvasW) {
    return {
      x: Math.floor((canvasW - Config.submitBtnW) / 2),
      y: Config.submitY,
      w: Config.submitBtnW,
      h: Config.submitBtnH,
    };
  }

  // ---- Timer bar ----

  function drawTimerBar(ctx, canvasW, fraction, y) {
    var barW = Config.gridW;
    var barH = 6;
    var x = Math.floor((canvasW - barW) / 2);

    // Background
    ctx.fillStyle = '#1a1a2e';
    roundRect(ctx, x, y, barW, barH, 3);
    ctx.fill();

    // Fill
    var fillW = Math.max(0, barW * fraction);
    if (fillW > 0) {
      ctx.fillStyle = fraction > 0.3 ? Config.textAccent : Config.textFail;
      roundRect(ctx, x, y, fillW, barH, 3);
      ctx.fill();
    }
  }

  // ---- Phase labels ----

  function drawPhaseLabel(ctx, canvasW, text, subtext) {
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = Config.textPrimary;
    ctx.fillText(text, canvasW / 2, 28);

    if (subtext) {
      ctx.font = '10px monospace';
      ctx.fillStyle = Config.textDim;
      ctx.fillText(subtext, canvasW / 2, 42);
    }
  }

  // ---- Countdown text ----

  function drawCountdown(ctx, canvasW, seconds) {
    var s = Math.ceil(seconds);
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = Config.textWarning;
    var dots = '';
    for (var i = 0; i < s; i++) dots += '● ';
    ctx.fillText(dots.trim(), canvasW / 2, Config.gridY + Config.gridH + 10);
  }

  // ---- Eraser indicator ----

  function drawEraserIndicator(ctx, canvasW, active) {
    if (!active) return;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = Config.textDim;
    ctx.fillText('ERASER', canvasW / 2, Config.paletteY - 4);
  }

  // ---- Cell coordinate from canvas position ----

  function getCellAt(px, py) {
    var relX = px - gridX - Config.gridPadding;
    var relY = py - gridY - Config.gridPadding;
    if (relX < 0 || relY < 0) return null;

    var step = Config.cellSize + Config.cellGap;
    var col = Math.floor(relX / step);
    var row = Math.floor(relY / step);

    if (col < 0 || col >= Config.cols || row < 0 || row >= Config.rows) return null;

    // Check we're actually inside the cell, not in the gap
    var cellX = col * step;
    var cellY = row * step;
    if (relX - cellX > Config.cellSize || relY - cellY > Config.cellSize) return null;

    return { col: col, row: row };
  }

  /** Check if a point is inside a palette button, return color index or -1 */
  function getPaletteAt(px, py, canvasW) {
    var rects = getPaletteRects(canvasW);
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
        return i;
      }
    }
    return -1;
  }

  /** Check if a point is inside the submit button */
  function isSubmitAt(px, py, canvasW) {
    var r = getSubmitRect(canvasW);
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }

  // ---- Utility: rounded rectangle ----

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  return {
    computeLayout: computeLayout,
    drawBackground: drawBackground,
    drawGrid: drawGrid,
    drawComparison: drawComparison,
    drawPalette: drawPalette,
    drawSubmitBtn: drawSubmitBtn,
    drawTimerBar: drawTimerBar,
    drawPhaseLabel: drawPhaseLabel,
    drawCountdown: drawCountdown,
    drawEraserIndicator: drawEraserIndicator,
    getCellAt: getCellAt,
    getPaletteAt: getPaletteAt,
    isSubmitAt: isSubmitAt,
    getPaletteRects: getPaletteRects,
    getSubmitRect: getSubmitRect,
  };
})();
