/* Orbit Dodge — Renderer
   Draws orbit ring glow, player dot + trail, obstacles, stars, background.
   Dark space theme with glowing elements.
*/

var Renderer = (function () {

  var bgStars = [];
  var screenFlash = 0;

  function initBgStars() {
    bgStars = [];
    for (var i = 0; i < Config.bgStarCount; i++) {
      bgStars.push({
        x: Math.random() * Config.canvasW,
        y: Math.random() * Config.canvasH,
        size: 0.5 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.5,
        twinkleSpeed: 1 + Math.random() * 3,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  function reset() {
    screenFlash = 0;
    if (bgStars.length === 0) initBgStars();
  }

  function triggerFlash() {
    screenFlash = Config.flashDuration;
  }

  function updateEffects(dt) {
    if (screenFlash > 0) screenFlash -= dt;
  }

  function drawBackground(ctx, w, h, time) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Twinkling star field
    for (var i = 0; i < bgStars.length; i++) {
      var s = bgStars[i];
      var twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
      ctx.globalAlpha = s.alpha * twinkle;
      ctx.fillStyle = Config.bgStarColor;
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.ceil(s.size), Math.ceil(s.size));
    }
    ctx.globalAlpha = 1;
  }

  function drawOrbitRing(ctx) {
    var cx = Config.centerX;
    var cy = Config.centerY;

    // Draw both orbit rings
    for (var i = 0; i < Config.orbits.length; i++) {
      var r = Config.orbits[i];
      var isPlayerOrbit = (i === Player.orbitIndex);
      var alpha = isPlayerOrbit ? 1 : Config.orbitInactiveAlpha / 0.25;

      // Outer glow
      ctx.shadowColor = Config.orbitGlowColor;
      ctx.shadowBlur = isPlayerOrbit ? Config.orbitGlowOuter : 4;
      ctx.strokeStyle = Config.orbitGlowColor;
      ctx.globalAlpha = isPlayerOrbit ? 1 : 0.4;
      ctx.lineWidth = Config.orbitGlowWidth;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Subtle inner ring
      ctx.strokeStyle = 'rgba(68, 170, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center dot
    ctx.fillStyle = Config.centerDotColor;
    ctx.beginPath();
    ctx.arc(cx, cy, Config.centerDotRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlayerTrail(ctx, trail) {
    if (trail.length < 2) return;

    var cx = Config.centerX;
    var cy = Config.centerY;
    var r = Config.orbitRadius;

    for (var i = 0; i < trail.length; i++) {
      var t = trail[i];
      var alpha = Config.trailMaxAlpha * (1 - i / trail.length);
      var size = Config.playerRadius * (1 - i / trail.length * 0.6);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = Config.playerColor;
      ctx.beginPath();
      ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayer(ctx, player) {
    if (!player.alive) return;

    var px = player.x;
    var py = player.y;
    var r = Config.playerRadius;

    // Draw trail first
    drawPlayerTrail(ctx, player.trail);

    // Outer glow
    ctx.shadowColor = Config.playerGlow;
    ctx.shadowBlur = 12;
    ctx.fillStyle = Config.playerColor;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bright center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawProjectiles(ctx) {
    var projs = Obstacles.projectiles;
    for (var i = 0; i < projs.length; i++) {
      var p = projs[i];

      // Glow
      ctx.shadowColor = Config.projectileGlow;
      ctx.shadowBlur = 8;
      ctx.fillStyle = Config.projectileColor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Bright core
      ctx.fillStyle = '#ffcccc';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawArcs(ctx) {
    var arcList = Obstacles.arcs;
    var cx = Config.centerX;
    var cy = Config.centerY;

    for (var i = 0; i < arcList.length; i++) {
      var a = arcList[i];
      var r = Config.orbits[a.orbitIndex];
      var startAngle = a.angle - a.width / 2;
      var endAngle = a.angle + a.width / 2;

      // Glow
      ctx.shadowColor = Config.arcGlow;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = Config.arcColor;
      ctx.lineWidth = Config.arcThickness;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Bright inner edge
      ctx.strokeStyle = 'rgba(255, 200, 100, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.stroke();

      ctx.lineCap = 'butt';
    }
  }

  function drawStars(ctx, time) {
    var starList = Obstacles.stars;
    var cx = Config.centerX;
    var cy = Config.centerY;

    for (var i = 0; i < starList.length; i++) {
      var s = starList[i];
      var pulse = 0.7 + 0.3 * Math.sin(time * Config.starPulseSpeed + s.angle);
      var fadeIn = Math.min(s.age * 3, 1);
      var fadeOut = s.age > s.maxAge - 0.8 ? (s.maxAge - s.age) / 0.8 : 1;
      var alpha = fadeIn * fadeOut * pulse;

      ctx.globalAlpha = alpha;

      // Star glow
      ctx.shadowColor = Config.starGlow;
      ctx.shadowBlur = 8;
      ctx.fillStyle = Config.starColor;

      // Draw 4-pointed star shape
      drawStarShape(ctx, s.x, s.y, Config.starRadius, Config.starRadius * 0.4);

      ctx.shadowBlur = 0;

      // Bright center
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawStarShape(ctx, cx, cy, outerR, innerR) {
    var points = 4;
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var angle = (i * Math.PI) / points - Math.PI / 2;
      var r = i % 2 === 0 ? outerR : innerR;
      var sx = cx + Math.cos(angle) * r;
      var sy = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawScreenFlash(ctx, w, h) {
    if (screenFlash <= 0) return;
    var alpha = (screenFlash / Config.flashDuration) * 0.4;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  function drawScore(ctx, w, h, score) {
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(score + '', w / 2, h / 2);
    ctx.globalAlpha = 1;
  }

  return {
    reset: reset,
    triggerFlash: triggerFlash,
    updateEffects: updateEffects,
    drawBackground: drawBackground,
    drawOrbitRing: drawOrbitRing,
    drawPlayer: drawPlayer,
    drawProjectiles: drawProjectiles,
    drawArcs: drawArcs,
    drawStars: drawStars,
    drawScreenFlash: drawScreenFlash,
    drawScore: drawScore,
  };
})();
