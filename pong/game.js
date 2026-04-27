/* Pong — Main game logic

   Modules loaded before this file:
   - Config    (src/config.js)    — constants + difficulty presets
   - Paddle    (src/paddle.js)    — paddle entities
   - Ball      (src/ball.js)      — ball physics
   - AI        (src/ai.js)        — AI opponent
   - Renderer  (src/renderer.js)  — background + score rendering

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, Timer, etc.
*/

(function () {

  var p1Score = 0;
  var p2Score = 0;
  var particles = Particles.create();
  var serveDir = 1;
  var difficulty = Config.defaultDifficulty;
  var matchTimer = null;

  // --- Difficulty selection overlay ---
  function showDifficultyChoice() {
    // Build a custom overlay with two buttons
    var overlay = document.getElementById('overlay');
    document.getElementById('overlay-title').textContent = 'Pong';
    document.getElementById('overlay-subtitle').textContent = 'Choose difficulty';
    document.getElementById('overlay-score').textContent = '';

    // Hide default button
    var defaultBtn = document.getElementById('overlay-btn');
    if (defaultBtn) defaultBtn.style.display = 'none';

    // Remove old choice buttons if any
    var old = overlay.querySelector('.diff-choice');
    if (old) old.remove();

    // Create choice buttons
    var wrap = document.createElement('div');
    wrap.className = 'diff-choice';
    wrap.style.cssText = 'display:flex;gap:16px;margin-top:12px;';

    var diffs = ['easy', 'hard'];
    for (var i = 0; i < diffs.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'btn' + (i === 0 ? ' btn-primary' : '');
      btn.textContent = Config.difficulties[diffs[i]].label;
      btn.style.cssText = 'min-width:110px;padding:12px 20px;';
      btn.addEventListener('click', (function (d) {
        return function () {
          difficulty = d;
          Config.setDifficulty(d);
          cleanup();
          startMatch();
        };
      })(diffs[i]));
      wrap.appendChild(btn);
    }

    overlay.appendChild(wrap);
    overlay.removeAttribute('hidden');
    overlay.style.display = '';

    function cleanup() {
      var w = overlay.querySelector('.diff-choice');
      if (w) w.remove();
      if (defaultBtn) defaultBtn.style.display = '';
    }
  }

  // --- Start a match ---
  function startMatch() {
    Shell.hideOverlay();
    p1Score = 0;
    p2Score = 0;
    serveDir = 1;
    Paddle.reset();
    Ball.reset(serveDir);
    particles.clear();
    Shell.setStat('p1', 0);
    Shell.setStat('p2', 0);

    if (matchTimer) matchTimer.reset();
    matchTimer = Timer.stopwatch(function (s) {
      Shell.setStat('time', Timer.format(s));
    });
    matchTimer.start();

    game.play();
    setTimeout(function () { Ball.serve(); }, 500);
  }

  // --- Engine ---
  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: '',

    init: function () {
      Input.init();
      if (game.canvas) {
        game.canvas.addEventListener('touchmove', function (e) {
          e.preventDefault();
          var rect = game.canvas.getBoundingClientRect();
          var scaleY = Config.canvasH / rect.height;
          var touchY = (e.touches[0].clientY - rect.top) * scaleY;
          var p1 = Paddle.getP1();
          Paddle.moveP1(touchY - p1.y - p1.h / 2);
        }, { passive: false });
      }
    },

    reset: function () {
      // Handled by startMatch
    },

    update: function (dt) {
      if (Input.pressed('Escape') || Input.pressed('p')) {
        if (matchTimer) matchTimer.pause();
        // Show pause menu with Resume and Restart options
        Shell.showOverlay({
          title: 'Paused',
          subtitle: '',
          score: '',
          btn: 'Resume',
          onAction: function () {
            Shell.hideOverlay();
            var rb = document.getElementById('overlay').querySelector('.restart-btn');
            if (rb) rb.remove();
            if (matchTimer) matchTimer.start();
            game.play();
          }
        });
        // Add a restart button below resume
        var overlay = document.getElementById('overlay');
        var oldRb = overlay.querySelector('.restart-btn');
        if (oldRb) oldRb.remove();
        var restartBtn = document.createElement('button');
        restartBtn.className = 'btn restart-btn';
        restartBtn.textContent = 'Restart';
        restartBtn.style.cssText = 'margin-top:8px;';
        restartBtn.addEventListener('click', function () {
          var rb2 = overlay.querySelector('.restart-btn');
          if (rb2) rb2.remove();
          Shell.hideOverlay();
          showDifficultyChoice();
        });
        overlay.appendChild(restartBtn);
        game.pause();
        Input.endFrame();
        return;
      }

      // P1 input
      if (Input.held('w') || Input.held('W') || Input.held('ArrowUp')) {
        Paddle.moveP1(-Config.paddleSpeed * dt);
      }
      if (Input.held('s') || Input.held('S') || Input.held('ArrowDown')) {
        Paddle.moveP1(Config.paddleSpeed * dt);
      }

      // AI controls P2
      AI.update(dt, { x: Ball.x, y: Ball.y, vx: Ball.vx, vy: Ball.vy }, Paddle.getP2());

      // Ball
      if (!Ball.serving) {
        var result = Ball.update(dt);

        Ball.checkPaddleCollision(Paddle.getP1());
        Ball.checkPaddleCollision(Paddle.getP2());

        if (result === 'p1scored') {
          p1Score++;
          Shell.setStat('p1', p1Score);
          Audio8.play('score');
          particles.emit(Config.canvasW, Ball.y, { count: 12, color: '#e0e0e0', speed: 100, life: 0.5 });
          serveDir = -1;
          Ball.reset(serveDir);
          if (p1Score >= Config.winScore) {
            endMatch(true);
            return;
          }
          setTimeout(function () { Ball.serve(); }, 800);
        } else if (result === 'p2scored') {
          p2Score++;
          Shell.setStat('p2', p2Score);
          Audio8.play('score');
          particles.emit(0, Ball.y, { count: 12, color: '#e0e0e0', speed: 100, life: 0.5 });
          serveDir = 1;
          Ball.reset(serveDir);
          if (p2Score >= Config.winScore) {
            endMatch(false);
            return;
          }
          setTimeout(function () { Ball.serve(); }, 800);
        }
      }

      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      Renderer.drawBackground(ctx);
      Renderer.drawScore(ctx, p1Score, p2Score);
      Paddle.draw(ctx);
      Ball.draw(ctx);
      particles.draw(ctx);
    },
  });

  function endMatch(playerWon) {
    if (matchTimer) matchTimer.pause();
    var timeStr = Timer.format(matchTimer ? matchTimer.elapsed : 0);
    var modeStr = Config.difficulties[difficulty].label;

    if (playerWon) {
      Audio8.play('win');
      Shell.showOverlay({
        title: 'You Win!',
        score: modeStr + ' — ' + timeStr,
        btn: 'Play Again',
        onAction: function () { showDifficultyChoice(); }
      });
    } else {
      Audio8.play('gameover');
      Shell.showOverlay({
        title: 'AI Wins',
        score: modeStr + ' — ' + timeStr,
        btn: 'Play Again',
        onAction: function () { showDifficultyChoice(); }
      });
    }
  }

  // --- Boot: show difficulty choice instead of default start screen ---
  game.start();
  // Replace the default "Start" overlay with our difficulty choice
  setTimeout(showDifficultyChoice, 50);

})();
