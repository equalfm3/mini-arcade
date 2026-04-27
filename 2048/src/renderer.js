/* 2048 — DOM Renderer (builds and updates the tile grid) */

var Renderer = (function () {

  var gridEl = null;
  var tileLayer = null;
  var tileEls = [];   // Array of current tile DOM elements

  /**
   * Build the 4×4 grid with empty cell backgrounds.
   * @param {Element} container - Parent element (Shell.area)
   */
  function build(container) {
    container.innerHTML = '';
    tileEls = [];

    gridEl = document.createElement('div');
    gridEl.className = 'grid-2048';

    // Create empty cell backgrounds
    for (var i = 0; i < Config.gridSize * Config.gridSize; i++) {
      var cell = document.createElement('div');
      cell.className = 'cell-2048';
      gridEl.appendChild(cell);
    }

    // Create tile overlay layer
    tileLayer = document.createElement('div');
    tileLayer.className = 'tile-layer';
    gridEl.appendChild(tileLayer);

    container.appendChild(gridEl);
    preventScroll(gridEl);
  }

  /**
   * Compute the CSS left/top for a tile at grid position (x, y).
   * Each cell is cellSize wide with cellGap between them.
   */
  function tilePos(x, y) {
    var size = Config.cellSize + Config.cellGap;
    return {
      left: x * size + 'px',
      top: y * size + 'px'
    };
  }

  /** Get the CSS class for a tile value */
  function tileClass(value) {
    if (value <= 2048) return 'tile tile-' + value;
    return 'tile tile-super';
  }

  /**
   * Full update: rebuild all tiles from the grid state.
   * @param {Array} grid - 4×4 array of values
   * @param {Object|null} newTile - { x, y, value } of newly spawned tile
   * @param {Array} merges - [{ x, y, value }, ...] of merged tiles
   */
  function update(grid, newTile, merges) {
    // Remove old tiles
    tileLayer.innerHTML = '';
    tileEls = [];

    // Build merge lookup for animation
    var mergeMap = {};
    for (var m = 0; m < merges.length; m++) {
      mergeMap[merges[m].x + ',' + merges[m].y] = true;
    }

    for (var y = 0; y < Config.gridSize; y++) {
      for (var x = 0; x < Config.gridSize; x++) {
        var val = grid[y][x];
        if (val === 0) continue;

        var tile = document.createElement('div');
        tile.className = tileClass(val);
        tile.textContent = val;

        var pos = tilePos(x, y);
        tile.style.left = pos.left;
        tile.style.top = pos.top;

        // Animate new tile
        if (newTile && newTile.x === x && newTile.y === y) {
          tile.classList.add('tile-new');
        }

        // Animate merged tile
        if (mergeMap[x + ',' + y]) {
          tile.classList.add('tile-merged');
        }

        tileLayer.appendChild(tile);
        tileEls.push(tile);
      }
    }
  }

  /** Remove all tiles */
  function clear() {
    if (tileLayer) tileLayer.innerHTML = '';
    tileEls = [];
  }

  return {
    build: build,
    update: update,
    clear: clear,
  };
})();
