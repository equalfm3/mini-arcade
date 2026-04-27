/* Sound Memory — Sequence generation, playback scheduling, input validation */

var Sequence = (function () {

  var steps = [];          // array of button indices (0-5)
  var playbackIndex = 0;   // current step during listen phase
  var inputIndex = 0;      // current step during play phase
  var activeButton = -1;   // currently highlighted button (-1 = none)
  var playTimer = null;    // setTimeout id for playback scheduling
  var activeTimer = null;  // setTimeout id for turning off highlight

  // Callbacks
  var onPlaybackDone = null;

  function reset() {
    steps = [];
    playbackIndex = 0;
    inputIndex = 0;
    activeButton = -1;
    clearTimers();
  }

  function clearTimers() {
    if (playTimer) { clearTimeout(playTimer); playTimer = null; }
    if (activeTimer) { clearTimeout(activeTimer); activeTimer = null; }
  }

  /** Add a random button to the sequence */
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
    var interval = Config.listenInterval - (round - 1) * Config.speedRamp;
    return Math.max(interval, Config.minListenInterval);
  }

  /** Start playing back the sequence (listen phase — audio only, no visual cues) */
  function startPlayback(callbacks) {
    onPlaybackDone = (callbacks && callbacks.onDone) || null;

    playbackIndex = 0;
    activeButton = -1;

    // Delay before starting
    playTimer = setTimeout(function () {
      playNextStep();
    }, Config.listenPreDelay * 1000);
  }

  /** Play the next step in the sequence */
  function playNextStep() {
    if (playbackIndex >= steps.length) {
      // Playback complete
      activeButton = -1;
      if (onPlaybackDone) onPlaybackDone();
      return;
    }

    var btnIdx = steps[playbackIndex];
    // Audio only — no visual highlight during listen phase
    // (the waveform visualization will show audio activity)
    Tones.playButton(btnIdx, Config.toneDuration);

    var interval = getInterval();

    // Schedule next step
    playTimer = setTimeout(function () {
      playbackIndex++;
      playNextStep();
    }, interval * 1000);
  }

  /** Pause playback (for game pause) */
  function pausePlayback() {
    clearTimers();
  }

  /** Prepare for input phase */
  function startInput() {
    inputIndex = 0;
    activeButton = -1;
  }

  /** Handle player pressing a button. Returns 'correct', 'complete', or 'fail' */
  function handleInput(buttonIndex) {
    if (inputIndex >= steps.length) return 'ignore';

    var expected = steps[inputIndex];

    // Play the tone for the pressed button (feedback)
    Tones.playButton(buttonIndex, Config.toneDuration);

    // Set active for visual feedback
    activeButton = buttonIndex;
    clearTimers();
    activeTimer = setTimeout(function () {
      activeButton = -1;
    }, 250);

    if (buttonIndex === expected) {
      inputIndex++;

      if (inputIndex >= steps.length) {
        return 'complete';
      }
      return 'correct';
    } else {
      return 'fail';
    }
  }

  /** Get the currently active (highlighted) button index, or -1 */
  function getActiveButton() {
    return activeButton;
  }

  /** Set active button externally (for learn phase) */
  function setActiveButton(index) {
    activeButton = index;
  }

  /** Get the full sequence */
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
    setActiveButton: setActiveButton,
    getSteps: getSteps,
    getInputIndex: getInputIndex,
    clearTimers: clearTimers,
  };
})();
