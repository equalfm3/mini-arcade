/* Pixel Painter — Main Game Logic

   Modules loaded before this file:
   - Config     (src/config.js)     — grid size, colors, timing, scoring
   - Patterns   (src/patterns.js)   — pre-defined pixel art patterns, comparison
   - Renderer   (src/renderer.js)   — canvas rendering, hit testing

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.

   Game flow:
   1. SHOW phase — target pattern displayed for a few seconds
   2. PAINT phase — blank grid, player paints from memory
   3. COMPARE phase — side-by-side comparison, accuracy scored
   4. 80%+ = pass to next level, below = retry
*/

(function () {

  var particles = Particles.create();

  // Game state
  var score = 0;
  var level = 1;
  var selectedColor = 0;   // palette index (0-5, maps to color 1-6)

  // Phase state: 'show' | 'countdown' | 'paint' | 'compare' | 'idle'
  var phase = 'idle';
  var phaseTimer = 0;

  // Pattern data
  var targetPattern = null;  // { name, data }
  var targetData = null;     // 8×8 array (deep copy)
  var playerGrid = null;     // 8×8 array (player's painting)
  var compareResult = null;  // { correct, total, accuracy, passed }

  // Interaction state
  var hoverSubmit = false;
  var painting = false;      // mouse/touch is held down for continuous painting

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Memorize the pattern, then recreate it!',

    init: function () {
      Input.init();
      Renderer.computeLayout(Config.canvasW);
      setupPointerEvents();
    },

    reset: function () {
      score = 0;
      level = 1;
      selectedColor = 0;
      particles.clear();
      compareResult = null;
      Patterns.resetUsed();
      Shell.setStat('accuracy', '—');
      Shell.setStat('level', 1);
      startShowPhase();
    },

    update: function (dt) {
      // Pause
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      if (phase === 'show') {
        updateShow(dt);
      } else if (phase === 'countdown') {
        updateCountdown(dt);
      } else if (phase === 'paint') {
        updatePaint(dt);
      } else if (phase === 'compare') {
        updateCompare(dt);
      }

      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w;
      var h = game.h;

      Renderer.drawBackground(ctx, w, h);

      if (phase === 'show') {
        drawShow(ctx, w, h);
      } else if (phase === 'countdown') {
        drawCountdownPhase(ctx, w, h);
      } else if (phase === 'paint') {
        drawPaint(ctx, w, h);
      } else if (phase === 'compare') {
        drawCompare(ctx, w, h);
      }

      particles.draw(ctx);
    },
  });

  // ========== PHASE: SHOW ==========

  function startShowPhase() {
    targetPattern = Patterns.getPattern(level);
    targetData = Patterns.cloneData(targetPattern.data);
    playerGrid = Patterns.createEmpty();
    phase = 'show';
    phaseTimer = Config.getShowDuration(level);
    compareResult = null;
  }

  function updateShow(dt) {
    phaseTimer -= dt;
    if (phaseTimer <= 0) {
      phase = 'countdown';
      phaseTimer = Config.countdownBeforePaint;
      Audio8.play('whoosh');
    }
  }

  function drawShow(ctx, w, h) {
    Renderer.drawPhaseLabel(ctx, w, 'MEMORIZE THIS!', targetPattern.name + ' · Level ' + level);

    // Timer bar
    var showDur = Config.getShowDuration(level);
    Renderer.drawTimerBar(ctx, w, phaseTimer / showDur, Config.gridY - 10);

    // Draw target pattern
    Renderer.drawGrid(ctx, targetData, w);

    // Countdown dots
    Renderer.drawCountdown(ctx, w, phaseTimer);
  }

  // ========== PHASE: COUNTDOWN ==========

  function updateCountdown(dt) {
    phaseTimer -= dt;
    if (phaseTimer <= 0) {
      phase = 'paint';
      phaseTimer = 0;
    }
  }

  function drawCountdownPhase(ctx, w, h) {
    Renderer.drawPhaseLabel(ctx, w, 'GET READY...', 'Paint from memory!');
    Renderer.drawGrid(ctx, Patterns.createEmpty(), w);
  }

  // ========== PHASE: PAINT ==========

  function updatePaint(dt) {
    // Keyboard color selection (1-6)
    for (var i = 1; i <= Config.colors.length; i++) {
      if (Input.pressed(String(i))) {
        selectedColor = i - 1;
        Audio8.play('click');
        break;
      }
    }

    // Enter/Space to submit
    if (Input.pressed('Enter') || Input.pressed(' ')) {
      submitPainting();
    }
  }

  function drawPaint(ctx, w, h) {
    Renderer.drawPhaseLabel(ctx, w, 'PAINT IT!', targetPattern.name);

    // Draw player grid
    Renderer.drawGrid(ctx, playerGrid, w);

    // Color palette
    Renderer.drawPalette(ctx, w, selectedColor);

    // Submit button
    Renderer.drawSubmitBtn(ctx, w, hoverSubmit);
  }

  // ========== PHASE: COMPARE ==========

  function submitPainting() {
    compareResult = Patterns.compare(targetData, playerGrid);
    phase = 'compare';
    phaseTimer = Config.compareDuration + 1;

    Shell.setStat('accuracy', compareResult.accuracy + '%');

    if (compareResult.passed) {
      Audio8.play('score');

      // Calculate score
      var points = compareResult.accuracy * Config.pointsPerPercent;
      if (compareResult.accuracy === 100) points += Config.perfectBonus;
      points += level * Config.levelBonus;
      score += points;

      // Celebration particles
      particles.emit(game.w / 2, game.h / 2, {
        count: Config.celebrationParticles,
        colors: Config.colors,
        speed: 200,
        life: 1,
        size: 5,
      });

      Shell.toast('+' + points + ' points!');
    } else {
      Audio8.play('error');
    }
  }

  function updateCompare(dt) {
    phaseTimer -= dt;
    if (phaseTimer <= 0) {
      if (compareResult.passed) {
        // Advance level
        level++;
        Shell.setStat('level', level);
        Audio8.play('win');
        startShowPhase();
      } else {
        // Game over
        Audio8.play('gameover');
        game.gameOver('Score: ' + score + '  Level: ' + level);
      }
    }
  }

  function drawCompare(ctx, w, h) {
    Renderer.drawPhaseLabel(ctx, w, 'RESULTS', 'Level ' + level);
    Renderer.drawComparison(ctx, targetData, playerGrid, w, h, compareResult);
  }

  // ========== POINTER EVENTS ==========

  function setupPointerEvents() {
    if (!game.canvas) return;

    // --- Mouse events ---
    game.canvas.addEventListener('mousedown', function (e) {
      if (!game.is('playing')) return;
      var pos = canvasPos(e);
      handlePointerDown(pos.x, pos.y);
      painting = true;
    });

    game.canvas.addEventListener('mousemove', function (e) {
      if (!game.is('playing')) return;
      var pos = canvasPos(e);

      // Hover submit button
      if (phase === 'paint') {
        hoverSubmit = Renderer.isSubmitAt(pos.x, pos.y, game.w);
      }

      // Continuous painting
      if (painting && phase === 'paint') {
        paintCell(pos.x, pos.y);
      }
    });

    game.canvas.addEventListener('mouseup', function () {
      painting = false;
    });

    game.canvas.addEventListener('mouseleave', function () {
      painting = false;
      hoverSubmit = false;
    });

    // --- Touch events ---
    game.canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      if (!game.is('playing')) return;
      var pos = touchPos(e);
      handlePointerDown(pos.x, pos.y);
      painting = true;
    }, { passive: false });

    game.canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      if (!game.is('playing') || !painting) return;
      if (phase === 'paint') {
        var pos = touchPos(e);
        paintCell(pos.x, pos.y);
      }
    }, { passive: false });

    game.canvas.addEventListener('touchend', function (e) {
      e.preventDefault();
      painting = false;
    }, { passive: false });
  }

  function handlePointerDown(px, py) {
    if (phase === 'paint') {
      // Check palette
      var colorIdx = Renderer.getPaletteAt(px, py, game.w);
      if (colorIdx >= 0) {
        selectedColor = colorIdx;
        Audio8.play('click');
        return;
      }

      // Check submit button
      if (Renderer.isSubmitAt(px, py, game.w)) {
        submitPainting();
        return;
      }

      // Paint cell
      paintCell(px, py);
    }
  }

  function paintCell(px, py) {
    var cell = Renderer.getCellAt(px, py);
    if (!cell) return;

    var current = playerGrid[cell.row][cell.col];
    var newVal = selectedColor + 1; // 1-indexed color

    if (current === newVal) {
      // Toggle off (erase) if same color
      playerGrid[cell.row][cell.col] = 0;
    } else {
      playerGrid[cell.row][cell.col] = newVal;
    }
    Audio8.play('click');
  }

  // ---- Coordinate helpers ----

  function canvasPos(e) {
    var rect = game.canvas.getBoundingClientRect();
    var scaleX = game.w / rect.width;
    var scaleY = game.h / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function touchPos(e) {
    var touch = e.changedTouches[0] || e.touches[0];
    var rect = game.canvas.getBoundingClientRect();
    var scaleX = game.w / rect.width;
    var scaleY = game.h / rect.height;
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  }

  game.start();

})();
