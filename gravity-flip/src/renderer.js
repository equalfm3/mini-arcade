/* Gravity Flip — Renderer

   Neon glow rendering: trail effect, speed lines, wall edges,
   player with glow, particles, color cycling.
   Think Geometry Dash meets VVVVVV — dark bg, glowing edges, particle trails.
*/

var Renderer = (function () {

  var speedLines = [];
  var inited = false;
  var hueOffset = 0;

  function init() {
    if (inited) return;
    inited = true;

    // Generate speed line positions
    speedLines = [];
    for (var i = 0; i < Config.speedLineCount; i++) {
      speedLines.push({
        y: Math.random() * Config.canvasH,
        x: Math.random() * Config.canvasW,
        len: 30 + Math.random() * 60,
      });
    }
  }

  /** Get a neon color shifted by the current hue offset */
  function shiftColor(baseHex, offset) {
    // Simple hue rotation via HSL
    var r = parseInt(baseHex.slice(1, 3), 16);
    var g = parseInt(baseHex.slice(3, 5), 16);
    var b = parseInt(baseHex.slice(5, 7), 16);
    var hsl = rgbToHsl(r, g, b);
    hsl[0] = (hsl[0] + offset) % 360;
    if (hsl[0] < 0) hsl[0] += 360;
    return 'hsl(' + Math.floor(hsl[0]) + ',' + Math.floor(hsl[1]) + '%,' + Math.floor(hsl[2]) + '%)';
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return [h * 360, s * 100, l * 100];
  }

  function drawBackground(ctx, time, speed) {
    // Dark background
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Subtle grid lines
    ctx.strokeStyle = Config.bgLineColor;
    ctx.lineWidth = 1;
    var gridSize = 30;
    var gridOffset = (time * speed * 0.3) % gridSize;
    ctx.globalAlpha = 0.3;
    for (var gx = -gridOffset; gx < Config.canvasW; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, Config.canvasH);
      ctx.stroke();
    }
    for (var gy = 0; gy < Config.canvasH; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(Config.canvasW, gy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawSpeedLines(ctx, speed, dt) {
    var speedFactor = clamp((speed - Config.corridorSpeed) / (Config.corridorSpeedMax - Config.corridorSpeed), 0, 1);
    var alpha = Config.speedLineAlpha + speedFactor * 0.08;

    ctx.strokeStyle = Config.speedLineColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = alpha;

    for (var i = 0; i < speedLines.length; i++) {
      var sl = speedLines[i];
      sl.x -= speed * dt * (0.5 + Math.random() * 0.5);
      if (sl.x + sl.len < 0) {
        sl.x = Config.canvasW + Math.random() * 50;
        sl.y = Math.random() * Config.canvasH;
        sl.len = 30 + Math.random() * 60 + speedFactor * 40;
      }
      ctx.beginPath();
      ctx.moveTo(sl.x, sl.y);
      ctx.lineTo(sl.x + sl.len, sl.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawWalls(ctx, segments, time) {
    var wallColor = shiftColor(Config.wallColor, hueOffset);
    var edgeColor = shiftColor(Config.wallEdgeColor, hueOffset);

    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      var sx = seg.x;
      var sw = Config.segmentWidth;

      // Skip off-screen
      if (sx + sw < 0 || sx > Config.canvasW) continue;

      // Top wall
      if (seg.hasGapTop) {
        // Draw wall with gap
        var gapS = seg.gapStart;
        var gapE = seg.gapEnd;
        // Left portion
        if (gapS > sx) {
          drawWallRect(ctx, sx, 0, gapS - sx, seg.topH, wallColor, edgeColor, 'bottom');
        }
        // Right portion
        if (gapE < sx + sw) {
          drawWallRect(ctx, gapE, 0, sx + sw - gapE, seg.topH, wallColor, edgeColor, 'bottom');
        }
        // Gap edges (vertical glow lines)
        drawGapEdge(ctx, gapS, 0, seg.topH, edgeColor);
        drawGapEdge(ctx, gapE, 0, seg.topH, edgeColor);
      } else {
        drawWallRect(ctx, sx, 0, sw, seg.topH, wallColor, edgeColor, 'bottom');
      }

      // Bottom wall
      var bottomY = Config.canvasH - seg.bottomH;
      if (seg.hasGapBottom) {
        var gapSB = seg.gapStart;
        var gapEB = seg.gapEnd;
        if (gapSB > sx) {
          drawWallRect(ctx, sx, bottomY, gapSB - sx, seg.bottomH, wallColor, edgeColor, 'top');
        }
        if (gapEB < sx + sw) {
          drawWallRect(ctx, gapEB, bottomY, sx + sw - gapEB, seg.bottomH, wallColor, edgeColor, 'top');
        }
        drawGapEdge(ctx, gapSB, bottomY, seg.bottomH, edgeColor);
        drawGapEdge(ctx, gapEB, bottomY, seg.bottomH, edgeColor);
      } else {
        drawWallRect(ctx, sx, bottomY, sw, seg.bottomH, wallColor, edgeColor, 'top');
      }
    }
  }

  function drawWallRect(ctx, x, y, w, h, fillColor, edgeColor, edgeSide) {
    // Wall fill
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);

    // Neon edge glow
    ctx.shadowColor = edgeColor;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2;

    if (edgeSide === 'bottom') {
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
    } else if (edgeSide === 'top') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  function drawGapEdge(ctx, x, y, h, edgeColor) {
    ctx.shadowColor = edgeColor;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawOrbs(ctx, orbList, time) {
    for (var i = 0; i < orbList.length; i++) {
      var orb = orbList[i];
      if (orb.collected) continue;
      if (orb.x < -20 || orb.x > Config.canvasW + 20) continue;

      var pulse = Math.sin(time * 5 + orb.x * 0.1) * 0.3 + 1;
      var r = orb.radius * pulse;
      var color = shiftColor('#ffff00', hueOffset + 60);

      // Glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Inner white
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function drawTrail(ctx, trail, time) {
    if (trail.length < 2) return;
    var playerColor = shiftColor(Config.playerColor, hueOffset);

    for (var i = 0; i < trail.length; i++) {
      var t = trail[i];
      var alpha = (i + 1) / trail.length * 0.5;
      var size = Config.playerSize * (0.3 + (i / trail.length) * 0.7);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = playerColor;
      ctx.fillRect(
        Math.floor(t.x - size / 2),
        Math.floor(t.y - size / 2),
        Math.ceil(size),
        Math.ceil(size)
      );
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayer(ctx, playerY, squish, glow, time) {
    var px = Config.playerX;
    var s = Config.playerSize;
    var playerColor = shiftColor(Config.playerColor, hueOffset);

    ctx.save();
    ctx.translate(px, playerY);
    ctx.scale(squish.sx, squish.sy);

    // Outer glow
    ctx.shadowColor = playerColor;
    ctx.shadowBlur = glow;

    // Main body
    ctx.fillStyle = playerColor;
    ctx.fillRect(-s, -s, s * 2, s * 2);

    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-s + 2, -s + 2, s - 2, s - 2);

    // Edge lines
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-s, -s, s * 2, s * 2);

    ctx.restore();
    ctx.shadowBlur = 0;
  }

  function drawGravityIndicator(ctx, gravityDir, playerY) {
    // Small arrow showing gravity direction
    var px = Config.playerX;
    var arrowY = playerY + (gravityDir > 0 ? 22 : -22);
    var arrowSize = 4;

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    if (gravityDir > 0) {
      ctx.moveTo(px, arrowY + arrowSize);
      ctx.lineTo(px - arrowSize, arrowY - arrowSize);
      ctx.lineTo(px + arrowSize, arrowY - arrowSize);
    } else {
      ctx.moveTo(px, arrowY - arrowSize);
      ctx.lineTo(px - arrowSize, arrowY + arrowSize);
      ctx.lineTo(px + arrowSize, arrowY + arrowSize);
    }
    ctx.closePath();
    ctx.fill();
  }

  function updateHue(dt) {
    hueOffset += Config.hueShiftSpeed * dt;
    if (hueOffset > 360) hueOffset -= 360;
  }

  function applyScreenShake(ctx, shakeTime) {
    if (shakeTime <= 0) return;
    var intensity = Config.shakeIntensity * (shakeTime / Config.shakeDuration);
    var ox = (Math.random() - 0.5) * 2 * intensity;
    var oy = (Math.random() - 0.5) * 2 * intensity;
    ctx.translate(ox, oy);
  }

  return {
    init: init,
    updateHue: updateHue,
    drawBackground: drawBackground,
    drawSpeedLines: drawSpeedLines,
    drawWalls: drawWalls,
    drawOrbs: drawOrbs,
    drawTrail: drawTrail,
    drawPlayer: drawPlayer,
    drawGravityIndicator: drawGravityIndicator,
    applyScreenShake: applyScreenShake,
    get hueOffset() { return hueOffset; },
  };
})();
