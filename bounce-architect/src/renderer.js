/* Bounce Architect — Renderer

   Draws all game elements: background, obstacles, pads, ball, goal,
   trajectory preview, and UI overlays.
*/

var Renderer = (function () {

  var time = 0;

  function reset() {
    time = 0;
  }

  function updateTime(dt) {
    time += dt;
  }

  // --- Background ---
  function drawBackground(ctx, w, h) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = Config.bgGridColor;
    ctx.lineWidth = 0.5;
    var sp = Config.bgGridSpacing;
    for (var x = 0; x < w; x += sp) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (var y = 0; y < h; y += sp) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  // --- Obstacles ---
  function drawObstacles(ctx, obstacles) {
    for (var i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      ctx.fillStyle = Config.obstacleColor;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = Config.obstacleBorderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    }
  }

  // --- Goal ---
  function drawGoal(ctx, goal) {
    var pulse = Config.goalPulseMin +
      (Config.goalPulseMax - Config.goalPulseMin) *
      (0.5 + 0.5 * Math.sin(time * Config.goalPulseSpeed));
    var r = Config.goalRadius * pulse;

    // Outer glow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(goal.x, goal.y, r + 8, 0, Math.PI * 2);
    ctx.fillStyle = Config.goalGlowColor;
    ctx.fill();
    ctx.restore();

    // Main circle
    ctx.beginPath();
    ctx.arc(goal.x, goal.y, r, 0, Math.PI * 2);
    ctx.fillStyle = Config.goalColor;
    ctx.fill();

    // Inner highlight
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(goal.x - r * 0.2, goal.y - r * 0.2, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();

    // Star/target cross
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(goal.x - r * 0.5, goal.y);
    ctx.lineTo(goal.x + r * 0.5, goal.y);
    ctx.moveTo(goal.x, goal.y - r * 0.5);
    ctx.lineTo(goal.x, goal.y + r * 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // --- Ball start indicator ---
  function drawBallStart(ctx, bx, by) {
    ctx.save();
    ctx.globalAlpha = 0.4 + 0.2 * Math.sin(time * 4);
    ctx.beginPath();
    ctx.arc(bx, by, Config.ballRadius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = Config.ballColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(bx, by, Config.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = Config.ballColor;
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // --- Pads ---
  function drawPad(ctx, pad, isGhost) {
    ctx.save();
    if (isGhost) {
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = Config.padPreviewColor;
    } else {
      // Glow
      ctx.shadowColor = Config.padGlowColor;
      ctx.shadowBlur = Config.padGlowSize;
      ctx.strokeStyle = Config.padColor;
    }
    ctx.lineWidth = Config.padThickness;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pad.x1, pad.y1);
    ctx.lineTo(pad.x2, pad.y2);
    ctx.stroke();
    ctx.restore();

    // End caps for placed pads
    if (!isGhost) {
      ctx.fillStyle = Config.padColor;
      ctx.beginPath();
      ctx.arc(pad.x1, pad.y1, Config.padThickness / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pad.x2, pad.y2, Config.padThickness / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPads(ctx, pads, ghost) {
    var all = pads.getAll();
    for (var i = 0; i < all.length; i++) {
      drawPad(ctx, all[i], false);
    }
    if (ghost) {
      drawPad(ctx, ghost, true);
    }
  }

  // --- Ball ---
  function drawBall(ctx) {
    if (!Ball.alive) return;

    // Trail
    var trail = Ball.trail;
    for (var i = 0; i < trail.length; i++) {
      var alpha = (i / trail.length) * Config.ballTrailAlpha;
      var size = Config.ballRadius * (0.3 + 0.7 * (i / trail.length));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = Config.ballTrailColor;
      ctx.beginPath();
      ctx.arc(trail[i].x, trail[i].y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Glow
    ctx.save();
    ctx.shadowColor = Config.ballColor;
    ctx.shadowBlur = Config.ballGlow;
    ctx.fillStyle = Config.ballColor;
    ctx.beginPath();
    ctx.arc(Ball.x, Ball.y, Config.ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Highlight
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(Ball.x - 2, Ball.y - 2, Config.ballRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- Trajectory preview ---
  function drawTrajectory(ctx, points) {
    if (!points || points.length < 2) return;
    ctx.fillStyle = Config.trajectoryColor;
    for (var i = 0; i < points.length; i++) {
      var alpha = 1 - (i / points.length) * 0.7;
      ctx.globalAlpha = alpha * 0.4;
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, Config.trajectoryDotSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // --- Phase indicator ---
  function drawPhaseText(ctx, w, phase, padsCount, padsMax) {
    ctx.save();
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    if (phase === 'place') {
      ctx.fillStyle = Config.phaseTextColor;
      var msg = padsMax === 0
        ? 'Press SPACE to launch!'
        : 'Click to place pads (' + padsCount + '/' + padsMax + ')';
      ctx.fillText(msg, w / 2, 24);

      if (padsMax > 0) {
        ctx.fillStyle = Config.uiTextColor;
        ctx.font = '10px monospace';
        ctx.fillText('Drag to angle · Click pad to remove · Space to launch', w / 2, 40);
      }
    } else if (phase === 'launch') {
      ctx.fillStyle = Config.uiHighlightColor;
      ctx.fillText('Press SPACE to launch!', w / 2, 24);
    }

    ctx.restore();
  }

  // --- Result message ---
  function drawResult(ctx, w, h, success) {
    ctx.save();
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (success) {
      ctx.fillStyle = Config.goalColor;
      ctx.shadowColor = Config.goalColor;
      ctx.shadowBlur = 20;
      ctx.fillText('LEVEL CLEAR!', w / 2, h / 2);
    } else {
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 20;
      ctx.fillText('MISSED!', w / 2, h / 2);
      ctx.font = '14px monospace';
      ctx.shadowBlur = 0;
      ctx.fillStyle = Config.uiTextColor;
      ctx.fillText('Pads reset — try again', w / 2, h / 2 + 30);
    }

    ctx.restore();
  }

  return {
    reset: reset,
    updateTime: updateTime,
    drawBackground: drawBackground,
    drawObstacles: drawObstacles,
    drawGoal: drawGoal,
    drawBallStart: drawBallStart,
    drawPads: drawPads,
    drawBall: drawBall,
    drawTrajectory: drawTrajectory,
    drawPhaseText: drawPhaseText,
    drawResult: drawResult,
  };
})();
