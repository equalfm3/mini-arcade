/* Memory Cards — Configuration */

var Config = {
  // Grid size presets
  sizes: {
    small:  { cols: 4, rows: 3, pairs: 6,  label: '4×3' },
    medium: { cols: 4, rows: 4, pairs: 8,  label: '4×4' },
    large:  { cols: 6, rows: 4, pairs: 12, label: '6×4' },
  },
  defaultSize: 'medium',

  // Active grid settings (set by setSize)
  cols: 4,
  rows: 4,
  totalPairs: 8,

  // Timing
  flipDelay: 800,     // ms to show mismatched cards before flipping back
  matchDelay: 300,     // ms before marking a match

  // Card appearance
  cardBack: '#1a1a2e',
  cardBorder: '#2a2a40',

  // Card icon size (pixels)
  iconSize: 36,
};

Config.setSize = function (name) {
  var s = Config.sizes[name] || Config.sizes.medium;
  Config.cols = s.cols;
  Config.rows = s.rows;
  Config.totalPairs = s.pairs;
};

Config.setSize(Config.defaultSize);
