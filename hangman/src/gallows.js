/* Hangman — Gallows Drawing (progressive stages 0-6) */

var Gallows = (function () {

  var wrongCount = 0;

  function reset() {
    wrongCount = 0;
  }

  function addWrong() {
    if (wrongCount < Config.maxWrong) wrongCount++;
    return wrongCount;
  }

  /**
   * Draw the gallows and body parts on canvas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} ox - origin X offset
   * @param {number} oy - origin Y offset
   * @param {number} scale - scale factor (default 1)
   */
  function draw(ctx, ox, oy, scale) {
    var s = scale || 1;
    var gx = ox || Config.gallowsX;
    var gy = oy || Config.gallowsY;

    ctx.save();
    ctx.translate(gx, gy);
    ctx.scale(s, s);

    // Stage 0: Always draw the gallows structure
    drawGallows(ctx);

    // Stage 1-6: Body parts based on wrong count
    if (wrongCount >= 1) drawHead(ctx);
    if (wrongCount >= 2) drawBody(ctx);
    if (wrongCount >= 3) drawLeftArm(ctx);
    if (wrongCount >= 4) drawRightArm(ctx);
    if (wrongCount >= 5) drawLeftLeg(ctx);
    if (wrongCount >= 6) drawRightLeg(ctx);

    ctx.restore();
  }

  // --- Gallows structure ---
  function drawGallows(ctx) {
    ctx.strokeStyle = Config.gallowsColor;
    ctx.lineWidth = Config.gallowsStroke;
    ctx.lineCap = 'round';

    // Base
    ctx.beginPath();
    ctx.moveTo(20, 240);
    ctx.lineTo(140, 240);
    ctx.stroke();

    // Vertical pole
    ctx.beginPath();
    ctx.moveTo(50, 240);
    ctx.lineTo(50, 30);
    ctx.stroke();

    // Horizontal beam
    ctx.beginPath();
    ctx.moveTo(50, 30);
    ctx.lineTo(130, 30);
    ctx.stroke();

    // Support brace
    ctx.beginPath();
    ctx.moveTo(50, 60);
    ctx.lineTo(80, 30);
    ctx.stroke();

    // Rope
    ctx.beginPath();
    ctx.moveTo(130, 30);
    ctx.lineTo(130, 60);
    ctx.stroke();
  }

  // --- Body parts ---
  // Anchor point: rope end at (130, 60)

  function drawHead(ctx) {
    ctx.strokeStyle = Config.bodyColor;
    ctx.lineWidth = Config.bodyStroke;
    ctx.beginPath();
    ctx.arc(130, 80, 20, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes (X marks when dead at stage 6)
    if (wrongCount >= Config.maxWrong) {
      ctx.strokeStyle = Config.wrongColor;
      ctx.lineWidth = 2;
      // Left eye X
      ctx.beginPath();
      ctx.moveTo(122, 74); ctx.lineTo(128, 80);
      ctx.moveTo(128, 74); ctx.lineTo(122, 80);
      ctx.stroke();
      // Right eye X
      ctx.beginPath();
      ctx.moveTo(132, 74); ctx.lineTo(138, 80);
      ctx.moveTo(138, 74); ctx.lineTo(132, 80);
      ctx.stroke();
    } else {
      // Normal eyes (dots)
      ctx.fillStyle = Config.bodyColor;
      ctx.beginPath();
      ctx.arc(124, 76, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(136, 76, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBody(ctx) {
    ctx.strokeStyle = Config.bodyColor;
    ctx.lineWidth = Config.bodyStroke;
    ctx.beginPath();
    ctx.moveTo(130, 100);
    ctx.lineTo(130, 160);
    ctx.stroke();
  }

  function drawLeftArm(ctx) {
    ctx.strokeStyle = Config.bodyColor;
    ctx.lineWidth = Config.bodyStroke;
    ctx.beginPath();
    ctx.moveTo(130, 115);
    ctx.lineTo(100, 145);
    ctx.stroke();
  }

  function drawRightArm(ctx) {
    ctx.strokeStyle = Config.bodyColor;
    ctx.lineWidth = Config.bodyStroke;
    ctx.beginPath();
    ctx.moveTo(130, 115);
    ctx.lineTo(160, 145);
    ctx.stroke();
  }

  function drawLeftLeg(ctx) {
    ctx.strokeStyle = Config.bodyColor;
    ctx.lineWidth = Config.bodyStroke;
    ctx.beginPath();
    ctx.moveTo(130, 160);
    ctx.lineTo(100, 200);
    ctx.stroke();
  }

  function drawRightLeg(ctx) {
    ctx.strokeStyle = Config.bodyColor;
    ctx.lineWidth = Config.bodyStroke;
    ctx.beginPath();
    ctx.moveTo(130, 160);
    ctx.lineTo(160, 200);
    ctx.stroke();
  }

  return {
    reset: reset,
    addWrong: addWrong,
    draw: draw,
    get wrongCount() { return wrongCount; },
  };
})();
