/* Asteroids — Ship module
   Handles rotation, thrust, wrapping, and drawing the classic vector ship */

var Ship = (function () {

  var x, y, vx, vy, angle;
  var alive, respawnTimer, blinkTimer, visible;
  var thrusting;
  var cooldown;
  var flameFlicker;

  function reset() {
    x = Config.canvasW / 2;
    y = Config.canvasH / 2;
    vx = 0;
    vy = 0;
    angle = -Math.PI / 2; // pointing up
    alive = true;
    respawnTimer = 0;
    blinkTimer = 0;
    visible = true;
    thrusting = false;
    cooldown = 0;
    flameFlicker = 0;
  }

  function update(dt) {
    // Handle respawn invulnerability
    if (respawnTimer > 0) {
      respawnTimer -= dt;
      blinkTimer -= dt;
      if (blinkTimer <= 0) {
        visible = !visible;
        blinkTimer = Config.shipBlinkRate;
      }
      if (respawnTimer <= 0) {
        respawnTimer = 0;
        visible = true;
      }
    }

    if (!alive) return;

    // Rotation
    if (Input.held('ArrowLeft')) {
      angle -= Config.shipRotSpeed * dt;
    }
    if (Input.held('ArrowRight')) {
      angle += Config.shipRotSpeed * dt;
    }

    // Thrust
    thrusting = Input.held('ArrowUp');
    if (thrusting) {
      vx += Math.cos(angle) * Config.shipThrust * dt;
      vy += Math.sin(angle) * Config.shipThrust * dt;
    }

    // Brake (reverse thrust / decelerate)
    if (Input.held('ArrowDown')) {
      var speed2 = Math.sqrt(vx * vx + vy * vy);
      if (speed2 > 5) {
        var brakePower = Config.shipThrust * 0.8 * dt;
        vx -= (vx / speed2) * brakePower;
        vy -= (vy / speed2) * brakePower;
      } else {
        vx = 0;
        vy = 0;
      }
    }

    // Cap speed
    var speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > Config.shipMaxSpeed) {
      vx = (vx / speed) * Config.shipMaxSpeed;
      vy = (vy / speed) * Config.shipMaxSpeed;
    }

    // Move
    x += vx * dt;
    y += vy * dt;

    // Wrap around edges
    wrap();

    // Shoot cooldown
    if (cooldown > 0) cooldown -= dt;

    // Flame animation
    flameFlicker += dt * 20;
  }

  function wrap() {
    var margin = Config.shipSize;
    if (x < -margin) x += Config.canvasW + margin * 2;
    if (x > Config.canvasW + margin) x -= Config.canvasW + margin * 2;
    if (y < -margin) y += Config.canvasH + margin * 2;
    if (y > Config.canvasH + margin) y -= Config.canvasH + margin * 2;
  }

  function canShoot() {
    return alive && cooldown <= 0 && respawnTimer <= 0;
  }

  function shoot() {
    cooldown = Config.shootCooldown;
  }

  function die() {
    alive = false;
    visible = false;
  }

  function respawn() {
    x = Config.canvasW / 2;
    y = Config.canvasH / 2;
    vx = 0;
    vy = 0;
    angle = -Math.PI / 2;
    alive = true;
    respawnTimer = Config.shipRespawnTime;
    blinkTimer = Config.shipBlinkRate;
    visible = false;
  }

  function hyperspace() {
    x = Math.random() * Config.canvasW;
    y = Math.random() * Config.canvasH;
    vx = 0;
    vy = 0;
  }

  function draw(ctx) {
    if (!visible) return;

    var r = Config.shipSize;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);

    // Ship triangle — nose, left wing, right wing
    var noseX = x + cos * r;
    var noseY = y + sin * r;
    var leftX = x + Math.cos(angle + 2.4) * r;
    var leftY = y + Math.sin(angle + 2.4) * r;
    var rightX = x + Math.cos(angle - 2.4) * r;
    var rightY = y + Math.sin(angle - 2.4) * r;

    ctx.strokeStyle = Config.shipColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(noseX, noseY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.stroke();

    // Thrust flame
    if (thrusting) {
      var flameLen = r * (0.5 + Math.sin(flameFlicker) * 0.3);
      var tailX = x - cos * flameLen;
      var tailY = y - sin * flameLen;
      var fLeftX = x + Math.cos(angle + 2.8) * r * 0.5;
      var fLeftY = y + Math.sin(angle + 2.8) * r * 0.5;
      var fRightX = x + Math.cos(angle - 2.8) * r * 0.5;
      var fRightY = y + Math.sin(angle - 2.8) * r * 0.5;

      ctx.strokeStyle = Config.shipThrustColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fLeftX, fLeftY);
      ctx.lineTo(tailX, tailY);
      ctx.lineTo(fRightX, fRightY);
      ctx.stroke();
    }
  }

  function getNose() {
    return {
      x: x + Math.cos(angle) * Config.shipSize,
      y: y + Math.sin(angle) * Config.shipSize,
    };
  }

  return {
    reset: reset,
    update: update,
    draw: draw,
    canShoot: canShoot,
    shoot: shoot,
    die: die,
    respawn: respawn,
    hyperspace: hyperspace,
    getNose: getNose,
    get x() { return x; },
    get y() { return y; },
    get vx() { return vx; },
    get vy() { return vy; },
    get angle() { return angle; },
    get alive() { return alive; },
    get visible() { return visible; },
    get invulnerable() { return respawnTimer > 0; },
    get radius() { return Config.shipSize; },
  };
})();
