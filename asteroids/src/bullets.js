/* Asteroids — Bullets module
   Manages bullet pool with screen wrapping and lifetime */

var Bullets = (function () {

  var pool = [];

  function reset() {
    pool = [];
  }

  function fire(x, y, angle) {
    if (pool.length >= Config.maxBullets) return false;
    pool.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * Config.bulletSpeed,
      vy: Math.sin(angle) * Config.bulletSpeed,
      life: Config.bulletLife,
    });
    return true;
  }

  function update(dt) {
    for (var i = pool.length - 1; i >= 0; i--) {
      var b = pool[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      // Wrap around edges
      if (b.x < 0) b.x += Config.canvasW;
      if (b.x > Config.canvasW) b.x -= Config.canvasW;
      if (b.y < 0) b.y += Config.canvasH;
      if (b.y > Config.canvasH) b.y -= Config.canvasH;

      // Remove expired bullets
      if (b.life <= 0) {
        pool.splice(i, 1);
      }
    }
  }

  function checkAsteroids() {
    var hits = [];
    for (var i = pool.length - 1; i >= 0; i--) {
      var b = pool[i];
      var idx = Asteroids.checkPoint(b.x, b.y);
      if (idx >= 0) {
        hits.push(idx);
        pool.splice(i, 1);
      }
    }
    return hits;
  }

  function draw(ctx) {
    ctx.fillStyle = Config.bulletColor;
    for (var i = 0; i < pool.length; i++) {
      var b = pool[i];
      ctx.beginPath();
      ctx.arc(b.x, b.y, Config.bulletRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return {
    reset: reset,
    fire: fire,
    update: update,
    checkAsteroids: checkAsteroids,
    draw: draw,
    get count() { return pool.length; },
  };
})();
