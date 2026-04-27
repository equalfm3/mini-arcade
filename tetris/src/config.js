/* Tetris — Configuration */

var Config = {
  // Board
  cols: 10,
  rows: 20,
  cellSize: 24,

  // Drop speed
  initialInterval: 0.8,    // seconds between auto-drops at level 1
  minInterval: 0.05,       // fastest possible drop interval
  speedFactor: 0.02,       // interval reduction per level

  // Scoring (base points, multiplied by level)
  scoreSingle: 100,
  scoreDouble: 300,
  scoreTriple: 500,
  scoreTetris: 800,

  // Drop scoring
  softDropPoints: 1,       // per cell
  hardDropPoints: 2,       // per cell

  // Leveling
  linesPerLevel: 10,

  // Lock delay
  lockDelay: 0.5,          // seconds before piece locks after landing

  // DAS (Delayed Auto Shift)
  dasInitial: 0.17,        // seconds before repeat starts
  dasRepeat: 0.05,         // seconds between repeats

  // Ghost piece
  ghostAlpha: 0.3,

  // Piece colors (indexed 0-6 for I, O, T, S, Z, J, L)
  colors: [
    '#00e5ff',   // I — cyan
    '#ffeb3b',   // O — yellow
    '#ab47bc',   // T — purple
    '#66bb6a',   // S — green
    '#ef5350',   // Z — red
    '#42a5f5',   // J — blue
    '#ffa726',   // L — orange
  ],

  // Board colors
  gridBg: '#0e0e1a',
  gridLine: '#161625',
  sidebarBg: '#0e0e1a',

  // Cell highlight/shadow for 3D look
  highlightAlpha: 0.3,
  shadowAlpha: 0.3,
};

// Derived
Config.canvasW = Config.cols * Config.cellSize;
Config.canvasH = Config.rows * Config.cellSize;
Config.sidebarW = 100;
Config.totalW = Config.canvasW + Config.sidebarW;
