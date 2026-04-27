/* Sound Memory — Web Audio tone generation with waveform visualization */

var Tones = (function () {

  var actx = null;
  var analyser = null;
  var dataArray = null;
  var isPlaying = false;

  function getCtx() {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.6;
      analyser.connect(actx.destination);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
    return actx;
  }

  /** Play a musical note at the given frequency */
  function playNote(freq, duration, callback) {
    var ctx = getCtx();
    var dur = duration || Config.toneDuration;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = Config.toneType;
    osc.frequency.value = freq;

    // Smooth envelope: attack + sustain + release
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(Config.toneVolume, ctx.currentTime + 0.02);
    gain.gain.setValueAtTime(Config.toneVolume, ctx.currentTime + dur - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    osc.connect(gain);
    gain.connect(analyser);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur + 0.05);

    isPlaying = true;

    osc.onended = function () {
      isPlaying = false;
      if (callback) callback();
    };
  }

  /** Play a button's tone by index */
  function playButton(index, duration) {
    if (index < 0 || index >= Config.buttons.length) return;
    var btn = Config.buttons[index];
    playNote(btn.freq, duration || Config.toneDuration);
  }

  /** Get waveform data for visualization (0-255 values) */
  function getWaveformData() {
    if (!analyser || !dataArray) return null;
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /** Check if a tone is currently playing */
  function getIsPlaying() {
    return isPlaying;
  }

  /** Resume audio context (needed after user interaction) */
  function resume() {
    var ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
  }

  return {
    playNote: playNote,
    playButton: playButton,
    getWaveformData: getWaveformData,
    resume: resume,
    get isPlaying() { return isPlaying; },
  };
})();
