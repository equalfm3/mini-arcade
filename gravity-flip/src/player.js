/* Gravity Flip — Player module

   The player is a glowing square that falls toward the floor or ceiling.
   
   Controls:
   - Quick tap: small impulse in the opposite direction of gravity
   - Hold: continuous thrust against gravity (stronger the longer you hold)
   - Release: gravity takes over, velocity dampened slightly
   
   Includes trail, squish animation, and glow pulse.
*/

var Player = (function () {

  var y = 0;
  var vy = 0;
  var gravityDir = 1;     // 1 = down, -1 = up
  var alive = true;
  var holding = false;    // is the player holding the button?

  // Trail positions (ring buffer)
  var trail = [];
  var trailTimer = 0;

  // Squish animation
  var squishTime = 0;

  // Glow pulse
  var glowTime = 0;

  function reset() {
    y = Config.playerStartY;
    vy = 0;
    gravityDir = 1;
    alive = true;
    holding = false;
    trail = [];
    trailTimer = 0;
    squishTime = 0;
    glowTime = 0;
  }

  /** Quick tap — small impulse against gravity */
  function tap() {
    if (!alive) return;
    vy = -gravityDir * Config.tapImpulse;
    squishTime = Config.squishDuration;
  }

  /** Start holding — begins continuous thrust */
  function startHold() {
    if (!alive) return;
    holding = true;
    // Initial tap impulse
    vy = -gravityDir * Config.tapImpulse;
    squishTime = Config.squishDuration;
  }

  /** Release hold — dampen velocity */
  function endHold() {
    holding = false;
    vy *= Config.dampingOnRelease;
  }

  /** Flip gravity direction (double-tap or separate button) */
  function flipGravity() {
    if (!alive) return;
    gravityDir *= -1;
    vy = -gravityDir * Config.tapImpulse * 0.5; // gentle redirect
    squishTime = Config.squishDuration;
  }

  function update(dt) {
    if (!alive) return;

    // If holding, apply continuous thrust against gravity
    if (holding) {
      vy -= gravityDir * Config.holdImpulseRate * dt;
      // Cap hold velocity
      if (Math.abs(vy) > Config.maxHoldVel) {
        vy = Config.maxHoldVel * (vy > 0 ? 1 : -1);
      }
    }

    // Gravity always pulls in gravityDir
    vy += Config.gravity * gravityDir * dt;

    // Terminal velocity
    if (Math.abs(vy) > Config.terminalVel) {
      vy = Config.terminalVel * (vy > 0 ? 1 : -1);
    }

    // Move
    y += vy * dt;

    // Clamp to corridor bounds (soft bounce off top/bottom)
    var margin = Config.playerSize + 2;
    if (y < margin) {
      y = margin;
      vy = Math.abs(vy) * 0.3; // soft bounce
    }
    if (y > Config.canvasH - margin) {
      y = Config.canvasH - margin;
      vy = -Math.abs(vy) * 0.3;
    }

    // Squish timer
    if (squishTime > 0) {
      squishTime -= dt;
      if (squishTime < 0) squishTime = 0;
    }

    // Glow pulse
    glowTime += dt;

    // Trail sampling
    trailTimer += dt;
    if (trailTimer >= Config.trailSpacing) {
      trailTimer = 0;
      trail.push({ x: Config.playerX, y: y });
      if (trail.length > Config.trailLength) {
        trail.shift();
      }
    }
  }

  function die() {
    alive = false;
    holding = false;
  }

  function getHitbox() {
    var s = Config.playerSize;
    return {
      x: Config.playerX - s,
      y: y - s,
      w: s * 2,
      h: s * 2,
    };
  }

  function getSquish() {
    if (squishTime <= 0) return { sx: 1, sy: 1 };
    var t = squishTime / Config.squishDuration;
    var ease = t * t;
    var sx = 1 + (Config.squishScaleX - 1) * ease;
    var sy = 1 + (Config.squishScaleY - 1) * ease;
    return { sx: sx, sy: sy };
  }

  function getGlow(speed) {
    var pulse = Math.sin(glowTime * Config.glowPulseSpeed) * 0.5 + 0.5;
    var speedFactor = clamp((speed - Config.corridorSpeed) / (Config.corridorSpeedMax - Config.corridorSpeed), 0, 1);
    return Config.glowBase + (Config.glowMax - Config.glowBase) * (pulse * 0.5 + speedFactor * 0.5);
  }

  return {
    reset: reset,
    tap: tap,
    startHold: startHold,
    endHold: endHold,
    flipGravity: flipGravity,
    update: update,
    die: die,
    getHitbox: getHitbox,
    getSquish: getSquish,
    getGlow: getGlow,
    get y() { return y; },
    set y(v) { y = v; },
    get vy() { return vy; },
    get gravityDir() { return gravityDir; },
    get alive() { return alive; },
    get holding() { return holding; },
    get trail() { return trail; },
  };
})();
