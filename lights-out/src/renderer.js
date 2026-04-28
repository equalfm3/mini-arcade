/* Lights Out — Renderer (canvas grid drawing) */

var Renderer = (function () {

  var flashCells = []; // [{x, y, t}] for toggle flash animation
  var flashDuration = 0.2;

  function reset() {
    flashCells = [];
  }

  function addFlash(x, y) {
    flashCells.push({ x: x, y: y, t: 0 });
    // Also flash neighbors
    if (x > 0) flashCells.push({ x: x - 1, y: y, t: 0 });
    if (x < Config.cols - 1) flashCells.push({ x: x + 1, y: y, t: 0 });
    if (y > 0) flashCells.push({ x: x, y: y - 1, t: 0 });
    if (y < Config.rows - 1) flashCells.push({ x: x, y: y + 1, t: 0 });
  }

  function update(dt) {
    for (var i = flashCells.length - 1; i >= 0; i--) {
      flashCells[i].t += dt;
      if (flashCells[i].t >= flashDuration) {
        flashCells.splice(i, 1);
      }
    }
  }

  function getFlashAlpha(x, y) {
    for (var i = 0; i < flashCells.length; i++) {
      if (flashCells[i].x === x && flashCells[i].y === y) {
        return 1 - (flashCells[i].t / flashDuration);
      }
    }
    return 0;
  }

  function draw(ctx) {
    var grid = Board.getGrid();
    var cs = Config.cellSize;
    var gap = Config.cellGap;

    // Background
    ctx.fillStyle = Config.gridBg;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    for (var y = 0; y < Config.rows; y++) {
      for (var x = 0; x < Config.cols; x++) {
        var px = gap + x * (cs + gap);
        var py = gap + y * (cs + gap);
        var isOn = grid[y][x];

        // Cell background
        ctx.fillStyle = isOn ? Config.lightOn : Config.lightOff;
        ctx.beginPath();
        ctx.roundRect(px, py, cs, cs, 6);
        ctx.fill();

        // Glow effect for on cells
        if (isOn) {
          ctx.shadowColor = Config.lightOnGlow;
          ctx.shadowBlur = 10;
          ctx.fillStyle = Config.lightOn;
          ctx.beginPath();
          ctx.roundRect(px + 4, py + 4, cs - 8, cs - 8, 4);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Flash animation
        var flash = getFlashAlpha(x, y);
        if (flash > 0) {
          ctx.fillStyle = 'rgba(255,255,255,' + (flash * 0.4) + ')';
          ctx.beginPath();
          ctx.roundRect(px, py, cs, cs, 6);
          ctx.fill();
        }

        // Border
        ctx.strokeStyle = Config.cellStroke;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(px, py, cs, cs, 6);
        ctx.stroke();
      }
    }
  }

  return {
    reset: reset,
    addFlash: addFlash,
    update: update,
    draw: draw,
  };
})();
