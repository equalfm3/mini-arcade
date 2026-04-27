/* Snake — Configuration */

var Config = {
  // Grid
  cols: 20,
  rows: 20,
  cellSize: 20,       // logical pixels per cell

  // Speed (cells per second) — increases with score
  baseSpeed: 6,
  speedIncrement: 0.3, // per food eaten
  maxSpeed: 18,

  // Scoring
  pointsPerFood: 10,
  bonusThreshold: 5,   // bonus points every N food

  // Colors
  snakeHead: '#44ff66',
  snakeBody: '#22aa44',
  snakeEye:  '#ffffff',
  snakePupil:'#0a0a16',
  food:      '#ff4444',
  foodGlow:  '#ff6666',
  gridLine:  '#161625',
  gridBg:    '#0e0e1a',
  wallColor: '#2a2a40',
};

// Derived
Config.canvasW = Config.cols * Config.cellSize;
Config.canvasH = Config.rows * Config.cellSize;
