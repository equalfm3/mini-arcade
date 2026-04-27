/* Shrinking Arena — Arena Module */

var Arena = (function () {

  var radius;
  var shrinkRate;
  var time;
  var warning;

  function reset() {
    radius = Config.arenaStartRadius;
    shrinkRate = Config.arenaShrinkRate;
    time = 0;
    warning = false;
  }

  function update(dt) {
    time += dt;

    // Increase shrink rate over time
    shrinkRate = Config.arenaShrinkRate + time * Config.arenaShrinkAccel;
    if (shrinkRate > Config.arenaMaxShrinkRate) {
      shrinkRate = Config.arenaMaxShrinkRate;
    }

    radius -= shrinkRate * dt;
    if (radius < Config.arenaMinRadius) {
      radius = Config.arenaMinRadius;
    }

    warning = radius < Config.arenaWarningRadius;
  }

  /** Check if a dot is outside the arena. Returns true if eliminated. */
  function isOutside(dotX, dotY) {
    var dx = dotX - Config.centerX;
    var dy = dotY - Config.centerY;
    return Math.sqrt(dx * dx + dy * dy) > radius;
  }

  /** Constrain a position to stay inside the arena (for player) */
  function constrain(dotX, dotY, dotRadius) {
    var dx = dotX - Config.centerX;
    var dy = dotY - Config.centerY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var maxDist = radius - dotRadius;
    if (maxDist < 0) maxDist = 0;
    if (dist > maxDist && dist > 0) {
      return {
        x: Config.centerX + (dx / dist) * maxDist,
        y: Config.centerY + (dy / dist) * maxDist,
      };
    }
    return null;
  }

  /** Get pulse intensity for warning effect (0-1) */
  function pulseIntensity() {
    if (!warning) return 0;
    return 0.5 + 0.5 * Math.sin(time * Config.arenaPulseSpeed);
  }

  /** Check if arena is at sudden death size */
  function isSuddenDeath() {
    return radius <= Config.suddenDeathRadius;
  }

  reset();

  return {
    reset: reset,
    update: update,
    isOutside: isOutside,
    constrain: constrain,
    pulseIntensity: pulseIntensity,
    isSuddenDeath: isSuddenDeath,
    get radius() { return radius; },
    get warning() { return warning; },
    get shrinkRate() { return shrinkRate; },
  };
})();
