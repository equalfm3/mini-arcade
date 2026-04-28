/* Lights Out — Configuration */

var Config = {
  // Grid
  cols: 5,
  rows: 5,
  cellSize: 60,
  cellGap: 4,

  // Colors
  lightOn: '#ffd700',
  lightOff: '#1a1a2e',
  lightOnGlow: '#ffee88',
  cellStroke: '#2a2a40',
  gridBg: '#12121f',

  // Levels: number of random toggles to generate puzzle
  // More toggles = harder puzzle (but always solvable)
  levelToggles: [3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 25],
};

// Derived
Config.canvasW = Config.cols * (Config.cellSize + Config.cellGap) + Config.cellGap;
Config.canvasH = Config.rows * (Config.cellSize + Config.cellGap) + Config.cellGap;
