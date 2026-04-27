/* Breakout — Renderer module */

var Renderer = (function () {

  function drawBackground(ctx) {
    // Fill dark background
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Subtle border
    ctx.strokeStyle = Config.borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, Config.canvasW - 1, Config.canvasH - 1);
  }

  return {
    drawBackground: drawBackground,
  };
})();
