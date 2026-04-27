/* Wordle — Main game orchestrator

   Modules loaded before this file:
   - Config     (src/config.js)     — word length, max guesses, colors
   - Words      (src/words.js)      — target + valid guess word lists
   - Evaluator  (src/evaluator.js)  — letter evaluation (correct/present/absent)
   - Keyboard   (src/keyboard.js)   — on-screen keyboard with color state
   - Renderer   (src/renderer.js)   — DOM grid, tile flip animation

   Shared globals available:
   - Engine, Input, Shell, Audio8, etc.

   This is a DOM game — Engine.create() without canvas option.
   Engine provides the state machine, pause/resume/restart, and overlay management.
*/

(function () {

  var target = '';         // current target word (lowercase)
  var currentRow = 0;      // which guess row we're on (0-5)
  var currentCol = 0;      // which column in the current row (0-4)
  var currentWord = '';    // letters typed so far in current row
  var locked = false;      // true during flip animation
  var wins = 0;
  var played = 0;
  var streak = 0;
  var bestStreak = loadHighScore('wordle');

  /** Handle a key press from keyboard (physical or on-screen) */
  function handleKey(key) {
    if (!game.is('playing')) return;
    if (locked) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACK') {
      deleteLetter();
    } else if (/^[A-Z]$/.test(key)) {
      typeLetter(key);
    }
  }

  /** Type a letter into the current position */
  function typeLetter(letter) {
    if (currentCol >= Config.wordLength) return;

    currentWord += letter.toLowerCase();
    Renderer.setLetter(currentRow, currentCol, letter);
    Renderer.popTile(currentRow, currentCol);
    Audio8.play('click');
    currentCol++;
  }

  /** Delete the last typed letter */
  function deleteLetter() {
    if (currentCol <= 0) return;

    currentCol--;
    currentWord = currentWord.slice(0, -1);
    Renderer.setLetter(currentRow, currentCol, '');
    Audio8.play('click');
  }

  /** Submit the current guess */
  function submitGuess() {
    if (currentWord.length < Config.wordLength) {
      Renderer.shakeRow(currentRow);
      Audio8.play('error');
      Renderer.setStatus('Not enough letters', 'error');
      clearStatusAfter(1500);
      return;
    }

    if (!Words.isValid(currentWord)) {
      Renderer.shakeRow(currentRow);
      Audio8.play('error');
      Renderer.setStatus('Not in word list', 'error');
      clearStatusAfter(1500);
      return;
    }

    // Evaluate the guess
    var results = Evaluator.evaluate(currentWord, target);
    locked = true;

    Audio8.play('move');

    // Reveal tiles with flip animation
    Renderer.revealRow(currentRow, currentWord, results, function () {
      // Update keyboard colors
      Keyboard.updateKeys(currentWord, results);

      // Play sound for results
      var hasCorrect = false;
      for (var i = 0; i < results.length; i++) {
        if (results[i] === Config.states.correct) hasCorrect = true;
      }
      if (hasCorrect) Audio8.play('score');

      // Check win
      if (Evaluator.isWin(results)) {
        handleWin();
        return;
      }

      // Check lose (used all guesses)
      currentRow++;
      Shell.setStat('guess', currentRow + '/' + Config.maxGuesses);

      if (currentRow >= Config.maxGuesses) {
        handleLose();
        return;
      }

      // Ready for next guess
      currentCol = 0;
      currentWord = '';
      locked = false;
    });
  }

  /** Handle win */
  function handleWin() {
    wins++;
    played++;
    streak++;
    if (saveHighScore('wordle', streak)) {
      bestStreak = streak;
    }

    Renderer.bounceRow(currentRow);
    Audio8.play('win');

    var guessNum = currentRow + 1;
    var messages = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'];
    Renderer.setStatus(messages[currentRow] || 'Nice!', 'win');

    setTimeout(function () {
      game.win(guessNum + '/6 · Streak ' + streak);
    }, Config.winDelay * 1000);
  }

  /** Handle lose */
  function handleLose() {
    played++;
    streak = 0;

    Audio8.play('gameover');
    Renderer.setStatus(target.toUpperCase(), 'lose');

    setTimeout(function () {
      game.gameOver('The word was: ' + target.toUpperCase());
    }, Config.loseDelay * 1000);
  }

  /** Clear status message after a delay */
  var statusTimeout = null;
  function clearStatusAfter(ms) {
    clearTimeout(statusTimeout);
    statusTimeout = setTimeout(function () {
      Renderer.setStatus('');
    }, ms);
  }

  /** Map physical keyboard events to our key format */
  function mapPhysicalKey(key) {
    if (key === 'Enter') return 'ENTER';
    if (key === 'Backspace') return 'BACK';
    if (/^[a-zA-Z]$/.test(key) && key.length === 1) return key.toUpperCase();
    return null;
  }

  // --- Engine setup (no canvas — DOM game) ---
  var game = Engine.create({
    startHint: 'Guess the 5-letter word in 6 tries',

    init: function () {
      Input.init();
    },

    reset: function () {
      target = Words.pickTarget();
      currentRow = 0;
      currentCol = 0;
      currentWord = '';
      locked = false;

      Shell.area.innerHTML = '';
      Renderer.build(Shell.area);
      Keyboard.build(Shell.area, handleKey);

      Shell.setStat('guess', '0/' + Config.maxGuesses);
    },

    update: function (dt) {
      // Pause / resume
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // Physical keyboard input (only when playing and not locked)
      if (game.is('playing') && !locked) {
        // Check all letter keys + Enter + Backspace
        var keysToCheck = 'abcdefghijklmnopqrstuvwxyz'.split('');
        keysToCheck.push('Enter', 'Backspace');

        for (var i = 0; i < keysToCheck.length; i++) {
          if (Input.pressed(keysToCheck[i])) {
            var mapped = mapPhysicalKey(keysToCheck[i]);
            if (mapped) handleKey(mapped);
          }
        }
      }

      Input.endFrame();
    },
  });

  game.start();

})();
