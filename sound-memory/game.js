/* Sound Memory — Main game orchestrator

   Modules loaded before this file:
   - Config    (src/config.js)    — button notes, layout, timing
   - Tones     (src/tones.js)     — Web Audio tone generation, waveform data
   - Sequence  (src/sequence.js)  — sequence generation, playback, input validation
   - Renderer  (src/renderer.js)  — DOM buttons, waveform display, phase text

   Shared globals available:
   - Engine, Input, Shell, Audio8, etc.

   This is a DOM game — no canvas needed.
   Engine.create() without the canvas option provides the state machine,
   pause/resume/restart, and overlay management.

   Game flow:
   1. LEARN phase — each button highlights and plays its tone so player learns the mapping
   2. LISTEN phase — a sequence of tones plays (audio only, no visual cues)
   3. PLAY phase — player reproduces the sequence by pressing buttons
   4. Each round adds one more tone to the sequence
   5. Wrong button = game over
*/

(function () {

  var round = 0;
  var best = loadHighScore('sound-memory');
  var phase = 'idle';       // 'idle', 'learn', 'listen', 'play'
  var inputTimer = null;    // timeout for player input deadline
  var learnTimers = [];     // timeouts for learn phase

  function onButtonClick(index) {
    if (!game.is('playing')) return;
    if (phase !== 'play') return;

    // Clear input timeout — player responded
    clearInputTimer();

    var result = Sequence.handleInput(index);
    Renderer.update();

    if (result === 'correct') {
      // Correct step — restart input timeout for next step
      startInputTimer();
    } else if (result === 'complete') {
      // Completed the round
      round++;
      Shell.setStat('round', round);
      Audio8.play('score');
      Renderer.setStatus('Round ' + round + ' complete!', 'listen');

      if (saveHighScore('sound-memory', round)) {
        best = round;
      }
      Shell.setStat('best', best);

      // Start next round after a brief pause
      setTimeout(function () {
        if (!game.is('playing')) return;
        startListenPhase();
      }, 1200);
    } else if (result === 'fail') {
      // Wrong button — game over
      handleGameOver(index);
    }
  }

  /** Learn phase: highlight each button and play its tone so player can learn the mapping */
  function startLearnPhase() {
    phase = 'learn';
    clearLearnTimers();
    Renderer.disableButtons();
    Renderer.setStatus('Learning...', 'learn');

    var delay = Config.learnDelay * 1000;
    var stepTime = (Config.learnToneDuration + Config.learnGap) * 1000;

    for (var i = 0; i < Config.totalButtons; i++) {
      (function (idx) {
        var t1 = setTimeout(function () {
          if (!game.is('playing') || phase !== 'learn') return;
          Tones.playButton(idx, Config.learnToneDuration);
          Renderer.flashButton(idx, Config.learnToneDuration * 1000);
        }, delay + idx * stepTime);
        learnTimers.push(t1);
      })(i);
    }

    // After all buttons have been shown, start the listen phase
    var totalLearnTime = delay + Config.totalButtons * stepTime + 400;
    var t2 = setTimeout(function () {
      if (!game.is('playing')) return;
      startListenPhase();
    }, totalLearnTime);
    learnTimers.push(t2);
  }

  /** Listen phase: play the sequence (audio only — no visual cues) */
  function startListenPhase() {
    phase = 'listen';
    clearInputTimer();
    Renderer.disableButtons();
    Renderer.resetButtons();
    Renderer.setStatus('Listen...', 'listen');

    // Add a new step to the sequence
    Sequence.addStep();

    // Play back the full sequence (audio only)
    Sequence.startPlayback({
      onDone: function () {
        // Transition to play phase
        startPlayPhase();
      },
    });
  }

  /** Play phase: player reproduces the sequence */
  function startPlayPhase() {
    phase = 'play';
    Renderer.enableButtons();
    Renderer.setStatus('Your turn!', 'play');

    Sequence.startInput();

    // Start input timeout
    startInputTimer();
  }

  function startInputTimer() {
    clearInputTimer();
    inputTimer = setTimeout(function () {
      if (!game.is('playing') || phase !== 'play') return;
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

  function clearLearnTimers() {
    for (var i = 0; i < learnTimers.length; i++) {
      clearTimeout(learnTimers[i]);
    }
    learnTimers = [];
  }

  function clearAllTimers() {
    clearInputTimer();
    clearLearnTimers();
    Sequence.clearTimers();
  }

  function handleGameOver(wrongIndex) {
    phase = 'idle';
    clearAllTimers();
    Renderer.disableButtons();

    if (wrongIndex >= 0) {
      Renderer.flashWrong(wrongIndex);
    }

    Audio8.play('gameover');
    Renderer.setStatus('Wrong!', 'fail');

    var isNewBest = false;
    if (saveHighScore('sound-memory', round)) {
      best = round;
      isNewBest = true;
    }

    setTimeout(function () {
      game.gameOver('Round ' + round + (isNewBest ? ' ★ New Best!' : ' · Best: ' + best));
    }, 1200);
  }

  // --- Engine setup (no canvas) ---
  var game = Engine.create({
    startHint: 'Listen to the tones, then repeat the sequence!',

    init: function () {
      Input.init();
      Shell.setStat('best', best);
    },

    reset: function () {
      round = 0;
      phase = 'idle';
      clearAllTimers();

      Sequence.reset();
      Renderer.build(Shell.area, onButtonClick);
      Renderer.resetButtons();
      Renderer.disableButtons();

      Shell.setStat('round', 0);
      Shell.setStat('best', best);

      // Unlock audio context
      Tones.resume();

      // Start the learn phase after a brief delay
      setTimeout(function () {
        if (!game.is('playing')) return;
        startLearnPhase();
      }, 300);
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
        clearAllTimers();
        Renderer.stopWaveformAnimation();
      }
      if (to === 'playing' && from === 'paused') {
        Renderer.startWaveformAnimation();
        // Resume: restart the current phase
        if (phase === 'learn') {
          // Restart learn phase from scratch
          startLearnPhase();
        } else if (phase === 'listen') {
          // Restart sequence playback
          Sequence.startPlayback({
            onDone: function () { startPlayPhase(); },
          });
        } else if (phase === 'play') {
          startInputTimer();
        }
      }
    },
  });

  game.start();

})();
