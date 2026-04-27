/* One-Button Duels — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 400,

  // Match
  roundsToWin: 3,               // first to 3 round wins
  hpPerRound: 3,                // HP each fighter starts with
  exchangeDamage: 1,            // damage per winning exchange

  // Timing bar
  barSpeed: 2.0,                // cycles per second (base)
  barSpeedIncrease: 0.3,        // speed increase per round
  barMaxSpeed: 5.0,
  barWidth: 140,
  barHeight: 12,
  barY: 320,                    // y position of timing bars

  // Zones — proportional widths (must sum to 1.0)
  zones: [
    { name: 'STRIKE', color: '#ff4444', width: 0.34 },
    { name: 'PARRY',  color: '#44aaff', width: 0.33 },
    { name: 'DODGE',  color: '#44ff66', width: 0.33 },
  ],

  // Combat resolution: winner[attacker][defender]
  // 'win' = attacker wins, 'lose' = defender wins, 'draw' = tie
  resolution: {
    STRIKE: { STRIKE: 'draw', PARRY: 'lose',  DODGE: 'win'  },
    PARRY:  { STRIKE: 'win',  PARRY: 'draw',  DODGE: 'lose' },
    DODGE:  { STRIKE: 'lose', PARRY: 'win',   DODGE: 'draw' },
  },

  // Lock-in timing
  lockTimeout: 3.0,             // seconds before AI takes over
  resolveDelay: 0.6,            // pause before showing result
  resultDisplayTime: 1.5,       // how long to show exchange result
  roundEndDelay: 1.5,           // pause after round ends
  matchEndDelay: 2.0,           // pause after match ends

  // Fighters
  fighterW: 32,
  fighterH: 48,
  fighterY: 200,                // vertical center of fighters
  p1X: 100,                     // P1 base x position
  p2X: 300,                     // P2 base x position
  lungeDistance: 30,             // how far strike lunges forward
  dodgeDistance: 25,             // how far dodge moves back

  // Animation
  animDuration: 0.4,            // action animation length
  shakeIntensity: 4,            // screen shake pixels
  shakeDuration: 0.3,           // screen shake time

  // Health bar
  hpBarWidth: 80,
  hpBarHeight: 8,
  hpBarY: 140,                  // y position above fighters
  hpBarP1X: 60,
  hpBarP2X: 260,

  // AI (single player fallback)
  aiEnabled: false,
  aiBias: 0.15,                 // slight bias toward good plays
  aiMinDelay: 0.4,              // min time before AI locks
  aiMaxDelay: 1.8,              // max time before AI locks

  // Colors
  bgColor: '#0a0a16',
  p1Color: '#ff4444',
  p2Color: '#44aaff',
  p1ColorDark: '#aa2222',
  p2ColorDark: '#2266aa',
  textColor: '#e0e0e0',
  dimColor: '#666666',
  goldColor: '#ffd700',
  hudBg: '#12121f',

  // Round text
  roundTextSize: 28,
  roundTextY: 50,

  // Versus divider
  vsX: 200,
  vsY: 200,
};

// Derived
Config.centerX = Config.canvasW / 2;
Config.centerY = Config.canvasH / 2;
Config.barP1X = Config.p1X - Config.barWidth / 2;
Config.barP2X = Config.p2X - Config.barWidth / 2;
