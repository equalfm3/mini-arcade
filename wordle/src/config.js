/* Wordle — Configuration */

var Config = {
  // Board
  wordLength: 5,
  maxGuesses: 6,

  // Tile sizing
  tileSize: 58,
  tileGap: 6,
  tileBorder: 2,
  tileRadius: 4,

  // Keyboard layout (QWERTY)
  keyboardRows: [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['ENTER','Z','X','C','V','B','N','M','BACK']
  ],

  // Timing (seconds)
  flipDelay: 0.3,        // delay between each tile flip in a row
  flipDuration: 0.5,     // single tile flip animation duration
  shakeDelay: 0.5,       // shake animation duration for invalid word
  winDelay: 1.8,         // delay before showing win overlay
  loseDelay: 2.0,        // delay before showing lose overlay

  // Tile states
  states: {
    empty:   'empty',
    filled:  'filled',
    correct: 'correct',
    present: 'present',
    absent:  'absent'
  },

  // Colors
  tileBg:        '#12121f',
  tileBorder:    '#2a2a40',
  tileFilled:    '#3a3a55',
  tileCorrect:   '#538d4e',
  tilePresent:   '#b59f3b',
  tileAbsent:    '#3a3a4c',
  tileText:      '#ffffff',

  keyBg:         '#818384',
  keyCorrect:    '#538d4e',
  keyPresent:    '#b59f3b',
  keyAbsent:     '#3a3a4c',
  keyText:       '#ffffff',

  // State priority (higher = better, used for keyboard color updates)
  statePriority: {
    empty:   0,
    absent:  1,
    present: 2,
    correct: 3
  },
};

// Derived
Config.gridWidth  = Config.wordLength * Config.tileSize + (Config.wordLength - 1) * Config.tileGap;
Config.gridHeight = Config.maxGuesses * Config.tileSize + (Config.maxGuesses - 1) * Config.tileGap;
