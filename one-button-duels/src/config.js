/* One-Button Duels — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 480,

  // Match
  roundsToWin: 3,
  hpPerRound: 3,
  exchangeDamage: 1,

  // Actions
  actions: ['STRIKE', 'PARRY', 'DODGE'],
  actionColors: { STRIKE: '#ff4444', PARRY: '#44aaff', DODGE: '#44ff66' },
  actionIcons: { STRIKE: 'ATK', PARRY: 'DEF', DODGE: 'EVD' },
  actionKeys: { STRIKE: '1', PARRY: '2', DODGE: '3' },

  // Combat resolution: resolution[player][ai]
  // 'win' = player wins, 'lose' = ai wins, 'draw' = tie
  resolution: {
    STRIKE: { STRIKE: 'draw', PARRY: 'lose',  DODGE: 'win'  },
    PARRY:  { STRIKE: 'win',  PARRY: 'draw',  DODGE: 'lose' },
    DODGE:  { STRIKE: 'lose', PARRY: 'win',   DODGE: 'draw' },
  },

  // Timing
  chooseTime: 5.0,           // seconds to pick an action (auto-random if timeout)
  resolveDelay: 0.8,         // dramatic pause before reveal
  resultDisplayTime: 1.8,    // show result before next exchange
  roundEndDelay: 1.5,
  matchEndDelay: 2.0,
  countdownTick: 1.0,        // tick sound in last 3 seconds

  // AI personality — shifts over rounds to keep it interesting
  // AI picks based on weighted probabilities, NO cheating (doesn't see player choice)
  aiPersonalities: [
    { name: 'Balanced',    weights: { STRIKE: 0.34, PARRY: 0.33, DODGE: 0.33 } },
    { name: 'Aggressive',  weights: { STRIKE: 0.55, PARRY: 0.25, DODGE: 0.20 } },
    { name: 'Defensive',   weights: { STRIKE: 0.20, PARRY: 0.55, DODGE: 0.25 } },
    { name: 'Evasive',     weights: { STRIKE: 0.25, PARRY: 0.20, DODGE: 0.55 } },
  ],

  // AI adapts: after losing 2 exchanges in a row, shifts personality
  aiAdaptThreshold: 2,

  // Canvas
  canvasW: 400,
  canvasH: 560,

  // Fighters
  fighterW: 32,
  fighterH: 48,
  fighterY: 220,
  playerX: 100,
  aiX: 300,
  lungeDistance: 30,
  dodgeDistance: 25,

  // Animation
  animDuration: 0.5,
  shakeIntensity: 5,
  shakeDuration: 0.3,

  // Health bar
  hpBarWidth: 90,
  hpBarHeight: 10,
  hpBarY: 145,
  hpBarPlayerX: 55,
  hpBarAIX: 255,

  // Result text area (between health bars and fighters)
  resultY: 175,

  // Action buttons layout
  btnY: 420,
  btnW: 100,
  btnH: 50,
  btnGap: 16,
  btnRadius: 8,

  // Timer bar
  timerBarY: 405,
  timerBarH: 6,

  // Choose prompt
  promptY: 390,

  // Colors
  bgColor: '#0a0a16',
  playerColor: '#44aaff',
  playerColorDark: '#2266aa',
  aiColor: '#ff4444',
  aiColorDark: '#aa2222',
  textColor: '#e0e0e0',
  dimColor: '#666666',
  goldColor: '#ffd700',
  btnBg: '#1a1a2e',
  btnBorder: '#2a2a40',
  btnHover: '#2a2a4a',
  btnSelected: '#ffd700',
  btnDisabled: '#111122',
};

// Derived
Config.centerX = Config.canvasW / 2;
Config.totalBtnW = Config.actions.length * Config.btnW + (Config.actions.length - 1) * Config.btnGap;
Config.btnStartX = (Config.canvasW - Config.totalBtnW) / 2;
