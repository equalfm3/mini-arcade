/* Tic-Tac-Toe — Configuration */

var Config = {
  // Board
  cols: 3,
  rows: 3,

  // Players
  playerMark: 'X',
  aiMark: 'O',

  // AI difficulty levels
  difficulties: {
    easy:   { label: 'Easy',   description: 'Random moves' },
    medium: { label: 'Medium', description: 'Blocks & takes wins' },
    hard:   { label: 'Hard',   description: 'Minimax (unbeatable)' },
  },
  defaultDifficulty: 'medium',

  // AI turn delay (seconds) — feels more natural than instant
  aiDelay: 0.4,

  // Win line animation
  winLineDelay: 0.15,       // seconds before win line appears
  winLineDuration: 0.4,     // seconds for line draw animation

  // Colors
  xColor: '#ff4444',        // X mark color
  oColor: '#44aaff',        // O mark color
  gridColor: '#2a2a40',     // grid line color
  cellBg: '#12121f',        // cell background
  cellHover: '#1a1a2e',     // cell hover background
  winLineColor: '#ffd700',  // win highlight color
  drawColor: '#888888',     // draw state color

  // Mark drawing
  markStroke: 4,            // px stroke width for X and O
  markPadding: 18,          // px padding inside cell for marks

  // Cell sizing
  cellSize: 100,            // px per cell
  cellGap: 8,               // px gap between cells
  cellRadius: 6,            // px border radius

  // Scoring
  streakKey: 'tic-tac-toe-streak',
};

// Derived
Config.totalCells = Config.cols * Config.rows;
Config.boardSize = Config.cols * Config.cellSize + (Config.cols - 1) * Config.cellGap;
