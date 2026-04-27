/* Snake — Food spawning and rendering */

var Food = (function () {

  var pos = null;       // { x, y }
  var pulse = 0;        // animation timer

  /** Spawn food at a random position not occupied by the snake */
  function spawn(snakeBody) {
    var attempts = 0;
    while (attempts < 200) {
      var x = randInt(0, Config.cols - 1);
      var y = randInt(0, Config.rows - 1);
      var occupied = false;
      for (var i = 0; i < snakeBody.length; i++) {
        if (snakeBody[i].x === x && snakeBody[i].y === y) {
          occupied = true;
          break;
        }
      }
      if (!occupied) {
        pos = { x: x, y: y };
        return;
      }
      attempts++;
    }
    // Fallback: just place it somewhere
    pos = { x: 0, y: 0 };
  }

  /** Update animation */
  function update(dt) {
    pulse += dt * 4;
  }

  /** Draw the food */
  function draw(ctx) {
    if (!pos) return;
    var cs = Config.cellSize;
    var cx = pos.x * cs + cs / 2;
    var cy = pos.y * cs + cs / 2;

    // Glow pulse
    var glowSize = cs * 0.6 + Math.sin(pulse) * cs * 0.08;

    // Outer glow
    ctx.fillStyle = Config.foodGlow;
    ctx.globalAlpha = 0.3 + Math.sin(pulse) * 0.1;
    ctx.beginPath();
    ctx.arc(cx, cy, glowSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Core
    var size = cs * 0.4;
    ctx.fillStyle = Config.food;
    ctx.fillRect(cx - size, cy - size, size * 2, size * 2);

    // Shine
    var shineSize = cs * 0.12;
    ctx.fillStyle = '#ff8888';
    ctx.fillRect(cx - size + 2, cy - size + 2, shineSize, shineSize);
  }

  return {
    spawn: spawn,
    update: update,
    draw: draw,
    get pos() { return pos; },
  };
})();
