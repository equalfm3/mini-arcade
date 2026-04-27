/* Simon Says — Main game orchestrator

   Modules loaded before this file:
   - Config    (src/config.js)    — button colors, tone frequencies, timing
   - Sequence  (src/sequence.js)  — sequence generation, playback, input validation
   - Renderer  (src/renderer.js)  — DOM button grid, light-up animation

   Shared globals available:
   - Engine, Input, Shell, Audio8, etc.

   This is a DOM game — no canvas needed.
   Engine.create() without the canvas option provides the state machine,
   pause/resume/restart, and overlay management.
*/

(function () {

  var round = 0;
  var best = loadHighScore('simon-says');
  var phase = 'idle';       // 'idle', 'watch', 'input'
  var inputTimer = null;    // timeout for player input deadline

  function onButtonClick(index) {
    if (!game.is('playing')) return;
    if (phase !== 'input') return;

    // Clear input timeout — player responded
    clearInputTimer();

    var result = Sequence.handleInput(index);

    if (result === 'correct') {
      // Correct step — restart input timeout for next step
      startInputTimer();
    } else if (result === 'complete') {
      // Completed the round
      round++;
      Shell.setStat('round', round);
      Audio8.play('score');
      Renderer.setStatus('Round ' + round + ' complete!', 'watch');

      if (saveHighScore('simon-says', round)) {
        best = round;
      }
      Shell.setStat('best', best);

      // Start next round after a brief pause
      setTimeout(function () {
        if (!game.is('playing')) return;
        startWatchPhase();
      }, 1000);
    } else if (result === 'fail') {
      // Wrong button — game over
      handleGameOver(index);
    }
  }

  function startWatchPhase() {
    phase = 'watch';
    clearInputTimer();
    Renderer.disableButtons();
    Renderer.setStatus('Watch...', 'watch');

    // Add a new step to the sequence
    Sequence.addStep();

    // Play back the full sequence
    Sequence.startPlayback({
      onStep: function (btnIdx) {
        Renderer.update();
      },
      onDone: function () {
        Renderer.update();
        // Transition to input phase
        startInputPhase();
      },
    });
  }

  function startInputPhase() {
    phase = 'input';
    Renderer.enableButtons();
    Renderer.setStatus('Your turn!', 'input');

    Sequence.startInput({
      onCorrect: function (nextIndex) {
        // Player got a step right, keep going
      },
      onRoundComplete: function () {
        // Handled in onButtonClick
      },
      onFail: function (correctIndex) {
        // Handled in onButtonClick
      },
    });

    // Start input timeout
    startInputTimer();
  }

  function startInputTimer() {
    clearInputTimer();
    inputTimer = setTimeout(function () {
      if (!game.is('playing') || phase !== 'input') return;
      // Timed out — game over
      handleGameOver(-1);
    }, Config.inputTimeout * 1000);
  }

  function clearInputTimer() {
    if (inputTimer) {
      clearTimeout(inputTimer);
      inputTimer = null;
    }
  }

  function handleGameOver(wrongIndex) {
    phase = 'idle';
    clearInputTimer();
    Sequence.clearTimers();
    Renderer.disableButtons();

    if (wrongIndex >= 0) {
      Renderer.flashWrong(wrongIndex);
    }

    Audio8.play('gameover');
    Renderer.setStatus('Wrong!', 'fail');

    var isNewBest = false;
    if (saveHighScore('simon-says', round)) {
      best = round;
      isNewBest = true;
    }

    setTimeout(function () {
      game.gameOver('Round ' + round + (isNewBest ? ' ★ New Best!' : ' · Best: ' + best));
    }, 1200);
  }

  // --- Engine setup (no canvas) ---
  var game = Engine.create({
    startHint: 'Watch the sequence, then repeat it!',

    init: function () {
      Input.init();
      Shell.setStat('best', best);
    },

    reset: function () {
      round = 0;
      phase = 'idle';
      clearInputTimer();

      Sequence.reset();
      Renderer.build(Shell.area, onButtonClick);
      Renderer.resetButtons();
      Renderer.enableButtons();

      Shell.setStat('round', 0);
      Shell.setStat('best', best);

      // Start the first watch phase after a brief delay
      setTimeout(function () {
        if (!game.is('playing')) return;
        startWatchPhase();
      }, 500);
    },

    update: function (dt) {
      // Pause
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // Update renderer to reflect active button state
      Renderer.update();

      Input.endFrame();
    },

    onStateChange: function (from, to) {
      // Pause/resume timers alongside Engine state
      if (to === 'paused') {
        clearInputTimer();
        Sequence.pausePlayback();
      }
      if (to === 'playing' && from === 'paused') {
        // Resume: if we were in watch phase, restart playback
        // For simplicity, restart the current round's playback
        if (phase === 'watch') {
          Sequence.startPlayback({
            onStep: function () { Renderer.update(); },
            onDone: function () { Renderer.update(); startInputPhase(); },
          });
        } else if (phase === 'input') {
          startInputTimer();
        }
      }
    },
  });

  game.start();

})();
