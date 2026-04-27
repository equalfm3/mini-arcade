/* Tetris — Main game logic

   Modules loaded before this file:
   - Config    (src/config.js)    — constants
   - Pieces    (src/pieces.js)    — piece data & 7-bag randomizer
   - Board     (src/board.js)     — playfield grid & logic
   - Renderer  (src/renderer.js)  — drawing functions

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var lines = 0;
  var level = 1;
  var best = loadHighScore('tetris');

  var currentPiece = null;
  var nextPiece = null;

  var dropTimer = 0;
  var lockTimer = 0;
  var locking = false;

  // DAS state
  var dasTimer = 0;
  var dasDir = 0;       // -1 = left, 1 = right, 0 = none
  var dasActive = false; // has initial delay passed?

  var particles = Particles.create();

  /** Get current drop interval based on level */
  function dropInterval() {
    return Math.max(Config.initialInterval - (level - 1) * Config.speedFactor, Config.minInterval);
  }

  /** Spawn a new piece at the top */
  function spawnPiece() {
    currentPiece = nextPiece || Pieces.random();
    currentPiece.x = Math.floor((Config.cols - currentPiece.shape[0].length) / 2);
    currentPiece.y = 0;
    currentPiece.shape = Pieces.getShape(currentPiece.type, currentPiece.rotation);
    nextPiece = Pieces.random();
    dropTimer = 0;
    lockTimer = 0;
    locking = false;
  }

  /** Calculate ghost Y position (hard drop destination) */
  function getGhostY() {
    if (!currentPiece) return 0;
    var gy = currentPiece.y;
    while (Board.isValid(currentPiece.type, currentPiece.x, gy + 1, currentPiece.rotation)) {
      gy++;
    }
    return gy;
  }

  /** Try to move the current piece */
  function movePiece(dx, dy) {
    if (!currentPiece) return false;
    var nx = currentPiece.x + dx;
    var ny = currentPiece.y + dy;
    if (Board.isValid(currentPiece.type, nx, ny, currentPiece.rotation)) {
      currentPiece.x = nx;
      currentPiece.y = ny;
      return true;
    }
    return false;
  }

  /** Try to rotate the current piece with wall kicks */
  function rotatePiece(dir) {
    if (!currentPiece) return false;
    var newRot = Pieces.rotate(currentPiece, dir);
    var result = Pieces.wallKick(currentPiece, newRot, Board.isValid);
    if (result) {
      currentPiece.x = result.x;
      currentPiece.y = result.y;
      currentPiece.rotation = result.rotation;
      currentPiece.shape = Pieces.getShape(currentPiece.type, result.rotation);
      return true;
    }
    return false;
  }

  /** Lock the piece and handle line clears */
  function lockPiece() {
    if (!currentPiece) return;

    Board.lock(currentPiece);
    Audio8.play('drop');

    var cleared = Board.clearLines();

    if (cleared > 0) {
      Audio8.play('clear');

      // Score based on lines cleared
      var lineScore = 0;
      if (cleared === 1) lineScore = Config.scoreSingle;
      else if (cleared === 2) lineScore = Config.scoreDouble;
      else if (cleared === 3) lineScore = Config.scoreTriple;
      else if (cleared >= 4) lineScore = Config.scoreTetris;

      score += lineScore * level;
      lines += cleared;
      level = Math.floor(lines / Config.linesPerLevel) + 1;

      Shell.setStat('score', score);
      Shell.setStat('lines', lines);

      if (cleared >= 4) {
        Shell.toast('Tetris!');
      }

      // Particles for line clear
      for (var r = 0; r < cleared; r++) {
        particles.emit(
          Config.canvasW / 2,
          Config.canvasH - (r + 1) * Config.cellSize,
          { count: 12, colors: Config.colors, speed: 120, life: 0.6 }
        );
      }
    }

    // Check game over
    if (Board.isTopBlocked()) {
      Audio8.play('gameover');
      if (saveHighScore('tetris', score)) {
        best = score;
      }
      game.gameOver('Score: ' + score);
      return;
    }

    spawnPiece();

    // Check if new piece can be placed
    if (!Board.isValid(currentPiece.type, currentPiece.x, currentPiece.y, currentPiece.rotation)) {
      Audio8.play('gameover');
      if (saveHighScore('tetris', score)) {
        best = score;
      }
      game.gameOver('Score: ' + score);
    }
  }

  /** Hard drop — instantly drop piece to ghost position */
  function hardDrop() {
    if (!currentPiece) return;
    var ghostY = getGhostY();
    var distance = ghostY - currentPiece.y;
    score += distance * Config.hardDropPoints;
    Shell.setStat('score', score);
    currentPiece.y = ghostY;
    lockPiece();
  }

  // --- Engine setup ---
  var game = Engine.create({
    canvas: { width: Config.totalW, height: Config.canvasH },
    startHint: 'Arrow keys to move, Up to rotate, Space to drop',

    init: function () {
      Input.init();
      Input.dpad();
      Shell.setStat('best', best);
    },

    reset: function () {
      score = 0;
      lines = 0;
      level = 1;
      dropTimer = 0;
      lockTimer = 0;
      locking = false;
      dasTimer = 0;
      dasDir = 0;
      dasActive = false;
      currentPiece = null;
      nextPiece = null;
      Pieces.reset();
      Board.reset();
      particles.clear();
      spawnPiece();
      Shell.setStat('score', 0);
      Shell.setStat('lines', 0);
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // --- Rotation ---
      if (Input.pressed('ArrowUp') || Input.dir === 'up') {
        if (rotatePiece(1)) {
          Audio8.play('move');
          // Reset lock timer on successful rotation
          if (locking) { lockTimer = 0; }
        }
      }
      if (Input.pressed('z') || Input.pressed('Z')) {
        if (rotatePiece(-1)) {
          Audio8.play('move');
          if (locking) { lockTimer = 0; }
        }
      }

      // --- Hard drop ---
      if (Input.pressed(' ') || Input.pressed('Space')) {
        hardDrop();
        Input.endFrame();
        return;
      }

      // --- Horizontal movement with DAS ---
      var moveDir = 0;
      if (Input.pressed('ArrowLeft') || Input.dir === 'left') {
        moveDir = -1;
      } else if (Input.pressed('ArrowRight') || Input.dir === 'right') {
        moveDir = 1;
      }

      if (moveDir !== 0) {
        // New direction pressed — move immediately and start DAS
        if (movePiece(moveDir, 0)) {
          Audio8.play('move');
          if (locking) { lockTimer = 0; }
        }
        dasDir = moveDir;
        dasTimer = 0;
        dasActive = false;
      } else if (Input.held('ArrowLeft')) {
        dasDir = -1;
      } else if (Input.held('ArrowRight')) {
        dasDir = 1;
      } else {
        dasDir = 0;
        dasTimer = 0;
        dasActive = false;
      }

      // DAS repeat
      if (dasDir !== 0 && !moveDir) {
        dasTimer += dt;
        if (!dasActive) {
          if (dasTimer >= Config.dasInitial) {
            dasActive = true;
            dasTimer = 0;
            if (movePiece(dasDir, 0)) {
              Audio8.play('move');
              if (locking) { lockTimer = 0; }
            }
          }
        } else {
          if (dasTimer >= Config.dasRepeat) {
            dasTimer -= Config.dasRepeat;
            if (movePiece(dasDir, 0)) {
              Audio8.play('move');
              if (locking) { lockTimer = 0; }
            }
          }
        }
      }

      // --- Soft drop ---
      var softDrop = Input.held('ArrowDown');

      // --- Auto drop ---
      var interval = softDrop ? Config.minInterval : dropInterval();
      dropTimer += dt;

      while (dropTimer >= interval) {
        dropTimer -= interval;

        if (Board.isValid(currentPiece.type, currentPiece.x, currentPiece.y + 1, currentPiece.rotation)) {
          currentPiece.y++;
          if (softDrop) {
            score += Config.softDropPoints;
            Shell.setStat('score', score);
          }
          locking = false;
          lockTimer = 0;
        } else {
          // Can't move down — start lock timer
          dropTimer = 0;
          break;
        }
      }

      // --- Lock delay ---
      if (!Board.isValid(currentPiece.type, currentPiece.x, currentPiece.y + 1, currentPiece.rotation)) {
        if (!locking) {
          locking = true;
          lockTimer = 0;
        }
        lockTimer += dt;
        if (lockTimer >= Config.lockDelay) {
          lockPiece();
        }
      } else {
        locking = false;
        lockTimer = 0;
      }

      // --- Particles ---
      particles.update(dt);

      Input.endFrame();
    },

    draw: function (ctx) {
      var grid = Board.getGrid();
      var ghostY = getGhostY();

      Renderer.drawBoard(ctx, grid);
      Renderer.drawGhost(ctx, currentPiece, ghostY);
      Renderer.drawPiece(ctx, currentPiece);
      Renderer.drawNext(ctx, nextPiece);
      particles.draw(ctx);
    },
  });

  game.start();

})();
