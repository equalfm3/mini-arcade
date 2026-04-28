/* Sudoku — Configuration */

var Config = {
  // Grid dimensions
  size: 9,
  boxSize: 3,

  // Difficulty presets (number of given/pre-filled cells)
  difficulties: {
    easy:   { givens: 40, label: 'Easy' },
    medium: { givens: 30, label: 'Medium' },
    hard:   { givens: 24, label: 'Hard' },
  },
  defaultDifficulty: 'easy',

  // Colors
  bgCell:          '#12121f',
  bgCellSelected:  '#1a2a3a',
  bgCellSameNum:   '#1a1a30',
  bgCellGiven:     '#181828',
  bgCellError:     '#3a1010',
  borderThin:      '#2a2a40',
  borderThick:     '#4a4a60',
  colorGiven:      '#e0e0e0',
  colorPlayer:     '#44aaff',
  colorError:      '#ff4444',
  colorPencil:     '#666688',
  colorSelected:   '#ffd700',
  accent:          '#44aaff',

  // Cell size (px)
  cellSize: 44,
};

// Derived
Config.gridSize = Config.size * Config.cellSize;
