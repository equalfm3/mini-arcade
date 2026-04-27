/* Pac-Man — Maze Module
   
   Classic 28×31 tile maze.
   Tile types: 0=wall, 1=path, 2=pellet, 3=power pellet, 4=ghost house, 5=tunnel
*/

var Maze = (function () {

  // Classic Pac-Man maze layout (28 cols × 31 rows)
  // 0=wall, 1=path(empty), 2=pellet, 3=power pellet, 4=ghost house, 5=tunnel, 6=ghost door
  var TEMPLATE = [
    //0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 0
    [0,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,2,2,2,0], // 1
    [0,2,0,0,0,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,0,2,0,0,0,0,2,0], // 2
    [0,3,0,0,0,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,0,2,0,0,0,0,3,0], // 3
    [0,2,0,0,0,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,0,2,0,0,0,0,2,0], // 4
    [0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0], // 5
    [0,2,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0], // 6
    [0,2,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0], // 7
    [0,2,2,2,2,2,2,0,0,2,2,2,2,0,0,2,2,2,2,0,0,2,2,2,2,2,2,0], // 8
    [0,0,0,0,0,0,2,0,0,0,0,0,1,0,0,1,0,0,0,0,0,2,0,0,0,0,0,0], // 9
    [0,0,0,0,0,0,2,0,0,0,0,0,1,0,0,1,0,0,0,0,0,2,0,0,0,0,0,0], // 10
    [0,0,0,0,0,0,2,0,0,1,1,1,1,1,1,1,1,1,1,0,0,2,0,0,0,0,0,0], // 11
    [0,0,0,0,0,0,2,0,0,1,0,0,0,6,6,6,0,0,1,0,0,2,0,0,0,0,0,0], // 12
    [0,0,0,0,0,0,2,0,0,1,0,4,4,4,4,4,4,0,1,0,0,2,0,0,0,0,0,0], // 13
    [5,5,5,5,5,5,2,1,1,1,0,4,4,4,4,4,4,0,1,1,1,2,5,5,5,5,5,5], // 14
    [0,0,0,0,0,0,2,0,0,1,0,4,4,4,4,4,4,0,1,0,0,2,0,0,0,0,0,0], // 15
    [0,0,0,0,0,0,2,0,0,1,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0], // 16
    [0,0,0,0,0,0,2,0,0,1,1,1,1,1,1,1,1,1,1,0,0,2,0,0,0,0,0,0], // 17
    [0,0,0,0,0,0,2,0,0,1,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0], // 18
    [0,0,0,0,0,0,2,0,0,1,0,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0], // 19
    [0,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,2,2,2,0], // 20
    [0,2,0,0,0,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,0,2,0,0,0,0,2,0], // 21
    [0,2,0,0,0,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,0,2,0,0,0,0,2,0], // 22
    [0,3,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,3,0], // 23
    [0,0,0,2,0,0,2,0,0,2,0,0,0,0,0,0,0,0,2,0,0,2,0,0,2,0,0,0], // 24
    [0,0,0,2,0,0,2,0,0,2,0,0,0,0,0,0,0,0,2,0,0,2,0,0,2,0,0,0], // 25
    [0,2,2,2,2,2,2,0,0,2,2,2,2,0,0,2,2,2,2,0,0,2,2,2,2,2,2,0], // 26
    [0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0], // 27
    [0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0], // 28
    [0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0], // 29
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 30
  ];

  var WALL = 0;
  var PATH = 1;
  var PELLET = 2;
  var POWER = 3;
  var GHOST_HOUSE = 4;
  var TUNNEL = 5;
  var GHOST_DOOR = 6;

  var tiles = null;

  function reset() {
    // Deep copy the template
    tiles = [];
    for (var r = 0; r < TEMPLATE.length; r++) {
      tiles[r] = TEMPLATE[r].slice();
    }
  }

  function getTile(col, row) {
    if (row < 0 || row >= Config.rows) return WALL;
    // Wrap columns for tunnel
    if (col < 0) col = Config.cols + col;
    if (col >= Config.cols) col = col - Config.cols;
    return tiles[row][col];
  }

  function setTile(col, row, val) {
    if (row < 0 || row >= Config.rows || col < 0 || col >= Config.cols) return;
    tiles[row][col] = val;
  }

  function isWalkable(col, row) {
    var t = getTile(col, row);
    return t !== WALL && t !== GHOST_HOUSE;
  }

  function isWalkableForGhost(col, row, canEnterHouse) {
    var t = getTile(col, row);
    if (t === WALL) return false;
    if (t === GHOST_HOUSE && !canEnterHouse) return false;
    return true;
  }

  function isGhostDoor(col, row) {
    return getTile(col, row) === GHOST_DOOR;
  }

  function isTunnel(col, row) {
    return getTile(col, row) === TUNNEL;
  }

  /** BFS pathfinding for ghosts */
  function bfs(startCol, startRow, targetCol, targetRow, canEnterHouse) {
    var key = function (c, r) { return c + ',' + r; };
    var visited = {};
    var queue = [{ col: startCol, row: startRow, firstDir: null }];
    visited[key(startCol, startRow)] = true;

    var dirs = [
      { dc: 0, dr: -1, name: 'up' },
      { dc: -1, dr: 0, name: 'left' },
      { dc: 0, dr: 1, name: 'down' },
      { dc: 1, dr: 0, name: 'right' },
    ];

    while (queue.length > 0) {
      var cur = queue.shift();

      if (cur.col === targetCol && cur.row === targetRow) {
        return cur.firstDir;
      }

      for (var i = 0; i < dirs.length; i++) {
        var nc = cur.col + dirs[i].dc;
        var nr = cur.row + dirs[i].dr;

        // Wrap for tunnel
        if (nc < 0) nc = Config.cols - 1;
        if (nc >= Config.cols) nc = 0;

        if (nr < 0 || nr >= Config.rows) continue;

        var nk = key(nc, nr);
        if (visited[nk]) continue;

        var t = getTile(nc, nr);
        if (t === WALL) continue;
        if (t === GHOST_HOUSE && !canEnterHouse) continue;

        visited[nk] = true;
        queue.push({
          col: nc,
          row: nr,
          firstDir: cur.firstDir || dirs[i].name,
        });
      }
    }

    return null; // no path found
  }

  return {
    WALL: WALL,
    PATH: PATH,
    PELLET: PELLET,
    POWER: POWER,
    GHOST_HOUSE: GHOST_HOUSE,
    TUNNEL: TUNNEL,
    GHOST_DOOR: GHOST_DOOR,
    reset: reset,
    getTile: getTile,
    setTile: setTile,
    isWalkable: isWalkable,
    isWalkableForGhost: isWalkableForGhost,
    isGhostDoor: isGhostDoor,
    isTunnel: isTunnel,
    bfs: bfs,
    get tiles() { return tiles; },
  };
})();
