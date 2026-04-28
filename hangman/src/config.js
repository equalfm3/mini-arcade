/* Hangman — Configuration */

var Config = {
  // Canvas dimensions
  canvasW: 480,
  canvasH: 520,

  // Gallows area (left side)
  gallowsX: 20,
  gallowsY: 20,
  gallowsW: 200,
  gallowsH: 260,

  // Word display area
  wordY: 310,
  letterSize: 32,
  letterGap: 12,
  blankWidth: 28,

  // Keyboard grid (A-Z)
  keyboardY: 380,
  keySize: 38,
  keyGap: 6,
  keyRadius: 6,
  keyCols: 9,

  // Gameplay
  maxWrong: 6,          // head, body, left arm, right arm, left leg, right leg
  wordMinLen: 4,
  wordMaxLen: 10,

  // Categories
  categories: ['Animals', 'Food', 'Countries', 'Sports', 'Technology'],

  // Colors
  bg: '#0a0a16',
  gallowsColor: '#888888',
  gallowsStroke: 3,
  bodyColor: '#e0e0e0',
  bodyStroke: 3,

  blankColor: '#444466',
  letterColor: '#ffffff',
  correctColor: '#44ff66',
  wrongColor: '#ff4444',

  keyBg: '#1e1e30',
  keyBorder: '#2a2a40',
  keyText: '#cccccc',
  keyUsedCorrect: '#2a6e2a',
  keyUsedWrong: '#6e2a2a',
  keyUsedText: '#666666',

  hintColor: '#888888',
  categoryColor: '#c084fc',

  // Timing
  revealDelay: 0.3,     // delay between letter reveals on win/lose
  endDelay: 1.5,        // delay before showing overlay

  // Accent
  accent: '#c084fc',
};

// Derived
Config.keyboardRows = [
  ['A','B','C','D','E','F','G','H','I'],
  ['J','K','L','M','N','O','P','Q','R'],
  ['S','T','U','V','W','X','Y','Z']
];
