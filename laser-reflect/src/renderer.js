/* Laser Reflect — Renderer */

var Renderer = (function () {

  var cs; // cell size shorthand

  function init() {
    cs = Config.cellSize;
  }

  function draw(ctx, level, laserPath, laserHit) {
    cs = Config.cellSize;
    var board = Mirrors.getBoard();

    // Background
    ctx.fillStyle = Config.gridBg;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Draw grid cells
    for (var y = 0; y < Config.rows; y++) {
      for (var x = 0; x < Config.cols; x++) {
        var px = x * cs;
        var py = y * cs;

        ctx.fillStyle = Config.cellBg;
        ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);

        var cell = board[y][x];

        // Walls
        if (cell === 'wall') {
          ctx.fillStyle = Config.wallColor;
          ctx.fillRect(px + 2, py + 2, cs - 4, cs - 4);
        }

        // Mirrors
        if (cell === '/' || cell === '\\') {
          var isFixed = Mirrors.isFixed(x, y);
          ctx.strokeStyle = isFixed ? Config.mirrorColor : Config.mirrorPlaced;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          if (cell === '/') {
            ctx.moveTo(px + 6, py + cs - 6);
            ctx.lineTo(px + cs - 6, py + 6);
          } else {
            ctx.moveTo(px + 6, py + 6);
            ctx.lineTo(px + cs - 6, py + cs - 6);
          }
          ctx.stroke();
        }
      }
    }

    // Draw emitter
    var em = level.emitter;
    ctx.fillStyle = Config.emitterColor;
    ctx.beginPath();
    ctx.arc(em.x * cs + cs / 2, em.y * cs + cs / 2, cs / 4, 0, Math.PI * 2);
    ctx.fill();
    // Direction arrow
    ctx.strokeStyle = Config.emitterColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    var ecx = em.x * cs + cs / 2;
    var ecy = em.y * cs + cs / 2;
    var arrowLen = cs / 3;
    var adx = em.dir === 'right' ? arrowLen : em.dir === 'left' ? -arrowLen : 0;
    var ady = em.dir === 'down' ? arrowLen : em.dir === 'up' ? -arrowLen : 0;
    ctx.moveTo(ecx, ecy);
    ctx.lineTo(ecx + adx, ecy + ady);
    ctx.stroke();

    // Draw target
    var tg = level.target;
    ctx.strokeStyle = Config.targetColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(tg.x * cs + cs / 2, tg.y * cs + cs / 2, cs / 4, 0, Math.PI * 2);
    ctx.stroke();
    // Inner dot
    ctx.fillStyle = Config.targetColor;
    ctx.beginPath();
    ctx.arc(tg.x * cs + cs / 2, tg.y * cs + cs / 2, cs / 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw laser path
    if (laserPath && laserPath.length > 1) {
      ctx.strokeStyle = Config.laserColor;
      ctx.lineWidth = Config.laserWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = Config.laserGlow;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(laserPath[0].x * cs + cs / 2, laserPath[0].y * cs + cs / 2);
      for (var i = 1; i < laserPath.length; i++) {
        ctx.lineTo(laserPath[i].x * cs + cs / 2, laserPath[i].y * cs + cs / 2);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Hit indicator
      if (laserHit) {
        var last = laserPath[laserPath.length - 1];
        ctx.fillStyle = Config.targetColor;
        ctx.beginPath();
        ctx.arc(last.x * cs + cs / 2, last.y * cs + cs / 2, cs / 3, 0, Math.PI * 2);
        ctx.globalAlpha = 0.4;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Draw mirror count
    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Mirrors: ' + Mirrors.available, 6, Config.canvasH - 6);
  }

  return {
    init: init,
    draw: draw,
  };
})();
