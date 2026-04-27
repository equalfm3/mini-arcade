/* Simon Says — Sequence generation, playback, and input validation */

var Sequence = (function () {

  var steps = [];          // array of button indices (0-3)
  var playbackIndex = 0;   // current step during playback
  var inputIndex = 0;      // current step during player input
  var isPlaying = false;   // true during watch phase playback
  var activeButton = -1;   // currently lit button index (-1 = none)
  var playTimer = null;    // setTimeout id for playback scheduling
  var activeTimer = null;  // setTimeout id for turning off active button

  // Callbacks
  var onPlaybackStep = null;   // called with (buttonIndex) when a step plays
  var onPlaybackDone = null;   // called when playback finishes
  var onCorrect = null;        // called when player gets a step right
  var onRoundComplete = null;  // called when player completes the full sequence
  var onFail = null;           // called with (correctIndex) when player gets it wrong

  function reset() {
    steps = [];
    playbackIndex = 0;
    inputIndex = 0;
    isPlaying = false;
    activeButton = -1;
    clearTimers();
  }

  function clearTimers() {
    if (playTimer) { clearTimeout(playTimer); playTimer = null; }
    if (activeTimer) { clearTimeout(activeTimer); activeTimer = null; }
  }

  /** Add a random step to the sequence */
  function addStep() {
    var next = Math.floor(Math.random() * Config.totalButtons);
    steps.push(next);
  }

  /** Get the current sequence length (= round number) */
  function getLength() {
    return steps.length;
  }

  /** Get the playback interval adjusted for current round */
  function getInterval() {
    var round = steps.length;
    var interval = Config.playbackInterval - (round - 1) * Config.speedRamp;
    return Math.max(interval, Config.minPlaybackInterval);
  }

  /** Start playing back the sequence (watch phase) */
  function startPlayback(callbacks) {
    onPlaybackStep = callbacks.onStep || null;
    onPlaybackDone = callbacks.onDone || null;

    playbackIndex = 0;
    isPlaying = true;
    activeButton = -1;

    // Delay before starting
    playTimer = setTimeout(function () {
      playNextStep();
    }, Config.prePlayDelay * 1000);
  }

  /** Play the next step in the sequence */
  function playNextStep() {
    if (playbackIndex >= steps.length) {
      // Playback complete
      isPlaying = false;
      activeButton = -1;
      if (onPlaybackDone) onPlaybackDone();
      return;
    }

    var btnIdx = steps[playbackIndex];
    activeButton = btnIdx;

    // Play tone
    var btn = Config.buttons[btnIdx];
    Audio8.note(btn.freq, Config.toneDuration, Config.toneType, Config.toneVolume);

    if (onPlaybackStep) onPlaybackStep(btnIdx);

    // Turn off after tone duration
    var interval = getInterval();
    activeTimer = setTimeout(function () {
      activeButton = -1;
      playbackIndex++;

      // Schedule next step after a brief pause
      playTimer = setTimeout(function () {
        playNextStep();
      }, Config.playbackPause * 1000);
    }, (interval - Config.playbackPause) * 1000);
  }

  /** Pause playback (for game pause) */
  function pausePlayback() {
    clearTimers();
  }

  /** Set up for input phase */
  function startInput(callbacks) {
    onCorrect = callbacks.onCorrect || null;
    onRoundComplete = callbacks.onRoundComplete || null;
    onFail = callbacks.onFail || null;
    inputIndex = 0;
    isPlaying = false;
    activeButton = -1;
  }

  /** Handle player pressing a button. Returns 'correct', 'complete', or 'fail' */
  function handleInput(buttonIndex) {
    if (isPlaying) return 'ignore';
    if (inputIndex >= steps.length) return 'ignore';

    var expected = steps[inputIndex];

    // Play the tone for the pressed button
    var btn = Config.buttons[buttonIndex];
    Audio8.note(btn.freq, Config.toneDuration, Config.toneType, Config.toneVolume);

    // Flash the button
    activeButton = buttonIndex;
    clearTimers();
    activeTimer = setTimeout(function () {
      activeButton = -1;
    }, 200);

    if (buttonIndex === expected) {
      inputIndex++;

      if (inputIndex >= steps.length) {
        // Completed the full sequence
        if (onRoundComplete) onRoundComplete();
        return 'complete';
      }

      if (onCorrect) onCorrect(inputIndex);
      return 'correct';
    } else {
      // Wrong button
      if (onFail) onFail(expected);
      return 'fail';
    }
  }

  /** Get the currently active (lit) button index, or -1 */
  function getActiveButton() {
    return activeButton;
  }

  /** Get the full sequence (for debugging/display) */
  function getSteps() {
    return steps.slice();
  }

  /** Get current input progress */
  function getInputIndex() {
    return inputIndex;
  }

  return {
    reset: reset,
    addStep: addStep,
    getLength: getLength,
    startPlayback: startPlayback,
    pausePlayback: pausePlayback,
    startInput: startInput,
    handleInput: handleInput,
    getActiveButton: getActiveButton,
    getSteps: getSteps,
    getInputIndex: getInputIndex,
    clearTimers: clearTimers,
    get isPlaying() { return isPlaying; },
  };
})();
