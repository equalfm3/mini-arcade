/* Endless Runner — Obstacle spawning & collision */

var Obstacles = (function () {

  var list = [];
  var spawnTimer = 0;
  var nextSpawnTime = 0;
  var totalTime = 0;

  function reset() {
    list = [];
    spawnTimer = 0;
    totalTime = 0;
    nextSpawnTime = 1.5; // initial delay before first obstacle
  }

  function getSpawnGap() {
    var gap = Config.maxObstacleGap - totalTime * Config.gapShrinkRate;
    return Math.max(Config.minObstacleGap, gap);
  }

  function pickType() {
    // Early game: only cacti. Birds appear after 10 seconds
    var r = Math.random();
    if (totalTime < 10) {
      if (r < 0.5) return Config.SMALL_CACTUS;
      if (r < 0.8) return Config.LARGE_CACTUS;
      return Config.DOUBLE_CACTUS;
    }
    if (r < 0.3) return Config.SMALL_CACTUS;
    if (r < 0.5) return Config.LARGE_CACTUS;
    if (r < 0.7) return Config.DOUBLE_CACTUS;
    return Config.BIRD;
  }

  function createObstacle(type, speed) {
    var obs = { type: type, x: Config.canvasW + 20, y: 0, w: 0, h: 0, flapTimer: 0 };

    switch (type) {
      case Config.SMALL_CACTUS:
        obs.w = Config.smallCactusW;
        obs.h = Config.smallCactusH;
        obs.y = Config.groundY - obs.h;
        break;
      case Config.LARGE_CACTUS:
        obs.w = Config.largeCactusW;
        obs.h = Config.largeCactusH;
        obs.y = Config.groundY - obs.h;
        break;
      case Config.DOUBLE_CACTUS:
        obs.w = Config.doubleCactusW;
        obs.h = Config.doubleCactusH;
        obs.y = Config.groundY - obs.h;
        break;
      case Config.BIRD:
        obs.w = Config.birdW;
        obs.h = Config.birdH;
        // Pick altitude
        var altitudes = [Config.birdLowY, Config.birdMidY, Config.birdHighY];
        obs.y = altitudes[randInt(0, 2)];
        obs.flapTimer = Math.random() * 6;
        break;
    }

    return obs;
  }

  function update(dt, speed) {
    totalTime += dt;
    spawnTimer += dt;

    // Spawn new obstacles
    if (spawnTimer >= nextSpawnTime) {
      spawnTimer = 0;
      var gap = getSpawnGap();
      nextSpawnTime = gap + Math.random() * gap * 0.5;
      var type = pickType();
      list.push(createObstacle(type, speed));
    }

    // Move obstacles left
    for (var i = list.length - 1; i >= 0; i--) {
      var obs = list[i];
      obs.x -= speed * dt;

      // Animate bird wings
      if (obs.type === Config.BIRD) {
        obs.flapTimer += dt * Config.birdFlapSpeed;
      }

      // Remove off-screen
      if (obs.x + obs.w < -20) {
        list.splice(i, 1);
      }
    }
  }

  function checkCollision(hitbox) {
    for (var i = 0; i < list.length; i++) {
      var obs = list[i];
      // AABB collision with slight padding for forgiveness
      var pad = 4;
      if (
        hitbox.x + hitbox.w - pad > obs.x + pad &&
        hitbox.x + pad < obs.x + obs.w - pad &&
        hitbox.y + hitbox.h - pad > obs.y + pad &&
        hitbox.y + pad < obs.y + obs.h - pad
      ) {
        return obs;
      }
    }
    return null;
  }

  return {
    reset: reset,
    update: update,
    checkCollision: checkCollision,
    get list() { return list; },
  };
})();
