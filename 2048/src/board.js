/* 2048 — Board logic (grid state, slide, merge) */

var Board = (function () {

  var grid = [];
  var _score = 0;

  /** Create an empty 4×4 grid filled with zeros */
  function makeGrid() {
    var g = [];
    for (var y = 0; y < Config.gridSize; y++) {
      g[y] = [];
      for (var x = 0; x < Config.gridSize; x++) {
        g[y][x] = 0;
      }
    }
    return g;
  }

  /** Reset the board — clear grid, zero score */
  function reset() {
    grid = makeGrid();
    _score = 0;
  }

  /** Get list of empty cell positions */
  function emptyCells() {
    var cells = [];
    for (var y = 0; y < Config.gridSize; y++) {
      for (var x = 0; x < Config.gridSize; x++) {
        if (grid[y][x] === 0) {
          cells.push({ x: x, y: y });
        }
      }
    }
    return cells;
  }

  /** Add a random tile (90% chance of 2, 10% chance of 4) */
  function addRandomTile() {
    var cells = emptyCells();
    if (cells.length === 0) return null;

    var cell = cells[Math.floor(Math.random() * cells.length)];
    var value = Math.random() < 0.9 ? 2 : 4;
    grid[cell.y][cell.x] = value;
    return { x: cell.x, y: cell.y, value: value };
  }

  /**
   * Slide one row to the left:
   * 1. Filter out zeros
   * 2. Merge adjacent equal pairs left-to-right
   * 3. Pad with zeros to length gridSize
   * Returns { row: [...], mergeScore: int, mergePositions: [index, ...] }
   */
  function slideRow(row) {
    // Step 1: remove zeros
    var filtered = [];
    for (var i = 0; i < row.length; i++) {
      if (row[i] !== 0) filtered.push(row[i]);
    }

    // Step 2: merge pairs
    var mergeScore = 0;
    var mergePositions = [];
    for (var j = 0; j < filtered.length - 1; j++) {
      if (filtered[j] === filtered[j + 1]) {
        filtered[j] *= 2;
        mergeScore += filtered[j];
        mergePositions.push(j);
        filtered.splice(j + 1, 1);
      }
    }

    // Step 3: pad with zeros
    while (filtered.length < Config.gridSize) {
      filtered.push(0);
    }

    return { row: filtered, mergeScore: mergeScore, mergePositions: mergePositions };
  }

  /**
   * Slide all tiles in the given direction.
   * Returns { moved: bool, score: int, merges: [{x, y, value}, ...] }
   */
  function slide(direction) {
    var oldGrid = [];
    var y, x;

    // Save old state for comparison
    for (y = 0; y < Config.gridSize; y++) {
      oldGrid[y] = grid[y].slice();
    }

    var totalMergeScore = 0;
    var merges = [];

    if (direction === 'left') {
      for (y = 0; y < Config.gridSize; y++) {
        var result = slideRow(grid[y]);
        grid[y] = result.row;
        totalMergeScore += result.mergeScore;
        for (var m = 0; m < result.mergePositions.length; m++) {
          merges.push({ x: result.mergePositions[m], y: y, value: result.row[result.mergePositions[m]] });
        }
      }
    } else if (direction === 'right') {
      for (y = 0; y < Config.gridSize; y++) {
        var reversed = grid[y].slice().reverse();
        var result = slideRow(reversed);
        grid[y] = result.row.reverse();
        totalMergeScore += result.mergeScore;
        for (var m = 0; m < result.mergePositions.length; m++) {
          var rx = Config.gridSize - 1 - result.mergePositions[m];
          merges.push({ x: rx, y: y, value: grid[y][rx] });
        }
      }
    } else if (direction === 'up') {
      for (x = 0; x < Config.gridSize; x++) {
        var col = [];
        for (y = 0; y < Config.gridSize; y++) col.push(grid[y][x]);
        var result = slideRow(col);
        for (y = 0; y < Config.gridSize; y++) grid[y][x] = result.row[y];
        totalMergeScore += result.mergeScore;
        for (var m = 0; m < result.mergePositions.length; m++) {
          merges.push({ x: x, y: result.mergePositions[m], value: result.row[result.mergePositions[m]] });
        }
      }
    } else if (direction === 'down') {
      for (x = 0; x < Config.gridSize; x++) {
        var col = [];
        for (y = Config.gridSize - 1; y >= 0; y--) col.push(grid[y][x]);
        var result = slideRow(col);
        var reversed = result.row.reverse();
        for (y = 0; y < Config.gridSize; y++) grid[y][x] = reversed[y];
        totalMergeScore += result.mergeScore;
        for (var m = 0; m < result.mergePositions.length; m++) {
          var ry = Config.gridSize - 1 - result.mergePositions[m];
          merges.push({ x: x, y: ry, value: grid[ry][x] });
        }
      }
    }

    _score += totalMergeScore;

    // Check if anything actually moved
    var moved = false;
    for (y = 0; y < Config.gridSize; y++) {
      for (x = 0; x < Config.gridSize; x++) {
        if (grid[y][x] !== oldGrid[y][x]) {
          moved = true;
          break;
        }
      }
      if (moved) break;
    }

    return { moved: moved, score: totalMergeScore, merges: merges };
  }

  /** Check if any move is possible */
  function canMove() {
    // Any empty cell?
    for (var y = 0; y < Config.gridSize; y++) {
      for (var x = 0; x < Config.gridSize; x++) {
        if (grid[y][x] === 0) return true;
      }
    }
    // Any adjacent equal values?
    for (var y = 0; y < Config.gridSize; y++) {
      for (var x = 0; x < Config.gridSize; x++) {
        var val = grid[y][x];
        // Check right
        if (x < Config.gridSize - 1 && grid[y][x + 1] === val) return true;
        // Check down
        if (y < Config.gridSize - 1 && grid[y + 1][x] === val) return true;
      }
    }
    return false;
  }

  /** Check if any cell has reached the win value */
  function hasWon() {
    for (var y = 0; y < Config.gridSize; y++) {
      for (var x = 0; x < Config.gridSize; x++) {
        if (grid[y][x] >= Config.winValue) return true;
      }
    }
    return false;
  }

  /** Return the current grid (4×4 array) */
  function getGrid() {
    return grid;
  }

  return {
    reset: reset,
    addRandomTile: addRandomTile,
    slide: slide,
    canMove: canMove,
    hasWon: hasWon,
    getGrid: getGrid,
    get score() { return _score; },
  };
})();
