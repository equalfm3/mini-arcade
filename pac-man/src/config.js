/* Pac-Man — Configuration */

var Config = {
  // Maze dimensions: classic 28×31 tile grid
  cols: 28,
  rows: 31,
  cellSize: 14,

  // Player
  playerSpeed: 80,          // tiles per second (scaled by dt)
  playerStartCol: 14,
  playerStartRow: 23,

  // Ghost speeds (tiles per second)
  ghostSpeed: 75,
  ghostFrightenedSpeed: 40,
  ghostTunnelSpeed: 40,
  ghostReturnSpeed: 150,

  // Ghost house
  ghostHouseCol: 14,
  ghostHouseRow: 14,
  ghostHouseExitCol: 14,
  ghostHouseExitRow: 11,

  // Ghost start positions (col, row)
  ghostStarts: [
    { col: 14, row: 11 },   // Blinky — starts outside
    { col: 14, row: 14 },   // Pinky — starts in house
    { col: 12, row: 14 },   // Inky — starts in house
    { col: 16, row: 14 },   // Clyde — starts in house
  ],

  // Ghost scatter targets (corners)
  scatterTargets: [
    { col: 25, row: 0 },    // Blinky — top-right
    { col: 2,  row: 0 },    // Pinky — top-left
    { col: 27, row: 30 },   // Inky — bottom-right
    { col: 0,  row: 30 },   // Clyde — bottom-left
  ],

  // Ghost colors
  ghostColors: ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'],
  ghostNames: ['Blinky', 'Pinky', 'Inky', 'Clyde'],
  frightenedColor: '#2121ff',
  frightenedFlashColor: '#ffffff',
  ghostEyeColor: '#ffffff',
  ghostPupilColor: '#2121de',

  // Mode timers (seconds) — scatter/chase alternation
  modeTimes: [7, 20, 7, 20, 5, 20, 5],
  // Modes: scatter, chase, scatter, chase, scatter, chase, scatter, then chase forever

  // Frightened duration
  frightenedDuration: 8,
  frightenedFlashTime: 2,   // flash for last 2 seconds

  // Ghost release timers (seconds after level start)
  ghostReleaseTimes: [0, 0, 5, 12],

  // Scoring
  pelletScore: 10,
  powerPelletScore: 50,
  ghostScoreBase: 200,      // doubles: 200, 400, 800, 1600

  // Lives
  startLives: 3,

  // Level speed scaling
  levelSpeedBoost: 3,       // extra speed per level

  // Tunnel columns
  tunnelRow: 14,
  tunnelLeftCol: 0,
  tunnelRightCol: 27,

  // Colors
  mazeColor: '#2121de',
  mazeWallColor: '#2121de',
  mazeBorderColor: '#2121de',
  pelletColor: '#ffb8ae',
  powerPelletColor: '#ffb8ae',
  playerColor: '#ffff00',
  bgColor: '#000000',
  textColor: '#ffffff',
  hudColor: '#ffd700',

  // Pac-Man mouth animation
  mouthSpeed: 8,            // radians per second for mouth animation

  // Power pellet blink
  powerPelletBlinkRate: 4,  // blinks per second
};

// Derived
Config.canvasW = Config.cols * Config.cellSize;
Config.canvasH = (Config.rows + 2) * Config.cellSize; // +2 for score area at bottom
