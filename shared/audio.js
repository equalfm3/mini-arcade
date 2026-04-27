/* ============================================
   audio.js — Tiny Web Audio synth
   
   No audio files needed. Generates retro beeps,
   blips, and effects using oscillators.
   
   Usage:
     Audio8.play('score');
     Audio8.play('hit');
     Audio8.play('gameover');
     Audio8.note(440, 0.1);  // custom freq + duration
   ============================================ */

var Audio8 = (function () {

  var actx = null;

  function getCtx() {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return actx;
  }

  // Unlock audio on first user interaction
  function unlock() {
    var ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
  }
  document.addEventListener('touchstart', unlock, { once: true });
  document.addEventListener('click', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });

  function note(freq, dur, type, vol) {
    var ctx = getCtx();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.1));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (dur || 0.1) + 0.05);
  }

  // Preset sound effects
  var presets = {
    score:    function () { note(660, 0.08); setTimeout(function(){ note(880, 0.12); }, 80); },
    hit:      function () { note(200, 0.15, 'sawtooth', 0.12); },
    move:     function () { note(330, 0.04, 'square', 0.06); },
    drop:     function () { note(150, 0.2, 'triangle', 0.1); },
    clear:    function () { note(523, 0.06); setTimeout(function(){ note(659, 0.06); }, 60); setTimeout(function(){ note(784, 0.1); }, 120); },
    gameover: function () { note(440, 0.15); setTimeout(function(){ note(370, 0.15); }, 150); setTimeout(function(){ note(311, 0.3); }, 300); },
    win:      function () { note(523, 0.08); setTimeout(function(){ note(659, 0.08); }, 80); setTimeout(function(){ note(784, 0.08); }, 160); setTimeout(function(){ note(1047, 0.2); }, 240); },
    click:    function () { note(800, 0.03, 'square', 0.08); },
    error:    function () { note(200, 0.2, 'sawtooth', 0.1); },
    tick:     function () { note(1000, 0.02, 'square', 0.04); },
    whoosh:   function () { var ctx = getCtx(); var osc = ctx.createOscillator(); var gain = ctx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(400, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2); gain.gain.setValueAtTime(0.08, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2); osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.25); },
  };

  return {
    /** Play a preset sound */
    play: function (name) {
      if (presets[name]) presets[name]();
    },

    /** Play a custom note */
    note: note,

    /** Get the AudioContext (for advanced use) */
    context: getCtx,
  };
})();
