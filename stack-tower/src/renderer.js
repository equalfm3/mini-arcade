/* Stack Tower — Renderer

   Draws: background, isometric 3D blocks (top + side faces),
   sliding current block, falling overhang pieces, camera offset.
*/

var Renderer = (function () {

  var bgStars = [];
  var inited = false;

  function init() {
    if (inited) return;
    inited = true;

    bgStars = [];
    for (var i = 0; i < Config.bgStarCount; i++) {
      bgStars.push({
        x: Math.random() * Config.canvasW,
        y: Math.random() * Config.canvasH * 3,
        size: 1 + Math.random(),
        opacity: 0.15 + Math.random() * 0.3,
      });
    }
  }

  function drawBackground(ctx, cameraY) {
    // Gradient background
    var grad = ctx.createLinearGradient(0, 0, 0, Config.canvasH);
    grad.addColorStop(0, Config.bgGradientTop);
    grad.addColorStop(1, Config.bgGradientBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Parallax stars
    for (var i = 0; i < bgStars.length; i++) {
      var s = bgStars[i];
      var sy = ((s.y + cameraY * 0.2) % (Config.canvasH * 1.5));
      if (sy < 0) sy += Config.canvasH * 1.5;
      if (sy > Config.canvasH) continue;
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(s.x), Math.floor(sy), Math.ceil(s.size), Math.ceil(s.size));
    }
    ctx.globalAlpha = 1;
  }

  /** Draw a single isometric block */
  function drawBlock(ctx, x, w, y, colorIndex, camY) {
    var screenY = y + camY;
    var h = Config.blockHeight;
    var dt = Config.blockDepthTop;
    var ds = Config.blockDepthSide;
    var colors = Blocks.getBlockColor(colorIndex);

    // Front face
    ctx.fillStyle = colors.front;
    ctx.fillRect(Math.floor(x), Math.floor(screenY), Math.ceil(w), h);

    // Top face (parallelogram)
    ctx.fillStyle = colors.top;
    ctx.beginPath();
    ctx.moveTo(Math.floor(x), Math.floor(screenY));
    ctx.lineTo(Math.floor(x) + ds, Math.floor(screenY) - dt);
    ctx.lineTo(Math.floor(x) + Math.ceil(w) + ds, Math.floor(screenY) - dt);
    ctx.lineTo(Math.floor(x) + Math.ceil(w), Math.floor(screenY));
    ctx.closePath();
    ctx.fill();

    // Right side face (parallelogram)
    ctx.fillStyle = colors.side;
    ctx.beginPath();
    ctx.moveTo(Math.floor(x) + Math.ceil(w), Math.floor(screenY));
    ctx.lineTo(Math.floor(x) + Math.ceil(w) + ds, Math.floor(screenY) - dt);
    ctx.lineTo(Math.floor(x) + Math.ceil(w) + ds, Math.floor(screenY) - dt + h);
    ctx.lineTo(Math.floor(x) + Math.ceil(w), Math.floor(screenY) + h);
    ctx.closePath();
    ctx.fill();

    // Subtle edge highlight on front face top
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.floor(x), Math.floor(screenY) + 0.5);
    ctx.lineTo(Math.floor(x) + Math.ceil(w), Math.floor(screenY) + 0.5);
    ctx.stroke();
  }

  /** Draw the entire tower stack */
  function drawStack(ctx, camY) {
    var stack = Blocks.stack;
    for (var i = 0; i < stack.length; i++) {
      var b = stack[i];
      // Skip blocks far off screen
      var screenY = b.y + camY;
      if (screenY > Config.canvasH + 40 || screenY < -60) continue;
      drawBlock(ctx, b.x, b.w, b.y, i, camY);
    }
  }

  /** Draw the sliding current block */
  function drawCurrent(ctx, camY) {
    var cur = Blocks.current;
    if (!cur) return;
    var colorIndex = Blocks.stack.length;
    drawBlock(ctx, cur.x, cur.w, cur.y, colorIndex, camY);
  }

  /** Draw falling overhang pieces */
  function drawFallingPieces(ctx, camY) {
    var pieces = Blocks.fallingPieces;
    for (var i = 0; i < pieces.length; i++) {
      var fp = pieces[i];
      var screenY = fp.y + camY;
      if (screenY > Config.canvasH + 40) continue;

      ctx.globalAlpha = Math.max(0, fp.opacity);
      var colors = Blocks.getBlockColor(fp.colorIndex);

      // Front face only (simplified for falling piece)
      ctx.fillStyle = colors.front;
      ctx.fillRect(Math.floor(fp.x), Math.floor(screenY), Math.ceil(fp.w), Config.blockHeight);

      // Top face
      var ds = Config.blockDepthSide;
      var dt = Config.blockDepthTop;
      ctx.fillStyle = colors.top;
      ctx.beginPath();
      ctx.moveTo(Math.floor(fp.x), Math.floor(screenY));
      ctx.lineTo(Math.floor(fp.x) + ds, Math.floor(screenY) - dt);
      ctx.lineTo(Math.floor(fp.x) + Math.ceil(fp.w) + ds, Math.floor(screenY) - dt);
      ctx.lineTo(Math.floor(fp.x) + Math.ceil(fp.w), Math.floor(screenY));
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /** Draw perfect placement indicator */
  function drawPerfectText(ctx, text, alpha) {
    if (alpha <= 0) return;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = Config.perfectColor;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, Config.canvasW / 2, Config.canvasH / 2 - 40);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  /** Draw score in center during gameplay */
  function drawScore(ctx, score) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.font = 'bold 80px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('' + score, Config.canvasW / 2, Config.canvasH / 2 + 20);
    ctx.textAlign = 'left';
  }

  return {
    init: init,
    drawBackground: drawBackground,
    drawStack: drawStack,
    drawCurrent: drawCurrent,
    drawFallingPieces: drawFallingPieces,
    drawPerfectText: drawPerfectText,
    drawScore: drawScore,
  };
})();
