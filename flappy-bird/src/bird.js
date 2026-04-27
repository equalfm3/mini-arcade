/* Flappy Bird — Bird entity */

var Bird = (function () {

  var y = 0;
  var vy = 0;
  var rotation = 0;
  var alive = true;

  function reset() {
    y = Config.canvasH / 2;
    vy = 0;
    rotation = 0;
    alive = true;
  }

  function flap() {
    if (!alive) return;
    vy = Config.flapForce;
  }

  function update(dt) {
    // Apply gravity
    vy += Config.gravity * dt;

    // Cap at terminal velocity
    if (vy > Config.maxFallSpeed) {
      vy = Config.maxFallSpeed;
    }

    // Update position
    y += vy * dt;

    // Soft clamp — only prevent going off-screen during death fall
    if (!alive) {
      var maxY = Config.canvasH - Config.groundH - Config.birdSize;
      if (y > maxY) y = maxY;
    }

    // Calculate rotation based on velocity
    // Going up (vy negative) → nose up (-30°)
    // Falling (vy positive) → nose down (up to 90°)
    rotation = clamp(vy / Config.maxFallSpeed * 90, -30, 90);
  }

  function draw(ctx) {
    var bx = Config.birdX;
    var r = Config.birdSize;

    ctx.save();
    ctx.translate(bx, y);
    ctx.rotate(rotation * Math.PI / 180);

    // Body (yellow circle)
    ctx.fillStyle = Config.birdBody;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Wing (orange triangle on the back)
    ctx.fillStyle = Config.birdWing;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.1);
    ctx.lineTo(-r * 1.0, r * 0.3);
    ctx.lineTo(-r * 0.2, r * 0.4);
    ctx.closePath();
    ctx.fill();

    // Eye (white circle)
    ctx.fillStyle = Config.birdEye;
    ctx.beginPath();
    ctx.arc(r * 0.35, -r * 0.25, r * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // Pupil (black dot)
    ctx.fillStyle = Config.birdPupil;
    ctx.beginPath();
    ctx.arc(r * 0.45, -r * 0.25, r * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // Beak (orange triangle)
    ctx.fillStyle = Config.birdBeak;
    ctx.beginPath();
    ctx.moveTo(r * 0.7, -r * 0.1);
    ctx.lineTo(r * 1.3, r * 0.1);
    ctx.lineTo(r * 0.7, r * 0.25);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function getHitbox() {
    // Slightly smaller than visual for forgiving collision
    return { x: Config.birdX, y: y, r: Config.birdSize * 0.75 };
  }

  function die() {
    alive = false;
  }

  return {
    reset: reset,
    flap: flap,
    update: update,
    draw: draw,
    getHitbox: getHitbox,
    die: die,
    get y() { return y; },
    get alive() { return alive; },
  };
})();
