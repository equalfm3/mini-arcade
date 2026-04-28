/* Gravity Well — Main game orchestrator

   Launch a satellite and use planetary gravity + thrust
   to achieve a stable orbit around the target planet.
   Click/drag to aim, release to launch. Space/tap to thrust.
*/

(function () {

  var currentLevel = 0;
  var levelData = null;
  var orbitTimer = 0;    // Time spent in target orbit zone
  var won = false;
  var winDelay = 0;

  // Aiming state
  var aiming = false;
  var aimAngle = 0;
  var aimPower = 0;
  var mouseX = 0, mouseY = 0;

  function loadLevel(n) {
    levelData = Config.levels[n];
    if (!levelData) {
      game.win('All levels complete!');
      return;
    }
    Satellite.reset(levelData.startPos, levelData.fuel);
    orbitTimer = 0;
    won = false;
    winDelay = 0;
    aiming = false;
    Shell.setStat('level', n + 1);
    Shell.setStat('fuel', levelData.fuel);
  }

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Click and drag to aim, release to launch. Space to thrust.',

    init: function (ctx) {
      Input.init();
      Input.actionBtn('THRUST');
      Renderer.init();

      // Mouse/touch aiming
      game.canvas.addEventListener('mousedown', function (e) {
        if (!game.is('playing') || Satellite.launched) return;
        aiming = true;
        var rect = game.canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) * (Config.canvasW / rect.width);
        mouseY = (e.clientY - rect.top) * (Config.canvasH / rect.height);
      });

      game.canvas.addEventListener('mousemove', function (e) {
        if (!aiming) return;
        var rect = game.canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) * (Config.canvasW / rect.width);
        mouseY = (e.clientY - rect.top) * (Config.canvasH / rect.height);
        updateAim();
      });

      game.canvas.addEventListener('mouseup', function (e) {
        if (!aiming) return;
        aiming = false;
        if (aimPower > 10) {
          Satellite.launch(aimAngle, aimPower);
          Audio8.play('whoosh');
        }
      });

      // Touch
      game.canvas.addEventListener('touchstart', function (e) {
        if (!game.is('playing') || Satellite.launched) return;
        aiming = true;
        var t = e.touches[0];
        var rect = game.canvas.getBoundingClientRect();
        mouseX = (t.clientX - rect.left) * (Config.canvasW / rect.width);
        mouseY = (t.clientY - rect.top) * (Config.canvasH / rect.height);
      });

      game.canvas.addEventListener('touchmove', function (e) {
        if (!aiming) return;
        e.preventDefault();
        var t = e.touches[0];
        var rect = game.canvas.getBoundingClientRect();
        mouseX = (t.clientX - rect.left) * (Config.canvasW / rect.width);
        mouseY = (t.clientY - rect.top) * (Config.canvasH / rect.height);
        updateAim();
      });

      game.canvas.addEventListener('touchend', function (e) {
        if (!aiming) return;
        aiming = false;
        if (aimPower > 10) {
          Satellite.launch(aimAngle, aimPower);
          Audio8.play('whoosh');
        }
      });
    },

    reset: function (ctx) {
      currentLevel = 0;
      loadLevel(currentLevel);
    },

    update: function (dt) {
      if (won) {
        winDelay += dt;
        if (winDelay > 1.2) {
          currentLevel++;
          if (currentLevel >= Config.levels.length) {
            game.win('All ' + Config.levels.length + ' levels complete!');
          } else {
            Shell.toast('Level ' + currentLevel + ' complete!');
            loadLevel(currentLevel);
          }
        }
        Input.endFrame();
        return;
      }

      // Update satellite
      if (Satellite.launched && Satellite.alive) {
        Satellite.update(dt, levelData.planets);
        Shell.setStat('fuel', Math.ceil(Satellite.fuel));

        // Check orbit
        var targetPlanet = levelData.planets[levelData.target.planet];
        var dist = Physics.distToOrbit(Satellite.x, Satellite.y,
                                        targetPlanet, levelData.target.orbitRadius);
        if (dist < Config.orbitTolerance) {
          orbitTimer += dt;
          if (orbitTimer >= Config.orbitTime) {
            won = true;
            winDelay = 0;
            Audio8.play('win');
          }
        } else {
          orbitTimer = Math.max(0, orbitTimer - dt * 0.5); // Decay slowly
        }

        // Death
        if (!Satellite.alive) {
          Audio8.play('hit');
          setTimeout(function () {
            loadLevel(currentLevel);
          }, 800);
        }
      }

      // Pause
      if (Input.pressed('Escape')) {
        Shell.showOverlay({
          title: 'Paused',
          btn: 'Resume',
          onAction: function () {
            var overlay = document.getElementById('overlay');
            if (overlay) { var rb = overlay.querySelector('.restart-btn'); if (rb) rb.remove(); }
            Shell.hideOverlay();
            game.play();
          }
        });
        var overlay = document.getElementById('overlay');
        if (overlay) {
          var existing = overlay.querySelector('.restart-btn');
          if (existing) existing.remove();
          var rb = document.createElement('button');
          rb.className = 'btn restart-btn';
          rb.textContent = 'Restart';
          rb.style.cssText = 'margin-top:8px;';
          rb.addEventListener('click', function (e) {
            e.stopPropagation();
            var o = document.getElementById('overlay');
            if (o) { var r = o.querySelector('.restart-btn'); if (r) r.remove(); }
            Shell.hideOverlay();
            game.restart();
          });
          overlay.appendChild(rb);
        }
        game.pause();
      }

      // R to retry level
      if (Input.pressed('KeyR')) {
        loadLevel(currentLevel);
      }

      Input.endFrame();
    },

    draw: function (ctx) {
      Renderer.drawBackground(ctx);

      // Draw planets
      for (var i = 0; i < levelData.planets.length; i++) {
        Planets.draw(ctx, levelData.planets[i], i);
      }

      // Draw target orbit
      var targetPlanet = levelData.planets[levelData.target.planet];
      var progress = orbitTimer / Config.orbitTime;
      Planets.drawOrbit(ctx, targetPlanet, levelData.target.orbitRadius, progress);

      // Draw satellite
      Renderer.drawSatellite(ctx);

      // Draw aim line
      if (aiming && !Satellite.launched) {
        Renderer.drawAimLine(ctx, Satellite.x, Satellite.y, aimAngle, aimPower);
      }

      // Fuel bar
      if (Satellite.launched) {
        var fuelPct = Satellite.fuel / levelData.fuel;
        ctx.fillStyle = '#333';
        ctx.fillRect(10, Config.canvasH - 16, 80, 8);
        ctx.fillStyle = fuelPct > 0.3 ? '#44ffdd' : '#ff4444';
        ctx.fillRect(10, Config.canvasH - 16, 80 * fuelPct, 8);
      }

      // Orbit progress text
      if (orbitTimer > 0 && !won) {
        ctx.fillStyle = Config.targetColor;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Orbiting... ' + Math.floor(progress * 100) + '%',
                     Config.canvasW / 2, 20);
      }
    },
  });

  function updateAim() {
    var dx = mouseX - Satellite.x;
    var dy = mouseY - Satellite.y;
    aimAngle = Math.atan2(dy, dx);
    aimPower = Math.min(Math.sqrt(dx * dx + dy * dy), Config.launchPower);
  }

  game.start();

})();
