/* Shrinking Arena — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 400,

  // Arena
  arenaStartRadius: 180,
  arenaMinRadius: 5,
  arenaShrinkRate: 3,            // px/s base shrink
  arenaShrinkAccel: 0.15,        // shrink rate increase per second
  arenaMaxShrinkRate: 20,
  arenaWarningRadius: 80,        // pulse red below this
  arenaPulseSpeed: 6,            // pulse frequency
  arenaBorderWidth: 2.5,
  arenaGlowColor: 'rgba(68, 170, 255, 0.4)',
  arenaWarningColor: 'rgba(255, 68, 68, 0.6)',
  arenaBorderColor: '#44aaff',
  arenaBorderWarning: '#ff4444',

  // Player
  playerRadius: 7,
  playerSpeed: 130,
  playerColor: '#44aaff',
  playerGlow: '#2288ff',
  playerTrailLength: 12,
  playerTrailAlpha: 0.4,

  // Enemies
  enemyCount: 10,
  enemyRadius: 5,
  enemySpeed: 60,
  enemySpeedVariance: 20,
  enemyDirChangeMin: 1.0,       // seconds
  enemyDirChangeMax: 3.0,
  enemyBoundaryAvoidDist: 30,   // start steering toward center
  enemyBoundaryAvoidForce: 1.5,
  enemyPlayerAvoidDist: 50,
  enemyPlayerAvoidForce: 0.8,
  enemyAggressiveDist: 80,
  enemyAggressiveForce: 0.5,
  enemyTrailLength: 6,
  enemyTrailAlpha: 0.25,
  enemyColors: [
    '#ff4444', '#ff8844', '#ffcc44', '#44ff66',
    '#44ffdd', '#c084fc', '#ff66aa', '#88cc44',
    '#ff6666', '#66ccff', '#ffaa66', '#aa66ff',
  ],

  // AI personality distribution (out of total enemies)
  aggressiveRatio: 0.3,          // 30% aggressive, 70% passive

  // Collision
  pushForce: 250,                // elastic push speed
  pushFriction: 4.0,             // how fast push velocity decays

  // Elimination particles
  eliminationParticles: 16,
  eliminationSpeed: 120,
  eliminationLife: 0.6,
  eliminationSize: 3,

  // Sudden death — arena keeps shrinking, enemies get pushed around chaotically
  suddenDeathRadius: 50,
  suddenDeathPushForce: 300,

  // Visual
  bgColor: '#0a0a16',
  bgStarCount: 50,
  bgStarColor: '#ffffff',
  bgStarAlpha: 0.15,

  // Scoring
  roundWinPoints: 1,
};

// Derived
Config.centerX = Config.canvasW / 2;
Config.centerY = Config.canvasH / 2;
