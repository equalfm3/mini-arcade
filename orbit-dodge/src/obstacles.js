/* Orbit Dodge — Obstacles
   Projectiles fly through both orbit rings.
   Arc obstacles sweep along ONE specific orbit ring.
   Stars appear on either orbit for bonus points.
   
   Key rule: max 1 arc per orbit ring at a time.
   This ensures the player can always escape by hopping to the other ring.
*/

var Obstacles = (function () {

  var projectiles = [];
  var arcs = [];          // { angle, speed, width, direction, orbitIndex }
  var stars = [];

  var spawnTimer = 0;
  var starTimer = 0;
  var elapsed = 0;
  var currentSpawnInterval = 0;
  var speedMultiplier = 1;

  function reset() {
    projectiles = [];
    arcs = [];
    stars = [];
    spawnTimer = Config.spawnInterval * 0.6;
    starTimer = Config.starSpawnInterval * 0.5;
    elapsed = 0;
    currentSpawnInterval = Config.spawnInterval;
    speedMultiplier = 1;
  }

  function spawnProjectile() {
    var spawnAngle = Math.random() * Math.PI * 2;
    var spawnDist = Config.orbits[1] + 100 + Math.random() * 60;

    var sx = Config.centerX + Math.cos(spawnAngle) * spawnDist;
    var sy = Config.centerY + Math.sin(spawnAngle) * spawnDist;

    var targetOffset = (Math.random() - 0.5) * 0.6;
    var targetAngle = spawnAngle + Math.PI + targetOffset;
    var tx = Config.centerX + Math.cos(targetAngle) * Config.orbits[0] * 0.3;
    var ty = Config.centerY + Math.sin(targetAngle) * Config.orbits[0] * 0.3;

    var dx = tx - sx;
    var dy = ty - sy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var speed = Config.projectileSpeed * speedMultiplier;

    projectiles.push({
      x: sx, y: sy,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      radius: Config.projectileRadius,
    });
  }

  /** Count active arcs on a specific orbit */
  function arcCountOnOrbit(idx) {
    var count = 0;
    for (var i = 0; i < arcs.length; i++) {
      if (arcs[i].orbitIndex === idx) count++;
    }
    return count;
  }

  function spawnArc() {
    // Pick which orbit to put the arc on
    // Prefer the orbit the player is currently on (to force a hop)
    var targetOrbit = Player.orbitIndex;
    
    // But respect the max arcs per orbit rule
    if (arcCountOnOrbit(targetOrbit) >= Config.maxArcsPerOrbit) {
      // Try the other orbit
      targetOrbit = 1 - targetOrbit;
      if (arcCountOnOrbit(targetOrbit) >= Config.maxArcsPerOrbit) {
        return; // both orbits full, skip this spawn
      }
    }

    var startAngle = Math.random() * Math.PI * 2;
    // Random direction — player can dodge by hopping orbits
    var dir = Math.random() < 0.5 ? 1 : -1;
    var speed = Config.arcSpeed * (0.7 + Math.random() * 0.3) * Math.min(speedMultiplier, 2.5);

    arcs.push({
      angle: startAngle,
      speed: speed,
      width: Config.arcWidth,
      direction: dir,
      orbitIndex: targetOrbit,
      age: 0,
      maxAge: (Math.PI * 2) / speed + 2,
    });
  }

  function spawnStar() {
    var starOrbit = Math.floor(Math.random() * Config.orbitCount);
    var starAngle = Math.random() * Math.PI * 2;
    var r = Config.orbits[starOrbit];
    stars.push({
      angle: starAngle,
      orbitIndex: starOrbit,
      x: Config.centerX + Math.cos(starAngle) * r,
      y: Config.centerY + Math.sin(starAngle) * r,
      age: 0,
      maxAge: Config.starLifetime,
    });
  }

  function update(dt) {
    elapsed += dt;

    currentSpawnInterval = Math.max(
      Config.spawnIntervalMin,
      Config.spawnInterval - elapsed * Config.spawnRampRate
    );
    speedMultiplier = 1 + elapsed * Config.speedRampRate;

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnTimer = currentSpawnInterval;
      var arcChance = Math.min(Config.arcChance + elapsed * 0.004, Config.arcChanceMax);
      if (Math.random() < arcChance) {
        spawnArc();
      } else {
        spawnProjectile();
      }
    }

    starTimer -= dt;
    if (starTimer <= 0) {
      starTimer = Config.starSpawnInterval;
      spawnStar();
    }

    // Update projectiles
    for (var i = projectiles.length - 1; i >= 0; i--) {
      var p = projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      var dx = p.x - Config.centerX;
      var dy = p.y - Config.centerY;
      if (dx * dx + dy * dy > 360000) {
        projectiles.splice(i, 1);
      }
    }

    // Update arcs
    for (var j = arcs.length - 1; j >= 0; j--) {
      var a = arcs[j];
      a.angle += a.speed * a.direction * dt;
      if (a.angle > Math.PI * 2) a.angle -= Math.PI * 2;
      if (a.angle < 0) a.angle += Math.PI * 2;
      a.age += dt;
      if (a.age > a.maxAge) {
        arcs.splice(j, 1);
      }
    }

    // Update stars
    for (var k = stars.length - 1; k >= 0; k--) {
      stars[k].age += dt;
      if (stars[k].age >= stars[k].maxAge) {
        stars.splice(k, 1);
      }
    }
  }

  /** Check collision. Now considers player's orbit ring for arcs. */
  function checkCollision(playerX, playerY, playerAngle, playerOrbitIndex, playerRadius) {
    var hitDist = Config.hitDistance;
    var starDist = Config.starPickupDistance;

    // Check projectiles (hit on any orbit)
    for (var i = 0; i < projectiles.length; i++) {
      var p = projectiles[i];
      var dx = p.x - playerX;
      var dy = p.y - playerY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hitDist + p.radius) {
        return { type: 'hit', x: p.x, y: p.y };
      }
    }

    // Check arcs — only arcs on the SAME orbit ring as the player
    for (var j = 0; j < arcs.length; j++) {
      var a = arcs[j];
      if (a.orbitIndex !== playerOrbitIndex) continue; // different ring, safe
      
      var angleDiff = normalizeAngle(playerAngle - a.angle);
      if (angleDiff < a.width / 2 || angleDiff > Math.PI * 2 - a.width / 2) {
        return { type: 'hit', x: playerX, y: playerY };
      }
    }

    // Check stars — only on same orbit
    for (var k = stars.length - 1; k >= 0; k--) {
      var s = stars[k];
      if (s.orbitIndex !== playerOrbitIndex) continue;
      var sdx = s.x - playerX;
      var sdy = s.y - playerY;
      if (Math.sqrt(sdx * sdx + sdy * sdy) < starDist) {
        var result = { type: 'star', x: s.x, y: s.y };
        stars.splice(k, 1);
        return result;
      }
    }

    return null;
  }

  function normalizeAngle(a) {
    a = a % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    return a;
  }

  return {
    reset: reset,
    update: update,
    checkCollision: checkCollision,
    get projectiles() { return projectiles; },
    get arcs() { return arcs; },
    get stars() { return stars; },
  };
})();
