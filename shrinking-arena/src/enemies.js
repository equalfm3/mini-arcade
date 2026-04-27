/* Shrinking Arena — Enemies Module */

var Enemies = (function () {

  var list = [];

  function createEnemy(index) {
    var angle = (Math.PI * 2 * index) / Config.enemyCount;
    var dist = 40 + Math.random() * 80;
    var aggressive = index < Math.floor(Config.enemyCount * Config.aggressiveRatio);
    var speed = Config.enemySpeed + (Math.random() - 0.5) * 2 * Config.enemySpeedVariance;
    var dirAngle = Math.random() * Math.PI * 2;

    return {
      x: Config.centerX + Math.cos(angle) * dist,
      y: Config.centerY + Math.sin(angle) * dist,
      vx: 0,
      vy: 0,
      pushVx: 0,
      pushVy: 0,
      speed: speed,
      dirAngle: dirAngle,
      dirTimer: Config.enemyDirChangeMin + Math.random() * (Config.enemyDirChangeMax - Config.enemyDirChangeMin),
      alive: true,
      aggressive: aggressive,
      color: Config.enemyColors[index % Config.enemyColors.length],
      radius: Config.enemyRadius,
      trail: [],
    };
  }

  function reset() {
    list = [];
    for (var i = 0; i < Config.enemyCount; i++) {
      list.push(createEnemy(i));
    }
  }

  function update(dt, arenaRadius, playerX, playerY, playerVx, playerVy) {
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (!e.alive) continue;

      // Direction change timer
      e.dirTimer -= dt;
      if (e.dirTimer <= 0) {
        e.dirAngle = Math.random() * Math.PI * 2;
        e.dirTimer = Config.enemyDirChangeMin + Math.random() * (Config.enemyDirChangeMax - Config.enemyDirChangeMin);
      }

      // Base wander velocity
      var wx = Math.cos(e.dirAngle) * e.speed;
      var wy = Math.sin(e.dirAngle) * e.speed;

      // Steer toward center if near boundary
      var dx = e.x - Config.centerX;
      var dy = e.y - Config.centerY;
      var distFromCenter = Math.sqrt(dx * dx + dy * dy);
      var distFromEdge = arenaRadius - distFromCenter;

      if (distFromEdge < Config.enemyBoundaryAvoidDist && distFromCenter > 0) {
        var avoidStr = Config.enemyBoundaryAvoidForce * (1 - distFromEdge / Config.enemyBoundaryAvoidDist);
        wx -= (dx / distFromCenter) * e.speed * avoidStr;
        wy -= (dy / distFromCenter) * e.speed * avoidStr;
      }

      // Avoid player if nearby and player is moving toward them
      var pdx = e.x - playerX;
      var pdy = e.y - playerY;
      var pDist = Math.sqrt(pdx * pdx + pdy * pdy);

      if (pDist < Config.enemyPlayerAvoidDist && pDist > 0) {
        // Check if player is moving toward this enemy
        var dotProduct = playerVx * (-pdx / pDist) + playerVy * (-pdy / pDist);
        if (dotProduct > 0) {
          var avoidF = Config.enemyPlayerAvoidForce * (1 - pDist / Config.enemyPlayerAvoidDist);
          wx += (pdx / pDist) * e.speed * avoidF;
          wy += (pdy / pDist) * e.speed * avoidF;
        }
      }

      // Aggressive enemies: move toward player
      if (e.aggressive && pDist < Config.enemyAggressiveDist && pDist > 0) {
        wx -= (pdx / pDist) * e.speed * Config.enemyAggressiveForce;
        wy -= (pdy / pDist) * e.speed * Config.enemyAggressiveForce;
      }

      e.vx = wx;
      e.vy = wy;

      // Apply push velocity
      e.pushVx *= Math.max(0, 1 - Config.pushFriction * dt);
      e.pushVy *= Math.max(0, 1 - Config.pushFriction * dt);

      e.x += (e.vx + e.pushVx) * dt;
      e.y += (e.vy + e.pushVy) * dt;

      // Trail
      e.trail.unshift({ x: e.x, y: e.y });
      if (e.trail.length > Config.enemyTrailLength) {
        e.trail.length = Config.enemyTrailLength;
      }
    }
  }

  function aliveCount() {
    var count = 0;
    for (var i = 0; i < list.length; i++) {
      if (list[i].alive) count++;
    }
    return count;
  }

  reset();

  return {
    reset: reset,
    update: update,
    aliveCount: aliveCount,
    get list() { return list; },
  };
})();
