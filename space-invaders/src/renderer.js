/* Space Invaders — Renderer module
   Draws pixel art sprites for player, enemies, and background */

var Renderer = (function () {

  // Pixel art sprite definitions (8x8 grids)
  // 1 = filled pixel, 0 = empty
  var sprites = {
    // Squid enemy — two animation frames
    squid: [
      [
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,0,1,0,0,1,0,0],
        [0,1,0,1,1,0,1,0],
        [1,0,1,0,0,1,0,1],
      ],
      [
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,1,0,0,0,0,1,0],
        [1,0,0,1,1,0,0,1],
        [0,1,0,0,0,0,1,0],
      ],
    ],
    // Crab enemy — two animation frames
    crab: [
      [
        [0,0,1,0,0,1,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,0,0,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,0,1,1,1,1,0,1],
        [1,0,1,0,0,1,0,1],
        [0,0,0,1,1,0,0,0],
      ],
      [
        [0,0,1,0,0,1,0,0],
        [1,0,0,1,1,0,0,1],
        [1,0,1,1,1,1,0,1],
        [1,1,1,0,0,1,1,1],
        [1,1,1,1,1,1,1,1],
        [0,0,1,1,1,1,0,0],
        [0,1,0,0,0,0,1,0],
        [1,0,0,0,0,0,0,1],
      ],
    ],
    // Octopus enemy — two animation frames
    octopus: [
      [
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,0,1,0,0,1,0,0],
        [0,1,0,1,1,0,1,0],
        [1,0,0,0,0,0,0,1],
      ],
      [
        [0,0,0,1,1,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,0,1,0,0,1,0,0],
        [0,1,0,0,0,0,1,0],
        [0,0,1,0,0,1,0,0],
      ],
    ],
    // Player ship
    player: [
      [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
  };

  function drawSprite8x8(ctx, sprite, x, y, w, h, color) {
    var px = w / 8;
    var py = h / 8;
    ctx.fillStyle = color;
    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        if (sprite[row][col]) {
          ctx.fillRect(
            Math.floor(x + col * px),
            Math.floor(y + row * py),
            Math.ceil(px),
            Math.ceil(py)
          );
        }
      }
    }
  }

  function drawPlayer(ctx) {
    if (!Player.visible) return;

    var px = Player.x;
    var py = Player.y;
    var w = Player.width;
    var h = Player.height;
    var sprite = sprites.player;
    var cols = sprite[0].length;
    var rows = sprite.length;
    var cellW = w / cols;
    var cellH = h / rows;

    ctx.fillStyle = Config.playerColor;
    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        if (sprite[row][col]) {
          ctx.fillRect(
            Math.floor(px + col * cellW),
            Math.floor(py + row * cellH),
            Math.ceil(cellW),
            Math.ceil(cellH)
          );
        }
      }
    }

    // Highlight top portion
    ctx.fillStyle = Config.playerHighlight;
    ctx.globalAlpha = 0.3;
    for (var row2 = 0; row2 < 4; row2++) {
      for (var col2 = 0; col2 < cols; col2++) {
        if (sprite[row2][col2]) {
          ctx.fillRect(
            Math.floor(px + col2 * cellW),
            Math.floor(py + row2 * cellH),
            Math.ceil(cellW),
            Math.ceil(cellH)
          );
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawEnemies(ctx) {
    var frame = Enemies.animFrame;

    Enemies.forEach(function (enemy, rect) {
      var spriteSet = sprites[enemy.type];
      if (!spriteSet) return;
      var sprite = spriteSet[frame] || spriteSet[0];
      drawSprite8x8(ctx, sprite, rect.x, rect.y, rect.w, rect.h, enemy.color);
    });
  }

  function drawBackground(ctx) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Subtle border
    ctx.strokeStyle = Config.borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, Config.canvasW - 1, Config.canvasH - 1);

    // Ground line
    ctx.fillStyle = Config.playerColor;
    ctx.fillRect(0, Config.canvasH - 2, Config.canvasW, 2);
  }

  function drawLives(ctx, lives) {
    var shipW = 16;
    var shipH = 10;
    var startX = 10;
    var y = Config.canvasH - 18;

    for (var i = 0; i < lives - 1; i++) {
      var sx = startX + i * (shipW + 6);
      // Draw mini player ship
      ctx.fillStyle = Config.playerColor;
      ctx.fillRect(sx + 7, y, 2, 2);
      ctx.fillRect(sx + 5, y + 2, 6, 2);
      ctx.fillRect(sx + 3, y + 4, 10, 2);
      ctx.fillRect(sx + 1, y + 6, 14, 2);
      ctx.fillRect(sx, y + 8, 16, 2);
    }
  }

  function drawWaveText(ctx, wave) {
    ctx.fillStyle = Config.textColor;
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('WAVE ' + (wave + 1), Config.canvasW - 10, Config.canvasH - 8);
    ctx.textAlign = 'left';
  }

  return {
    drawBackground: drawBackground,
    drawPlayer: drawPlayer,
    drawEnemies: drawEnemies,
    drawLives: drawLives,
    drawWaveText: drawWaveText,
  };
})();
