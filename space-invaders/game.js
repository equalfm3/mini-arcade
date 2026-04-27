/* Space Invaders — Main game logic

   Modules loaded before this file:
   - Config    (src/config.js)    — constants
   - Player    (src/player.js)    — player ship
   - Enemies   (src/enemies.js)   — enemy formation
   - Bullets   (src/bullets.js)   — bullet pool + collision
   - Renderer  (src/renderer.js)  — pixel art sprites

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var lives = 0;
  var best = loadHighScore('space-invaders');
  var wave = 0;
  var particles = Particles.create();
  var shootChance = 0;

  // --- Engine setup ---
  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Arrow keys to move, Space to shoot',

    init: function () {
      Input.init();
      Input.dpad();
      Input.actionBtn('FIRE');
      Shell.setStat('best', best);
    },

    reset: function () {
      score = 0;
      wave = 0;
      lives = Config.lives;
      shootChance = Config.enemyShootChance;
      Player.reset();
      Enemies.reset(wave);
      Bullets.reset();
      particles.clear();
      Shell.setStat('score', 0);
      Shell.setStat('lives', lives);
    },

    update: function (dt) {
      // --- Input ---
      if (Input.pressed('Escape') || Input.pressed('p')) game.togglePause();

      // --- Player ---
      Player.update(dt);

      // --- Player shooting ---
      if (Player.canShoot() && (Input.pressed(' ') || Input.tapped)) {
        if (Bullets.firePlayer(Player.getCenterX(), Player.getTopY())) {
          Player.shoot();
          Audio8.play('move');
        }
      }

      // --- Enemies ---
      Enemies.update(dt);

      // --- Enemy shooting ---
      var shooters = Enemies.getShooters();
      var currentShootChance = shootChance + wave * Config.waveShootBonus;
      for (var s = 0; s < shooters.length; s++) {
        if (Math.random() < currentShootChance) {
          Bullets.fireEnemy(shooters[s].cx, shooters[s].cy);
        }
      }

      // --- Bullets ---
      Bullets.update(dt);

      // --- Player bullet → enemy collision ---
      var hits = Bullets.checkPlayerHits();
      for (var h = 0; h < hits.length; h++) {
        var hit = hits[h];
        var killed = Enemies.kill(hit.row, hit.col);
        if (killed) {
          score += killed.points;
          Shell.setStat('score', score);
          Audio8.play('hit');

          // Particles at enemy center
          particles.emit(hit.rect.x + hit.rect.w / 2, hit.rect.y + hit.rect.h / 2, {
            count: 10,
            color: killed.color,
            speed: 80,
            life: 0.4,
            size: 3,
          });
        }
      }

      // --- Enemy bullet → player collision ---
      if (Player.alive && !Player.respawning) {
        if (Bullets.checkEnemyHits(Player.getRect())) {
          playerHit();
          if (lives <= 0) return;
        }
      }

      // --- Enemies reached bottom ---
      if (Enemies.reachedBottom()) {
        playerHit();
        if (lives <= 0) return;
      }

      // --- Wave clear ---
      if (Enemies.aliveCount <= 0) {
        wave++;
        Audio8.play('score');
        Shell.toast('Wave ' + (wave + 1) + '!');
        Enemies.reset(wave);
        Bullets.reset();
      }

      // --- Particles ---
      particles.update(dt);

      Input.endFrame();
    },

    draw: function (ctx) {
      Renderer.drawBackground(ctx);
      Renderer.drawEnemies(ctx);
      Bullets.drawPlayerBullets(ctx);
      Bullets.drawEnemyBullets(ctx);
      Renderer.drawPlayer(ctx);
      particles.draw(ctx);
      Renderer.drawLives(ctx, lives);
      Renderer.drawWaveText(ctx, wave);
    },
  });

  function playerHit() {
    lives--;
    Shell.setStat('lives', lives);
    Audio8.play('error');

    // Explosion particles at player position
    particles.emit(Player.getCenterX(), Player.y + Player.height / 2, {
      count: 20,
      colors: [Config.playerColor, '#ffffff', '#ff4444'],
      speed: 120,
      life: 0.6,
    });

    if (lives <= 0) {
      Audio8.play('gameover');
      Player.die();
      if (saveHighScore('space-invaders', score)) {
        best = score;
        Shell.setStat('best', best);
      }
      game.gameOver('Score: ' + score);
      return;
    }

    Player.respawn();
    Bullets.reset();
  }

  game.start();

})();
