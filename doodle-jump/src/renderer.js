/* Doodle Jump — Renderer module */

var Renderer = (function () {

  var stars = [];
  var inited = false;

  function init() {
    if (inited) return;
    inited = true;

    // Generate random star positions
    stars = [];
    for (var i = 0; i < Config.bgStarCount; i++) {
      stars.push({
        x: Math.random() * Config.canvasW,
        y: Math.random() * Config.canvasH * 4, // spread across a large area
        size: 1 + Math.random(),
        opacity: 0.2 + Math.random() * 0.4,
      });
    }
  }

  function drawBackground(ctx, cameraY) {
    // Sky
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Parallax stars
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      // Parallax: stars move at 10% of camera speed
      var sy = ((s.y - cameraY * 0.1) % (Config.canvasH + 20));
      if (sy < 0) sy += Config.canvasH + 20;

      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(s.x), Math.floor(sy), Math.ceil(s.size), Math.ceil(s.size));
    }
    ctx.globalAlpha = 1;

    // Subtle horizontal grid lines (parallax at 5%)
    ctx.strokeStyle = Config.bgLineColor;
    ctx.lineWidth = 0.5;
    var lineSpacing = 40;
    var offset = (-cameraY * 0.05) % lineSpacing;
    for (var ly = offset; ly < Config.canvasH; ly += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, Math.floor(ly));
      ctx.lineTo(Config.canvasW, Math.floor(ly));
      ctx.stroke();
    }
  }

  /** Draw height markers on the side */
  function drawHeightMarkers(ctx, cameraY) {
    ctx.fillStyle = '#333344';
    ctx.font = '8px monospace';
    ctx.textAlign = 'right';

    var markerSpacing = 500; // every 500 world units
    var startY = Math.floor(cameraY / markerSpacing) * markerSpacing;

    for (var my = startY; my < cameraY + Config.canvasH; my += markerSpacing) {
      var screenY = my - cameraY;
      var height = Math.floor(Math.abs(my) * Config.heightScale);
      if (height > 0) {
        ctx.fillText(height + 'm', Config.canvasW - 4, screenY + 3);
        // Small tick
        ctx.fillRect(Config.canvasW - 3, screenY, 3, 1);
      }
    }
    ctx.textAlign = 'left';
  }

  return {
    init: init,
    drawBackground: drawBackground,
    drawHeightMarkers: drawHeightMarkers,
  };
})();
