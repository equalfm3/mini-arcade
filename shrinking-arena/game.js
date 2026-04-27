/* Shrinking Arena — Main game logic

   Modules loaded before this file:
   - Config       (src/config.js)       — arena, player, enemy, collision constants
   - Player       (src/player.js)       — player movement, push physics
   - Enemies      (src/enemies.js)      — AI enemy dots with wander/avoid/aggressive behavior
   - Arena        (src/arena.js)        — circular shrinking boundary, elimination checks
   - Renderer     (src/renderer.js)     — background, arena ring, dots, trails, effects

   Controls:
   - WASD / Arrow keys / D-pad: move player dot
   - Esc / P: pause
*/

(function () {

  var wins = 0;
  var particles = Particles.create();
  var roundActive = false;

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'WASD or arrows to move. Push enemies out!',

    init: function () {
      Input.init();
      Input.dpad();
      Shell.setStat('wins', wins);
    },

    reset: function () {
      particles.clear();
      Player.reset();
      Enemies.reset();
      Arena.reset();
      Renderer.reset();
      roundActive = true;
      updateAliveHUD();
    },

    update: function (dt) {
      if (Input.pressed('Escape') || Input.pressed('p') || Input.pressed('P')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      if (!roundActive) {
        Input.endFrame();
        return;
      }

      // --- Update arena ---
      Arena.update(dt);

      // --- Update player ---
      Player.update(dt);

      // Constrain player inside arena
      var pc = Arena.constrain(Player.x, Player.y, Player.radius);
      if (pc) {
        Player.x = pc.x;
        Player.y = pc.y;
      }

      // --- Update enemies ---
      Enemies.update(dt, Arena.radius, Player.x, Player.y, Player.vx, Player.vy);

      // --- Collisions: player vs enemies ---
      var enemies = Enemies.list;
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!e.alive) continue;

        // Player-enemy collision
        if (Player.alive) {
          var dx = Player.x - e.x;
          var dy = Player.y - e.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var minDist = Player.radius + e.radius;

          if (dist < minDist && dist > 0) {
            // Elastic push — both get pushed apart
            var nx = dx / dist;
            var ny = dy / dist;
            var overlap = minDist - dist;

            // Separate
            Player.x += nx * overlap * 0.5;
            Player.y += ny * overlap * 0.5;
            e.x -= nx * overlap * 0.5;
            e.y -= ny * overlap * 0.5;

            // Push velocities
            Player.applyPush(nx * Config.pushForce, ny * Config.pushForce);
            e.pushVx -= nx * Config.pushForce;
            e.pushVy -= ny * Config.pushForce;

            Audio8.play('hit');
          }
        }

        // Enemy-enemy collisions
        for (var j = i + 1; j < enemies.length; j++) {
          var e2 = enemies[j];
          if (!e2.alive) continue;

          var edx = e.x - e2.x;
          var edy = e.y - e2.y;
          var eDist = Math.sqrt(edx * edx + edy * edy);
          var eMinDist = e.radius + e2.radius;

          if (eDist < eMinDist && eDist > 0) {
            var enx = edx / eDist;
            var eny = edy / eDist;
            var eOverlap = eMinDist - eDist;

            e.x += enx * eOverlap * 0.5;
            e.y += eny * eOverlap * 0.5;
            e2.x -= enx * eOverlap * 0.5;
            e2.y -= eny * eOverlap * 0.5;

            var pushHalf = Config.pushForce * 0.5;
            e.pushVx += enx * pushHalf;
            e.pushVy += eny * pushHalf;
            e2.pushVx -= enx * pushHalf;
            e2.pushVy -= eny * pushHalf;
          }
        }
      }

      // --- Boundary elimination ---
      // Check enemies
      var eliminated = false;
      for (var k = 0; k < enemies.length; k++) {
        var en = enemies[k];
        if (!en.alive) continue;

        if (Arena.isOutside(en.x, en.y)) {
          en.alive = false;
          eliminated = true;
          Audio8.play('score');
          particles.emit(en.x, en.y, {
            count: Config.eliminationParticles,
            colors: [en.color, '#ffffff', '#ffdd44'],
            speed: Config.eliminationSpeed,
            life: Config.eliminationLife,
            size: Config.eliminationSize,
          });
        }
      }

      if (eliminated) {
        updateAliveHUD();
      }

      // Check player
      if (Player.alive && Arena.isOutside(Player.x, Player.y)) {
        Player.eliminate();
        Audio8.play('hit');
        Audio8.play('gameover');
        Renderer.triggerFlash();
        particles.emit(Player.x, Player.y, {
          count: 20,
          colors: [Config.playerColor, '#ffffff', '#88ccff'],
          speed: 150,
          life: 0.8,
          size: 3,
        });
        roundActive = false;
        game.gameOver('Eliminated! Wins: ' + wins);
        Input.endFrame();
        return;
      }

      // --- Sudden death: push everyone toward center ---
      if (Arena.isSuddenDeath()) {
        for (var sd = 0; sd < enemies.length; sd++) {
          var se = enemies[sd];
          if (!se.alive) continue;
          var sdx = Config.centerX - se.x;
          var sdy = Config.centerY - se.y;
          var sDist = Math.sqrt(sdx * sdx + sdy * sdy);
          if (sDist > 0) {
            se.pushVx += (sdx / sDist) * Config.suddenDeathPushForce * dt;
            se.pushVy += (sdy / sDist) * Config.suddenDeathPushForce * dt;
          }
        }
      }

      // --- Win condition ---
      if (Player.alive && Enemies.aliveCount() === 0) {
        roundActive = false;
        wins++;
        Shell.setStat('wins', wins);
        Audio8.play('win');
        Shell.toast('You win!');
        game.win('Wins: ' + wins);
        Input.endFrame();
        return;
      }

      // --- Effects ---
      Renderer.updateEffects(dt);
      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w;
      var h = game.h;

      Renderer.drawBackground(ctx, w, h);
      Renderer.drawArena(ctx, Arena.radius, Arena.pulseIntensity(), Arena.warning);
      Renderer.drawEnemies(ctx, Enemies.list);
      Renderer.drawPlayer(ctx, Player);
      particles.draw(ctx);
      Renderer.drawAliveCount(ctx, w, Enemies.aliveCount() + (Player.alive ? 1 : 0));
      Renderer.drawScreenFlash(ctx, w, h);
    },
  });

  function updateAliveHUD() {
    var total = Enemies.aliveCount() + (Player.alive ? 1 : 0);
    Shell.setStat('alive', total);
  }

  game.start();

})();
