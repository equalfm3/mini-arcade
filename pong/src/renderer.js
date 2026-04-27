/* Pong — Renderer module */

var Renderer = (function () {

  function drawBackground(ctx) {
    // Dark background
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Dashed center line
    ctx.strokeStyle = Config.lineColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(Config.canvasW / 2, 0);
    ctx.lineTo(Config.canvasW / 2, Config.canvasH);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawScore(ctx, p1Score, p2Score) {
    ctx.fillStyle = Config.scoreColor;
    ctx.font = Config.scoreFontSize + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // P1 score on left half
    ctx.fillText('' + p1Score, Config.canvasW * 0.25, Config.canvasH * 0.5);

    // P2 score on right half
    ctx.fillText('' + p2Score, Config.canvasW * 0.75, Config.canvasH * 0.5);

    // Reset alignment
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  return {
    drawBackground: drawBackground,
    drawScore: drawScore,
  };
})();
