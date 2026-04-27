/* Snake — Snake entity */

var Snake = (function () {

  var body = [];       // array of {x, y} — head is [0]
  var direction = { x: 1, y: 0 };
  var nextDir = { x: 1, y: 0 };
  var growing = false;

  function reset() {
    var cx = Math.floor(Config.cols / 2);
    var cy = Math.floor(Config.rows / 2);
    body = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];
    direction = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    growing = false;
  }

  /** Queue a direction change (prevents 180° reversal) */
  function setDirection(dx, dy) {
    // Can't reverse into yourself
    if (dx === -direction.x && dy === -direction.y) return;
    // Can't set same direction
    if (dx === nextDir.x && dy === nextDir.y) return;
    nextDir = { x: dx, y: dy };
  }

  /** Move one step. Returns { alive, ate } */
  function step(foodPos) {
    direction = nextDir;

    var head = body[0];
    var nx = head.x + direction.x;
    var ny = head.y + direction.y;

    // Wall collision
    if (nx < 0 || nx >= Config.cols || ny < 0 || ny >= Config.rows) {
      return { alive: false, ate: false };
    }

    // Self collision (skip tail if not growing — it will move)
    var checkLen = growing ? body.length : body.length - 1;
    for (var i = 0; i < checkLen; i++) {
      if (body[i].x === nx && body[i].y === ny) {
        return { alive: false, ate: false };
      }
    }

    // Move head
    body.unshift({ x: nx, y: ny });

    // Check food
    var ate = false;
    if (foodPos && nx === foodPos.x && ny === foodPos.y) {
      ate = true;
      growing = false; // already grew by not removing tail
    } else {
      if (!growing) body.pop();
      else growing = false;
    }

    // If ate, don't pop tail (snake grows by 1)
    return { alive: true, ate: ate };
  }

  /** Grow by one cell on next step */
  function grow() {
    growing = true;
  }

  /** Draw the snake */
  function draw(ctx) {
    var cs = Config.cellSize;
    var pad = 1;

    // Body segments (back to front)
    for (var i = body.length - 1; i >= 1; i--) {
      var seg = body[i];
      // Slight gradient: darker toward tail
      var t = i / body.length;
      var r = Math.floor(34 + (0 - 34) * t);
      var g = Math.floor(170 + (80 - 170) * t);
      var b = Math.floor(68 + (34 - 68) * t);
      ctx.fillStyle = 'rgb(' + Math.max(0,r) + ',' + Math.max(0,g) + ',' + Math.max(0,b) + ')';
      ctx.fillRect(seg.x * cs + pad, seg.y * cs + pad, cs - pad * 2, cs - pad * 2);
    }

    // Head
    var h = body[0];
    ctx.fillStyle = Config.snakeHead;
    ctx.fillRect(h.x * cs + pad, h.y * cs + pad, cs - pad * 2, cs - pad * 2);

    // Eyes
    var eyeSize = Math.max(2, cs * 0.22);
    var pupilSize = Math.max(1, cs * 0.12);
    var eyeOffX = direction.x !== 0 ? cs * 0.15 * direction.x : 0;
    var eyeOffY = direction.y !== 0 ? cs * 0.15 * direction.y : 0;

    // Position eyes based on direction
    var e1x, e1y, e2x, e2y;
    if (direction.x !== 0) {
      // Moving horizontally
      var frontX = h.x * cs + cs / 2 + (direction.x > 0 ? cs * 0.2 : -cs * 0.2);
      e1x = frontX;
      e1y = h.y * cs + cs * 0.3;
      e2x = frontX;
      e2y = h.y * cs + cs * 0.7;
    } else {
      // Moving vertically
      var frontY = h.y * cs + cs / 2 + (direction.y > 0 ? cs * 0.2 : -cs * 0.2);
      e1x = h.x * cs + cs * 0.3;
      e1y = frontY;
      e2x = h.x * cs + cs * 0.7;
      e2y = frontY;
    }

    // White of eyes
    ctx.fillStyle = Config.snakeEye;
    ctx.beginPath();
    ctx.arc(e1x, e1y, eyeSize, 0, Math.PI * 2);
    ctx.arc(e2x, e2y, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = Config.snakePupil;
    ctx.beginPath();
    ctx.arc(e1x + eyeOffX, e1y + eyeOffY, pupilSize, 0, Math.PI * 2);
    ctx.arc(e2x + eyeOffX, e2y + eyeOffY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
  }

  return {
    reset: reset,
    setDirection: setDirection,
    step: step,
    grow: grow,
    draw: draw,
    get head() { return body[0]; },
    get body() { return body; },
    get length() { return body.length; },
    get direction() { return direction; },
  };
})();
