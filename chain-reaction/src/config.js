/* Chain Reaction — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 560,

  // Dot colors — vibrant palette
  dotColors: [
    '#ff4444', // red
    '#ff8844', // orange
    '#ffd700', // gold
    '#44ff66', // green
    '#44aaff', // blue
    '#c084fc', // purple
    '#ff66aa', // pink
    '#44ffdd', // cyan
  ],

  // Dot physics
  dotRadius: 10,
  dotMinSpeed: 30,
  dotMaxSpeed: 80,
  dotGlow: 6,           // inner glow radius offset
  dotTrailAlpha: 0.15,  // trail opacity
  dotTrailLength: 5,    // number of trail positions

  // Explosion mechanics
  explosionMaxRadius: 50,
  explosionExpandTime: 0.8,   // seconds to grow to max
  explosionHoldTime: 0.6,     // seconds at max radius
  explosionFadeTime: 0.4,     // seconds to fade out
  explosionRingWidth: 3,      // ring stroke width
  explosionGlowSize: 12,      // glow around ring

  // Chain reaction
  slowMoFactor: 0.7,          // time scale during chain
  slowMoThreshold: 1,         // chain count to trigger slow-mo
  bigChainThreshold: 5,       // chain count for screen flash
  screenFlashDuration: 0.15,  // seconds

  // Score popups
  popupSpeed: 60,             // float-up speed px/s
  popupLife: 0.8,             // seconds
  popupSize: 16,              // font size

  // Chain counter display
  chainCounterSize: 72,       // base font size
  chainCounterScaleMax: 1.4,  // max scale on pop
  chainCounterFadeTime: 1.5,  // seconds to fade after chain ends

  // Level design: [dotCount, targetPops]
  levels: [
    [5,  1],   // Level 1 — tutorial
    [10, 3],   // Level 2
    [15, 5],   // Level 3
    [20, 8],   // Level 4
    [25, 12],  // Level 5
    [30, 15],  // Level 6
  ],

  // For levels beyond the defined ones, scale up
  levelScaleDots: 5,     // extra dots per level beyond defined
  levelScaleTarget: 3,   // extra target per level beyond defined

  // Attempts
  maxAttempts: 3,

  // Timing
  settleDelay: 1.0,      // seconds after last explosion fades to check result

  // Background
  bgColor: '#0a0a16',
  bgGridColor: '#161625',
  bgGridSpacing: 30,

  // Particle burst on dot pop
  burstCount: 8,
  burstSpeed: 120,
  burstLife: 0.5,
  burstSize: 3,

  // Audio
  explosionFreqLow: 60,
  explosionFreqMid: 300,
  explosionDurLow: 0.3,
  explosionDurMid: 0.1,
};

// Derived
Config.totalExplosionTime = Config.explosionExpandTime + Config.explosionHoldTime + Config.explosionFadeTime;

// Helper to get level data
Config.getLevel = function (lvl) {
  var idx = lvl - 1;
  if (idx < Config.levels.length) {
    return { dots: Config.levels[idx][0], target: Config.levels[idx][1] };
  }
  var last = Config.levels[Config.levels.length - 1];
  var extra = idx - Config.levels.length + 1;
  return {
    dots: last[0] + extra * Config.levelScaleDots,
    target: last[1] + extra * Config.levelScaleTarget,
  };
};
