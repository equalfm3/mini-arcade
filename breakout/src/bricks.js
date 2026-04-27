/* Breakout — Bricks module */

var Bricks = (function () {

  var grid = [];

  function reset() {
    grid = [];
    var gap = Config.brickGap;
    var bw = Config.brickW;
    var bh = Config.brickH;
    var topOffset = Config.brickTopOffset;

    for (var row = 0; row < Config.brickRows; row++) {
      var rowArr = [];
      for (var col = 0; col < Config.brickCols; col++) {
        rowArr.push({
          alive: true,
          color: Config.brickColors[row],
          points: Config.brickPoints[row],
          x: gap + col * (bw + gap),
          y: topOffset + row * (bh + gap),
          w: bw,
          h: bh,
        });
      }
      grid.push(rowArr);
    }
  }

  function checkCollision(ballRect) {
    for (var row = 0; row < grid.length; row++) {
      for (var col = 0; col < grid[row].length; col++) {
        var brick = grid[row][col];
        if (!brick.alive) continue;

        if (collides(ballRect, brick)) {
          brick.alive = false;

          // Determine collision side based on overlap
          var overlapLeft = (ballRect.x + ballRect.w) - brick.x;
          var overlapRight = (brick.x + brick.w) - ballRect.x;
          var overlapTop = (ballRect.y + ballRect.h) - brick.y;
          var overlapBottom = (brick.y + brick.h) - ballRect.y;

          var minOverlapX = Math.min(overlapLeft, overlapRight);
          var minOverlapY = Math.min(overlapTop, overlapBottom);

          var side;
          if (minOverlapX < minOverlapY) {
            side = overlapLeft < overlapRight ? 'left' : 'right';
          } else {
            side = overlapTop < overlapBottom ? 'top' : 'bottom';
          }

          return {
            hit: true,
            brick: brick,
            side: side,
          };
        }
      }
    }
    return { hit: false };
  }

  function draw(ctx) {
    for (var row = 0; row < grid.length; row++) {
      for (var col = 0; col < grid[row].length; col++) {
        var brick = grid[row][col];
        if (!brick.alive) continue;

        var bx = Math.floor(brick.x);
        var by = Math.floor(brick.y);
        var bw = Math.floor(brick.w);
        var bh = Math.floor(brick.h);

        // Main brick body
        ctx.fillStyle = brick.color;
        ctx.fillRect(bx, by, bw, bh);

        // Highlight top edge
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.25;
        ctx.fillRect(bx, by, bw, 2);
        ctx.globalAlpha = 1;

        // Shadow bottom edge
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.2;
        ctx.fillRect(bx, by + bh - 2, bw, 2);
        ctx.globalAlpha = 1;
      }
    }
  }

  return {
    reset: reset,
    checkCollision: checkCollision,
    draw: draw,
    get remaining() {
      var count = 0;
      for (var row = 0; row < grid.length; row++) {
        for (var col = 0; col < grid[row].length; col++) {
          if (grid[row][col].alive) count++;
        }
      }
      return count;
    },
  };
})();
