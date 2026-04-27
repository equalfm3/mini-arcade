/* Chain Reaction — Main game logic

   Modules loaded before this file:
   - Config       (src/config.js)       — constants, level data
   - Dots         (src/dots.js)         — floating dots, movement, bouncing
   - Explosions   (src/explosions.js)   — explosion circles, chain triggers
   - Renderer     (src/renderer.js)     — drawing everything

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var level = 1;
  var popped = 0;
  var target = 0;
  var totalDots = 0;
  var attempts = 0;
  var best = loadHighScore('chain-reaction');
  var particles = Particles.create();

  // Game sub-states: 'waiting' | 'chaining' | 'settling' | 'result'
  var phase = 'waiting';
  var settleTimer = 0;
  var resultTimer = 0;
  var resultShown = false;

  // Click tracking
  var clickX = 0;
  var clickY = 0;
  var canvasEl = null;

  function getLevelData() {
    var data = Config.getLevel(level);
    target = data.target;
    totalDots = data.dots;
  }

  function playExplosionSound() {
    // Low rumble + mid pop
    Audio8.note(Config.explosionFreqLow, Config.explosionDurLow, 'sine', 0.1);
    Audio8.note(Config.explosionFreqMid, Config.explosionDurMid, 'square', 0.08);
  }

  function handleCanvasClick(e) {
    if (phase !== 'waiting') return;
    var rect = canvasEl.getBoundingClientRect();
    var scaleX = game.w / rect.width;
    var scaleY = game.h / rect.height;
    clickX = (e.clientX - rect.left) * scaleX;
    clickY = (e.clientY - rect.top) * scaleY;
    startChain();
  }

  function handleCanvasTouch(e) {
    if (phase !== 'waiting') return;
    e.preventDefault();
    var touch = e.touches[0];
    var rect = canvasEl.getBoundingClientRect();
    var scaleX = game.w / rect.width;
    var scaleY = game.h / rect.height;
    clickX = (touch.clientX - rect.left) * scaleX;
    clickY = (touch.clientY - rect.top) * scaleY;
    startChain();
  }

  function startChain() {
    phase = 'chaining';
    popped = 0;
    Explosions.createFromClick(clickX, clickY);
    playExplosionSound();
    Shell.setStat('popped', popped + '/' + target);
  }

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Click once to trigger a chain reaction!',

    init: function () {
      Input.init();
      Shell.setStat('best', best);
      canvasEl = game.canvas;

      // Direct click/touch on canvas for precise placement
      canvasEl.addEventListener('click', handleCanvasClick);
      canvasEl.addEventListener('touchstart', handleCanvasTouch, { passive: false });
    },

    reset: function () {
      level = 1;
      popped = 0;
      attempts = 0;
      particles.clear();
      Dots.init(game.w, game.h);
      Explosions.reset();
      Renderer.reset();
      getLevelData();
      Dots.spawn(totalDots);
      phase = 'waiting';
      settleTimer = 0;
      resultTimer = 0;
      resultShown = false;
      Shell.setStat('level', level);
      Shell.setStat('popped', '0/' + target);
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // Time scaling for slow-mo during chains
      var timeScale = 1;
      if (phase === 'chaining' && Explosions.chainCount >= Config.slowMoThreshold) {
        timeScale = Config.slowMoFactor;
      }
      var scaledDt = dt * timeScale;

      // --- Update dots ---
      if (phase === 'waiting' || phase === 'chaining') {
        Dots.update(scaledDt);
      }

      // --- Update explosions ---
      Explosions.update(scaledDt);

      // --- Chain detection ---
      if (phase === 'chaining') {
        var prevPopped = popped;
        Explosions.checkChains(Dots, particles, function (dot) {
          popped++;
          Shell.setStat('popped', popped + '/' + target);
          Audio8.play('score');
          playExplosionSound();

          // Big chain flash
          if (popped >= Config.bigChainThreshold && popped > prevPopped) {
            Renderer.triggerFlash();
          }
        });

        // Check if all explosions have finished
        if (!Explosions.isActive()) {
          phase = 'settling';
          settleTimer = Config.settleDelay;
        }
      }

      // --- Settling phase (wait for visual clarity) ---
      if (phase === 'settling') {
        Dots.update(scaledDt);
        settleTimer -= dt;
        if (settleTimer <= 0) {
          phase = 'result';
          resultTimer = 2.0;
          resultShown = true;
          checkResult();
        }
      }

      // --- Result display ---
      if (phase === 'result') {
        Dots.update(dt);
        resultTimer -= dt;
        if (resultTimer <= 0) {
          advanceOrRetry();
        }
      }

      // --- Update effects ---
      Renderer.updateEffects(dt, Explosions.chainCount);
      particles.update(dt);

      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w;
      var h = game.h;

      Renderer.drawBackground(ctx, w, h);
      Renderer.drawDots(ctx);
      Renderer.drawExplosions(ctx);
      particles.draw(ctx);
      Renderer.drawPopups(ctx);
      Renderer.drawChainCounter(ctx, w, h);
      Renderer.drawScreenFlash(ctx, w, h);
      Renderer.drawLevelInfo(ctx, w, h, level, target, popped, attempts, Config.maxAttempts, phase);

      if (phase === 'result' && resultShown) {
        Renderer.drawResultMessage(ctx, w, h, popped >= target, popped, target);
      }
    },
  });

  function checkResult() {
    if (popped >= target) {
      // Level passed!
      Audio8.play('win');
      Shell.toast('Level ' + level + ' Clear!');
      // Save best level as score
      var score = level;
      if (saveHighScore('chain-reaction', score)) {
        best = score;
        Shell.setStat('best', best);
      }
    } else {
      Audio8.play('error');
    }
  }

  function advanceOrRetry() {
    if (popped >= target) {
      // Next level
      level++;
      attempts = 0;
      Shell.setStat('level', level);
    } else {
      // Retry
      attempts++;
      if (attempts >= Config.maxAttempts) {
        // Game over
        var score = level - 1;
        if (saveHighScore('chain-reaction', score)) {
          best = score;
          Shell.setStat('best', best);
        }
        Audio8.play('gameover');
        game.gameOver('Reached Level ' + level);
        return;
      }
    }

    // Set up next round
    getLevelData();
    Dots.init(game.w, game.h);
    Dots.spawn(totalDots);
    Explosions.reset();
    Renderer.reset();
    particles.clear();
    popped = 0;
    phase = 'waiting';
    resultShown = false;
    Shell.setStat('popped', '0/' + target);
  }

  game.start();

})();
