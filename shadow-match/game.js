/* Shadow Match — Main Game Logic

   Modules loaded before this file:
   - Config     (src/config.js)     — all tunable constants
   - Shapes     (src/shapes.js)     — polyomino generation, transforms, distractors
   - Renderer   (src/renderer.js)   — all visual rendering

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var best = loadHighScore('shadow-match');
  var particles = Particles.create();

  // Game state
  var score = 0;
  var level = 1;
  var lives = Config.maxLives;

  // Round state
  var round = null;        // { original, options, correctIndex, displayTime }
  var phase = 'idle';      // 'showing' | 'choosing' | 'feedback' | 'levelup' | 'idle'
  var phaseTimer = 0;
  var answerTimer = 0;
  var answerTimeMax = 0;
  var selectedOption = -1;
  var feedbackResult = '';  // 'correct' | 'wrong' | 'timeout'
  var scorePopupText = '';
  var scorePopupTimer = 0;
  var shakeTimer = 0;

  // Cached option rects
  var optionRects = [];

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Match the shadow shape — 1 2 3 4 or tap',

    init: function () {
      Input.init();
      Shell.setStat('level', best > 0 ? 'Best: ' + best : '1');
      setupTouchControls();
    },

    reset: function () {
      score = 0;
      level = 1;
      lives = Config.maxLives;
      particles.clear();
      selectedOption = -1;
      feedbackResult = '';
      scorePopupTimer = 0;
      shakeTimer = 0;
      Shell.setStat('score', 0);
      Shell.setStat('level', level);
      startRound();
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      if (phase === 'showing') {
        updateShowing(dt);
      } else if (phase === 'choosing') {
        updateChoosing(dt);
      } else if (phase === 'feedback') {
        updateFeedback(dt);
      } else if (phase === 'levelup') {
        updateLevelUp(dt);
      }

      // Timers
      if (scorePopupTimer > 0) scorePopupTimer -= dt;
      if (shakeTimer > 0) shakeTimer -= dt;

      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w;
      var h = game.h;

      // Apply shake
      var shake = Renderer.getShakeOffset(shakeTimer);
      ctx.save();
      ctx.translate(shake.x, shake.y);

      Renderer.drawBackground(ctx, w, h);

      // Lives
      Renderer.drawLives(ctx, lives, Config.maxLives, w - 60, 6);

      if (phase === 'showing') {
        drawShowing(ctx, w, h);
      } else if (phase === 'choosing') {
        drawChoosing(ctx, w, h);
      } else if (phase === 'feedback') {
        drawFeedback(ctx, w, h);
      } else if (phase === 'levelup') {
        Renderer.drawLevelText(ctx, w, h, level, Math.min(1, phaseTimer / 0.3));
      }

      // Score popup
      Renderer.drawScorePopup(ctx, w, scorePopupText, scorePopupTimer, 0.8);

      particles.draw(ctx);
      ctx.restore();
    },
  });

  // --- Round management ---

  function startRound() {
    round = Shapes.generateRound(level);
    phase = 'showing';
    phaseTimer = round.displayTime;
    selectedOption = -1;
    feedbackResult = '';
    answerTimeMax = Math.max(Config.answerTimeMin, Config.answerTime - (level - 1) * Config.answerTimeDecay);
    answerTimer = answerTimeMax;
    optionRects = Renderer.getOptionRects(game.w, game.h);
  }

  // --- Phase: Showing the shadow ---

  function updateShowing(dt) {
    phaseTimer -= dt;
    if (phaseTimer <= 0) {
      phase = 'choosing';
      Audio8.play('whoosh');
    }
  }

  function drawShowing(ctx, w, h) {
    // Label
    Renderer.drawShadowLabel(ctx, w, 'MEMORIZE THIS SHAPE');

    // Shadow shape centered in shadow area
    var cy = Config.shadowAreaY + Config.shadowAreaH / 2;
    var alpha = phaseTimer > 0.3 ? 1 : phaseTimer / 0.3;
    Renderer.drawShadowShape(ctx, round.original, w / 2, cy, alpha);

    // Countdown dots
    var dots = Math.ceil(phaseTimer);
    ctx.fillStyle = Config.textDim;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    var dotStr = '';
    for (var i = 0; i < dots; i++) dotStr += '● ';
    ctx.fillText(dotStr.trim(), w / 2, Config.shadowAreaY + Config.shadowAreaH + 10);
  }

  // --- Phase: Choosing ---

  function updateChoosing(dt) {
    answerTimer -= dt;

    // Timer tick sound when low
    if (answerTimer <= 2 && answerTimer > 0) {
      var prev = answerTimer + dt;
      if (Math.floor(prev * 4) !== Math.floor(answerTimer * 4)) {
        Audio8.play('tick');
      }
    }

    // Keyboard input: 1-4
    for (var i = 0; i < Config.optionCount; i++) {
      if (Input.pressed((i + 1).toString())) {
        selectOption(i);
        return;
      }
    }

    // Timeout
    if (answerTimer <= 0) {
      feedbackResult = 'timeout';
      phase = 'feedback';
      phaseTimer = Config.flashDuration + 0.5;
      lives--;
      Audio8.play('error');
      shakeTimer = Config.shakeDuration;
      if (lives <= 0) {
        endGame();
        return;
      }
    }
  }

  function drawChoosing(ctx, w, h) {
    // Shadow area — show "?" placeholder
    Renderer.drawShadowLabel(ctx, w, 'WHICH SHAPE MATCHES?');
    ctx.fillStyle = Config.shadowColor;
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', w / 2, Config.shadowAreaY + Config.shadowAreaH / 2);

    // Timer bar
    Renderer.drawTimerBar(ctx, w, answerTimer / answerTimeMax);

    // Options
    drawOptions(ctx, w, h, '');
  }

  // --- Phase: Feedback ---

  function updateFeedback(dt) {
    phaseTimer -= dt;
    if (phaseTimer <= 0) {
      if (lives <= 0) {
        endGame();
        return;
      }
      // Advance level on correct
      if (feedbackResult === 'correct') {
        level++;
        Shell.setStat('level', level);
        phase = 'levelup';
        phaseTimer = Config.levelTransDuration;
        return;
      }
      // Next round (same level on wrong/timeout)
      startRound();
    }
  }

  function drawFeedback(ctx, w, h) {
    // Show the original shape again in shadow area
    Renderer.drawShadowLabel(ctx, w, feedbackResult === 'correct' ? 'CORRECT!' : 'WRONG!');
    var cy = Config.shadowAreaY + Config.shadowAreaH / 2;
    Renderer.drawShadowShape(ctx, round.original, w / 2, cy, 1);

    // Timer bar frozen
    Renderer.drawTimerBar(ctx, w, answerTimer / answerTimeMax);

    // Options with feedback highlighting
    drawOptions(ctx, w, h, feedbackResult);
  }

  // --- Phase: Level Up ---

  function updateLevelUp(dt) {
    phaseTimer -= dt;
    if (phaseTimer <= 0) {
      startRound();
    }
  }

  // --- Option drawing ---

  function drawOptions(ctx, w, h, state) {
    if (!round) return;
    for (var i = 0; i < Config.optionCount; i++) {
      var rect = optionRects[i];
      var isCorrect = i === round.correctIndex;
      var isSelected = i === selectedOption;

      Renderer.drawOptionBox(ctx, rect, i, isSelected, state, isCorrect);

      // Draw shape in center of option box
      var color = Config.cellColors[i];
      var highlight = null;
      if (state === 'correct' && isCorrect) highlight = Config.correctColor;
      if (state === 'wrong' && isCorrect) highlight = Config.highlightColor;

      Renderer.drawOptionShape(
        ctx,
        round.options[i],
        rect.x + rect.w / 2,
        rect.y + rect.h / 2,
        color,
        highlight,
        1
      );
    }
  }

  // --- Selection logic ---

  function selectOption(index) {
    if (phase !== 'choosing') return;
    selectedOption = index;
    Audio8.play('click');

    if (index === round.correctIndex) {
      // Correct!
      feedbackResult = 'correct';
      var timeBonus = Math.floor(answerTimer * Config.timeBonusMultiplier);
      var levelBonus = level * Config.levelBonusMultiplier;
      var points = Config.basePoints + timeBonus + levelBonus;
      score += points;
      Shell.setStat('score', score);

      scorePopupText = '+' + points;
      scorePopupTimer = 0.8;

      Audio8.play('score');

      // Particles from correct option
      var rect = optionRects[index];
      particles.emit(rect.x + rect.w / 2, rect.y + rect.h / 2, {
        count: 20,
        colors: [Config.correctColor, '#ffffff', Config.cellColors[index]],
        speed: 150,
        life: 0.6,
        size: 4,
      });
    } else {
      // Wrong!
      feedbackResult = 'wrong';
      lives--;
      Audio8.play('error');
      shakeTimer = Config.shakeDuration;

      // Red particles from wrong option
      var wrongRect = optionRects[index];
      particles.emit(wrongRect.x + wrongRect.w / 2, wrongRect.y + wrongRect.h / 2, {
        count: 10,
        color: Config.wrongColor,
        speed: 80,
        life: 0.4,
        size: 3,
      });
    }

    phase = 'feedback';
    phaseTimer = Config.flashDuration + 0.5;
  }

  // --- Game over ---

  function endGame() {
    var isNew = saveHighScore('shadow-match', score);
    if (isNew) best = score;
    Audio8.play('gameover');
    game.gameOver('Score: ' + score + '  Level: ' + level);
  }

  // --- Touch controls ---

  function setupTouchControls() {
    if (!game.canvas) return;

    game.canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      if (phase !== 'choosing') return;

      var rect = game.canvas.getBoundingClientRect();
      var scaleX = game.w / rect.width;
      var scaleY = game.h / rect.height;

      for (var t = 0; t < e.changedTouches.length; t++) {
        var touch = e.changedTouches[t];
        var x = (touch.clientX - rect.left) * scaleX;
        var y = (touch.clientY - rect.top) * scaleY;

        // Check which option was tapped
        for (var i = 0; i < optionRects.length; i++) {
          var or = optionRects[i];
          if (x >= or.x && x <= or.x + or.w && y >= or.y && y <= or.y + or.h) {
            selectOption(i);
            return;
          }
        }
      }
    }, { passive: false });

    game.canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
    }, { passive: false });
  }

  game.start();

})();
