/* Shrinking Arena — Player Module */

var Player = (function () {

  var x, y, vx, vy;
  var pushVx, pushVy;
  var alive;
  var trail;

  function reset() {
    x = Config.centerX;
    y = Config.centerY;
    vx = 0;
    vy = 0;
    pushVx = 0;
    pushVy = 0;
    alive = true;
    trail = [];
  }

  function update(dt) {
    if (!alive) return;

    // Movement input
    var mx = 0;
    var my = 0;

    if (Input.held('ArrowLeft') || Input.held('a') || Input.held('A')) mx -= 1;
    if (Input.held('ArrowRight') || Input.held('d') || Input.held('D')) mx += 1;
    if (Input.held('ArrowUp') || Input.held('w') || Input.held('W')) my -= 1;
    if (Input.held('ArrowDown') || Input.held('s') || Input.held('S')) my += 1;

    // D-pad support
    if (Input.dir === 'left') mx -= 1;
    if (Input.dir === 'right') mx += 1;
    if (Input.dir === 'up') my -= 1;
    if (Input.dir === 'down') my += 1;

    // Normalize diagonal
    var len = Math.sqrt(mx * mx + my * my);
    if (len > 0) {
      mx /= len;
      my /= len;
    }

    vx = mx * Config.playerSpeed;
    vy = my * Config.playerSpeed;

    // Apply push velocity (decays over time)
    pushVx *= Math.max(0, 1 - Config.pushFriction * dt);
    pushVy *= Math.max(0, 1 - Config.pushFriction * dt);

    x += (vx + pushVx) * dt;
    y += (vy + pushVy) * dt;

    // Trail
    trail.unshift({ x: x, y: y });
    if (trail.length > Config.playerTrailLength) {
      trail.length = Config.playerTrailLength;
    }
  }

  function applyPush(pvx, pvy) {
    pushVx += pvx;
    pushVy += pvy;
  }

  function eliminate() {
    alive = false;
  }

  reset();

  return {
    reset: reset,
    update: update,
    applyPush: applyPush,
    eliminate: eliminate,
    get x() { return x; },
    get y() { return y; },
    get vx() { return vx; },
    get vy() { return vy; },
    get alive() { return alive; },
    get trail() { return trail; },
    get radius() { return Config.playerRadius; },
    set x(v) { x = v; },
    set y(v) { y = v; },
  };
})();
