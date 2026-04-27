/* Flappy Bird — Pipes module */

var Pipes = (function () {

  var pipes = [];      // array of { x, topH, scored }
  var spawnTimer = 0;

  function reset() {
    pipes = [];
    spawnTimer = 0;
  }

  /** Spawn a new pipe pair at the right edge */
  function spawnPipe() {
    var minTop = 60;
    var maxTop = Config.canvasH - Config.groundH - Config.pipeGap - 60;
    var topH = minTop + Math.random() * (maxTop - minTop);
    pipes.push({
      x: Config.canvasW + 10,
      topH: topH,
      scored: false,
    });
  }

  function update(dt) {
    // Move pipes left
    for (var i = pipes.length - 1; i >= 0; i--) {
      pipes[i].x -= Config.pipeSpeed * dt;

      // Remove off-screen pipes
      if (pipes[i].x + Config.pipeWidth < -10) {
        pipes.splice(i, 1);
      }
    }

    // Spawn timer
    spawnTimer += dt;
    if (spawnTimer >= Config.pipeSpawnInterval) {
      spawnTimer -= Config.pipeSpawnInterval;
      spawnPipe();
    }
  }

  /** Circle-rect collision helper */
  function circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
    // Find closest point on rect to circle center
    var closestX = clamp(cx, rx, rx + rw);
    var closestY = clamp(cy, ry, ry + rh);
    var dx = cx - closestX;
    var dy = cy - closestY;
    return (dx * dx + dy * dy) < (cr * cr);
  }

  function checkCollision(hitbox) {
    var cx = hitbox.x;
    var cy = hitbox.y;
    var cr = hitbox.r;

    // Pipe collision only — ground/ceiling handled by game.js
    for (var i = 0; i < pipes.length; i++) {
      var p = pipes[i];
      var px = p.x;
      var pw = Config.pipeWidth;
      var topH = p.topH;
      var bottomY = topH + Config.pipeGap;
      var bottomH = Config.canvasH - Config.groundH - bottomY;

      // Top pipe rect
      if (circleRectCollision(cx, cy, cr, px, 0, pw, topH)) {
        return true;
      }

      // Bottom pipe rect
      if (circleRectCollision(cx, cy, cr, px, bottomY, pw, bottomH)) {
        return true;
      }
    }

    return false;
  }

  function checkScore(birdX) {
    var count = 0;
    for (var i = 0; i < pipes.length; i++) {
      var p = pipes[i];
      if (!p.scored && p.x + Config.pipeWidth < birdX) {
        p.scored = true;
        count++;
      }
    }
    return count;
  }

  function draw(ctx) {
    for (var i = 0; i < pipes.length; i++) {
      var p = pipes[i];
      var px = p.x;
      var pw = Config.pipeWidth;
      var topH = p.topH;
      var bottomY = topH + Config.pipeGap;
      var bottomH = Config.canvasH - Config.groundH - bottomY;
      var capH = Config.pipeCapH;

      // --- Top pipe ---
      // Body
      ctx.fillStyle = Config.pipeColor;
      ctx.fillRect(px + 4, 0, pw - 8, topH - capH);

      // Cap (wider, at the bottom of top pipe)
      ctx.fillStyle = Config.pipeColor;
      ctx.fillRect(px, topH - capH, pw, capH);

      // Dark edge on body
      ctx.fillStyle = Config.pipeDark;
      ctx.fillRect(px + 4, 0, 4, topH - capH);

      // Dark edge on cap
      ctx.fillStyle = Config.pipeDark;
      ctx.fillRect(px, topH - capH, 4, capH);

      // Highlight on cap
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(px + pw - 8, topH - capH, 4, capH);

      // --- Bottom pipe ---
      // Body
      ctx.fillStyle = Config.pipeColor;
      ctx.fillRect(px + 4, bottomY + capH, pw - 8, bottomH - capH);

      // Cap (wider, at the top of bottom pipe)
      ctx.fillStyle = Config.pipeColor;
      ctx.fillRect(px, bottomY, pw, capH);

      // Dark edge on body
      ctx.fillStyle = Config.pipeDark;
      ctx.fillRect(px + 4, bottomY + capH, 4, bottomH - capH);

      // Dark edge on cap
      ctx.fillStyle = Config.pipeDark;
      ctx.fillRect(px, bottomY, 4, capH);

      // Highlight on cap
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(px + pw - 8, bottomY, 4, capH);
    }
  }

  return {
    reset: reset,
    update: update,
    checkCollision: checkCollision,
    checkScore: checkScore,
    draw: draw,
  };
})();
