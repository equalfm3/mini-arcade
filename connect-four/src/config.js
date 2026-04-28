/* Connect Four — Configuration */

var Config = {
  // Board dimensions
  cols: 7,
  rows: 6,

  // Players
  playerDisc: 1,   // red
  aiDisc: 2,       // yellow
  empty: 0,

  // AI difficulty levels
  difficulties: {
    easy:   { label: 'Easy',   description: 'Random moves' },
    medium: { label: 'Medium', description: 'Blocks & takes wins' },
    hard:   { label: 'Hard',   description: 'Minimax depth 6' },
  },
  defaultDifficulty: 'medium',

  // AI turn delay (seconds)
  aiDelay: 0.5,

  // Minimax search depth for hard AI
  minimaxDepth: 6,

  // Animation
  dropSpeed: 1800,          // pixels per second for disc fall
  bounceHeight: 4,          // px bounce at landing
  bounceDuration: 0.12,     // seconds for bounce
  winPulseSpeed: 3,         // pulse cycles per second
  hoverAlpha: 0.35,         // ghost disc opacity

  // Canvas sizing
  cellSize: 64,             // px per cell
  discPadding: 4,           // px padding inside cell for disc
  boardPadding: 8,          // px padding around the board
  headerHeight: 48,         // px above board for column hover indicator

  // Colors
  boardColor: '#1a5fb4',    // blue board
  boardBorder: '#1650a0',   // darker board edge
  bgColor: '#0a0a16',       // background behind board
  playerColor: '#ff4444',   // red disc
  playerGlow: '#ff6666',    // red glow
  aiColor: '#ffd700',       // yellow disc
  aiGlow: '#ffeb3b',        // yellow glow
  emptyHole: '#0a0a16',     // hole color (shows background)
  gridLine: '#2266cc',      // subtle grid lines
  winHighlight: '#ffffff',  // win disc border
  hoverColor: '#ffffff',    // column hover indicator

  // Scoring
  scoreKey: 'connect-four',
};

// Derived values
Config.boardW = Config.cols * Config.cellSize + Config.boardPadding * 2;
Config.boardH = Config.rows * Config.cellSize + Config.boardPadding * 2;
Config.canvasW = Config.boardW;
Config.canvasH = Config.boardH + Config.headerHeight;
Config.discRadius = (Config.cellSize - Config.discPadding * 2) / 2;
Config.totalCells = Config.cols * Config.rows;
