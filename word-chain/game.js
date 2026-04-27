/* Word Chain — Main game orchestrator

   Modules loaded before this file:
   - Config      (src/config.js)      — timer, scoring, AI settings, colors
   - Dictionary  (src/dictionary.js)  — word list, validation, AI word lookup
   - Chain       (src/chain.js)       — chain state, word submission, scoring
   - Renderer    (src/renderer.js)    — DOM: mode select, letter, input, history

   Two modes:
   - Solo: player chains words against the clock. Score = sum of word points.
   - vs AI: player and AI alternate turns. Timer still runs. AI can fail
     (no valid word) which means player wins.
*/

(function () {

  var timer = null;
  var timerTotal = Config.timerDuration;
  var started = false;
  var bestScore = loadHighScore('word-chain');
  var gameMode = 'solo';  // 'solo' or 'vs'
  var aiTurnActive = false;
  var aiTimeout = null;
  var modeSelected = false;

  /** Calculate score for display */
  function currentScore() {
    return Chain.score;
  }

  /** Handle word submission (Enter key) */
  function submitWord() {
    if (!game.is('playing')) return;
    if (gameMode === 'vs' && aiTurnActive) return; // Not player's turn

    var word = Renderer.getInputValue().trim().toLowerCase();
    if (!word) return;

    // Start timer on first submission
    if (!started) {
      started = true;
      timer.start();
    }

    var result = Chain.submit(word, 'player');

    if (result.valid) {
      var isLong = word.length >= Config.longWordLength;
      Audio8.play(isLong ? 'clear' : 'score');

      // Add bonus time
      timerTotal += Config.bonusTime;
      timer.reset(timer.remaining + Config.bonusTime);
      timer.start();

      // Update display
      Shell.setStat('score', currentScore());
      Shell.setStat('chain', Chain.length);
      Renderer.clearInput();
      Renderer.setRequiredLetter(Chain.requiredLetter);
      Renderer.pulseLetter();
      Renderer.renderHistory(Chain.history);
      Renderer.setTimer(timer.remaining, timerTotal);

      var label = Chain.getScoreLabel(word);
      if (label) {
        Renderer.showMessage(label, 'success');
      } else if (isLong) {
        Renderer.showMessage('+' + result.points + 'pts', 'success');
      }

      // In vs mode, trigger AI turn
      if (gameMode === 'vs') {
        startAiTurn();
      } else {
        Renderer.focusInput();
      }
    } else {
      Audio8.play('error');
      Renderer.shakeInput();
      Renderer.showMessage(result.error, 'error');
      Renderer.focusInput();
    }
  }

  /** AI takes its turn */
  function startAiTurn() {
    if (!game.is('playing')) return;
    aiTurnActive = true;
    Renderer.setInputEnabled(false);
    Renderer.setTurn('ai');

    var delay = Config.aiDelayMin + Math.random() * (Config.aiDelayMax - Config.aiDelayMin);

    aiTimeout = setTimeout(function () {
      if (!game.is('playing')) return;

      var letter = Chain.requiredLetter;
      var preferLong = Math.random() < Config.aiPreferLong;
      var aiWord = Dictionary.getRandomWord(letter, Chain.usedWords, preferLong);

      if (!aiWord) {
        // AI can't find a word — player wins!
        Audio8.play('win');
        aiTurnActive = false;
        finishGame(true);
        return;
      }

      var result = Chain.submit(aiWord, 'ai');
      if (result.valid) {
        Audio8.play('click');

        Shell.setStat('chain', Chain.length);
        Renderer.setRequiredLetter(Chain.requiredLetter);
        Renderer.pulseLetter();
        Renderer.renderHistory(Chain.history);

        Renderer.showMessage('AI: ' + aiWord + ' (+' + result.points + 'pts)', 'success');
      }

      // Back to player
      aiTurnActive = false;
      Renderer.setInputEnabled(true);
      Renderer.setTurn('player');
      Renderer.focusInput();
    }, delay);
  }

  /** Finish the game */
  function finishGame(playerWins) {
    var finalScore = currentScore();

    if (playerWins) {
      Audio8.play('win');
    } else {
      Audio8.play('gameover');
    }

    // Check for new best
    var isNewBest = false;
    if (finalScore > bestScore) {
      if (saveHighScore('word-chain', finalScore)) {
        bestScore = finalScore;
        isNewBest = true;
      }
    }

    var scoreText = 'Score: ' + finalScore + ' · Chain: ' + Chain.length + ' words';
    if (gameMode === 'vs' && playerWins) {
      scoreText = 'AI stumped! ' + scoreText;
    }
    if (Chain.lastWord) {
      scoreText += ' · Last: ' + Chain.lastWord;
    }
    if (isNewBest) {
      scoreText += ' · New Best!';
    }

    game.gameOver(scoreText);
  }

  /** Handle keydown on the input */
  function onInputKeyDown(e) {
    if (!game.is('playing')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      submitWord();
      return;
    }

    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      Audio8.play('click');
    }
  }

  /** Show mode selection screen */
  function showModeSelect() {
    modeSelected = false;
    Renderer.buildModeSelector(Shell.area, function (mode) {
      gameMode = mode;
      modeSelected = true;
      game.play();
    });
  }

  // --- Engine setup ---
  var game = Engine.create({
    startHint: Dictionary.count.toLocaleString() + ' words loaded · Choose a mode to play!',

    init: function () {
      Input.init();
      if (bestScore > 0) {
        Shell.setStat('score', bestScore);
      }
    },

    reset: function () {
      Chain.reset();
      started = false;
      aiTurnActive = false;
      clearTimeout(aiTimeout);
      timerTotal = Config.timerDuration;

      // Set up countdown timer
      timer = Timer.countdown(Config.timerDuration,
        function (remaining) {
          Shell.setStat('time', remaining);
          Renderer.setTimer(remaining, timerTotal);
        },
        function () {
          finishGame(false);
        }
      );

      Shell.setStat('time', Config.timerDuration);
      Shell.setStat('score', 0);
      Shell.setStat('chain', 0);

      // Build game DOM
      Shell.area.innerHTML = '';
      Renderer.build(Shell.area);
      Renderer.setRequiredLetter('');
      Renderer.renderHistory([]);
      Renderer.setTimer(Config.timerDuration, Config.timerDuration);

      // Show turn indicator in vs mode
      if (gameMode === 'vs') {
        Renderer.setTurn('player');
      } else {
        Renderer.setTurn(null);
      }

      // Bind input events
      var input = Renderer.getInput();
      if (input) {
        input.addEventListener('keydown', onInputKeyDown);
      }

      Shell.area.addEventListener('click', function () {
        if (game.is('playing')) {
          Renderer.focusInput();
        }
      });

      setTimeout(function () {
        Renderer.focusInput();
      }, 100);
    },

    update: function (dt) {
      if (Input.pressed('Escape')) {
        if (game.is('playing')) {
          if (timer) timer.pause();
        }
        game.togglePause();
        Input.endFrame();
        return;
      }
      Input.endFrame();
    },

    onStateChange: function (from, to) {
      if (to === 'playing' && from === 'paused') {
        if (started && timer) {
          timer.start();
        }
        setTimeout(function () {
          Renderer.focusInput();
        }, 100);
      }
      if (to === 'paused') {
        if (timer) timer.pause();
        clearTimeout(aiTimeout);
      }
    },

    onRestart: function () {
      clearTimeout(aiTimeout);
      aiTurnActive = false;
      Shell.hideOverlay();
      showModeSelect();
    },
  });

  // Override start to show mode select first
  var originalStart = game.start.bind(game);
  game.start = function () {
    // Run init
    originalStart();
    // Replace the default overlay with mode selection
    Shell.hideOverlay();
    showModeSelect();
  };

  // Override play to handle mode selection flow
  var originalPlay = game.play.bind(game);
  game.play = function () {
    if (!modeSelected) {
      showModeSelect();
      return;
    }
    originalPlay();
  };

  game.start();

})();
