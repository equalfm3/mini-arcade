/* Shadow Match — Renderer

   Draws the shadow display, option grids, timer bar,
   level text, and correct/wrong animations.
*/

var Renderer = (function () {

  // --- Shadow shape drawing (dark silhouette with glow) ---

  function drawShadowShape(ctx, cells, cx, cy, alpha) {
    var bounds = Shapes.getBounds(cells);
    var cs = Config.cellSize;
    var gap = Config.cellGap;
    var totalW = bounds.cols * (cs + gap) - gap;
    var totalH = bounds.rows * (cs + gap) - gap;
    var ox = cx - totalW / 2;
    var oy = cy - totalH / 2;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Glow effect
    ctx.shadowColor = Config.shadowCellGlow;
    ctx.shadowBlur = 18;

    for (var i = 0; i < cells.length; i++) {
      var r = cells[i][0];
      var c = cells[i][1];
      var x = ox + c * (cs + gap);
      var y = oy + r * (cs + gap);

      ctx.fillStyle = Config.shadowCellColor;
      ctx.fillRect(x, y, cs, cs);
    }

    ctx.shadowBlur = 0;

    // Subtle border on each cell
    for (var j = 0; j < cells.length; j++) {
      var r2 = cells[j][0];
      var c2 = cells[j][1];
      var x2 = ox + c2 * (cs + gap);
      var y2 = oy + r2 * (cs + gap);

      ctx.strokeStyle = Config.shadowGlow;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x2 + 0.5, y2 + 0.5, cs - 1, cs - 1);
    }

    ctx.restore();
  }

  // --- Option shape drawing (colored cells on grid) ---

  function drawOptionShape(ctx, cells, cx, cy, color, highlight, scale) {
    var bounds = Shapes.getBounds(cells);
    var sc = scale || 1;
    var cs = Math.floor(Config.cellSize * 0.72 * sc);
    var gap = Math.floor(Config.cellGap * sc);
    var totalW = bounds.cols * (cs + gap) - gap;
    var totalH = bounds.rows * (cs + gap) - gap;
    var ox = cx - totalW / 2;
    var oy = cy - totalH / 2;

    ctx.save();

    if (highlight) {
      ctx.shadowColor = highlight;
      ctx.shadowBlur = 12;
    }

    for (var i = 0; i < cells.length; i++) {
      var r = cells[i][0];
      var c = cells[i][1];
      var x = ox + c * (cs + gap);
      var y = oy + r * (cs + gap);

      ctx.fillStyle = color;
      ctx.fillRect(x, y, cs, cs);

      // Top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(x, y, cs, Math.max(2, cs * 0.15));

      // Border
      ctx.strokeStyle = 'rgba(255,255,255,' + Config.cellBorderAlpha + ')';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
    }

    ctx.restore();
  }

  // --- Option box drawing ---

  function getOptionRects(w, h) {
    var pad = Config.optionPad;
    var cols = 2;
    var rows = 2;
    var boxW = Math.floor((w - pad * 3) / cols);
    var boxH = Math.floor((h - Config.optionsY - pad * 3) / rows);
    var rects = [];

    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        var x = pad + col * (boxW + pad);
        var y = Config.optionsY + pad + row * (boxH + pad);
        rects.push({ x: x, y: y, w: boxW, h: boxH });
      }
    }
    return rects;
  }

  function drawOptionBox(ctx, rect, index, selected, state, isCorrect) {
    var borderColor = Config.optionBorderColor;
    var bgColor = Config.optionBg;

    if (state === 'correct' && isCorrect) {
      borderColor = Config.correctColor;
      bgColor = 'rgba(68, 255, 102, 0.15)';
    } else if (state === 'wrong' && selected) {
      borderColor = Config.wrongColor;
      bgColor = 'rgba(255, 68, 68, 0.15)';
    } else if (state === 'wrong' && isCorrect) {
      borderColor = Config.highlightColor;
      bgColor = 'rgba(255, 215, 0, 0.1)';
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = Config.optionBorder;
    ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);

    // Number label
    ctx.fillStyle = Config.textDim;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText((index + 1).toString(), rect.x + 6, rect.y + 4);
  }

  // --- Timer bar ---

  function drawTimerBar(ctx, w, fraction) {
    var pad = Config.timerBarPad;
    var y = Config.timerBarY;
    var h = Config.timerBarH;
    var barW = w - pad * 2;

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(pad, y, barW, h);

    // Fill
    var fillW = barW * fraction;
    var color;
    if (fraction > 0.5) {
      color = Config.timerGreen;
    } else if (fraction > 0.25) {
      color = Config.timerYellow;
    } else {
      color = Config.timerRed;
    }

    ctx.fillStyle = color;
    ctx.fillRect(pad, y, fillW, h);

    // Border
    ctx.strokeStyle = '#2a2a40';
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, y, barW, h);
  }

  // --- Level transition text ---

  function drawLevelText(ctx, w, h, level, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = Config.levelTextColor;
    ctx.font = 'bold ' + Config.levelTextSize + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = Config.levelTextColor;
    ctx.shadowBlur = 20;
    ctx.fillText('Level ' + level, w / 2, h / 2);
    ctx.restore();
  }

  // --- Lives display ---

  function drawLives(ctx, lives, maxLives, x, y) {
    var heartW = 14;
    var heartGap = 4;
    for (var i = 0; i < maxLives; i++) {
      var hx = x + i * (heartW + heartGap);
      ctx.fillStyle = i < lives ? Config.heartColor : Config.heartDimColor;
      drawHeart(ctx, hx, y, heartW);
    }
  }

  function drawHeart(ctx, x, y, size) {
    var s = size / 14;
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(7 * s, 13 * s);
    ctx.bezierCurveTo(0, 8 * s, 0, 3 * s, 3.5 * s, 1 * s);
    ctx.bezierCurveTo(5 * s, 0, 7 * s, 1 * s, 7 * s, 4 * s);
    ctx.bezierCurveTo(7 * s, 1 * s, 9 * s, 0, 10.5 * s, 1 * s);
    ctx.bezierCurveTo(14 * s, 3 * s, 14 * s, 8 * s, 7 * s, 13 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // --- Background ---

  function drawBackground(ctx, w, h) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid pattern
    ctx.strokeStyle = '#111122';
    ctx.lineWidth = 0.5;
    for (var x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (var y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  // --- Shadow area label ---

  function drawShadowLabel(ctx, w, text) {
    ctx.fillStyle = Config.textDim;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, w / 2, Config.shadowAreaY - 18);
  }

  // --- Score popup ---

  function drawScorePopup(ctx, w, text, timer, duration) {
    if (timer <= 0) return;
    var alpha = timer / duration;
    var rise = (1 - alpha) * 30;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = Config.correctColor;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, Config.timerBarY - 15 - rise);
    ctx.restore();
  }

  // --- Shake offset ---

  function getShakeOffset(timer) {
    if (timer <= 0) return { x: 0, y: 0 };
    var intensity = Config.shakeIntensity * (timer / Config.shakeDuration);
    return {
      x: (Math.random() - 0.5) * 2 * intensity,
      y: (Math.random() - 0.5) * 2 * intensity,
    };
  }

  return {
    drawBackground: drawBackground,
    drawShadowShape: drawShadowShape,
    drawShadowLabel: drawShadowLabel,
    drawOptionShape: drawOptionShape,
    getOptionRects: getOptionRects,
    drawOptionBox: drawOptionBox,
    drawTimerBar: drawTimerBar,
    drawLevelText: drawLevelText,
    drawLives: drawLives,
    drawScorePopup: drawScorePopup,
    getShakeOffset: getShakeOffset,
  };
})();
