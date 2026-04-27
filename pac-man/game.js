/* Pac-Man — Main Game Logic

   Modules loaded before this file:
   - Config    (src/config.js)    — constants
   - Maze      (src/maze.js)      — maze layout + BFS pathfinding
   - Pellets   (src/pellets.js)   — pellet state + rendering
   - Player    (src/player.js)    — Pac-Man movement + animation
   - Ghosts    (src/ghosts.js)    — 4 ghost AI + rendering
   - Renderer  (src/renderer.js)  — maze walls + HUD drawing

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var lives = 0;
  var level = 1;
  var best = loadHighScore('pac-man');
  var particles = Particles.create();
  var readyTimer = 0;
  var deathPause = 0;
  var levelClearTimer = 0;
  var scorePopups = [];

  // --- Engine setup ---
  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Arrow keys to move, eat all pellets!',

    init: function () {
      Input.init();
      Input.dpad();
      Shell.setStat('best', best);
    },

    reset: function () {
      score = 0;
      level = 1;
      lives = Config.startLives;
      particles.clear();
      scorePopups = [];
      Shell.setStat('score', 0);
      Shell.setStat('lives', lives);
      resetLevel();
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p') || Input.pressed('P')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // --- Ready countdown ---
      if (readyTimer > 0) {
        readyTimer -= dt;
        Input.endFrame();
        return;
      }

      // --- Death pause ---
      if (deathPause > 0) {
        deathPause -= dt;
        Player.update(dt); // death animation
        if (deathPause <= 0) {
          if (lives <= 0) {
            Audio8.play('gameover');
            if (saveHighScore('pac-man', score)) {
              best = score;
              Shell.setStat('best', best);
            }
            game.gameOver('Score: ' + score);
            Input.endFrame();
            return;
          }
          // Respawn
          resetPositions();
          readyTimer = 1.5;
        }
        Input.endFrame();
        return;
      }

      // --- Level clear ---
      if (levelClearTimer > 0) {
        levelClearTimer -= dt;
        if (levelClearTimer <= 0) {
          level++;
          resetLevel();
          readyTimer = 1.5;
        }
        Input.endFrame();
        return;
      }

      // --- Input ---
      if (Input.pressed('ArrowUp') || Input.dir === 'up') Player.setDirection('up');
      if (Input.pressed('ArrowDown') || Input.dir === 'down') Player.setDirection('down');
      if (Input.pressed('ArrowLeft') || Input.dir === 'left') Player.setDirection('left');
      if (Input.pressed('ArrowRight') || Input.dir === 'right') Player.setDirection('right');

      // --- Update player ---
      Player.update(dt);

      // --- Eat pellets ---
      var pelletScore = Pellets.eat(Player.col, Player.row);
      if (pelletScore > 0) {
        score += pelletScore;
        Shell.setStat('score', score);

        if (pelletScore === Config.powerPelletScore) {
          // Power pellet — frighten ghosts
          Audio8.play('score');
          Ghosts.startFrightened();
        } else {
          Audio8.play('move');
        }

        // Check level clear
        if (Pellets.allEaten()) {
          Audio8.play('win');
          levelClearTimer = 2.0;
          Input.endFrame();
          return;
        }
      }

      // --- Update pellets (blink animation) ---
      Pellets.update(dt);

      // --- Update ghosts ---
      Ghosts.update(dt);

      // --- Ghost collision ---
      var hitGhost = Ghosts.checkCollision(Player.col, Player.row, Player.px, Player.py);
      if (hitGhost >= 0) {
        var ghost = Ghosts.list[hitGhost];
        if (ghost.mode === 'frightened') {
          // Eat ghost
          var ghostScore = Ghosts.eatGhost(hitGhost);
          score += ghostScore;
          Shell.setStat('score', score);
          Audio8.play('hit');

          // Score popup
          scorePopups.push({
            x: ghost.px,
            y: ghost.py,
            text: '' + ghostScore,
            timer: 1.0,
          });

          particles.emit(ghost.px, ghost.py, {
            count: 8,
            color: Config.frightenedColor,
            speed: 60,
            life: 0.4,
            size: 2,
          });
        } else if (ghost.mode !== 'eaten') {
          // Pac-Man dies
          Audio8.play('gameover');
          lives--;
          Shell.setStat('lives', lives);
          Player.die();
          deathPause = 1.5;
        }
      }

      // --- Update particles ---
      particles.update(dt);

      // --- Update score popups ---
      for (var i = scorePopups.length - 1; i >= 0; i--) {
        scorePopups[i].timer -= dt;
        if (scorePopups[i].timer <= 0) {
          scorePopups.splice(i, 1);
        }
      }

      Input.endFrame();
    },

    draw: function (ctx) {
      // Clear
      ctx.fillStyle = Config.bgColor;
      ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

      // Maze walls
      Renderer.drawMaze(ctx);

      // Pellets
      Pellets.draw(ctx);

      // Ghosts
      Ghosts.draw(ctx);

      // Player
      if (deathPause > 0 || readyTimer <= 0) {
        Player.draw(ctx);
      }

      // Particles
      particles.draw(ctx);

      // Score popups
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      for (var i = 0; i < scorePopups.length; i++) {
        var pop = scorePopups[i];
        var alpha = Math.min(1, pop.timer * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
        ctx.fillText(pop.text, pop.x, pop.y - (1 - pop.timer) * 15);
      }
      ctx.textAlign = 'left';

      // Ready text
      if (readyTimer > 0) {
        Renderer.drawReady(ctx);
      }

      // Lives + level
      Renderer.drawLives(ctx, lives);
      Renderer.drawLevel(ctx, level);
    },
  });

  function resetLevel() {
    Maze.reset();
    Pellets.reset();
    resetPositions();
  }

  function resetPositions() {
    Player.reset(level - 1);
    Ghosts.reset(level - 1);
    particles.clear();
    scorePopups = [];
    readyTimer = 2.0;
  }

  game.start();

})();
