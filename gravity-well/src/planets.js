/* Gravity Well — Planet rendering helpers */

var Planets = (function () {

  /** Draw a planet with gravity field visualization */
  function draw(ctx, planet, colorIdx) {
    var color = Config.planetColors[colorIdx % Config.planetColors.length];

    // Gravity field rings
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (var r = planet.radius + 20; r < planet.radius + 100; r += 25) {
      ctx.globalAlpha = Config.gravityFieldAlpha * (1 - (r - planet.radius) / 100);
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Planet body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(planet.x - planet.radius * 0.3, planet.y - planet.radius * 0.3,
            planet.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Draw target orbit ring */
  function drawOrbit(ctx, planet, orbitRadius, progress) {
    ctx.strokeStyle = Config.targetColor;
    ctx.lineWidth = Config.targetWidth;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, orbitRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Progress arc (solid)
    if (progress > 0) {
      ctx.strokeStyle = Config.targetColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, orbitRadius, -Math.PI / 2,
              -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();
    }
  }

  return {
    draw: draw,
    drawOrbit: drawOrbit,
  };
})();
