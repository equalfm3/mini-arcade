/* Space Invaders — Player module */

var Player = (function () {

  var x = 0;
  var y = 0;
  var width = 0;
  var height = 0;
  var cooldown = 0;
  var alive = true;
  var respawnTimer = 0;
  var blinkTimer = 0;
  var visible = true;

  function reset() {
    width = Config.playerW;
    height = Config.playerH;
    x = (Config.canvasW - width) / 2;
    y = Config.playerY;
    cooldown = 0;
    alive = true;
    respawnTimer = 0;
    blinkTimer = 0;
    visible = true;
  }

  function update(dt) {
    // Handle respawn blinking
    if (respawnTimer > 0) {
      respawnTimer -= dt;
      blinkTimer -= dt;
      if (blinkTimer <= 0) {
        visible = !visible;
        blinkTimer = 0.1;
      }
      if (respawnTimer <= 0) {
        alive = true;
        visible = true;
        respawnTimer = 0;
      }
      return;
    }

    if (!alive) return;

    // Movement
    if (Input.held('ArrowLeft') || Input.dir === 'left') {
      x -= Config.playerSpeed * dt;
    }
    if (Input.held('ArrowRight') || Input.dir === 'right') {
      x += Config.playerSpeed * dt;
    }

    // Clamp to canvas
    x = clamp(x, 0, Config.canvasW - width);

    // Cooldown
    if (cooldown > 0) {
      cooldown -= dt;
    }
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
    x = (Config.canvasW - width) / 2;
    y = Config.playerY;
    respawnTimer = 1.5;
    blinkTimer = 0.1;
    visible = false;
    alive = false;
  }

  function getRect() {
    return { x: x, y: y, w: width, h: height };
  }

  function getCenterX() {
    return x + width / 2;
  }

  function getTopY() {
    return y;
  }

  return {
    reset: reset,
    update: update,
    canShoot: canShoot,
    shoot: shoot,
    die: die,
    respawn: respawn,
    getRect: getRect,
    getCenterX: getCenterX,
    getTopY: getTopY,
    get x() { return x; },
    get y() { return y; },
    get width() { return width; },
    get height() { return height; },
    get alive() { return alive; },
    get visible() { return visible; },
    get respawning() { return respawnTimer > 0; },
  };
})();
