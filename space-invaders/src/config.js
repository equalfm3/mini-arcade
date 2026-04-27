/* Space Invaders — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 500,

  // Player
  playerW: 26,
  playerH: 16,
  playerSpeed: 200,       // px per second
  playerY: 470,           // y position (near bottom)
  playerColor: '#44ff66',
  playerHighlight: '#88ffaa',

  // Bullets
  bulletW: 3,
  bulletH: 10,
  playerBulletSpeed: 350, // px per second (upward)
  enemyBulletSpeed: 180,  // px per second (downward)
  playerBulletColor: '#44ff66',
  enemyBulletColor: '#ff4444',
  shootCooldown: 0.35,    // seconds between player shots
  maxPlayerBullets: 3,
  maxEnemyBullets: 8,

  // Enemy formation
  enemyRows: 5,
  enemyCols: 11,
  enemyW: 24,
  enemyH: 16,
  enemyPadX: 8,           // horizontal gap between enemies
  enemyPadY: 8,           // vertical gap between enemies
  enemyTopOffset: 50,     // top margin for formation
  enemyLeftOffset: 20,    // left margin for formation

  // Enemy types (row index → type)
  // Row 0: top (squid), Rows 1-2: middle (crab), Rows 3-4: bottom (octopus)
  enemyTypes: [
    { name: 'squid',   points: 30, color: '#c084fc' },
    { name: 'crab',    points: 20, color: '#44aaff' },
    { name: 'crab',    points: 20, color: '#44aaff' },
    { name: 'octopus', points: 10, color: '#44ff66' },
    { name: 'octopus', points: 10, color: '#44ff66' },
  ],

  // Enemy movement
  enemyBaseSpeed: 30,       // px per second (lateral)
  enemySpeedIncrease: 2,    // added per enemy killed
  enemyMaxSpeed: 200,
  enemyDropDistance: 12,     // px to descend when hitting wall
  enemyShootChance: 0.008,  // per-frame chance for bottom enemy to shoot
  enemyAnimInterval: 0.6,   // seconds between animation frames

  // Wave scaling
  waveSpeedBonus: 10,       // extra base speed per wave
  waveShootBonus: 0.002,    // extra shoot chance per wave

  // Lives
  lives: 3,

  // Colors
  bgColor: '#0a0a16',
  borderColor: '#2a2a40',
  textColor: '#e0e0e0',
  hudColor: '#ffd700',
  shieldColor: '#44ff66',
};

// Derived
Config.formationW = Config.enemyCols * (Config.enemyW + Config.enemyPadX) - Config.enemyPadX;
Config.formationH = Config.enemyRows * (Config.enemyH + Config.enemyPadY) - Config.enemyPadY;
