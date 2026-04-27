/* Breakout — Paddle module */

var Paddle = (function () {

  var x = 0;
  var y = 0;
  var width = 0;
  var height = 0;
  var mouseX = -1;

  function reset() {
    width = Config.paddleW;
    height = Config.paddleH;
    x = (Config.canvasW - width) / 2;
    y = Config.paddleY;
    mouseX = -1;
  }

  function initPointerTracking(canvas) {
    if (!canvas) return;

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = Config.canvasW / rect.width;
      mouseX = (e.clientX - rect.left) * scaleX;
    });

    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      var scaleX = Config.canvasW / rect.width;
      var touch = e.touches[0];
      mouseX = (touch.clientX - rect.left) * scaleX;
    }, { passive: false });
  }

  function update(dt) {
    // Keyboard movement — disables mouse tracking while keys are held
    if (Input.held('ArrowLeft')) {
      x -= Config.paddleSpeed * dt;
      mouseX = -1; // disable mouse override
    }
    if (Input.held('ArrowRight')) {
      x += Config.paddleSpeed * dt;
      mouseX = -1; // disable mouse override
    }

    // Mouse/touch tracking (only active when mouse has moved recently)
    if (mouseX >= 0) {
      x = mouseX - width / 2;
    }

    // Clamp to canvas bounds
    x = clamp(x, 0, Config.canvasW - width);
  }

  function draw(ctx) {
    // Main paddle body
    ctx.fillStyle = Config.paddleColor;
    ctx.fillRect(Math.floor(x), Math.floor(y), width, height);

    // Highlight on top edge
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(Math.floor(x), Math.floor(y), width, 2);
    ctx.globalAlpha = 1;
  }

  function getRect() {
    return { x: x, y: y, w: width, h: height };
  }

  return {
    reset: reset,
    initPointerTracking: initPointerTracking,
    update: update,
    draw: draw,
    getRect: getRect,
    get x() { return x; },
    get centerX() { return x + width / 2; },
  };
})();
