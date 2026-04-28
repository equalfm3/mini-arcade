/* Asteroids — Main game logic

   Modules loaded before this file:
   - Config     (src/config.js)     — constants
   - Ship       (src/ship.js)       — player ship
   - Asteroids  (src/asteroids.js)  — asteroid field
   - Bullets    (src/bullets.js)    — bullet pool
   - Renderer   (src/renderer.js)   — background, HUD

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var lives = 0;
  var best = loadHighScore('asteroids');
  var wave = 0;
  var particles = Particles.create();
  var thrustSoundTimer = 0;
  var waveClearDelay = 0;  // brief pause between waves

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Arrows to fly, Space to shoot',

    init: function () {
      Input.init();
      Input.dpad();
      Input.actionBtn('FIRE');
      Shell.setStat('best', best);
      Renderer.initStars();
    },

    reset: function () {
      score = 0;
      wave = 0;
      lives = Config.lives;
      thrustSoundTimer = 0;
      waveClearDelay = 0;
      Ship.reset();
      Asteroids.spawnWave(wave);
      Bullets.reset();
      particles.clear();
      Shell.setStat('score', 0);
      Shell.setStat('lives', lives);
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
      }

      // --- Ship ---
      Ship.update(dt);

      // --- Thrust sound ---
      if (Input.held('ArrowUp') && Ship.alive) {
        thrustSoundTimer -= dt;
        if (thrustSoundTimer <= 0) {
          Audio8.play('move');
          thrustSoundTimer = 0.2;
        }
      } else {
        thrustSoundTimer = 0;
      }

      // --- Hyperspace ---
      if (Input.pressed('Shift') && Ship.alive && !Ship.invulnerable) {
        Ship.hyperspace();
        Audio8.play('whoosh');
        particles.emit(Ship.x, Ship.y, {
          count: 8,
          color: '#44aaff',
          speed: 100,
          life: 0.3,
          size: 2,
        });
      }

      // --- Shooting ---
      if (Ship.canShoot() && (Input.pressed(' ') || Input.tapped)) {
        var nose = Ship.getNose();
        if (Bullets.fire(nose.x, nose.y, Ship.angle)) {
          Ship.shoot();
          Audio8.play('click');
        }
      }

      // --- Asteroids ---
      Asteroids.update(dt);

      // --- Bullets ---
      Bullets.update(dt);

      // --- Bullet → asteroid collision ---
      var hits = Bullets.checkAsteroids();
      // Process hits from highest index first to avoid index shifting
      hits.sort(function (a, b) { return b - a; });
      for (var h = 0; h < hits.length; h++) {
        var result = Asteroids.split(hits[h]);
        score += result.points;
        Shell.setStat('score', score);
        Audio8.play('hit');

        // Explosion particles
        var pColor = result.size === 'large' ? '#aaaaaa' : result.size === 'medium' ? '#cccccc' : '#ffffff';
        particles.emit(result.x, result.y, {
          count: result.size === 'large' ? 16 : result.size === 'medium' ? 10 : 6,
          color: pColor,
          speed: 80,
          life: 0.5,
          size: 2,
        });
      }

      // --- Ship → asteroid collision ---
      if (Ship.alive && !Ship.invulnerable) {
        var shipHit = Asteroids.checkCircle(Ship.x, Ship.y, Ship.radius * 0.6);
        if (shipHit >= 0) {
          playerHit();
          if (lives <= 0) {
            Input.endFrame();
            return;
          }
        }
      }

      // --- Wave clear ---
      if (Asteroids.count === 0 && waveClearDelay <= 0) {
        waveClearDelay = 2.0; // 2 second pause before next wave
        Audio8.play('score');
        Shell.toast('Wave ' + (wave + 2) + ' incoming!');
      }

      if (waveClearDelay > 0) {
        waveClearDelay -= dt;
        if (waveClearDelay <= 0 && Asteroids.count === 0) {
          wave++;
          Asteroids.spawnWave(wave);
          Asteroids.clearCenter(Config.canvasW / 2, Config.canvasH / 2, 80);
          Bullets.reset();
        }
      }

      // --- Particles ---
      particles.update(dt);

      Input.endFrame();
    },

    draw: function (ctx) {
      Renderer.drawBackground(ctx);
      Asteroids.draw(ctx);
      Bullets.draw(ctx);
      Ship.draw(ctx);
      particles.draw(ctx);
      Renderer.drawLives(ctx, lives);
      Renderer.drawWave(ctx, wave);
    },
  });

  function playerHit() {
    lives--;
    Shell.setStat('lives', lives);
    Audio8.play('gameover');

    // Explosion at ship position
    particles.emit(Ship.x, Ship.y, {
      count: 24,
      colors: ['#ffffff', '#ff6600', '#ff4444'],
      speed: 120,
      life: 0.7,
      size: 2,
    });

    if (lives <= 0) {
      Ship.die();
      if (saveHighScore('asteroids', score)) {
        best = score;
        Shell.setStat('best', best);
      }
      game.gameOver('Score: ' + score);
      return;
    }

    Ship.respawn();
    Bullets.reset();
    // Push asteroids away from center so respawn is safe
    Asteroids.clearCenter(Config.canvasW / 2, Config.canvasH / 2, 80);
  }

  game.start();

})();
