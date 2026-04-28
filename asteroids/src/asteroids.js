/* Asteroids — Asteroid field module
   Manages asteroid spawning, movement, splitting, and collision */

var Asteroids = (function () {

  var pool = [];

  function createShape(numVerts, jaggedness) {
    var verts = [];
    for (var i = 0; i < numVerts; i++) {
      var a = (i / numVerts) * Math.PI * 2;
      var r = 1 - jaggedness * 0.5 + Math.random() * jaggedness;
      verts.push({ angle: a, dist: r });
    }
    return verts;
  }

  function createAsteroid(x, y, size) {
    var info = Config.asteroidSizes[size];
    var a = Math.random() * Math.PI * 2;
    var spd = info.speed * (0.7 + Math.random() * 0.6);
    return {
      x: x,
      y: y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      radius: info.radius,
      size: size,
      points: info.points,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * Config.asteroidRotSpeed * 2,
      shape: createShape(Config.asteroidVertices, Config.asteroidJaggedness),
    };
  }

  function spawnWave(wave) {
    pool = [];
    var count = Config.startingAsteroids + wave;
    var cx = Config.canvasW / 2;
    var cy = Config.canvasH / 2;
    var margin = Config.asteroidSpawnMargin;

    for (var i = 0; i < count; i++) {
      var x, y;
      // Spawn away from center (where ship is)
      do {
        x = Math.random() * Config.canvasW;
        y = Math.random() * Config.canvasH;
      } while (Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) < margin);

      pool.push(createAsteroid(x, y, 'large'));
    }
  }

  function update(dt) {
    for (var i = 0; i < pool.length; i++) {
      var a = pool[i];
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.angle += a.rotSpeed * dt;

      // Wrap around edges
      var r = a.radius;
      if (a.x < -r) a.x += Config.canvasW + r * 2;
      if (a.x > Config.canvasW + r) a.x -= Config.canvasW + r * 2;
      if (a.y < -r) a.y += Config.canvasH + r * 2;
      if (a.y > Config.canvasH + r) a.y -= Config.canvasH + r * 2;
    }
  }

  function split(index) {
    var a = pool[index];
    var result = { points: a.points, x: a.x, y: a.y, size: a.size };

    pool.splice(index, 1);

    // Split into smaller asteroids
    if (a.size === 'large') {
      pool.push(createAsteroid(a.x, a.y, 'medium'));
      pool.push(createAsteroid(a.x, a.y, 'medium'));
    } else if (a.size === 'medium') {
      pool.push(createAsteroid(a.x, a.y, 'small'));
      pool.push(createAsteroid(a.x, a.y, 'small'));
    }
    // small asteroids just get destroyed

    return result;
  }

  function draw(ctx) {
    ctx.strokeStyle = Config.asteroidColor;
    ctx.lineWidth = 1.5;

    for (var i = 0; i < pool.length; i++) {
      var a = pool[i];
      var shape = a.shape;

      ctx.beginPath();
      for (var v = 0; v < shape.length; v++) {
        var vert = shape[v];
        var vx = a.x + Math.cos(vert.angle + a.angle) * vert.dist * a.radius;
        var vy = a.y + Math.sin(vert.angle + a.angle) * vert.dist * a.radius;
        if (v === 0) {
          ctx.moveTo(vx, vy);
        } else {
          ctx.lineTo(vx, vy);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  function checkCircle(cx, cy, cr) {
    for (var i = pool.length - 1; i >= 0; i--) {
      var a = pool[i];
      var dx = cx - a.x;
      var dy = cy - a.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < cr + a.radius * 0.8) {
        return i;
      }
    }
    return -1;
  }

  function checkPoint(px, py) {
    for (var i = pool.length - 1; i >= 0; i--) {
      var a = pool[i];
      var dx = px - a.x;
      var dy = py - a.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < a.radius * 0.9) {
        return i;
      }
    }
    return -1;
  }

  /** Push asteroids away from center to make respawn safe */
  function clearCenter(cx, cy, safeRadius) {
    for (var i = 0; i < pool.length; i++) {
      var a = pool[i];
      var dx = a.x - cx;
      var dy = a.y - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < safeRadius + a.radius) {
        // Push asteroid away from center
        if (dist < 1) { dx = 1; dy = 0; dist = 1; }
        var pushDist = safeRadius + a.radius + 20 - dist;
        a.x += (dx / dist) * pushDist;
        a.y += (dy / dist) * pushDist;
        // Also push velocity away
        a.vx += (dx / dist) * 30;
        a.vy += (dy / dist) * 30;
      }
    }
  }

  return {
    spawnWave: spawnWave,
    update: update,
    split: split,
    draw: draw,
    checkCircle: checkCircle,
    checkPoint: checkPoint,
    clearCenter: clearCenter,
    get count() { return pool.length; },
    get pool() { return pool; },
  };
})();
