/* Merge Path — Configuration */

var Config = {
  // Grid sizes per level tier
  gridSizes: {
    small: 5,   // levels 1-3
    medium: 6,  // levels 4-7
    large: 7,   // levels 8-11
    xlarge: 8,  // levels 12+
  },

  // Cell rendering
  cellSize: 56,
  cellGap: 3,
  cellRadius: 6,
  cellBg: '#161625',
  cellBgFilled: null, // computed per-color with alpha

  // Dot rendering
  dotRadius: 14,
  dotGlowRadius: 22,
  dotGlowAlpha: 0.35,

  // Path rendering
  pathWidth: 12,
  pathCap: 'round',
  pathJoin: 'round',
  pathAlpha: 0.85,

  // Colors for dot pairs (up to 8 colors)
  colors: [
    '#ff4444', // red
    '#44aaff', // blue
    '#44ff66', // green
    '#ffd700', // gold
    '#ff8844', // orange
    '#c084fc', // purple
    '#ff66aa', // pink
    '#44ffdd', // cyan
  ],

  // Darker tints for filled cells
  fillAlpha: 0.12,

  // Completion animation
  completionPulseDuration: 1.2,
  completionGlowMax: 18,

  // Canvas padding
  padding: 20,
  headerHeight: 40,

  // Background
  bgColor: '#0a0a16',
  bgGridColor: '#161625',

  // Timing
  invalidFlashDuration: 0.3,
};

// Helper: get grid size for a level
Config.gridForLevel = function (lvl) {
  if (lvl <= 3) return Config.gridSizes.small;
  if (lvl <= 7) return Config.gridSizes.medium;
  if (lvl <= 11) return Config.gridSizes.large;
  return Config.gridSizes.xlarge;
};

// Helper: compute canvas dimensions for a grid size
Config.canvasDims = function (gridSize) {
  var cellTotal = Config.cellSize + Config.cellGap;
  var gridPx = gridSize * cellTotal - Config.cellGap;
  var w = gridPx + Config.padding * 2;
  var h = gridPx + Config.padding * 2 + Config.headerHeight;
  return { w: w, h: h };
};
