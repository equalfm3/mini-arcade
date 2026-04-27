/* Color Switch — Ball entity */

var Ball = (function () {

  var x = 0;
  var y = 0;
  var vy = 0;
  var colorIndex = 0;
  var alive = true;

  // Variable jump state
  var holdTime = 0;       // how long jump has been held
  var jumping = false;    // currently in a hold-boost jump

  function reset() {
    x = Config.canvasW / 2;
    y = 0;
    vy = 0;
    colorIndex = Math.floor(Math.random() * Config.colors.length);
    alive = true;
    holdTime = 0;
    jumping = false;
  }

  /** Called once when the player first presses jump */
  function jumpStart() {
    if (!alive) return;
    vy = Config.jumpTapForce;
    holdTime = 0;
    jumping = true;
  }

  /** Called every frame while the player keeps holding jump */
  function jumpHold(dt) {
    if (!alive || !jumping) return;
    holdTime += dt;
    if (holdTime < Config.jumpHoldMax) {
      // Apply upward acceleration while held
      vy += Config.jumpHoldAccel * dt;
      // Clamp so we don't fly off
      if (vy < Config.jumpMinVy) vy = Config.jumpMinVy;
    } else {
      jumping = false;
    }
  }

  /** Called when the player releases the jump button */
  function jumpRelease() {
    jumping = false;
  }

  function update(dt) {
    if (!alive) return;

    // Gravity (only full gravity when not actively boosting)
    vy += Config.gravity * dt;
    if (vy > Config.maxFallSpeed) vy = Config.maxFallSpeed;

    // Move
    y += vy * dt;
  }

  function switchColor() {
    // Pick a different color randomly
    var newIndex;
    do {
      newIndex = Math.floor(Math.random() * Config.colors.length);
    } while (newIndex === colorIndex);
    colorIndex = newIndex;
  }

  function die() {
    alive = false;
    jumping = false;
  }

  function getColor() {
    return Config.colors[colorIndex];
  }

  return {
    reset: reset,
    jumpStart: jumpStart,
    jumpHold: jumpHold,
    jumpRelease: jumpRelease,
    update: update,
    switchColor: switchColor,
    die: die,
    getColor: getColor,
    get x() { return x; },
    get y() { return y; },
    get vy() { return vy; },
    get colorIndex() { return colorIndex; },
    get alive() { return alive; },
  };
})();
