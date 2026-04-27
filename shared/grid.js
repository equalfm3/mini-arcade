/* ============================================
   grid.js — Grid/board helper for tile-based games
   
   Usage:
     var board = Grid.create(4, 4, 0);
     board.set(1, 2, 'mine');
     board.get(1, 2); // 'mine'
     board.neighbors(1, 2); // [{x,y,val}, ...]
     board.forEach(function(x, y, val) { ... });
   
   Also: Grid.renderDOM() for DOM-based grids
   (Minesweeper, 2048, Memory Cards, etc.)
   ============================================ */

var Grid = (function () {

  function create(cols, rows, fill) {
    var data = [];
    for (var y = 0; y < rows; y++) {
      data[y] = [];
      for (var x = 0; x < cols; x++) {
        data[y][x] = typeof fill === 'function' ? fill(x, y) : fill;
      }
    }

    var grid = {
      cols: cols,
      rows: rows,
      data: data,

      get: function (x, y) {
        if (x < 0 || x >= cols || y < 0 || y >= rows) return undefined;
        return data[y][x];
      },

      set: function (x, y, val) {
        if (x < 0 || x >= cols || y < 0 || y >= rows) return;
        data[y][x] = val;
      },

      inBounds: function (x, y) {
        return x >= 0 && x < cols && y >= 0 && y < rows;
      },

      forEach: function (fn) {
        for (var y = 0; y < rows; y++) {
          for (var x = 0; x < cols; x++) {
            fn(x, y, data[y][x]);
          }
        }
      },

      /** Get orthogonal neighbors */
      neighbors4: function (x, y) {
        var dirs = [[0,-1],[1,0],[0,1],[-1,0]];
        var result = [];
        for (var i = 0; i < dirs.length; i++) {
          var nx = x + dirs[i][0], ny = y + dirs[i][1];
          if (grid.inBounds(nx, ny)) {
            result.push({ x: nx, y: ny, val: data[ny][nx] });
          }
        }
        return result;
      },

      /** Get all 8 neighbors */
      neighbors8: function (x, y) {
        var result = [];
        for (var dy = -1; dy <= 1; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            var nx = x + dx, ny = y + dy;
            if (grid.inBounds(nx, ny)) {
              result.push({ x: nx, y: ny, val: data[ny][nx] });
            }
          }
        }
        return result;
      },

      /** Find first cell matching predicate */
      find: function (fn) {
        for (var y = 0; y < rows; y++) {
          for (var x = 0; x < cols; x++) {
            if (fn(x, y, data[y][x])) return { x: x, y: y, val: data[y][x] };
          }
        }
        return null;
      },

      /** Count cells matching predicate */
      count: function (fn) {
        var n = 0;
        grid.forEach(function (x, y, v) { if (fn(x, y, v)) n++; });
        return n;
      },

      /** Fill entire grid */
      fill: function (val) {
        grid.forEach(function (x, y) {
          data[y][x] = typeof val === 'function' ? val(x, y) : val;
        });
      },

      /** Clone the grid */
      clone: function () {
        var g = create(cols, rows, 0);
        grid.forEach(function (x, y, v) { g.set(x, y, v); });
        return g;
      },
    };

    return grid;
  }

  /**
   * Render a grid as DOM cells inside a container.
   * Returns a lookup: cells[y][x] = DOM element.
   */
  function renderDOM(grid, container, onCellClick) {
    container.innerHTML = '';
    container.className = 'game-board';
    container.style.gridTemplateColumns = 'repeat(' + grid.cols + ', 1fr)';

    var cells = [];
    for (var y = 0; y < grid.rows; y++) {
      cells[y] = [];
      for (var x = 0; x < grid.cols; x++) {
        var cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        if (onCellClick) {
          cell.addEventListener('click', (function (cx, cy) {
            return function () { onCellClick(cx, cy); };
          })(x, y));
        }
        container.appendChild(cell);
        cells[y][x] = cell;
      }
    }

    return cells;
  }

  return {
    create: create,
    renderDOM: renderDOM,
  };
})();
