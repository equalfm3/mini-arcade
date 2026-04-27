/* Shadow Match — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 600,

  // Grid for shape cells
  cellSize: 28,
  cellGap: 3,

  // Shape grid max dimensions
  gridCols: 5,
  gridRows: 5,

  // Difficulty levels — shape complexity, display time, distractor difficulty
  levels: [
    // Level 1-3: 3-cell shapes, 3s display, easy distractors (90° rotation only)
    { cells: 3, displayTime: 3.0, distractorMode: 'easy' },
    { cells: 3, displayTime: 3.0, distractorMode: 'easy' },
    { cells: 3, displayTime: 2.8, distractorMode: 'easy' },
    // Level 4-6: 4-cell shapes, 2.5s display, medium distractors (mirror + rotation)
    { cells: 4, displayTime: 2.5, distractorMode: 'medium' },
    { cells: 4, displayTime: 2.5, distractorMode: 'medium' },
    { cells: 4, displayTime: 2.3, distractorMode: 'medium' },
    // Level 7-10: 5-cell shapes, 2s display, hard distractors
    { cells: 5, displayTime: 2.0, distractorMode: 'hard' },
    { cells: 5, displayTime: 2.0, distractorMode: 'hard' },
    { cells: 5, displayTime: 1.8, distractorMode: 'hard' },
    { cells: 5, displayTime: 1.8, distractorMode: 'hard' },
    // Level 11+: 6-7 cell shapes, 1.5s display, very hard
    { cells: 6, displayTime: 1.5, distractorMode: 'expert' },
    { cells: 6, displayTime: 1.5, distractorMode: 'expert' },
    { cells: 7, displayTime: 1.5, distractorMode: 'expert' },
  ],

  // Timer for answering (seconds)
  answerTime: 6.0,
  answerTimeMin: 3.5,
  answerTimeDecay: 0.15, // reduce per level

  // Lives
  maxLives: 3,

  // Scoring
  basePoints: 100,
  timeBonusMultiplier: 50, // bonus per second remaining
  levelBonusMultiplier: 20, // bonus per level

  // Option count
  optionCount: 4,

  // Layout — shadow display area
  shadowAreaY: 30,
  shadowAreaH: 180,

  // Layout — timer bar
  timerBarY: 225,
  timerBarH: 10,
  timerBarPad: 30,

  // Layout — options area
  optionsY: 260,
  optionPad: 12,
  optionBorder: 3,

  // Animation timings
  flashDuration: 0.6,     // correct/wrong flash
  levelTransDuration: 1.2, // "Level X" text display
  shakeIntensity: 6,
  shakeDuration: 0.3,

  // Colors
  bgColor: '#0a0a16',
  shadowColor: '#1a1a2e',
  shadowGlow: '#6644cc',
  shadowCellColor: '#2a2a50',
  shadowCellGlow: '#8866ee',

  cellColors: ['#44aaff', '#44ff66', '#ffd700', '#ff66aa'],
  cellBorder: '#ffffff',
  cellBorderAlpha: 0.2,

  gridBg: '#12121f',
  gridLine: '#1a1a2e',

  optionBg: '#12121f',
  optionBorderColor: '#2a2a40',
  optionHoverColor: '#3a3a55',
  optionSelectedColor: '#44aaff',

  correctColor: '#44ff66',
  wrongColor: '#ff4444',
  highlightColor: '#ffd700',

  timerGreen: '#44ff66',
  timerYellow: '#ffd700',
  timerRed: '#ff4444',

  textColor: '#e0e0e0',
  textDim: '#666666',
  hudColor: '#ffd700',

  levelTextColor: '#44aaff',
  levelTextSize: 36,

  // Heart icon for lives
  heartColor: '#ff4444',
  heartDimColor: '#442222',
};

// Derived
Config.gridPixelW = Config.gridCols * (Config.cellSize + Config.cellGap) - Config.cellGap;
Config.gridPixelH = Config.gridRows * (Config.cellSize + Config.cellGap) - Config.cellGap;
