/* Pac-Man — Pellets Module
   
   Manages pellet and power pellet state.
   Pellets are stored in the maze tile data.
*/

var Pellets = (function () {

  var totalPellets = 0;
  var eaten = 0;
  var blinkTimer = 0;
  var powerVisible = true;

  function reset() {
    eaten = 0;
    totalPellets = 0;
    blinkTimer = 0;
    powerVisible = true;

    // Count pellets in maze
    for (var r = 0; r < Config.rows; r++) {
      for (var c = 0; c < Config.cols; c++) {
        var t = Maze.getTile(c, r);
        if (t === Maze.PELLET || t === Maze.POWER) {
          totalPellets++;
        }
      }
    }
  }

  function update(dt) {
    // Power pellet blink
    blinkTimer += dt * Config.powerPelletBlinkRate;
    powerVisible = Math.floor(blinkTimer) % 2 === 0;
  }

  /** Try to eat pellet at tile position. Returns score or 0. */
  function eat(col, row) {
    var t = Maze.getTile(col, row);
    if (t === Maze.PELLET) {
      Maze.setTile(col, row, Maze.PATH);
      eaten++;
      return Config.pelletScore;
    }
    if (t === Maze.POWER) {
      Maze.setTile(col, row, Maze.PATH);
      eaten++;
      return Config.powerPelletScore;
    }
    return 0;
  }

  function allEaten() {
    return eaten >= totalPellets;
  }

  function draw(ctx) {
    var cs = Config.cellSize;
    var half = cs / 2;

    for (var r = 0; r < Config.rows; r++) {
      for (var c = 0; c < Config.cols; c++) {
        var t = Maze.getTile(c, r);
        if (t === Maze.PELLET) {
          ctx.fillStyle = Config.pelletColor;
          ctx.beginPath();
          ctx.arc(c * cs + half, r * cs + half, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (t === Maze.POWER && powerVisible) {
          ctx.fillStyle = Config.powerPelletColor;
          ctx.beginPath();
          ctx.arc(c * cs + half, r * cs + half, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  return {
    reset: reset,
    update: update,
    eat: eat,
    allEaten: allEaten,
    draw: draw,
    get remaining() { return totalPellets - eaten; },
    get total() { return totalPellets; },
  };
})();
