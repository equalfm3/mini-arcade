/* Breakout — Ball module */

var Ball = (function () {

  var x = 0;
  var y = 0;
  var vx = 0;
  var vy = 0;
  var radius = 0;
  var speed = 0;
  var active = false;

  function reset() {
    radius = Config.ballRadius;
    speed = Config.ballBaseSpeed;
    active = false;
    followPaddle();
  }

  function followPaddle() {
    var pr = Paddle.getRect();
    x = pr.x + pr.w / 2;
    y = pr.y - radius - 1;
  }

  function launch() {
    if (active) return;
    active = true;
    // Random upward angle between 45° and 135°
    var angle = Config.launchAngleMin + Math.random() * (Config.launchAngleMax - Config.launchAngleMin);
    vx = Math.cos(angle) * speed;
    vy = -Math.sin(angle) * speed;
  }

  function update(dt) {
    if (!active) {
      followPaddle();
      return 'ok';
    }

    x += vx * dt;
    y += vy * dt;

    // Bounce off left wall
    if (x - radius < 0) {
      x = radius;
      vx = Math.abs(vx);
    }

    // Bounce off right wall
    if (x + radius > Config.canvasW) {
      x = Config.canvasW - radius;
      vx = -Math.abs(vx);
    }

    // Bounce off top wall
    if (y - radius < 0) {
      y = radius;
      vy = Math.abs(vy);
    }

    // Fell below bottom
    if (y + radius > Config.canvasH) {
      return 'lost';
    }

    return 'ok';
  }

  function bounceX() {
    vx = -vx;
  }

  function bounceY() {
    vy = -vy;
  }

  function increaseSpeed() {
    speed = Math.min(speed + Config.ballSpeedIncrement, Config.ballMaxSpeed);
    // Normalize velocity to new speed
    var mag = Math.sqrt(vx * vx + vy * vy);
    if (mag > 0) {
      vx = (vx / mag) * speed;
      vy = (vy / mag) * speed;
    }
  }

  function setVelocity(newVx, newVy) {
    vx = newVx;
    vy = newVy;
  }

  function draw(ctx) {
    ctx.fillStyle = Config.ballColor;
    ctx.beginPath();
    ctx.arc(Math.floor(x), Math.floor(y), radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function getRect() {
    return {
      x: x - radius,
      y: y - radius,
      w: radius * 2,
      h: radius * 2,
    };
  }

  return {
    reset: reset,
    launch: launch,
    update: update,
    draw: draw,
    getRect: getRect,
    bounceX: bounceX,
    bounceY: bounceY,
    increaseSpeed: increaseSpeed,
    setVelocity: setVelocity,
    get active() { return active; },
    get x() { return x; },
    get y() { return y; },
    get speed() { return speed; },
  };
})();
