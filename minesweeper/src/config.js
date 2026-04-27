/* Minesweeper — Configuration */

var Config = {
  // Difficulty presets
  difficulties: {
    easy:   { cols: 9,  rows: 9,  mines: 10 },
    medium: { cols: 16, rows: 16, mines: 40 },
    hard:   { cols: 16, rows: 20, mines: 60 },
  },
  defaultDifficulty: 'easy',

  // Cell rendering
  cellSize: 28,

  // Number colors (index 0 = "1", index 7 = "8")
  numberColors: [
    '#44aaff', '#44ff66', '#ff4444', '#8844cc',
    '#ff8844', '#44ffdd', '#e0e0e0', '#888888'
  ],

  // Symbols
  mineSymbol: '💣',
  flagSymbol: '🚩',

  // Current game settings (set by setDifficulty)
  cols: 9,
  rows: 9,
  mines: 10,
};

Config.setDifficulty = function (name) {
  var d = Config.difficulties[name] || Config.difficulties.easy;
  Config.cols = d.cols;
  Config.rows = d.rows;
  Config.mines = d.mines;
};
