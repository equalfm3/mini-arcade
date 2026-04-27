/* Doodle Jump — Player module */

var Player = (function () {

  var x = 0;       // center x
  var y = 0;       // bottom of player (feet)
  var vy = 0;      // vertical velocity (negative = up)
  var facingRight = true;

  function reset() {
    x = Config.canvasW / 2;
    y = Config.canvasH - 60;
    vy = Config.jumpForce;
    facingRight = true;
  }

  function update(dt) {
    // Horizontal movement
    var dx = 0;
    if (Input.held('ArrowLeft') || Input.dir === 'left') {
      dx = -Config.playerSpeed;
      facingRight = false;
    }
    if (Input.held('ArrowRight') || Input.dir === 'right') {
      dx = Config.playerSpeed;
      facingRight = true;
    }
    x += dx * dt;

    // Screen wrapping
    if (x < -Config.playerHalfW) {
      x = Config.canvasW + Config.playerHalfW;
    } else if (x > Config.canvasW + Config.playerHalfW) {
      x = -Config.playerHalfW;
    }

    // Gravity
    vy += Config.gravity * dt;
    if (vy > Config.maxFallSpeed) {
      vy = Config.maxFallSpeed;
    }

    // Move vertically
    y += vy * dt;
  }

  function bounce(force) {
    vy = force || Config.jumpForce;
  }

  /** Check if player feet overlap a platform rect */
  function checkPlatformCollision(px, py, pw, ph) {
    // Only collide when falling
    if (vy < 0) return false;

    var feetY = y;
    var prevFeetY = y - vy * (1 / 60); // approximate previous position

    // Player horizontal overlap
    var playerLeft = x - Config.playerHalfW;
    var playerRight = x + Config.playerHalfW;
    var platLeft = px;
    var platRight = px + pw;

    if (playerRight < platLeft || playerLeft > platRight) return false;

    // Feet must be crossing through the platform top
    var platTop = py;
    var platBottom = py + ph;

    if (feetY >= platTop && feetY <= platBottom + vy * (1 / 60)) {
      // Snap feet to platform top
      y = platTop;
      return true;
    }

    return false;
  }

  function draw(ctx, cameraY) {
    var screenY = y - cameraY;
    var sx = x;

    ctx.save();
    ctx.translate(sx, screenY);

    // Body (rounded rectangle)
    var bw = Config.playerW;
    var bh = Config.playerH;
    var bx = -bw / 2;
    var by = -bh;

    // Main body
    ctx.fillStyle = Config.playerBody;
    ctx.beginPath();
    ctx.moveTo(bx + 4, by);
    ctx.lineTo(bx + bw - 4, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + 4);
    ctx.lineTo(bx + bw, by + bh - 2);
    ctx.lineTo(bx, by + bh - 2);
    ctx.lineTo(bx, by + 4);
    ctx.quadraticCurveTo(bx, by, bx + 4, by);
    ctx.fill();

    // Darker belly
    ctx.fillStyle = Config.playerDark;
    ctx.fillRect(bx + 4, by + bh * 0.55, bw - 8, bh * 0.35);

    // Eyes
    var eyeOffX = facingRight ? 3 : -3;
    // Left eye
    ctx.fillStyle = Config.playerEye;
    ctx.beginPath();
    ctx.arc(eyeOffX - 5, by + 10, 4, 0, Math.PI * 2);
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.arc(eyeOffX + 5, by + 10, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    var pupilOff = facingRight ? 1.5 : -1.5;
    ctx.fillStyle = Config.playerPupil;
    ctx.beginPath();
    ctx.arc(eyeOffX - 5 + pupilOff, by + 10, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeOffX + 5 + pupilOff, by + 10, 2, 0, Math.PI * 2);
    ctx.fill();

    // Nose / mouth
    ctx.fillStyle = Config.playerNose;
    var noseX = facingRight ? 4 : -4;
    ctx.fillRect(noseX - 1, by + 16, 3, 2);

    // Feet
    ctx.fillStyle = Config.playerFeet;
    ctx.fillRect(-8, -3, 6, 3);
    ctx.fillRect(2, -3, 6, 3);

    ctx.restore();
  }

  return {
    reset: reset,
    update: update,
    bounce: bounce,
    checkPlatformCollision: checkPlatformCollision,
    draw: draw,
    get x() { return x; },
    get y() { return y; },
    set y(v) { y = v; },
    get vy() { return vy; },
    get facingRight() { return facingRight; },
  };
})();
