/* Pong — Paddle module */

var Paddle = (function () {

  var p1 = { x: 0, y: 0, w: 0, h: 0, score: 0 };
  var p2 = { x: 0, y: 0, w: 0, h: 0, score: 0 };

  function reset() {
    var centerY = (Config.canvasH - Config.paddleH) / 2;

    p1.x = Config.paddleMargin;
    p1.y = centerY;
    p1.w = Config.paddleW;
    p1.h = Config.paddleH;
    p1.score = 0;

    p2.x = Config.canvasW - Config.paddleMargin - Config.paddleW;
    p2.y = centerY;
    p2.w = Config.paddleW;
    p2.h = Config.paddleH;
    p2.score = 0;
  }

  function clampY(paddle) {
    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y + paddle.h > Config.canvasH) paddle.y = Config.canvasH - paddle.h;
  }

  function moveP1(dy) {
    p1.y += dy;
    clampY(p1);
  }

  function moveP2(dy) {
    p2.y += dy;
    clampY(p2);
  }

  function getP1() {
    return { x: p1.x, y: p1.y, w: p1.w, h: p1.h };
  }

  function getP2() {
    return { x: p2.x, y: p2.y, w: p2.w, h: p2.h };
  }

  function draw(ctx) {
    ctx.fillStyle = Config.paddleColor;
    ctx.fillRect(Math.floor(p1.x), Math.floor(p1.y), p1.w, p1.h);
    ctx.fillRect(Math.floor(p2.x), Math.floor(p2.y), p2.w, p2.h);
  }

  return {
    reset: reset,
    moveP1: moveP1,
    moveP2: moveP2,
    getP1: getP1,
    getP2: getP2,
    draw: draw,
  };
})();
