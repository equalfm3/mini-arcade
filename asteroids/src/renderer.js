/* Asteroids — Renderer module
   Draws background stars, lives indicator, wave text, and HUD elements */

var Renderer = (function () {

  var stars = [];

  function initStars() {
    stars = [];
    for (var i = 0; i < Config.starCount; i++) {
      stars.push({
        x: Math.random() * Config.canvasW,
        y: Math.random() * Config.canvasH,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }
  }

  function drawBackground(ctx) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Stars
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.ceil(s.size), Math.ceil(s.size));
    }
    ctx.globalAlpha = 1;
  }

  function drawLives(ctx, lives) {
    var size = 8;
    var startX = 10;
    var y = Config.canvasH - 20;

    for (var i = 0; i < lives - 1; i++) {
      var cx = startX + i * (size * 2.5) + size;
      var cy = y;
      var a = -Math.PI / 2; // pointing up

      ctx.strokeStyle = Config.shipColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * size, cy + Math.sin(a) * size);
      ctx.lineTo(cx + Math.cos(a + 2.4) * size, cy + Math.sin(a + 2.4) * size);
      ctx.lineTo(cx + Math.cos(a - 2.4) * size, cy + Math.sin(a - 2.4) * size);
      ctx.closePath();
      ctx.stroke();
    }
  }

  function drawWave(ctx, wave) {
    ctx.fillStyle = Config.uiDim;
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('WAVE ' + (wave + 1), Config.canvasW - 10, Config.canvasH - 10);
    ctx.textAlign = 'left';
  }

  return {
    initStars: initStars,
    drawBackground: drawBackground,
    drawLives: drawLives,
    drawWave: drawWave,
  };
})();
