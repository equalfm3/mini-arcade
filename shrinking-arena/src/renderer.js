/* Shrinking Arena — Renderer Module */

var Renderer = (function () {

  var bgStars = [];
  var flashTimer = 0;

  function reset() {
    bgStars = [];
    flashTimer = 0;
    for (var i = 0; i < Config.bgStarCount; i++) {
      bgStars.push({
        x: Math.random() * Config.canvasW,
        y: Math.random() * Config.canvasH,
        size: 0.5 + Math.random() * 1.5,
        alpha: 0.05 + Math.random() * Config.bgStarAlpha,
      });
    }
  }

  function triggerFlash() {
    flashTimer = 0.2;
  }

  function updateEffects(dt) {
    if (flashTimer > 0) flashTimer -= dt;
  }

  // --- Drawing functions ---

  function drawBackground(ctx, w, h) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Stars
    for (var i = 0; i < bgStars.length; i++) {
      var s = bgStars[i];
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = Config.bgStarColor;
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.ceil(s.size), Math.ceil(s.size));
    }
    ctx.globalAlpha = 1;
  }

  function drawArena(ctx, arenaRadius, pulseIntensity, warning) {
    var cx = Config.centerX;
    var cy = Config.centerY;

    // Outer glow
    var glowColor = warning
      ? Config.arenaWarningColor
      : Config.arenaGlowColor;

    // Pulsing glow when warning
    if (warning && pulseIntensity > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, arenaRadius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 68, 68, ' + (pulseIntensity * 0.4) + ')';
      ctx.lineWidth = 6;
      ctx.stroke();
    }

    // Arena fill (very subtle)
    ctx.beginPath();
    ctx.arc(cx, cy, arenaRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20, 20, 40, 0.3)';
    ctx.fill();

    // Arena border ring
    ctx.beginPath();
    ctx.arc(cx, cy, arenaRadius, 0, Math.PI * 2);
    var borderColor = warning
      ? lerpColor(Config.arenaBorderColor, Config.arenaBorderWarning, pulseIntensity)
      : Config.arenaBorderColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = Config.arenaBorderWidth;
    ctx.stroke();

    // Inner glow
    ctx.beginPath();
    ctx.arc(cx, cy, arenaRadius - 1, 0, Math.PI * 2);
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawTrail(ctx, trail, color, alpha, radius) {
    for (var i = 1; i < trail.length; i++) {
      var t = trail[i];
      var a = alpha * (1 - i / trail.length);
      var r = radius * (1 - i / trail.length) * 0.7;
      ctx.globalAlpha = a;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(Math.floor(t.x), Math.floor(t.y), Math.max(r, 1), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayer(ctx, player) {
    if (!player.alive) return;

    // Trail
    drawTrail(ctx, player.trail, Config.playerColor, Config.playerTrailAlpha, Config.playerRadius);

    // Glow
    ctx.beginPath();
    ctx.arc(player.x, player.y, Config.playerRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(68, 170, 255, 0.15)';
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.arc(player.x, player.y, Config.playerRadius, 0, Math.PI * 2);
    ctx.fillStyle = Config.playerColor;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(player.x - 2, player.y - 2, Config.playerRadius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
  }

  function drawEnemies(ctx, enemies) {
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.alive) continue;

      // Trail
      drawTrail(ctx, e.trail, e.color, Config.enemyTrailAlpha, e.radius);

      // Body
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      ctx.fill();

      // Highlight
      ctx.beginPath();
      ctx.arc(e.x - 1.5, e.y - 1.5, e.radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fill();
    }
  }

  function drawAliveCount(ctx, w, count) {
    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Remaining: ' + count, w / 2, 18);
    ctx.textAlign = 'left';
  }

  function drawScreenFlash(ctx, w, h) {
    if (flashTimer > 0) {
      ctx.globalAlpha = flashTimer * 3;
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  }

  // --- Helpers ---

  function lerpColor(c1, c2, t) {
    // Simple hex color lerp
    var r1 = parseInt(c1.slice(1, 3), 16);
    var g1 = parseInt(c1.slice(3, 5), 16);
    var b1 = parseInt(c1.slice(5, 7), 16);
    var r2 = parseInt(c2.slice(1, 3), 16);
    var g2 = parseInt(c2.slice(3, 5), 16);
    var b2 = parseInt(c2.slice(5, 7), 16);
    var r = Math.round(r1 + (r2 - r1) * t);
    var g = Math.round(g1 + (g2 - g1) * t);
    var b = Math.round(b1 + (b2 - b1) * t);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  reset();

  return {
    reset: reset,
    triggerFlash: triggerFlash,
    updateEffects: updateEffects,
    drawBackground: drawBackground,
    drawArena: drawArena,
    drawPlayer: drawPlayer,
    drawEnemies: drawEnemies,
    drawAliveCount: drawAliveCount,
    drawScreenFlash: drawScreenFlash,
  };
})();
