/* Space Invaders — Bullets module */

var Bullets = (function () {

  var playerBullets = [];
  var enemyBullets = [];

  function reset() {
    playerBullets = [];
    enemyBullets = [];
  }

  function firePlayer(x, y) {
    if (playerBullets.length >= Config.maxPlayerBullets) return false;
    playerBullets.push({
      x: x - Config.bulletW / 2,
      y: y - Config.bulletH,
      w: Config.bulletW,
      h: Config.bulletH,
    });
    return true;
  }

  function fireEnemy(x, y) {
    if (enemyBullets.length >= Config.maxEnemyBullets) return false;
    enemyBullets.push({
      x: x - Config.bulletW / 2,
      y: y,
      w: Config.bulletW,
      h: Config.bulletH,
    });
    return true;
  }

  function update(dt) {
    // Move player bullets upward
    for (var i = playerBullets.length - 1; i >= 0; i--) {
      playerBullets[i].y -= Config.playerBulletSpeed * dt;
      if (playerBullets[i].y + playerBullets[i].h < 0) {
        playerBullets.splice(i, 1);
      }
    }

    // Move enemy bullets downward
    for (var j = enemyBullets.length - 1; j >= 0; j--) {
      enemyBullets[j].y += Config.enemyBulletSpeed * dt;
      if (enemyBullets[j].y > Config.canvasH) {
        enemyBullets.splice(j, 1);
      }
    }
  }

  // Check player bullets against enemies — returns array of hits
  function checkPlayerHits() {
    var hits = [];
    for (var i = playerBullets.length - 1; i >= 0; i--) {
      var bullet = playerBullets[i];
      var hit = false;

      Enemies.forEach(function (enemy, rect, row, col) {
        if (hit) return;
        if (collides(bullet, rect)) {
          hit = true;
          hits.push({ row: row, col: col, enemy: enemy, rect: rect });
          playerBullets.splice(i, 1);
        }
      });
    }
    return hits;
  }

  // Check enemy bullets against player — returns true if hit
  function checkEnemyHits(playerRect) {
    for (var i = enemyBullets.length - 1; i >= 0; i--) {
      if (collides(enemyBullets[i], playerRect)) {
        enemyBullets.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  function drawPlayerBullets(ctx) {
    ctx.fillStyle = Config.playerBulletColor;
    for (var i = 0; i < playerBullets.length; i++) {
      var b = playerBullets[i];
      ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.w, b.h);
    }
  }

  function drawEnemyBullets(ctx) {
    ctx.fillStyle = Config.enemyBulletColor;
    for (var i = 0; i < enemyBullets.length; i++) {
      var b = enemyBullets[i];
      ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.w, b.h);
    }
  }

  return {
    reset: reset,
    firePlayer: firePlayer,
    fireEnemy: fireEnemy,
    update: update,
    checkPlayerHits: checkPlayerHits,
    checkEnemyHits: checkEnemyHits,
    drawPlayerBullets: drawPlayerBullets,
    drawEnemyBullets: drawEnemyBullets,
    get playerCount() { return playerBullets.length; },
    get enemyCount() { return enemyBullets.length; },
  };
})();
