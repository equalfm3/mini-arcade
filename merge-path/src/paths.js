/* Merge Path — Path Drawing State
   Manages path storage per color, cell occupancy,
   drag handling, and path validation.
*/

var Paths = (function () {

  var size = 0;
  var grid = [];       // grid[r][c] = colorIndex or -1 (empty)
  var paths = {};      // paths[colorIndex] = [{r, c}, ...]
  var dots = {};       // dots[colorIndex] = {r1, c1, r2, c2}
  var drawing = false;
  var drawColor = -1;
  var levelData = null;
  var moveCount = 0;

  function reset(lvl) {
    levelData = lvl;
    size = lvl.size;
    grid = [];
    paths = {};
    dots = {};
    drawing = false;
    drawColor = -1;
    moveCount = 0;

    // Init empty grid
    for (var r = 0; r < size; r++) {
      grid[r] = [];
      for (var c = 0; c < size; c++) {
        grid[r][c] = -1;
      }
    }

    // Place dots on grid and register them
    for (var i = 0; i < lvl.pairs.length; i++) {
      var p = lvl.pairs[i];
      var ci = p[0];
      dots[ci] = { r1: p[1], c1: p[2], r2: p[3], c2: p[4] };
      grid[p[1]][p[2]] = ci;
      grid[p[3]][p[4]] = ci;
      paths[ci] = [];
    }
  }

  function isDot(r, c) {
    for (var ci in dots) {
      var d = dots[ci];
      if ((d.r1 === r && d.c1 === c) || (d.r2 === r && d.c2 === c)) {
        return parseInt(ci);
      }
    }
    return -1;
  }

  function isEndpoint(colorIdx, r, c) {
    var d = dots[colorIdx];
    if (!d) return false;
    return (d.r1 === r && d.c1 === c) || (d.r2 === r && d.c2 === c);
  }

  function clearPath(colorIdx) {
    var path = paths[colorIdx];
    if (!path) return;
    // Remove path cells from grid (but keep dots)
    for (var i = 0; i < path.length; i++) {
      var cell = path[i];
      if (grid[cell.r][cell.c] === colorIdx) {
        // Only clear if not a dot of this color
        if (!isEndpoint(colorIdx, cell.r, cell.c)) {
          grid[cell.r][cell.c] = -1;
        }
      }
    }
    paths[colorIdx] = [];
  }

  function isAdjacent(r1, c1, r2, c2) {
    var dr = Math.abs(r1 - r2);
    var dc = Math.abs(c1 - c2);
    return (dr + dc) === 1;
  }

  function pathContains(colorIdx, r, c) {
    var path = paths[colorIdx];
    for (var i = 0; i < path.length; i++) {
      if (path[i].r === r && path[i].c === c) return i;
    }
    return -1;
  }

  /** Start drawing from a cell (must be a dot or on an existing path) */
  function startDraw(r, c) {
    if (r < 0 || r >= size || c < 0 || c >= size) return false;

    var dotColor = isDot(r, c);
    if (dotColor >= 0) {
      // Starting from a dot — clear existing path for this color
      clearPath(dotColor);
      drawColor = dotColor;
      drawing = true;
      paths[drawColor] = [{ r: r, c: c }];
      grid[r][c] = drawColor;
      moveCount++;
      return true;
    }

    // Check if clicking on an existing path
    var cellColor = grid[r][c];
    if (cellColor >= 0 && paths[cellColor] && paths[cellColor].length > 0) {
      // Clear this path and start fresh from its first dot
      var d = dots[cellColor];
      clearPath(cellColor);
      drawColor = cellColor;
      drawing = true;
      paths[drawColor] = [{ r: d.r1, c: d.c1 }];
      grid[d.r1][d.c1] = drawColor;
      moveCount++;
      return true;
    }

    return false;
  }

  /** Extend the current path to an adjacent cell */
  function extendTo(r, c) {
    if (!drawing || drawColor < 0) return false;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;

    var path = paths[drawColor];
    if (!path || path.length === 0) return false;

    var last = path[path.length - 1];

    // Must be adjacent (orthogonal only)
    if (!isAdjacent(last.r, last.c, r, c)) return false;

    // Check if backtracking (going back on own path)
    if (path.length >= 2) {
      var prev = path[path.length - 2];
      if (prev.r === r && prev.c === c) {
        // Backtrack: remove last cell
        var removed = path.pop();
        if (!isEndpoint(drawColor, removed.r, removed.c)) {
          grid[removed.r][removed.c] = -1;
        }
        return true;
      }
    }

    // Already in our own path? Skip
    if (pathContains(drawColor, r, c) >= 0) return false;

    // Check if cell is occupied by another color
    var occupant = grid[r][c];
    if (occupant >= 0 && occupant !== drawColor) {
      // Cell belongs to another path — check if it's a dot of another color
      if (isDot(r, c) >= 0 && isDot(r, c) !== drawColor) {
        return false; // Can't cross other dots
      }
      // Overwrite the other path at this cell and beyond
      var otherPath = paths[occupant];
      var otherIdx = pathContains(occupant, r, c);
      if (otherIdx >= 0) {
        // Truncate the other path from this cell onward
        var removed2 = otherPath.splice(otherIdx);
        for (var i = 0; i < removed2.length; i++) {
          if (!isEndpoint(occupant, removed2[i].r, removed2[i].c)) {
            grid[removed2[i].r][removed2[i].c] = -1;
          }
        }
      }
    }

    // Check if this is the other endpoint of our color — complete the path
    var isEnd = isEndpoint(drawColor, r, c);

    // Place the cell
    path.push({ r: r, c: c });
    grid[r][c] = drawColor;

    if (isEnd) {
      // Path completed — stop drawing
      drawing = false;
      drawColor = -1;
    }

    return true;
  }

  /** Stop drawing (release) */
  function endDraw() {
    drawing = false;
    drawColor = -1;
  }

  /** Count filled cells */
  function filledCount() {
    var count = 0;
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (grid[r][c] >= 0) count++;
      }
    }
    return count;
  }

  /** Check if puzzle is solved */
  function checkSolved() {
    if (!levelData) return false;
    return Puzzle.isSolved(grid, size, paths, levelData);
  }

  /** Get number of completed (connected) paths */
  function completedPaths() {
    var count = 0;
    for (var ci in dots) {
      var d = dots[ci];
      var path = paths[ci];
      if (path && Puzzle.isSolved !== undefined) {
        // Check if path connects both dots
        if (path.length >= 2) {
          var first = path[0];
          var last = path[path.length - 1];
          if (
            (first.r === d.r1 && first.c === d.c1 && last.r === d.r2 && last.c === d.c2) ||
            (first.r === d.r2 && first.c === d.c2 && last.r === d.r1 && last.c === d.c1)
          ) {
            count++;
          }
        }
      }
    }
    return count;
  }

  return {
    reset: reset,
    startDraw: startDraw,
    extendTo: extendTo,
    endDraw: endDraw,
    clearPath: clearPath,
    checkSolved: checkSolved,
    filledCount: filledCount,
    completedPaths: completedPaths,
    isDot: isDot,
    isEndpoint: isEndpoint,
    get grid() { return grid; },
    get paths() { return paths; },
    get dots() { return dots; },
    get size() { return size; },
    get drawing() { return drawing; },
    get drawColor() { return drawColor; },
    get moveCount() { return moveCount; },
  };
})();
