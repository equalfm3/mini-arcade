/* Laser Reflect — Configuration */

var Config = {
  // Grid
  cols: 8,
  rows: 8,
  cellSize: 44,

  // Canvas
  canvasW: 352,
  canvasH: 352,

  // Laser
  laserColor: '#ff4444',
  laserWidth: 3,
  laserGlow: '#ff8888',
  maxBounces: 50, // prevent infinite loops

  // Colors
  gridBg: '#12121f',
  cellBg: '#1a1a2e',
  cellStroke: '#2a2a40',
  mirrorColor: '#44aaff',
  mirrorPlaced: '#44ff66',
  targetColor: '#ffd700',
  emitterColor: '#ff4444',
  wallColor: '#666666',
  highlightColor: '#ffffff22',

  // Levels: each level defines emitter, target, walls, and available mirrors
  // mirror types: '/' = reflects NE/SW, '\' = reflects NW/SE
  // emitter direction: 'right', 'left', 'up', 'down'
};

// Derived
Config.canvasW = Config.cols * Config.cellSize;
Config.canvasH = Config.rows * Config.cellSize;
