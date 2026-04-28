/* Gravity Well — Satellite state and movement */

var Satellite = (function () {

  var x, y, vx, vy;
  var fuel;
  var launched;
  var trail;
  var alive;

  function reset(startPos, startFuel) {
    x = startPos.x;
    y = startPos.y;
    vx = 0;
    vy = 0;
    fuel = startFuel;
    launched = false;
    trail = [];
    alive = true;
  }

  function launch(angle, power) {
    vx = Math.cos(angle) * power;
    vy = Math.sin(angle) * power;
    launched = true;
  }

  function update(dt, planets) {
    if (!launched || !alive) return;

    // Gravity
    var g = Physics.gravity(x, y, planets);
    vx += g.ax * dt;
    vy += g.ay * dt;

    // Thrust (if holding and has fuel)
    if (fuel > 0 && (Input.held('Space') || Input.held('touchA'))) {
      // Thrust in direction of velocity (prograde)
      var speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > 0.1) {
        var tx = vx / speed;
        var ty = vy / speed;
        vx += tx * Config.thrustForce * dt;
        vy += ty * Config.thrustForce * dt;
        fuel -= Config.fuelBurnRate * dt;
        if (fuel < 0) fuel = 0;
      }
    }

    // Speed cap
    var speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > Config.maxSpeed) {
      vx = (vx / speed) * Config.maxSpeed;
      vy = (vy / speed) * Config.maxSpeed;
    }

    // Move
    x += vx * dt;
    y += vy * dt;

    // Trail
    trail.push({ x: x, y: y });
    if (trail.length > Config.trailLength) trail.shift();

    // Collision check
    if (Physics.collidesWithPlanet(x, y, planets)) {
      alive = false;
    }

    // Out of bounds
    if (Physics.outOfBounds(x, y)) {
      alive = false;
    }
  }

  return {
    reset: reset,
    launch: launch,
    update: update,
    get x() { return x; },
    get y() { return y; },
    get vx() { return vx; },
    get vy() { return vy; },
    get fuel() { return fuel; },
    get launched() { return launched; },
    get trail() { return trail; },
    get alive() { return alive; },
  };
})();
