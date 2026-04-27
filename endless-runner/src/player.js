/* Endless Runner — Player entity */

var Player = (function () {

  // States
  var RUN = 0;
  var JUMP = 1;
  var DUCK = 2;
  var DEAD = 3;

  var state = RUN;
  var y = 0;
  var vy = 0;
  var legTimer = 0;   // for run animation

  function reset() {
    state = RUN;
    y = Config.playerRunY;
    vy = 0;
    legTimer = 0;
  }

  function jump() {
    if (state === JUMP || state === DEAD) return false;
    state = JUMP;
    vy = Config.jumpForce;
    y = Math.min(y, Config.playerRunY); // ensure starting from ground level
    return true;
  }

  function duck() {
    if (state === JUMP || state === DEAD) return false;
    state = DUCK;
    y = Config.playerDuckY;
    return true;
  }

  function unduck() {
    if (state !== DUCK) return;
    state = RUN;
    y = Config.playerRunY;
  }

  function die() {
    state = DEAD;
  }

  function update(dt) {
    if (state === DEAD) return;

    if (state === JUMP) {
      vy += Config.gravity * dt;
      if (vy > Config.maxFallSpeed) vy = Config.maxFallSpeed;
      y += vy * dt;

      // Land on ground
      if (y >= Config.playerRunY) {
        y = Config.playerRunY;
        vy = 0;
        state = RUN;
      }
    }

    // Leg animation timer (only when running)
    if (state === RUN) {
      legTimer += dt * Config.legSpeed;
    }
  }

  function getHitbox() {
    if (state === DUCK) {
      return {
        x: Config.playerX,
        y: Config.playerDuckY,
        w: Config.duckW,
        h: Config.duckH
      };
    }
    return {
      x: Config.playerX,
      y: y,
      w: Config.playerW,
      h: Config.playerH
    };
  }

  return {
    reset: reset,
    jump: jump,
    duck: duck,
    unduck: unduck,
    die: die,
    update: update,
    getHitbox: getHitbox,
    get state() { return state; },
    get y() { return y; },
    get legTimer() { return legTimer; },
    get alive() { return state !== DEAD; },
    get isJumping() { return state === JUMP; },
    get isDucking() { return state === DUCK; },
    get isRunning() { return state === RUN; },
    RUN: RUN,
    JUMP: JUMP,
    DUCK: DUCK,
    DEAD: DEAD,
  };
})();
