/* Hex Merge — Renderer (canvas drawing for hex grid) */

var Renderer = (function () {

  var cx, cy; // center of canvas

  function init(ctx) {
    cx = Config.canvasW / 2;
    cy = Config.canvasH / 2;
  }

  /** Draw a flat-top hexagon at pixel (x, y) with given size */
  function drawHex(ctx, x, y, size, fill, stroke) {
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var angle = Math.PI / 180 * (60 * i);
      var hx = x + size * Math.cos(angle);
      var hy = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  /** Get tile color for a value */
  function getTileColor(value) {
    if (value === 0) return null;
    if (Config.tileColors[value]) return Config.tileColors[value];
    return Config.superTile;
  }

  /** Draw the full board */
  function draw(ctx) {
    var cells = HexGrid.getAllCells();
    var size = Config.hexSize;
    var innerSize = size - 3; // slight gap between hexes

    // Draw empty cells first
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      var pos = HexGrid.hexToPixel(c.q, c.r);
      var px = cx + pos.x;
      var py = cy + pos.y;
      drawHex(ctx, px, py, innerSize, Config.emptyCell, Config.cellStroke);
    }

    // Draw tiles
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      if (c.value === 0) continue;

      var pos = HexGrid.hexToPixel(c.q, c.r);
      var px = cx + pos.x;
      var py = cy + pos.y;
      var colors = getTileColor(c.value);
      var scale = Tiles.getScale(c.q, c.r);

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(scale, scale);

      drawHex(ctx, 0, 0, innerSize, colors.bg, null);

      // Draw value text
      ctx.fillStyle = colors.text;
      var fontSize = c.value >= 1024 ? 11 : c.value >= 128 ? 13 : 16;
      ctx.font = 'bold ' + fontSize + 'px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.value, 0, 1);

      ctx.restore();
    }
  }

  /** Draw direction indicators (subtle arrows around the grid) */
  function drawDirectionHints(ctx) {
    var radius = Config.gridRadius;
    var size = Config.hexSize;
    var dist = (radius + 1.3) * size * Math.sqrt(3) * 0.55;

    ctx.fillStyle = '#444';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var labels = Config.dirNames;
    var angles = [0, -60, -120, 180, 120, 60]; // degrees for flat-top hex directions

    for (var i = 0; i < 6; i++) {
      var angle = angles[i] * Math.PI / 180;
      var lx = cx + dist * Math.cos(angle);
      var ly = cy + dist * Math.sin(angle);
      ctx.fillText(labels[i], lx, ly);
    }
  }

  return {
    init: init,
    draw: draw,
    drawDirectionHints: drawDirectionHints,
  };
})();
