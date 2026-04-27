/* Breakout — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 500,

  // Paddle
  paddleW: 80,
  paddleH: 12,
  paddleSpeed: 400,       // px per second
  paddleColor: '#e0e0e0',
  paddleY: 500 - 30,      // 30px from bottom

  // Ball
  ballRadius: 5,
  ballBaseSpeed: 280,
  ballSpeedIncrement: 15,  // per brick hit
  ballMaxSpeed: 500,
  ballColor: '#ffffff',

  // Bricks
  brickRows: 6,
  brickCols: 8,
  brickH: 16,
  brickGap: 4,
  brickTopOffset: 50,
  brickColors: ['#ff4444', '#ff8844', '#ffd700', '#44ff66', '#44aaff', '#c084fc'],
  brickPoints: [60, 50, 40, 30, 20, 10],

  // Lives
  lives: 3,

  // Launch angle range (radians) — 45° to 135° (upward)
  launchAngleMin: Math.PI / 4,
  launchAngleMax: 3 * Math.PI / 4,

  // Paddle reflection angles (radians)
  reflectAngleMax: 150 * Math.PI / 180,  // left edge → 150°
  reflectAngleMin: 30 * Math.PI / 180,   // right edge → 30°

  // Background
  bgColor: '#0e0e1a',
  borderColor: '#2a2a40',
};

// Derived
Config.brickW = (Config.canvasW - (Config.brickCols + 1) * Config.brickGap) / Config.brickCols;
