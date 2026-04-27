/* Pac-Man — Renderer Module
   
   Draws the maze walls, background, and HUD elements.
   Pellets, player, and ghosts draw themselves.
*/

var Renderer = (function () {

  /** Draw the maze walls */
  function drawMaze(ctx) {
    var cs = Config.cellSize;

    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Draw walls with rounded style
    ctx.fillStyle = Config.mazeColor;

    for (var r = 0; r < Config.rows; r++) {
      for (var c = 0; c < Config.cols; c++) {
        var t = Maze.getTile(c, r);
        if (t === Maze.WALL) {
          drawWallTile(ctx, c, r, cs);
        } else if (t === Maze.GHOST_DOOR) {
          // Draw ghost house door
          ctx.fillStyle = '#ffb8ff';
          ctx.fillRect(c * cs, r * cs + cs / 2 - 1, cs, 2);
          ctx.fillStyle = Config.mazeColor;
        }
      }
    }
  }

  function drawWallTile(ctx, c, r, cs) {
    var x = c * cs;
    var y = r * cs;

    // Check neighbors to draw connected walls
    var up = Maze.getTile(c, r - 1) === Maze.WALL;
    var down = Maze.getTile(c, r + 1) === Maze.WALL;
    var left = Maze.getTile(c - 1, r) === Maze.WALL;
    var right = Maze.getTile(c + 1, r) === Maze.WALL;

    // Draw wall border lines instead of filled blocks for classic look
    var lineW = 1.5;
    var half = cs / 2;

    ctx.strokeStyle = Config.mazeColor;
    ctx.lineWidth = lineW;

    // Determine which edges face a non-wall tile
    var upOpen = !up;
    var downOpen = !down;
    var leftOpen = !left;
    var rightOpen = !right;

    // Draw border segments on edges facing open space
    if (upOpen) {
      ctx.beginPath();
      ctx.moveTo(x + (leftOpen ? half : 0), y + half);
      ctx.lineTo(x + (rightOpen ? half : cs), y + half);
      ctx.stroke();
    }
    if (downOpen) {
      ctx.beginPath();
      ctx.moveTo(x + (leftOpen ? half : 0), y + half);
      ctx.lineTo(x + (rightOpen ? half : cs), y + half);
      ctx.stroke();
    }
    if (leftOpen) {
      ctx.beginPath();
      ctx.moveTo(x + half, y + (upOpen ? half : 0));
      ctx.lineTo(x + half, y + (downOpen ? half : cs));
      ctx.stroke();
    }
    if (rightOpen) {
      ctx.beginPath();
      ctx.moveTo(x + half, y + (upOpen ? half : 0));
      ctx.lineTo(x + half, y + (downOpen ? half : cs));
      ctx.stroke();
    }

    // Draw corners for L-shaped wall connections
    if (!up && !left && Maze.getTile(c - 1, r - 1) !== Maze.WALL) {
      ctx.beginPath();
      ctx.arc(x + half, y + half, half, Math.PI, Math.PI * 1.5);
      ctx.stroke();
    }
    if (!up && !right && Maze.getTile(c + 1, r - 1) !== Maze.WALL) {
      ctx.beginPath();
      ctx.arc(x + half, y + half, half, Math.PI * 1.5, 0);
      ctx.stroke();
    }
    if (!down && !left && Maze.getTile(c - 1, r + 1) !== Maze.WALL) {
      ctx.beginPath();
      ctx.arc(x + half, y + half, half, Math.PI * 0.5, Math.PI);
      ctx.stroke();
    }
    if (!down && !right && Maze.getTile(c + 1, r + 1) !== Maze.WALL) {
      ctx.beginPath();
      ctx.arc(x + half, y + half, half, 0, Math.PI * 0.5);
      ctx.stroke();
    }
  }

  /** Draw lives indicator at bottom */
  function drawLives(ctx, lives) {
    var cs = Config.cellSize;
    var y = Config.rows * cs + cs;
    var radius = cs / 2 - 2;

    ctx.fillStyle = Config.playerColor;
    for (var i = 0; i < lives - 1; i++) {
      var x = cs * 2 + i * (cs + 4);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, radius, 0.2 * Math.PI, -0.2 * Math.PI, true);
      ctx.closePath();
      ctx.fill();
    }
  }

  /** Draw level indicator */
  function drawLevel(ctx, level) {
    var cs = Config.cellSize;
    ctx.fillStyle = Config.textColor;
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('LVL ' + level, Config.canvasW - cs, Config.rows * cs + cs + 4);
    ctx.textAlign = 'left';
  }

  /** Draw "READY!" text */
  function drawReady(ctx) {
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('READY!', Config.canvasW / 2, 17 * Config.cellSize + Config.cellSize / 2 + 4);
    ctx.textAlign = 'left';
  }

  return {
    drawMaze: drawMaze,
    drawLives: drawLives,
    drawLevel: drawLevel,
    drawReady: drawReady,
  };
})();
