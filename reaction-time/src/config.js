/* Reaction Time — Configuration */

var Config = {
  // Match settings
  roundsPerMatch: 7,

  // Wait range before signal (seconds) — base values
  waitMin: 1.5,
  waitMax: 5.0,

  // Per-round difficulty scaling: wait window shrinks
  waitShrink: 0.3,
  waitMinCap: 2.0,

  // Phase colors
  colors: {
    wait:    '#1a1a2e',
    ready:   '#cc2222',
    go:      '#22cc44',
    result:  '#1a3a6a',
    early:   '#cc8800',
    wrong:   '#882244',
    summary: '#0f2a4a',
  },

  // Challenge types — round 1 is always 'tap', rest are random
  challenges: ['tap', 'color', 'direction', 'sequence', 'doubletap', 'math', 'oddoneout'],

  // ---- Color challenge (Stroop) ----
  colorWords: [
    { word: 'RED',    color: '#ff4444' },
    { word: 'GREEN',  color: '#44ff66' },
    { word: 'BLUE',   color: '#4488ff' },
    { word: 'YELLOW', color: '#ffdd44' },
  ],
  colorMatchChance: 0.5,

  // ---- Direction challenge ----
  directions: ['↑', '←', '→', '↓'],
  directionKeys: {
    '↑': ['ArrowUp', 'w', 'W'],
    '←': ['ArrowLeft', 'a', 'A'],
    '→': ['ArrowRight', 'd', 'D'],
    '↓': ['ArrowDown', 's', 'S'],
  },

  // ---- Sequence challenge ----
  sequenceSymbols: ['★', '♦', '●', '▲', '■', '♥'],
  sequenceLength: 3,
  sequenceShowTime: 1.8,   // seconds to display the sequence before input

  // ---- Double-tap challenge ----
  doubleTapWindow: 0.8,    // seconds allowed between first and second tap
  doubleTapRequired: 2,

  // ---- Math challenge ----
  mathMaxNum: 20,
  mathCorrectChance: 0.5,

  // ---- Odd-one-out challenge ----
  oddShapes: ['●', '■', '▲', '♦', '★', '♥'],
  oddGridSize: 4,  // 4 items shown

  // ---- Rating thresholds (ms) ----
  ratings: [
    { max: 150,  label: 'Inhuman!',   color: '#ff44ff' },
    { max: 200,  label: 'Lightning!', color: '#ffd700' },
    { max: 250,  label: 'Blazing!',   color: '#ff8844' },
    { max: 300,  label: 'Fast!',      color: '#44ff66' },
    { max: 400,  label: 'Good',       color: '#44aaff' },
    { max: 500,  label: 'Average',    color: '#aaaaaa' },
    { max: 700,  label: 'Slow',       color: '#888888' },
    { max: Infinity, label: 'Sleepy…', color: '#666666' },
  ],

  // Penalty for wrong answer (added to time)
  wrongPenaltyMs: 200,

  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  textDim: '#888888',
  textDanger: '#ff6666',
  textSuccess: '#44ff66',

  // Timing
  earlyMessageDuration: 1.5,
  wrongMessageDuration: 1.5,
  resultMinDuration: 1.2,
  summaryMinDuration: 2.0,
};
