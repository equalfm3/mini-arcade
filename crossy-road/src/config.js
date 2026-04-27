/* Crossy Road — Configuration */

var Config = {
  // Canvas
  canvasW: 320,
  canvasH: 480,

  // Grid
  cellSize: 32,
  cols: 10,           // 320 / 32

  // Player
  playerSize: 24,     // drawn size inside cell
  hopDuration: 0.15,   // seconds for hop animation
  idleTimeout: 12.0,   // seconds before eagle warning
  eagleWarning: 3.0,  // seconds of warning before death

  // Lane types
  GRASS: 'grass',
  ROAD: 'road',
  RIVER: 'river',

  // Lane generation
  startSafeLanes: 5,       // safe grass lanes at start
  generateAhead: 18,       // lanes generated ahead of camera
  recycleBehind: 5,        // lanes recycled behind camera
  maxConsecutiveRoad: 3,
  maxConsecutiveRiver: 2,
  minGrassBetween: 1,      // min grass lanes between hazard groups

  // Road (cars)
  carMinSpeed: 40,
  carMaxSpeed: 120,
  carWidth: 48,
  carHeight: 24,
  carMinGap: 80,
  carMaxGap: 200,

  // River (logs)
  logMinSpeed: 30,
  logMaxSpeed: 70,
  logMinWidth: 80,
  logMaxWidth: 140,
  logMinGap: 40,
  logMaxGap: 90,
  logHeight: 28,

  // Trees (grass obstacles)
  treeChance: 0.25,   // chance per cell on grass lane
  treeSize: 24,

  // Camera
  cameraSmooth: 6,

  // Colors
  grassLight: '#4a8c3f',
  grassDark: '#3d7534',
  roadColor: '#444455',
  roadLine: '#555566',
  riverColor: '#2266aa',
  riverLight: '#3388cc',
  logColor: '#8b6914',
  logDark: '#6b4f10',
  carColors: ['#ff4444', '#44aaff', '#ffd700', '#ff8844', '#c084fc', '#44ff66'],
  treeGreen: '#2d6b2d',
  treeTrunk: '#6b4226',
  playerBody: '#e0e0e0',
  playerEye: '#222222',
  playerBeak: '#ffa500',
  eagleColor: '#8b4513',
  waterSplash: '#66ccff',

  // Scoring
  pointsPerRow: 1,

  // Background
  bgColor: '#0a0a16',
};

// Derived
Config.canvasRows = Math.ceil(Config.canvasH / Config.cellSize) + 2;
Config.halfCell = Config.cellSize / 2;
