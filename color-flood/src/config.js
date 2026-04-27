/* Color Flood — Configuration */

var Config = {
  // Grid dimensions
  cols: 14,
  rows: 14,

  // Colors — 6 vibrant, easily distinguishable
  colors: [
    '#ff4444',  // red
    '#ff8844',  // orange
    '#ffd700',  // yellow
    '#44ff66',  // green
    '#44aaff',  // blue
    '#c084fc',  // purple
  ],

  colorNames: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'],

  // Gameplay
  maxMoves: 25,

  // Animation
  floodWaveDelay: 30,     // ms delay between each wave ring of flood animation
  floodCellDuration: 200, // ms for each cell's color transition
  absorbPause: 150,       // ms pause after flood animation before re-enabling input

  // Progress bar
  progressHeight: 8,      // px height of progress bar

  // Cell sizing
  cellSize: 28,           // px per cell (responsive, this is the max)
  cellGap: 2,             // px gap between cells
  cellRadius: 3,          // px border radius

  // Color picker button sizing
  pickerSize: 44,         // px per color button
  pickerGap: 8,           // px gap between buttons
  pickerRadius: 8,        // px border radius

  // Scoring
  streakKey: 'color-flood-streak',
};

// Derived
Config.totalCells = Config.cols * Config.rows;
