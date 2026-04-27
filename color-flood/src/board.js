/* Color Flood — Board logic (grid state, flood fill BFS, territory tracking) */

var Board = (function () {

  var grid = [];       // 2D array of color indices (0-5)
  var territory = [];  // Set of cell keys "x,y" belonging to the player's territory
  var _moves = 0;
  var _territorySize = 0;

  /** Initialize grid with random colors */
  function reset() {
    grid = [];
    territory = [];
    _moves = 0;
    _territorySize = 0;

    for (var y = 0; y < Config.rows; y++) {
      grid[y] = [];
      for (var x = 0; x < Config.cols; x++) {
        grid[y][x] = randInt(0, Config.colors.length - 1);
      }
    }

    // Compute initial territory from top-left
    territory = computeTerritory();
    _territorySize = territory.length;
  }

  /** Get color index at (x, y) */
  function getColor(x, y) {
    if (x < 0 || x >= Config.cols || y < 0 || y >= Config.rows) return -1;
    return grid[y][x];
  }

  /** Get the current territory color (color of top-left cell) */
  function getTerritoryColor() {
    return grid[0][0];
  }

  /**
   * BFS from (0,0) to find all connected cells sharing the same color.
   * Returns array of {x, y} objects.
   */
  function computeTerritory() {
    var color = grid[0][0];
    var visited = {};
    var result = [];
    var queue = [{ x: 0, y: 0 }];
    visited['0,0'] = true;

    while (queue.length > 0) {
      var cell = queue.shift();
      result.push(cell);

      var neighbors = [
        { x: cell.x - 1, y: cell.y },
        { x: cell.x + 1, y: cell.y },
        { x: cell.x, y: cell.y - 1 },
        { x: cell.x, y: cell.y + 1 },
      ];

      for (var i = 0; i < neighbors.length; i++) {
        var n = neighbors[i];
        var key = n.x + ',' + n.y;
        if (n.x >= 0 && n.x < Config.cols && n.y >= 0 && n.y < Config.rows &&
            !visited[key] && grid[n.y][n.x] === color) {
          visited[key] = true;
          queue.push(n);
        }
      }
    }

    return result;
  }

  /**
   * Perform a flood fill move: change territory to the new color.
   * Returns an object with:
   *   - newCells: array of {x, y} cells newly absorbed (in wave order for animation)
   *   - waves: array of arrays, each wave is cells absorbed at that distance
   *   - totalTerritory: new territory size
   *   - won: boolean
   *   - lost: boolean (out of moves and not won)
   */
  function flood(colorIndex) {
    var currentColor = grid[0][0];

    // Can't pick the same color as current territory
    if (colorIndex === currentColor) return null;

    _moves++;

    // Build a set of current territory for fast lookup
    var territorySet = {};
    for (var i = 0; i < territory.length; i++) {
      territorySet[territory[i].x + ',' + territory[i].y] = true;
    }

    // Change all territory cells to the new color
    for (var i = 0; i < territory.length; i++) {
      grid[territory[i].y][territory[i].x] = colorIndex;
    }

    // BFS outward from territory edges to find newly absorbed cells in waves
    var waves = [];
    var visited = {};
    // Copy territory set to visited
    for (var key in territorySet) {
      visited[key] = true;
    }

    // Find frontier: territory cells adjacent to non-territory cells of the new color
    var frontier = [];
    for (var i = 0; i < territory.length; i++) {
      var cell = territory[i];
      var neighbors = [
        { x: cell.x - 1, y: cell.y },
        { x: cell.x + 1, y: cell.y },
        { x: cell.x, y: cell.y - 1 },
        { x: cell.x, y: cell.y + 1 },
      ];
      for (var j = 0; j < neighbors.length; j++) {
        var n = neighbors[j];
        var nkey = n.x + ',' + n.y;
        if (n.x >= 0 && n.x < Config.cols && n.y >= 0 && n.y < Config.rows &&
            !visited[nkey] && grid[n.y][n.x] === colorIndex) {
          visited[nkey] = true;
          frontier.push(n);
        }
      }
    }

    // BFS wave by wave from frontier
    while (frontier.length > 0) {
      waves.push(frontier.slice());
      var nextFrontier = [];
      for (var i = 0; i < frontier.length; i++) {
        var cell = frontier[i];
        var neighbors = [
          { x: cell.x - 1, y: cell.y },
          { x: cell.x + 1, y: cell.y },
          { x: cell.x, y: cell.y - 1 },
          { x: cell.x, y: cell.y + 1 },
        ];
        for (var j = 0; j < neighbors.length; j++) {
          var n = neighbors[j];
          var nkey = n.x + ',' + n.y;
          if (n.x >= 0 && n.x < Config.cols && n.y >= 0 && n.y < Config.rows &&
              !visited[nkey] && grid[n.y][n.x] === colorIndex) {
            visited[nkey] = true;
            nextFrontier.push(n);
          }
        }
      }
      frontier = nextFrontier;
    }

    // Flatten waves into newCells
    var newCells = [];
    for (var w = 0; w < waves.length; w++) {
      for (var c = 0; c < waves[w].length; c++) {
        newCells.push(waves[w][c]);
      }
    }

    // Recompute territory
    territory = computeTerritory();
    _territorySize = territory.length;

    var won = _territorySize === Config.totalCells;
    var lost = !won && _moves >= Config.maxMoves;

    return {
      newCells: newCells,
      waves: waves,
      totalTerritory: _territorySize,
      won: won,
      lost: lost,
    };
  }

  /** Check if the board is fully flooded */
  function isComplete() {
    return _territorySize === Config.totalCells;
  }

  /** Get the full grid (for rendering) */
  function getGrid() {
    return grid;
  }

  /** Get current territory cells */
  function getTerritory() {
    return territory;
  }

  return {
    reset: reset,
    getColor: getColor,
    getTerritoryColor: getTerritoryColor,
    getGrid: getGrid,
    getTerritory: getTerritory,
    flood: flood,
    isComplete: isComplete,
    get moves() { return _moves; },
    get territorySize() { return _territorySize; },
  };
})();
