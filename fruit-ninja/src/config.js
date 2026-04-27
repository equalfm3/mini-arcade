/* Fruit Ninja — Configuration */

var Config = {
  // Canvas
  canvasW: 360,
  canvasH: 540,

  // Fruit types: name, body color, highlight color, radius
  fruits: [
    { name: 'watermelon', body: '#44ff66', highlight: '#88ffaa', dark: '#22aa44', radius: 26 },
    { name: 'orange',     body: '#ff8844', highlight: '#ffaa77', dark: '#cc6622', radius: 22 },
    { name: 'apple',      body: '#ff4444', highlight: '#ff7777', dark: '#cc2222', radius: 22 },
    { name: 'banana',     body: '#ffd700', highlight: '#ffee66', dark: '#b89a00', radius: 20 },
    { name: 'grape',      body: '#c084fc', highlight: '#d4aaff', dark: '#8844cc', radius: 18 },
  ],

  // Fruit interior colors (shown when sliced)
  fruitFlesh: {
    watermelon: '#ff6666',
    orange:     '#ffcc66',
    apple:      '#ffffcc',
    banana:     '#ffffaa',
    grape:      '#ddaaff',
  },

  // Bomb
  bombRadius: 22,
  bombColor: '#333333',
  bombHighlight: '#555555',
  bombFuseColor: '#ff4444',
  bombChance: 0.12,         // 12% chance a thrown item is a bomb

  // Throw physics
  throwMinVY: -620,         // min upward velocity (more negative = higher)
  throwMaxVY: -480,         // max upward velocity
  throwMinVX: -80,          // horizontal velocity range
  throwMaxVX: 80,
  gravity: 600,             // px/s² downward
  throwSpinMin: -4,         // rotation speed range (rad/s)
  throwSpinMax: 4,

  // Spawn
  spawnInterval: 1.2,       // seconds between spawn waves
  spawnIntervalMin: 0.6,    // minimum interval at high scores
  spawnCountMin: 1,         // min fruits per wave
  spawnCountMax: 4,         // max fruits per wave
  spawnMarginX: 40,         // horizontal margin from edges

  // Slice halves
  halfGravity: 500,         // gravity on sliced halves
  halfFadeTime: 1.0,        // seconds before halves disappear
  halfSpinSpeed: 6,         // rotation speed of halves

  // Blade trail
  bladeTrailLength: 12,     // number of trail points
  bladeTrailWidth: 4,       // max width of trail
  bladeTrailColor: '#ffffff',
  bladeMinSpeed: 80,        // minimum mouse speed to register a swipe (px/s)

  // Juice particles
  juiceCount: 10,           // particles per slice
  juiceSpeed: 150,
  juiceLife: 0.5,
  juiceSize: 4,

  // Lives
  lives: 3,

  // Combo
  comboWindow: 0.3,         // seconds to chain slices into a combo
  comboMinCount: 3,         // minimum slices for combo bonus

  // Scoring
  pointsPerFruit: 1,
  comboBonus: 3,            // bonus points for combo (3+ in one swipe)

  // Background
  bgColor: '#0a0a16',
  bgGradientTop: '#0e0e1a',
  bgGradientBottom: '#1a1028',

  // UI
  textColor: '#e0e0e0',
  heartColor: '#ff4444',
  heartEmpty: '#333333',
};
