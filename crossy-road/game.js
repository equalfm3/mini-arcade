/* Crossy Road — Main game logic

   Modules loaded before this file:
   - Config     (src/config.js)     — constants
   - Player     (src/player.js)     — grid-based hop movement
   - Lanes      (src/lanes.js)      — lane generation, obstacles, river riding
   - Renderer   (src/renderer.js)   — top-down drawing

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var best = loadHighScore('crossy-road');
  var particles = Particles.create();
  var cameraY = 0;
  var lastScore = 0;
  var deathType = '';  // 'car', 'water', 'eagle'

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Hop forward to score — avoid cars and water',

    init: function () {
      Input.init();
      Input.dpad();
      Shell.setStat('best', best);
      Renderer.init();
    },

    reset: function () {
      score = 0;
      lastScore = 0;
      cameraY = 0;
      deathType = '';
      Player.reset();
      Lanes.reset();
      particles.clear();
      Shell.setStat('score', 0);
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
      }

      if (!Player.alive) {
        Input.endFrame();
        return;
      }

      // --- Input: hop movement ---
      var hopped = false;
      if (Input.pressed('ArrowUp') || Input.dir === 'up') {
        hopped = Player.tryHop('up', Lanes);
      } else if (Input.pressed('ArrowDown') || Input.dir === 'down') {
        hopped = Player.tryHop('down', Lanes);
      } else if (Input.pressed('ArrowLeft') || Input.dir === 'left') {
        hopped = Player.tryHop('left', Lanes);
      } else if (Input.pressed('ArrowRight') || Input.dir === 'right') {
        hopped = Player.tryHop('right', Lanes);
      }

      if (hopped) {
        Audio8.play('move');
      }

      // --- Update ---
      Player.update(dt);

      // Camera follows player upward
      var targetCamY = Player.worldY - Config.canvasH * 0.6;
      if (targetCamY < cameraY) {
        cameraY += (targetCamY - cameraY) * Config.cameraSmooth * dt;
      }

      // Update lanes (move cars, logs, generate/recycle)
      var cameraRow = Math.floor(-cameraY / Config.cellSize);
      Lanes.update(dt, cameraRow);

      // --- River riding ---
      if (!Player.hopping) {
        var rideOffset = Lanes.checkRiverRiding(Player.worldX, Player.row, dt);
        if (rideOffset !== null) {
          Player.applyRiding(rideOffset);
          Player.resetLandingGrace();

          // Check if player drifted off screen
          if (Player.worldX < -Config.cellSize || Player.worldX > Config.canvasW + Config.cellSize) {
            deathType = 'water';
            Player.die();
            Audio8.play('drop');
            emitDeathParticles();
            endGame();
          }
        } else {
          // Check if on river but not on log = in water
          // Small grace period after landing to allow log to reach player
          var lane = Lanes.getLane(Player.row);
          if (lane && lane.type === Config.RIVER && !Player.hasLandingGrace()) {
            deathType = 'water';
            Player.die();
            Audio8.play('drop');
            particles.emit(Player.worldX, screenYForPlayer(), {
              count: 15,
              color: Config.waterSplash,
              speed: 80,
              life: 0.5,
              size: 3,
            });
            endGame();
          }
        }
      }

      // --- Car collision ---
      if (!Player.hopping && Player.alive) {
        if (Lanes.checkCarCollision(Player.worldX, Player.row)) {
          deathType = 'car';
          Player.die();
          Audio8.play('hit');
          emitDeathParticles();
          endGame();
        }
      }

      // --- Eagle death (idle timeout) ---
      if (!Player.alive && deathType === '') {
        deathType = 'eagle';
        Audio8.play('gameover');
        endGame();
      }

      // --- Scoring ---
      var newScore = Player.furthestRow;
      if (newScore > score) {
        score = newScore;
        Shell.setStat('score', score);
        if (score > lastScore) {
          if (score > best) {
            Audio8.play('score');
          }
          lastScore = score;
        }
      }

      // --- Off-screen death (fell behind camera) ---
      if (Player.alive) {
        var playerScreenY = Player.worldY - cameraY;
        if (playerScreenY > Config.canvasH + Config.cellSize * 2) {
          deathType = 'eagle';
          Player.die();
          Audio8.play('gameover');
          endGame();
        }
      }

      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w;
      var h = game.h;

      // Background
      ctx.fillStyle = Config.bgColor;
      ctx.fillRect(0, 0, w, h);

      // Lanes (grass, road, river with objects)
      Renderer.drawLanes(ctx, cameraY, w, h);

      // Player
      if (Player.alive) {
        Renderer.drawPlayer(
          ctx, Player.worldX, Player.worldY, cameraY,
          Player.hopTimer, Player.hopDir,
          Player.eagleActive, Player.eagleTimer, Player.alive
        );
      }

      // Eagle warning
      if (Player.eagleActive && Player.alive) {
        Renderer.drawEagle(ctx, Player.worldX, Player.worldY, cameraY, Player.eagleTimer, w);
      }

      // Particles
      particles.draw(ctx);
    },
  });

  function screenYForPlayer() {
    return Player.worldY - cameraY + Config.cellSize / 2;
  }

  function emitDeathParticles() {
    particles.emit(Player.worldX, screenYForPlayer(), {
      count: 20,
      colors: ['#ff4444', '#ffd700', '#e0e0e0'],
      speed: 120,
      life: 0.6,
      size: 3,
    });
  }

  function endGame() {
    if (saveHighScore('crossy-road', score)) {
      best = score;
      Shell.setStat('best', best);
    }
    Audio8.play('gameover');
    game.gameOver('Score: ' + score);
  }

  game.start();

})();
