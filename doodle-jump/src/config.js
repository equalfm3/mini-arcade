/* Doodle Jump — Configuration */

var Config = {
  // Canvas
  canvasW: 320,
  canvasH: 480,

  // Player
  playerW: 24,
  playerH: 28,
  playerSpeed: 250,       // horizontal px/s
  gravity: 900,           // px/s² downward
  jumpForce: -450,        // px/s upward on normal bounce
  springForce: -700,      // px/s upward on spring bounce
  maxFallSpeed: 600,      // terminal velocity

  // Player colors
  playerBody: '#44ff66',
  playerDark: '#22aa44',
  playerEye: '#ffffff',
  playerPupil: '#0a0a16',
  playerFeet: '#22aa44',
  playerNose: '#88ffaa',

  // Platforms
  platformW: 58,
  platformH: 12,
  platformGap: 60,        // base vertical gap between platforms
  platformMaxGap: 110,    // max gap at high difficulty
  platformDifficultyRate: 0.0003, // gap increase per height unit

  // Platform colors
  normalColor: '#44ff66',
  normalDark: '#22aa44',
  movingColor: '#44aaff',
  movingDark: '#2266cc',
  breakingColor: '#ff8844',
  breakingDark: '#cc6622',
  breakingBroken: '#ff4444',
  springColor: '#ffd700',
  springDark: '#b89a00',

  // Moving platform
  movingSpeed: 60,        // px/s horizontal

  // Platform spawn chances (cumulative thresholds)
  // At height 0: mostly normal. As height increases, more variety.
  normalChance: 0.65,
  movingChance: 0.85,     // 0.65-0.85 = 20% moving
  breakingChance: 0.95,   // 0.85-0.95 = 10% breaking
  // remaining 5% = spring

  // Camera
  cameraOffset: 0.35,     // player stays in lower 35% of screen

  // Background
  bgColor: '#0e0e1a',
  bgStarCount: 40,
  bgLineColor: '#161625',

  // Score
  heightScale: 0.1,       // score = maxHeight * heightScale (1 point per 10px)

  // Colors
  textColor: '#e0e0e0',
  hudColor: '#ffd700',
};

// Derived
Config.playerHalfW = Config.playerW / 2;
Config.playerHalfH = Config.playerH / 2;
Config.platformHalfW = Config.platformW / 2;
