/* Gravity Well — Renderer */

var Renderer = (function () {

  var stars = [];

  function init() {
    // Generate background stars
    stars = [];
    for (var i = 0; i < Config.starCount; i++) {
      stars.push({
        x: Math.random() * Config.canvasW,
        y: Math.random() * Config.canvasH,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }
  }

  function drawBackground(ctx) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Stars
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.fillStyle = 'rgba(255,255,255,' + s.alpha + ')';
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
  }

  function drawSatellite(ctx) {
    if (!Satellite.alive && Satellite.launched) return;

    var trail = Satellite.trail;

    // Trail
    if (trail.length > 1) {
      for (var i = 1; i < trail.length; i++) {
        var alpha = i / trail.length * 0.6;
        ctx.strokeStyle = 'rgba(68,255,221,' + alpha + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
    }

    // Satellite body
    ctx.fillStyle = Config.satColor;
    ctx.beginPath();
    ctx.arc(Satellite.x, Satellite.y, Config.satRadius, 0, Math.PI * 2);
    ctx.fill();

    // Thrust indicator
    if (Satellite.fuel > 0 && Satellite.launched &&
        (Input.held('Space') || Input.held('touchA'))) {
      var speed = Math.sqrt(Satellite.vx * Satellite.vx + Satellite.vy * Satellite.vy);
      if (speed > 0.1) {
        var tx = -Satellite.vx / speed;
        var ty = -Satellite.vy / speed;
        ctx.strokeStyle = '#ff8844';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Satellite.x + tx * 8, Satellite.y + ty * 8);
        ctx.lineTo(Satellite.x + tx * 16, Satellite.y + ty * 16);
        ctx.stroke();
      }
    }
  }

  function drawAimLine(ctx, startX, startY, angle, power) {
    var len = power * 0.4;
    var ex = startX + Math.cos(angle) * len;
    var ey = startY + Math.sin(angle) * len;

    ctx.strokeStyle = '#ffffff88';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrow head
    ctx.fillStyle = '#ffffff88';
    ctx.beginPath();
    ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  return {
    init: init,
    drawBackground: drawBackground,
    drawSatellite: drawSatellite,
    drawAimLine: drawAimLine,
  };
})();
