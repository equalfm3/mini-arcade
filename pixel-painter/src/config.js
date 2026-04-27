/* Pixel Painter — Configuration */

var Config = {
  // Grid dimensions
  cols: 8,
  rows: 8,

  // Colors — 6 vibrant, same as Color Flood
  colors: [
    '#ff4444',  // red
    '#ff8844',  // orange
    '#ffd700',  // yellow
    '#44ff66',  // green
    '#44aaff',  // blue
    '#c084fc',  // purple
  ],

  colorNames: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'],

  // Empty cell color
  emptyColor: '#1a1a2e',
  emptyStroke: '#2a2a40',

  // Grid rendering
  cellSize: 36,
  cellGap: 2,
  cellRadius: 3,
  gridPadding: 4,
  gridBorder: '#2a2a40',
  gridBg: '#12121f',

  // Palette button sizing
  paletteSize: 40,
  paletteGap: 8,
  paletteRadius: 6,

  // Phases
  showDurations: [5, 4, 3, 2],   // seconds per level (level 1=5s, 2=4s, 3=3s, 4+=2s)
  compareDuration: 2.5,           // seconds to show comparison
  countdownBeforePaint: 0.8,      // brief pause before paint phase

  // Scoring
  passThreshold: 80,              // accuracy % needed to pass
  pointsPerPercent: 10,           // score per accuracy %
  perfectBonus: 500,              // bonus for 100% accuracy
  levelBonus: 100,                // bonus per level

  // Difficulty tiers
  easyMaxLevel: 2,                // levels 1-2 use easy patterns (1-2 colors)
  mediumMaxLevel: 5,              // levels 3-5 use medium patterns (3-4 colors)
  // level 6+ uses hard patterns (5-6 colors)

  // Canvas layout
  canvasW: 380,
  canvasH: 520,

  // Layout positions
  headerH: 40,
  gridY: 48,
  paletteY: 0,       // computed below
  submitBtnH: 36,
  submitBtnW: 120,

  // Comparison layout
  compareGridSize: 24, // smaller cells for side-by-side
  compareGap: 1,

  // Animation
  flashDuration: 0.3,
  celebrationParticles: 30,

  // Text colors
  textPrimary: '#e0e0e0',
  textDim: '#666666',
  textAccent: '#c084fc',
  textSuccess: '#44ff66',
  textFail: '#ff4444',
  textWarning: '#ffd700',
};

// Derived values
Config.gridW = Config.cols * (Config.cellSize + Config.cellGap) - Config.cellGap + Config.gridPadding * 2;
Config.gridH = Config.rows * (Config.cellSize + Config.cellGap) - Config.cellGap + Config.gridPadding * 2;
Config.paletteY = Config.gridY + Config.gridH + 12;
Config.submitY = Config.paletteY + Config.paletteSize + 16;

/** Get show duration for a given level */
Config.getShowDuration = function (level) {
  var idx = Math.min(level - 1, Config.showDurations.length - 1);
  return Config.showDurations[idx];
};
