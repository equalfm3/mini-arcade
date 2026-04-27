/* Merge Path — Main game logic

   Modules loaded before this file:
   - Config       (src/config.js)       — grid sizes, colors, rendering constants
   - Puzzle       (src/puzzle.js)        — level definitions, validation
   - Paths        (src/paths.js)         — path drawing state, drag handling
   - Renderer     (src/renderer.js)      — grid, dots, paths, effects

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var level = 1;
  var particles = Particles.create();
  var canvasEl = null;
  var solved = false;
  var solveDelay = 0;
  var currentDims = null;

  // Mouse/touch tracking for drag
  var mouseDown = false;
  var lastGridR = -1;
  var lastGridC = -1;

  function getDims() {
    var gridSize = Config.gridForLevel(level);
    return Config.canvasDims(gridSize);
  }

  /** Convert pixel coords to grid row/col */
  function pixelToGrid(px, py, scale) {
    var cellTotal = Config.cellSize + Config.cellGap;
    var col = Math.floor((px / scale - Config.padding) / cellTotal);
    var row = Math.floor((py / scale - Config.padding - Config.headerHeight) / cellTotal);
    var size = Paths.size;
    if (row < 0 || row >= size || col < 0 || col >= size) return null;
    return { r: row, c: col };
  }

  function getEventPos(e, canvas) {
    var rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      return {
        x: e.changedTouches[0].clientX - rect.left,
        y: e.changedTouches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function handlePointerDown(e) {
    if (game.state !== 'playing' || solved) return;
    e.preventDefault();
    var pos = getEventPos(e, canvasEl);
    var cell = pixelToGrid(pos.x, pos.y, game.scale);
    if (!cell) return;

    mouseDown = true;
    lastGridR = cell.r;
    lastGridC = cell.c;

    if (Paths.startDraw(cell.r, cell.c)) {
      Audio8.play('click');
      Shell.setStat('moves', Paths.moveCount);
    }
  }

  function handlePointerMove(e) {
    if (!mouseDown || !Paths.drawing || solved) return;
    e.preventDefault();
    var pos = getEventPos(e, canvasEl);
    var cell = pixelToGrid(pos.x, pos.y, game.scale);
    if (!cell) return;

    // Only process if we moved to a new cell
    if (cell.r === lastGridR && cell.c === lastGridC) return;
    lastGridR = cell.r;
    lastGridC = cell.c;

    if (Paths.extendTo(cell.r, cell.c)) {
      Audio8.play('move');

      // Check if a path was just completed (connected both dots)
      if (!Paths.drawing) {
        Audio8.play('score');
        // Emit particles at the endpoint
        var center = Renderer.cellCenter(cell.r, cell.c);
        var pColor = Config.colors[0];
        particles.emit(center.x, center.y, {
          count: 10,
          color: pColor,
          speed: 80,
          life: 0.5,
          size: 3,
        });

        // Immediately check if puzzle is solved
        if (!solved && Paths.checkSolved()) {
          solved = true;
          solveDelay = 1.8;
          Renderer.triggerCompletion();
          Audio8.play('win');
          Shell.toast('Level ' + level + ' Complete!');
        }
      }
    }
  }

  function handlePointerUp(e) {
    if (!mouseDown) return;
    mouseDown = false;
    Paths.endDraw();
    lastGridR = -1;
    lastGridC = -1;

    // Check solve after every path completion
    if (!solved && Paths.checkSolved()) {
      solved = true;
      solveDelay = 1.8;
      Renderer.triggerCompletion();
      Audio8.play('win');
      Shell.toast('Level ' + level + ' Complete!');
    }
  }

  function setupLevel() {
    var lvl = Puzzle.load(level);
    Paths.reset(lvl);
    Renderer.reset();
    particles.clear();
    solved = false;
    solveDelay = 0;
    Shell.setStat('level', level);
    Shell.setStat('moves', 0);
  }

  var game = Engine.create({
    canvas: { width: 400, height: 460 },
    startHint: 'Connect matching dots — fill every cell!',

    init: function () {
      Input.init();
      canvasEl = game.canvas;

      // Attach pointer events for drag drawing
      canvasEl.addEventListener('mousedown', handlePointerDown);
      canvasEl.addEventListener('mousemove', handlePointerMove);
      canvasEl.addEventListener('mouseup', handlePointerUp);
      canvasEl.addEventListener('mouseleave', handlePointerUp);
      canvasEl.addEventListener('touchstart', handlePointerDown, { passive: false });
      canvasEl.addEventListener('touchmove', handlePointerMove, { passive: false });
      canvasEl.addEventListener('touchend', handlePointerUp, { passive: false });
      canvasEl.addEventListener('touchcancel', handlePointerUp, { passive: false });

      preventScroll(canvasEl);
    },

    reset: function () {
      level = 1;
      setupLevel();
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // --- Completion check ---
      if (!solved && Paths.checkSolved()) {
        solved = true;
        solveDelay = 1.8;
        Renderer.triggerCompletion();
        Audio8.play('win');
        Shell.toast('Level ' + level + ' Complete!');
      }

      // --- After solve, advance ---
      if (solved) {
        solveDelay -= dt;
        if (solveDelay <= 0) {
          level++;
          setupLevel();
        }
      }

      // --- Update effects ---
      Renderer.update(dt);
      particles.update(dt);

      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w;
      var h = game.h;

      Renderer.drawBackground(ctx, w, h);
      Renderer.drawGrid(ctx);
      Renderer.drawPaths(ctx);
      Renderer.drawDots(ctx);
      Renderer.drawProgress(ctx, w);
      particles.draw(ctx);
      Renderer.drawCompletionOverlay(ctx, w, h);
    },
  });

  game.start();

})();
