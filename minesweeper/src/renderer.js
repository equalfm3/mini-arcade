/* Minesweeper — DOM Renderer (builds and updates the grid) */

var Renderer = (function () {

  var cells = [];     // 2D array: cells[y][x] = DOM element
  var gridEl = null;  // The grid container element

  /**
   * Build the grid DOM inside the given container.
   * @param {Element} container - Parent element (Shell.area)
   * @param {Function} onCellClick - Called with (x, y) on left click
   * @param {Function} onCellRightClick - Called with (x, y) on right click
   */
  function build(container, onCellClick, onCellRightClick) {
    container.innerHTML = '';
    cells = [];

    gridEl = document.createElement('div');
    gridEl.className = 'mine-grid';
    gridEl.style.gridTemplateColumns = 'repeat(' + Config.cols + ', ' + Config.cellSize + 'px)';

    for (var y = 0; y < Config.rows; y++) {
      cells[y] = [];
      for (var x = 0; x < Config.cols; x++) {
        var cell = document.createElement('div');
        cell.className = 'mine-cell hidden';
        cell.dataset.x = x;
        cell.dataset.y = y;

        // Left click
        cell.addEventListener('click', (function (cx, cy) {
          return function () { onCellClick(cx, cy); };
        })(x, y));

        // Right click (flag)
        cell.addEventListener('contextmenu', (function (cx, cy) {
          return function (e) {
            e.preventDefault();
            onCellRightClick(cx, cy);
          };
        })(x, y));

        // Long press for mobile (500ms)
        (function (el, cx, cy) {
          var longTimer = null;
          var moved = false;

          el.addEventListener('touchstart', function (e) {
            moved = false;
            longTimer = setTimeout(function () {
              if (!moved) {
                e.preventDefault();
                onCellRightClick(cx, cy);
              }
            }, 500);
          }, { passive: true });

          el.addEventListener('touchmove', function () {
            moved = true;
            clearTimeout(longTimer);
          });

          el.addEventListener('touchend', function () {
            clearTimeout(longTimer);
          });

          el.addEventListener('touchcancel', function () {
            clearTimeout(longTimer);
          });
        })(cell, x, y);

        gridEl.appendChild(cell);
        cells[y][x] = cell;
      }
    }

    container.appendChild(gridEl);
  }

  /** Update a single cell's appearance based on its state */
  function updateCell(x, y, cellData) {
    if (!cellData || !cells[y] || !cells[y][x]) return;

    var el = cells[y][x];
    var cls = 'mine-cell';
    var text = '';

    if (!cellData.revealed) {
      // Hidden cell
      cls += ' hidden';
      if (cellData.flagged) {
        cls += ' flagged';
        text = Config.flagSymbol;
      }
    } else if (cellData.mine) {
      // Revealed mine
      cls += ' revealed mine';
      text = Config.mineSymbol;
    } else if (cellData.neighbors > 0) {
      // Revealed number
      cls += ' revealed n' + cellData.neighbors;
      text = cellData.neighbors;
    } else {
      // Revealed empty
      cls += ' revealed';
    }

    el.className = cls;
    el.textContent = text;
  }

  /** Refresh all cells */
  function updateAll() {
    for (var y = 0; y < Config.rows; y++) {
      for (var x = 0; x < Config.cols; x++) {
        updateCell(x, y, Board.getCell(x, y));
      }
    }
  }

  /** Highlight the mine that was clicked (red background) */
  function highlightMine(x, y) {
    if (cells[y] && cells[y][x]) {
      cells[y][x].classList.add('mine-hit');
    }
  }

  return {
    build: build,
    updateCell: updateCell,
    updateAll: updateAll,
    highlightMine: highlightMine,
  };
})();
