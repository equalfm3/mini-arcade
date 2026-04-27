/* Bounce Architect — Main Game Logic

   Modules loaded before this file:
   - Config       (src/config.js)    — constants
   - Levels       (src/levels.js)    — level definitions
   - Ball         (src/ball.js)      — ball physics
   - Pads         (src/pads.js)      — pad placement
   - Renderer     (src/renderer.js)  — drawing

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.

   Game phases:
   - 'place'   — player places bounce pads
   - 'launch'  — pads placed, waiting for launch
   - 'flying'  — ball is in motion
   - 'result'  — showing success/fail before next action
*/

(function () {

  var level = 1;
  var levelData = null;
  var phase = 'place';       // 'place' | 'launch' | 'flying' | 'result'
  var resultTimer = 0;
  var resultSuccess = false;
  var particles = Particles.create();
  var trajectoryPoints = [];
  var canvasEl = null;

  // Mouse state for pad placement
  var mouseDown = false;
  var mouseX = 0;
  var mouseY = 0;

  function loadLevel() {
    levelData = Levels.get(level);
    Ball.reset(levelData.ball.x, levelData.ball.y);
    Pads.reset(levelData.pads);
    particles.clear();
    trajectoryPoints = [];

    // Tutorial level (0 pads) goes straight to launch phase
    phase = levelData.pads === 0 ? 'launch' : 'place';

    Shell.setStat('level', level);
    Shell.setStat('pads', Pads.count + '/' + Pads.max);
    updateTrajectory();
  }

  function updateTrajectory() {
    trajectoryPoints = Ball.simulateTrajectory(
      Pads.getAll(), levelData.obstacles,
      Config.canvasW, Config.canvasH
    );
  }

  function toCanvasCoords(clientX, clientY) {
    var rect = canvasEl.getBoundingClientRect();
    var scaleX = game.w / rect.width;
    var scaleY = game.h / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  // --- Mouse/touch handlers ---
  function onMouseDown(e) {
    if (phase !== 'place') return;
    var pos = toCanvasCoords(e.clientX, e.clientY);
    mouseDown = true;
    mouseX = pos.x;
    mouseY = pos.y;

    // Try to remove an existing pad first
    if (Pads.removeAt(pos.x, pos.y)) {
      Audio8.play('click');
      Shell.setStat('pads', Pads.count + '/' + Pads.max);
      updateTrajectory();
      mouseDown = false;
      return;
    }

    // Start placing a new pad
    if (Pads.canPlace()) {
      Pads.startPlace(pos.x, pos.y);
      Audio8.play('click');
    }
  }

  function onMouseMove(e) {
    if (!mouseDown || phase !== 'place') return;
    var pos = toCanvasCoords(e.clientX, e.clientY);
    mouseX = pos.x;
    mouseY = pos.y;
    Pads.updateDrag(pos.x, pos.y);
    updateTrajectory();
  }

  function onMouseUp(e) {
    if (!mouseDown) return;
    mouseDown = false;
    if (phase !== 'place') return;

    if (Pads.ghost) {
      Pads.confirmPlace();
      Audio8.play('move');
      Shell.setStat('pads', Pads.count + '/' + Pads.max);
      updateTrajectory();

      // Auto-switch to launch if all pads placed
      if (!Pads.canPlace()) {
        phase = 'launch';
      }
    }
  }

  function onTouchStart(e) {
    if (phase !== 'place') return;
    e.preventDefault();
    var touch = e.touches[0];
    var pos = toCanvasCoords(touch.clientX, touch.clientY);
    mouseDown = true;
    mouseX = pos.x;
    mouseY = pos.y;

    if (Pads.removeAt(pos.x, pos.y)) {
      Audio8.play('click');
      Shell.setStat('pads', Pads.count + '/' + Pads.max);
      updateTrajectory();
      mouseDown = false;
      return;
    }

    if (Pads.canPlace()) {
      Pads.startPlace(pos.x, pos.y);
      Audio8.play('click');
    }
  }

  function onTouchMove(e) {
    if (!mouseDown || phase !== 'place') return;
    e.preventDefault();
    var touch = e.touches[0];
    var pos = toCanvasCoords(touch.clientX, touch.clientY);
    mouseX = pos.x;
    mouseY = pos.y;
    Pads.updateDrag(pos.x, pos.y);
    updateTrajectory();
  }

  function onTouchEnd(e) {
    if (!mouseDown) return;
    mouseDown = false;
    if (phase !== 'place') return;
    e.preventDefault();

    if (Pads.ghost) {
      Pads.confirmPlace();
      Audio8.play('move');
      Shell.setStat('pads', Pads.count + '/' + Pads.max);
      updateTrajectory();

      if (!Pads.canPlace()) {
        phase = 'launch';
      }
    }
  }

  function launchBall() {
    phase = 'flying';
    Ball.launch();
    Audio8.play('whoosh');
  }

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Place pads, then launch the ball!',

    init: function () {
      Input.init();
      canvasEl = game.canvas;

      // Attach mouse/touch handlers for pad placement
      canvasEl.addEventListener('mousedown', onMouseDown);
      canvasEl.addEventListener('mousemove', onMouseMove);
      canvasEl.addEventListener('mouseup', onMouseUp);
      canvasEl.addEventListener('touchstart', onTouchStart, { passive: false });
      canvasEl.addEventListener('touchmove', onTouchMove, { passive: false });
      canvasEl.addEventListener('touchend', onTouchEnd, { passive: false });

      // Add launch button for mobile
      var launchBtn = document.createElement('button');
      launchBtn.className = 'btn btn-primary btn-action';
      launchBtn.textContent = 'LAUNCH';
      launchBtn.id = 'launch-btn';
      launchBtn.addEventListener('touchstart', function (e) {
        e.preventDefault();
        if (phase === 'place' || phase === 'launch') {
          launchBall();
        }
      }, { passive: false });
      launchBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (phase === 'place' || phase === 'launch') {
          launchBall();
        }
      });
      if (Shell && Shell.controls) {
        Shell.controls.appendChild(launchBtn);
      }
    },

    reset: function () {
      level = 1;
      particles.clear();
      Renderer.reset();
      loadLevel();
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      Renderer.updateTime(dt);

      // --- PLACE phase ---
      if (phase === 'place') {
        // Keyboard rotation of ghost pad
        if (Pads.ghost) {
          if (Input.held('ArrowLeft')) {
            Pads.rotateGhost(-Config.padRotateSpeed * dt);
            updateTrajectory();
          }
          if (Input.held('ArrowRight')) {
            Pads.rotateGhost(Config.padRotateSpeed * dt);
            updateTrajectory();
          }
        }

        // Space to launch (even if not all pads placed)
        if (Input.pressed(' ')) {
          Pads.cancelPlace();
          launchBall();
        }
      }

      // --- LAUNCH phase ---
      if (phase === 'launch') {
        if (Input.pressed(' ') || Input.tapped) {
          launchBall();
        }
      }

      // --- FLYING phase ---
      if (phase === 'flying') {
        // Combined physics + collision with substeps to prevent tunneling
        var allPads = Pads.getAll();
        var result = Ball.updateWithCollisions(dt, allPads, levelData.obstacles, game.w, game.h);

        if (result.bounced) {
          Audio8.play('move');
          particles.emit(Ball.x, Ball.y, {
            count: 6,
            color: Config.padColor,
            speed: 80,
            life: 0.3,
            size: 2,
          });
        }

        // Check goal
        if (Ball.checkGoal(levelData.goal)) {
          phase = 'result';
          resultSuccess = true;
          resultTimer = Config.resultDelay;
          Audio8.play('score');
          particles.emit(levelData.goal.x, levelData.goal.y, {
            count: Config.burstCount,
            colors: [Config.goalColor, '#fff', Config.padColor],
            speed: Config.burstSpeed,
            life: Config.burstLife,
            size: Config.burstSize,
            gravity: 100,
          });
          Shell.toast('Level ' + level + ' Clear!');
        }

        // Check lost
        if (!resultSuccess && Ball.isLost(game.h)) {
          phase = 'result';
          resultSuccess = false;
          resultTimer = Config.resultDelay;
          Audio8.play('error');
        }
      }

      // --- RESULT phase ---
      if (phase === 'result') {
        if (Ball.alive) Ball.update(dt);
        resultTimer -= dt;
        if (resultTimer <= 0) {
          if (resultSuccess) {
            // Advance to next level
            if (level >= Levels.count) {
              Audio8.play('win');
              game.win('All ' + Levels.count + ' levels complete!');
              Input.endFrame();
              return;
            }
            level++;
            loadLevel();
          } else {
            // Retry — reset pads
            loadLevel();
          }
          resultSuccess = false;
        }
      }

      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w;
      var h = game.h;

      // Background
      Renderer.drawBackground(ctx, w, h);

      // Obstacles
      Renderer.drawObstacles(ctx, levelData.obstacles);

      // Goal
      Renderer.drawGoal(ctx, levelData.goal);

      // Trajectory preview (only during place/launch)
      if (phase === 'place' || phase === 'launch') {
        Renderer.drawTrajectory(ctx, trajectoryPoints);
        Renderer.drawBallStart(ctx, levelData.ball.x, levelData.ball.y);
      }

      // Pads
      Renderer.drawPads(ctx, Pads, Pads.ghost);

      // Ball
      Renderer.drawBall(ctx);

      // Particles
      particles.draw(ctx);

      // Phase text
      Renderer.drawPhaseText(ctx, w, phase, Pads.count, Pads.max);

      // Result overlay
      if (phase === 'result') {
        Renderer.drawResult(ctx, w, h, resultSuccess);
      }
    },
  });

  game.start();

})();
