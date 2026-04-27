/* Endless Runner — Configuration */

var Config = {
  // Canvas
  canvasW: 600,
  canvasH: 200,

  // Physics
  gravity: 1800,         // px/s²
  jumpForce: -550,       // px/s (initial upward velocity)
  maxFallSpeed: 800,     // terminal velocity

  // Ground
  groundY: 170,          // y position of ground line
  groundH: 30,           // ground fill height below groundY

  // Player
  playerX: 60,           // fixed horizontal position
  playerW: 28,           // run width
  playerH: 40,           // run height
  duckW: 34,             // duck width (wider)
  duckH: 24,             // duck height (shorter)
  legSpeed: 12,          // leg animation speed (cycles/sec)

  // Player colors
  playerBody: '#e0e0e0',
  playerDark: '#aaaaaa',
  playerEye: '#ff4444',

  // Speed
  baseSpeed: 280,        // initial ground scroll speed px/s
  maxSpeed: 700,         // maximum speed
  speedIncrement: 0.4,   // speed increase per second of play

  // Obstacles
  minObstacleGap: 0.8,   // minimum seconds between obstacles
  maxObstacleGap: 2.0,   // maximum seconds between obstacles
  gapShrinkRate: 0.01,   // gap shrinks per second of play

  // Obstacle types
  SMALL_CACTUS: 0,
  LARGE_CACTUS: 1,
  DOUBLE_CACTUS: 2,
  BIRD: 3,

  // Cactus sizes
  smallCactusW: 14,
  smallCactusH: 28,
  largeCactusW: 18,
  largeCactusH: 40,
  doubleCactusW: 30,
  doubleCactusH: 28,

  // Bird
  birdW: 30,
  birdH: 20,
  birdFlapSpeed: 6,      // wing flap cycles/sec
  birdLowY: 145,         // low altitude (jump over)
  birdMidY: 120,         // mid altitude (jump or duck)
  birdHighY: 90,         // high altitude (duck under)

  // Obstacle colors
  cactusColor: '#44ff66',
  cactusDark: '#22aa44',
  birdColor: '#c084fc',
  birdDark: '#8844cc',

  // Background — parallax layers
  skyColor: '#0e0e1a',
  skyNightColor: '#060610',
  mountainColor: '#161625',
  mountainDark: '#0e0e1a',
  hillColor: '#1a1a2e',
  hillDark: '#12121f',
  cloudColor: '#1e1e30',
  groundColor: '#2a2a40',
  groundLine: '#3a3a55',
  groundDot: '#333350',

  // Day/night cycle
  dayNightCycleDuration: 60, // seconds per full cycle
  nightTint: 'rgba(0,0,20,0.3)',

  // Scoring
  scoreRate: 10,         // points per second at base speed
  milestoneInterval: 100, // play sound every N points

  // Stars (background)
  starCount: 20,

  // Cloud count
  cloudCount: 5,

  // Mountain count
  mountainCount: 4,

  // Hill count
  hillCount: 6,
};

// Derived
Config.playerRunY = Config.groundY - Config.playerH;
Config.playerDuckY = Config.groundY - Config.duckH;
