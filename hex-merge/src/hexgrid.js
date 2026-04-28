/* Hex Merge — Hexagonal Grid (axial coordinates)

   Uses axial coordinate system (q, r) with flat-top hexagons.
   Grid radius = 2 means cells where max(|q|, |r|, |q+r|) <= 2
   Total cells = 3*R*R + 3*R + 1 = 19 for R=2
*/

var HexGrid = (function () {

  // All valid cell keys for the grid
  var cells = [];
  var cellMap = {};  // key → value

  /** Generate all valid hex positions for given radius */
  function generateCells(radius) {
    cells = [];
    cellMap = {};
    for (var q = -radius; q <= radius; q++) {
      for (var r = -radius; r <= radius; r++) {
        if (Math.abs(q + r) <= radius) {
          var key = q + ',' + r;
          cells.push({ q: q, r: r, key: key });
          cellMap[key] = 0;
        }
      }
    }
  }

  /** Reset all cells to 0 */
  function reset() {
    generateCells(Config.gridRadius);
  }

  /** Get value at (q, r) */
  function get(q, r) {
    var key = q + ',' + r;
    if (key in cellMap) return cellMap[key];
    return -1; // out of bounds
  }

  /** Set value at (q, r) */
  function set(q, r, val) {
    var key = q + ',' + r;
    if (key in cellMap) cellMap[key] = val;
  }

  /** Check if (q, r) is a valid cell */
  function isValid(q, r) {
    return (q + ',' + r) in cellMap;
  }

  /** Get all empty cell positions */
  function emptyCells() {
    var empty = [];
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      if (cellMap[c.key] === 0) {
        empty.push({ q: c.q, r: c.r });
      }
    }
    return empty;
  }

  /** Add a random tile (90% = 2, 10% = 4) */
  function addRandomTile() {
    var empty = emptyCells();
    if (empty.length === 0) return null;
    var cell = empty[Math.floor(Math.random() * empty.length)];
    var value = Math.random() < 0.9 ? 2 : 4;
    set(cell.q, cell.r, value);
    return { q: cell.q, r: cell.r, value: value };
  }

  /**
   * Slide all tiles in one of 6 directions.
   * direction: index 0-5 from Config.directions
   * Returns { moved: bool, score: int, merges: [{q, r, value}] }
   */
  function slide(dirIndex) {
    var dir = Config.directions[dirIndex];
    var totalScore = 0;
    var merges = [];
    var moved = false;

    // We need to process cells in the correct order:
    // For each direction, process cells starting from the "far" side
    // Sort cells by their projection onto the direction vector
    var sorted = cells.slice().sort(function (a, b) {
      // Project onto direction: higher projection = further in that direction
      var projA = a.q * dir.q + a.r * dir.r;
      var projB = b.q * dir.q + b.r * dir.r;
      return projB - projA; // Process far cells first
    });

    // Track which cells have already been merged this turn
    var merged = {};

    for (var i = 0; i < sorted.length; i++) {
      var cell = sorted[i];
      var val = cellMap[cell.key];
      if (val === 0) continue;

      // Try to move this tile as far as possible in the direction
      var cq = cell.q;
      var cr = cell.r;

      while (true) {
        var nq = cq + dir.q;
        var nr = cr + dir.r;
        var nkey = nq + ',' + nr;

        if (!isValid(nq, nr)) break; // hit edge

        var nval = cellMap[nkey];
        if (nval === 0) {
          // Move into empty cell
          cellMap[nkey] = val;
          cellMap[cq + ',' + cr] = 0;
          cq = nq;
          cr = nr;
          moved = true;
        } else if (nval === val && !merged[nkey]) {
          // Merge!
          var newVal = val * 2;
          cellMap[nkey] = newVal;
          cellMap[cq + ',' + cr] = 0;
          merged[nkey] = true;
          totalScore += newVal;
          merges.push({ q: nq, r: nr, value: newVal });
          moved = true;
          break;
        } else {
          break; // blocked
        }
      }
    }

    return { moved: moved, score: totalScore, merges: merges };
  }

  /** Check if any move is possible in any of 6 directions */
  function canMove() {
    // Any empty cell means we can always place
    if (emptyCells().length > 0) return true;

    // Check if any adjacent same-value pair exists
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      var val = cellMap[c.key];
      if (val === 0) return true;

      for (var d = 0; d < 6; d++) {
        var dir = Config.directions[d];
        var nq = c.q + dir.q;
        var nr = c.r + dir.r;
        if (isValid(nq, nr) && get(nq, nr) === val) {
          return true;
        }
      }
    }
    return false;
  }

  /** Check if any cell has reached win value */
  function hasWon() {
    for (var i = 0; i < cells.length; i++) {
      if (cellMap[cells[i].key] >= Config.winValue) return true;
    }
    return false;
  }

  /** Convert axial (q, r) to pixel position (center of hex) */
  function hexToPixel(q, r) {
    var size = Config.hexSize;
    var x = size * (3 / 2 * q);
    var y = size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
    return { x: x, y: y };
  }

  /** Get all cells with their positions and values */
  function getAllCells() {
    var result = [];
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      result.push({ q: c.q, r: c.r, value: cellMap[c.key] });
    }
    return result;
  }

  return {
    reset: reset,
    get: get,
    set: set,
    isValid: isValid,
    emptyCells: emptyCells,
    addRandomTile: addRandomTile,
    slide: slide,
    canMove: canMove,
    hasWon: hasWon,
    hexToPixel: hexToPixel,
    getAllCells: getAllCells,
    get cells() { return cells; },
  };
})();
