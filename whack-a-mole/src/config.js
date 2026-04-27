/* Whack-a-Mole — Configuration */

var Config = {
  // Grid
  cols: 3,
  rows: 3,

  // Round
  roundDuration: 30,       // seconds

  // Mole timing (seconds)
  moleShowMin: 0.6,        // minimum time a mole stays visible
  moleShowMax: 1.4,        // maximum time a mole stays visible
  spawnIntervalMin: 0.4,   // minimum time between spawns
  spawnIntervalMax: 1.2,   // maximum time between spawns
  maxActiveMoles: 2,       // max moles visible at once

  // Difficulty ramp — as time passes, moles get faster
  difficultyRamp: 0.02,    // reduce show/spawn times by this per second elapsed

  // Mole types
  moleTypes: {
    normal: { points: 10, color: '#aa6633', chance: 0.75 },
    golden: { points: 30, color: '#ffd700', chance: 0.15 },
    bomb:   { points: -15, color: '#ff4444', chance: 0.10 },
  },

  // Scoring
  missPoints: 0,           // no penalty for missing
  comboWindow: 1.5,        // seconds to chain hits for combo
  comboMultiplier: 0.5,    // extra multiplier per combo level (1x, 1.5x, 2x, ...)
  maxCombo: 5,

  // Colors
  holeColor: '#1a1020',
  holeBorder: '#2a2040',
  holeMound: '#3a2a1a',
  bgColor: '#0e0e1a',
  gridBg: '#12121f',

  // Mole appearance
  moleSize: 80,            // px height of mole area
  holeWidth: 90,           // px
  holeHeight: 50,          // px (visible hole opening)
};

// Derived
Config.totalHoles = Config.cols * Config.rows;
