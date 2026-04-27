/* Snake — Board rendering */

var Board = (function () {

  /** Draw the background grid */
  function draw(ctx) {
    var cs = Config.cellSize;

    // Background
    ctx.fillStyle = Config.gridBg;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Grid lines
    ctx.strokeStyle = Config.gridLine;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (var x = 0; x <= Config.cols; x++) {
      ctx.moveTo(x * cs, 0);
      ctx.lineTo(x * cs, Config.canvasH);
    }
    for (var y = 0; y <= Config.rows; y++) {
      ctx.moveTo(0, y * cs);
      ctx.lineTo(Config.canvasW, y * cs);
    }
    ctx.stroke();
  }

  /** Draw a filled cell at grid position */
  function fillCell(ctx, gx, gy, color) {
    var cs = Config.cellSize;
    var pad = 1;
    ctx.fillStyle = color;
    ctx.fillRect(gx * cs + pad, gy * cs + pad, cs - pad * 2, cs - pad * 2);
  }

  return {
    draw: draw,
    fillCell: fillCell,
  };
})();
