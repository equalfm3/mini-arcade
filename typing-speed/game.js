/* Typing Speed — Main game orchestrator

   Modules loaded before this file:
   - Config    (src/config.js)    — round duration, colors, WPM thresholds
   - Words     (src/words.js)     — word pool, passage generation, line wrapping
   - Renderer  (src/renderer.js)  — DOM word display, character coloring, stats

   Shared globals available:
   - Engine, Input, Shell, Audio8, Timer, etc.

   This is a DOM game — Engine.create() without canvas option.
   Engine provides the state machine, pause/resume/restart, and overlay management.

   Input handling: physical keyboard events are captured via a direct keydown
   listener (since Input module doesn't track individual letter presses well).
   Input module is still used for Esc pause.

   WPM formula: WPM = (correctCharacters / 5) / elapsedMinutes
   Standard WPM uses 5 characters = 1 word.
*/

(function () {

  // --- Game state ---
  var passage = [];          // array of words for this round
  var lines = [];            // passage broken into display lines
  var wordIndex = 0;         // current word index in passage
  var typed = '';             // characters typed for current word
  var correctChars = 0;      // total correct characters typed
  var totalChars = 0;        // total characters typed (including wrong)
  var wordsCompleted = 0;    // words successfully completed
  var timer = null;          // countdown timer
  var elapsed = 0;           // seconds elapsed (for WPM calc)
  var elapsedInterval = null;
  var started = false;       // has the player started typing?
  var bestWpm = loadHighScore('typing-speed');
  var currentLineIdx = 0;

  // Hidden input element for mobile keyboard support
  var hiddenInput = null;

  /** Calculate WPM */
  function calcWPM() {
    if (elapsed <= 0) return 0;
    var minutes = elapsed / 60;
    return Math.round((correctChars / 5) / minutes);
  }

  /** Calculate accuracy percentage */
  function calcAccuracy() {
    if (totalChars <= 0) return 100;
    return Math.round((correctChars / totalChars) * 100);
  }

  /** Get WPM rating */
  function getRating(wpm) {
    for (var i = 0; i < Config.ratings.length; i++) {
      if (wpm >= Config.ratings[i].min) {
        return Config.ratings[i];
      }
    }
    return Config.ratings[Config.ratings.length - 1];
  }

  /** Advance to the next word */
  function advanceWord() {
    var currentWord = passage[wordIndex];
    wordsCompleted++;
    Audio8.play('score');

    wordIndex++;
    typed = '';

    // Update renderer state
    syncRenderer();

    // Check if we've run out of words (unlikely with 200)
    if (wordIndex >= passage.length) {
      finishGame();
    }
  }

  /** Sync renderer with current game state */
  function syncRenderer() {
    Renderer.setState({
      words: passage,
      wordIndex: wordIndex,
      typed: typed,
      lines: lines,
      currentLineIdx: currentLineIdx,
    });
  }

  /** Full render update */
  function renderAll() {
    var wpm = calcWPM();
    var acc = calcAccuracy();
    syncRenderer();
    Renderer.render(wpm, acc, wordsCompleted, correctChars, totalChars);
    Shell.setStat('wpm', wpm);
    Shell.setStat('acc', acc + '%');
  }

  /** Start the elapsed timer (separate from countdown for precision) */
  function startElapsedTimer() {
    elapsed = 0;
    clearInterval(elapsedInterval);
    elapsedInterval = setInterval(function () {
      if (game.is('playing')) {
        elapsed++;
      }
    }, 1000);
  }

  /** Finish the game — time's up or words exhausted */
  function finishGame() {
    clearInterval(elapsedInterval);
    if (timer) timer.pause();

    var finalWpm = calcWPM();
    var finalAcc = calcAccuracy();

    Audio8.play('gameover');

    // Check for new best
    var isNewBest = false;
    if (finalWpm > bestWpm) {
      if (saveHighScore('typing-speed', finalWpm)) {
        bestWpm = finalWpm;
        isNewBest = true;
      }
    }

    if (isNewBest) {
      Audio8.play('win');
    }

    var rating = getRating(finalWpm);
    var scoreText = finalWpm + ' WPM · ' + finalAcc + '% accuracy · ' + wordsCompleted + ' words';
    if (isNewBest) {
      scoreText += ' · New Best!';
    }

    game.gameOver(scoreText);
  }

  /** Handle a character typed by the player */
  function handleChar(ch) {
    if (!game.is('playing')) return;

    var currentWord = passage[wordIndex];
    if (!currentWord) return;

    // Start timer on first keypress
    if (!started) {
      started = true;
      timer.start();
      startElapsedTimer();
    }

    totalChars++;

    var expectedChar = currentWord[typed.length];
    if (ch === expectedChar) {
      correctChars++;
      Audio8.play('click');
    } else {
      Audio8.play('error');
    }

    typed += ch;

    renderAll();
  }

  /** Handle space — only advances if word is fully and correctly typed */
  function handleSpace() {
    if (!game.is('playing')) return;

    var currentWord = passage[wordIndex];
    if (!currentWord) return;

    // Start timer on first keypress
    if (!started) {
      started = true;
      timer.start();
      startElapsedTimer();
    }

    totalChars++;

    // Only advance if the word was typed correctly
    if (typed === currentWord) {
      correctChars++; // count the space as correct
      advanceWord();
    } else {
      // Wrong — space pressed before word is complete or with errors
      Audio8.play('error');
    }

    renderAll();
  }

  /** Handle backspace */
  function handleBackspace() {
    if (!game.is('playing')) return;
    if (typed.length <= 0) return;

    typed = typed.slice(0, -1);
    renderAll();
  }

  // --- Keyboard event listener (direct, not through Input module) ---
  function onKeyDown(e) {
    if (!game.is('playing')) return;

    // Let Esc through for pause handling by Input module
    if (e.key === 'Escape') return;

    // Prevent default for typing keys to avoid page scrolling etc.
    if (e.key.length === 1 || e.key === 'Backspace') {
      e.preventDefault();
    }

    if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === ' ') {
      handleSpace();
    } else if (e.key.length === 1 && e.key !== ' ') {
      // Single printable character
      handleChar(e.key);
    }
  }

  // --- Engine setup (no canvas — DOM game) ---
  var game = Engine.create({
    startHint: 'Type the words as fast as you can! (Desktop recommended)',

    init: function () {
      Input.init();

      // Show best WPM
      if (bestWpm > 0) {
        Shell.setStat('wpm', bestWpm);
      }

      // Create hidden input for mobile keyboard
      hiddenInput = document.createElement('input');
      hiddenInput.type = 'text';
      hiddenInput.className = 'ts-hidden-input';
      hiddenInput.setAttribute('autocomplete', 'off');
      hiddenInput.setAttribute('autocorrect', 'off');
      hiddenInput.setAttribute('autocapitalize', 'off');
      hiddenInput.setAttribute('spellcheck', 'false');
      document.body.appendChild(hiddenInput);

      // Direct keyboard listener
      document.addEventListener('keydown', onKeyDown);
    },

    reset: function () {
      // Generate new passage
      passage = Words.generatePassage();
      lines = Words.wrapLines(passage);
      wordIndex = 0;
      typed = '';
      correctChars = 0;
      totalChars = 0;
      wordsCompleted = 0;
      started = false;
      elapsed = 0;
      currentLineIdx = 0;

      clearInterval(elapsedInterval);

      // Set up countdown timer
      timer = Timer.countdown(Config.roundDuration,
        function (remaining) {
          Shell.setStat('time', remaining);
        },
        function () {
          // Time's up!
          finishGame();
        }
      );

      Shell.setStat('time', Config.roundDuration);
      Shell.setStat('wpm', 0);
      Shell.setStat('acc', '100%');

      // Build DOM
      Shell.area.innerHTML = '';
      Renderer.build(Shell.area);
      syncRenderer();
      renderAll();

      // Focus hidden input for mobile
      if (hiddenInput) {
        hiddenInput.value = '';
      }

      // Tap on game area focuses hidden input (for mobile keyboard)
      Shell.area.addEventListener('click', function () {
        if (hiddenInput && game.is('playing')) {
          hiddenInput.focus();
        }
      });
    },

    update: function (dt) {
      // Pause via Esc only (not P, since P is a typing key)
      if (Input.pressed('Escape')) {
        if (game.is('playing')) {
          // Pause timer
          if (timer) timer.pause();
          clearInterval(elapsedInterval);
        }
        game.togglePause();
        Input.endFrame();
        return;
      }

      Input.endFrame();
    },

    onStateChange: function (from, to) {
      if (to === 'playing' && from === 'paused') {
        // Resume timer
        if (started && timer) {
          timer.start();
          // Restart elapsed counter
          elapsedInterval = setInterval(function () {
            if (game.is('playing')) {
              elapsed++;
            }
          }, 1000);
        }
      }
      if (to === 'paused') {
        if (timer) timer.pause();
        clearInterval(elapsedInterval);
      }
    },
  });

  game.start();

})();

