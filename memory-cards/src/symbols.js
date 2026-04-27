/* Memory Cards — 16x16 pixel art symbols for card faces */

var Symbols = (function () {

  var P = {
    '.': 'transparent',
    'w': '#ffffff',
    'y': '#ffd700',
    'Y': '#b89a00',
    'r': '#ff4444',
    'R': '#cc2222',
    'g': '#44ff66',
    'G': '#22aa44',
    'b': '#44aaff',
    'B': '#2266cc',
    'p': '#c084fc',
    'P': '#8844cc',
    'c': '#44ffdd',
    'C': '#22aa99',
    'o': '#ff8844',
    'O': '#cc6622',
    'm': '#ff66aa',
    'M': '#cc4488',
    'k': '#222222',
    'd': '#666666',
    '#': '#e0e0e0',
  };

  // 12 unique 16x16 pixel art icons
  var icons = {

    // 0: Star (gold)
    star: {
      color: '#ffd700',
      grid: [
        '................',
        '.......yy.......',
        '.......yy.......',
        '......yyyy......',
        '......yyyy......',
        '.yyyyyyyyyyyyy..',
        '..yyyyyyyyyyyy..',
        '...yyyyyyyyyy...',
        '....yyyyyyyy....',
        '...yyyy..yyyy...',
        '..yyyy....yyyy..',
        '..yyy......yyy..',
        '.yyy........yyy.',
        '.yy..........yy.',
        '................',
        '................',
      ]
    },

    // 1: Heart (red)
    heart: {
      color: '#ff4444',
      grid: [
        '................',
        '..rrr....rrr....',
        '.rrrrr..rrrrr...',
        '.rrrrrrrrrrrr...',
        '.rrrrrrrrrrrr...',
        '.rrrrrrrrrrrr...',
        '..rrrrrrrrrr....',
        '..rrrrrrrrrr....',
        '...rrrrrrrr.....',
        '....rrrrrr......',
        '.....rrrr.......',
        '......rr........',
        '................',
        '................',
        '................',
        '................',
      ]
    },

    // 2: Diamond (cyan)
    diamond: {
      color: '#44ffdd',
      grid: [
        '................',
        '.......cc.......',
        '......cccc......',
        '.....cccccc.....',
        '....cccccccc....',
        '...ccccwwcccc...',
        '..ccccwwwwcccc..',
        '.cccccwwcccccc..',
        '..cccccccccccc..',
        '...cccccccccc...',
        '....cccccccc....',
        '.....cccccc.....',
        '......cccc......',
        '.......cc.......',
        '................',
        '................',
      ]
    },

    // 3: Lightning (yellow)
    bolt: {
      color: '#ffeb3b',
      grid: [
        '................',
        '........yy......',
        '.......yy.......',
        '......yy........',
        '.....yy.........',
        '....yy..........',
        '...yyyyyyyy.....',
        '..........yy....',
        '.........yy.....',
        '........yy......',
        '.......yy.......',
        '......yy........',
        '.....yy.........',
        '................',
        '................',
        '................',
      ]
    },

    // 4: Music note (purple)
    note: {
      color: '#c084fc',
      grid: [
        '................',
        '......pppppp....',
        '......pppppp....',
        '......p....p....',
        '......p....p....',
        '......p....p....',
        '......p....p....',
        '......p....p....',
        '......p....p....',
        '...pppp.pppp....',
        '..pppppppppp....',
        '..pppp.ppppp....',
        '...pp...ppp.....',
        '................',
        '................',
        '................',
      ]
    },

    // 5: Flame (orange)
    flame: {
      color: '#ff8844',
      grid: [
        '................',
        '.......oo.......',
        '......ooo.......',
        '.....oooo.......',
        '....ooooo.......',
        '...oooooo.......',
        '...ooooyoo......',
        '..ooooyyooo.....',
        '..oooyyyyoo.....',
        '..oooyyyyoo.....',
        '..ooooyyooo.....',
        '...ooooooo......',
        '....ooooo.......',
        '.....ooo........',
        '................',
        '................',
      ]
    },

    // 6: Clover (green)
    clover: {
      color: '#44ff66',
      grid: [
        '................',
        '....ggg.ggg.....',
        '...ggggggggg....',
        '...ggggggggg....',
        '....ggggggg.....',
        '.ggg..ggg..ggg..',
        'ggggggggggggggg.',
        'ggggggggggggggg.',
        '.ggg..ggg..ggg..',
        '....ggggggg.....',
        '......ggg.......',
        '......ggg.......',
        '.......g........',
        '................',
        '................',
        '................',
      ]
    },

    // 7: Crown (gold)
    crown: {
      color: '#ffd700',
      grid: [
        '................',
        '.y...yyyy...y...',
        '.yy..yyyy..yy...',
        '.yy..yyyy..yy...',
        '..yy.yyyy.yy....',
        '..yy.yyyy.yy....',
        '..yyyyyyyyyyy....',
        '..yyyyyyyyyyy....',
        '..yyyyyyyyyyy....',
        '..yyyyyyyyyyy....',
        '..yyyyyyyyyyy....',
        '..yyyyyyyyyyy....',
        '................',
        '................',
        '................',
        '................',
      ]
    },

    // 8: Moon (blue)
    moon: {
      color: '#44aaff',
      grid: [
        '................',
        '.....bbbbb......',
        '....bbbbbbb.....',
        '...bbb...bbb....',
        '..bbb.....bbb...',
        '..bb.......bb...',
        '..bb.......bb...',
        '..bb........b...',
        '..bbb......bb...',
        '...bbb....bbb...',
        '....bbbbbbbbb...',
        '.....bbbbbbb....',
        '......bbbbb.....',
        '................',
        '................',
        '................',
      ]
    },

    // 9: Skull (white)
    skull: {
      color: '#e0e0e0',
      grid: [
        '................',
        '....######......',
        '...########.....',
        '..##########....',
        '..##.##.##.#....',
        '..##.##.##.#....',
        '..##########....',
        '..##########....',
        '...###..###.....',
        '...########.....',
        '....######......',
        '....#.#.#.#.....',
        '....######......',
        '................',
        '................',
        '................',
      ]
    },

    // 10: Potion (magenta)
    potion: {
      color: '#ff66aa',
      grid: [
        '................',
        '......####......',
        '......#..#......',
        '......####......',
        '.......mm.......',
        '......mmmm......',
        '.....mmmmmm.....',
        '....mmmmmmmm....',
        '....mmmwmmmm....',
        '....mmwwmmmm....',
        '....mmmmmmmm....',
        '....mmmmmmmm....',
        '.....mmmmmm.....',
        '......mmmm......',
        '................',
        '................',
      ]
    },

    // 11: Shield (blue)
    shield: {
      color: '#44aaff',
      grid: [
        '................',
        '..bbbbbbbbbb....',
        '..bbbbbbbbbb....',
        '..bb..bb..bb....',
        '..bb..bb..bb....',
        '..bbbbbbbbbb....',
        '..bbbbbbbbbb....',
        '...bbbbbbbb.....',
        '...bbbbbbbb.....',
        '....bbbbbb......',
        '....bbbbbb......',
        '.....bbbb.......',
        '......bb........',
        '................',
        '................',
        '................',
      ]
    },
  };

  var names = ['star','heart','diamond','bolt','note','flame','clover','crown','moon','skull','potion','shield'];

  /** Build an inline SVG string for a symbol at given size */
  function buildSVG(name, size) {
    var icon = icons[name];
    if (!icon) return '';
    var s = size || 48;
    var grid = icon.grid;
    var rows = grid.length;
    var cols = 16;
    var px = s / cols;
    var rects = '';

    for (var y = 0; y < rows; y++) {
      var row = grid[y];
      for (var x = 0; x < cols; x++) {
        var ch = row[x];
        if (!ch || ch === '.') continue;
        var color = P[ch] || '#888';
        rects += '<rect x="' + (x * px) + '" y="' + (y * px) + '" width="' + px + '" height="' + px + '" fill="' + color + '"/>';
      }
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + s + ' ' + s +
      '" width="' + s + '" height="' + s + '" shape-rendering="crispEdges">' + rects + '</svg>';
  }

  /** Get symbol data by index */
  function get(index) {
    var name = names[index % names.length];
    return { name: name, color: icons[name].color };
  }

  /** Get the number of available symbols */
  function count() {
    return names.length;
  }

  return {
    svg: buildSVG,
    get: get,
    count: count,
    names: names,
  };
})();
