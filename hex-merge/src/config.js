/* Hex Merge — Configuration */

var Config = {
  // Hex grid: radius = number of rings around center (radius 2 = 19 cells)
  gridRadius: 2,
  hexSize: 38,       // Hex cell radius in pixels
  startTiles: 2,
  winValue: 2048,

  // Canvas
  canvasW: 400,
  canvasH: 400,

  // Animation
  slideSpeed: 12,    // cells per second for slide animation
  popDuration: 0.15, // seconds for merge pop

  // Tile colors: value → { bg, text }
  tileColors: {
    2:    { bg: '#eee4da', text: '#776e65' },
    4:    { bg: '#ede0c8', text: '#776e65' },
    8:    { bg: '#f2b179', text: '#f9f6f2' },
    16:   { bg: '#f59563', text: '#f9f6f2' },
    32:   { bg: '#f67c5f', text: '#f9f6f2' },
    64:   { bg: '#f65e3b', text: '#f9f6f2' },
    128:  { bg: '#edcf72', text: '#f9f6f2' },
    256:  { bg: '#edcc61', text: '#f9f6f2' },
    512:  { bg: '#edc850', text: '#f9f6f2' },
    1024: { bg: '#edc53f', text: '#f9f6f2' },
    2048: { bg: '#edc22e', text: '#f9f6f2' },
  },
  superTile: { bg: '#3c3a32', text: '#f9f6f2' },
  emptyCell: '#1a1a2e',
  gridBg: '#12121f',
  cellStroke: '#2a2a40',

  // 6 hex directions (axial coordinates: q, r)
  // 0=E, 1=NE, 2=NW, 3=W, 4=SW, 5=SE
  directions: [
    { q: 1, r: 0 },   // East
    { q: 1, r: -1 },  // NE
    { q: 0, r: -1 },  // NW
    { q: -1, r: 0 },  // West
    { q: -1, r: 1 },  // SW
    { q: 0, r: 1 },   // SE
  ],

  dirNames: ['E', 'NE', 'NW', 'W', 'SW', 'SE'],
};
