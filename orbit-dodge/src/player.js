/* Orbit Dodge — Player
   Moves along one of two concentric orbit rings.
   Tap/Space reverses direction. Up/Down hops between orbits.
*/

var Player = (function () {

  var angle = 0;
  var direction = 1;      // 1 = clockwise, -1 = counter-clockwise
  var orbitIndex = 0;     // 0 = inner, 1 = outer
  var radius = 0;         // current orbit radius (animates during hop)
  var targetRadius = 0;
  var x = 0;
  var y = 0;
  var trail = [];
  var alive = true;
  var hopping = false;
  var hopTimer = 0;
  var hopFrom = 0;
  var hopTo = 0;

  function reset() {
    angle = -Math.PI / 2;
    direction = 1;
    orbitIndex = 0;
    radius = Config.orbits[0];
    targetRadius = radius;
    alive = true;
    hopping = false;
    hopTimer = 0;
    trail = [];
    updatePosition();
  }

  function updatePosition() {
    x = Config.centerX + Math.cos(angle) * radius;
    y = Config.centerY + Math.sin(angle) * radius;
  }

  function update(dt) {
    if (!alive) return;

    // Hop animation
    if (hopping) {
      hopTimer += dt;
      var t = Math.min(hopTimer / Config.hopDuration, 1);
      var ease = 1 - (1 - t) * (1 - t); // ease-out
      radius = hopFrom + (hopTo - hopFrom) * ease;
      if (t >= 1) {
        hopping = false;
        radius = hopTo;
      }
    }

    // Store trail
    trail.unshift({ angle: angle, x: x, y: y });
    if (trail.length > Config.trailLength) {
      trail.length = Config.trailLength;
    }

    // Move along orbit
    angle += Config.angularSpeed * direction * dt;
    if (angle > Math.PI * 2) angle -= Math.PI * 2;
    if (angle < 0) angle += Math.PI * 2;

    updatePosition();
  }

  function reverseDirection() {
    direction *= -1;
  }

  /** Hop to the other orbit ring */
  function hopOrbit() {
    if (hopping) return; // can't hop while hopping
    var newIndex = orbitIndex === 0 ? 1 : 0;
    orbitIndex = newIndex;
    hopping = true;
    hopTimer = 0;
    hopFrom = radius;
    hopTo = Config.orbits[newIndex];
    targetRadius = hopTo;
  }

  /** Hop to a specific orbit */
  function hopToOrbit(idx) {
    if (hopping || idx === orbitIndex) return;
    orbitIndex = idx;
    hopping = true;
    hopTimer = 0;
    hopFrom = radius;
    hopTo = Config.orbits[idx];
    targetRadius = hopTo;
  }

  function kill() {
    alive = false;
  }

  return {
    reset: reset,
    update: update,
    reverseDirection: reverseDirection,
    hopOrbit: hopOrbit,
    hopToOrbit: hopToOrbit,
    kill: kill,
    get x() { return x; },
    get y() { return y; },
    get angle() { return angle; },
    get direction() { return direction; },
    get orbitIndex() { return orbitIndex; },
    get radius() { return radius; },
    get trail() { return trail; },
    get alive() { return alive; },
    get hopping() { return hopping; },
  };
})();
