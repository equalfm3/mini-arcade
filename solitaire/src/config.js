/* Solitaire — Configuration */

var Config = {
  // Canvas
  canvasW: 700,
  canvasH: 500,

  // Card dimensions
  cardW: 60,
  cardH: 84,
  cardRadius: 4,
  cardGap: 4,

  // Tableau layout
  tableauX: 20,
  tableauY: 110,
  tableauGapX: 16,
  tableauFaceDownOffset: 4,
  tableauFaceUpOffset: 18,

  // Foundation layout (top-right)
  foundationX: 334,
  foundationY: 10,
  foundationGapX: 16,

  // Stock / Waste (top-left)
  stockX: 20,
  stockY: 10,
  wasteX: 100,
  wasteY: 10,

  // Animation
  animSpeed: 600,       // px per second for card movement
  autoCompleteDelay: 80, // ms between auto-complete moves
  winAnimDuration: 2000,

  // Drag
  dragSnapDist: 40,     // snap-to-target distance

  // Colors — suits
  suitRed: '#ff4444',
  suitBlack: '#e0e0e0',

  // Colors — cards
  cardFace: '#1a1a2e',
  cardBorder: '#3a3a5a',
  cardBack: '#2a4a6a',
  cardBackPattern: '#1a3a5a',
  cardHighlight: '#ffd700',
  cardSelected: '#44ff66',

  // Colors — table
  bgColor: '#0e0e1a',
  feltColor: '#0a1a0a',
  emptySlot: '#161625',
  emptySlotBorder: '#2a2a40',

  // Colors — UI
  accentColor: '#44ff66',

  // Suits
  suits: ['spades', 'hearts', 'diamonds', 'clubs'],
  suitSymbols: { spades: '\u2660', hearts: '\u2665', diamonds: '\u2666', clubs: '\u2663' },
  suitColors: { spades: '#e0e0e0', hearts: '#ff4444', diamonds: '#ff4444', clubs: '#e0e0e0' },

  // Ranks
  ranks: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
  rankValues: { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 },
};

// Derived layout values
Config.tableauColWidth = Config.cardW + Config.tableauGapX;
Config.foundationColWidth = Config.cardW + Config.foundationGapX;
