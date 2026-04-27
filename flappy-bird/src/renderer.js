/* Flappy Bird — Background & ground renderer */

var Renderer = (function () {

  var stars = [];
  var inited = false;

  function init() {
    if (inited) return;
    inited = true;

    // Generate random star positions
    stars = [];
    for (var i = 0; i < Config.bgStars; i++) {
      stars.push({
        x: Math.random() * Config.canvasW,
        y: Math.random() * (Config.canvasH - Config.groundH - 40),
        size: 1 + Math.random(),
        opacity: 0.3 + Math.random() * 0.5,
      });
    }
  }

  function drawBackground(ctx) {
    // Sky
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Stars
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.ceil(s.size), Math.ceil(s.size));
    }
    ctx.globalAlpha = 1;
  }

  function drawGround(ctx, offset) {
    var gY = Config.canvasH - Config.groundH;

    // Ground fill
    ctx.fillStyle = Config.groundColor;
    ctx.fillRect(0, gY, Config.canvasW, Config.groundH);

    // Top line
    ctx.fillStyle = Config.groundLine;
    ctx.fillRect(0, gY, Config.canvasW, 2);

    // Scrolling texture lines
    var spacing = 24;
    ctx.fillStyle = Config.groundLine;
    for (var x = -offset; x < Config.canvasW; x += spacing) {
      ctx.fillRect(Math.floor(x), gY + 8, 12, 2);
      ctx.fillRect(Math.floor(x + spacing / 2), gY + 20, 12, 2);
    }
  }

  return {
    init: init,
    drawBackground: drawBackground,
    drawGround: drawGround,
  };
})();
