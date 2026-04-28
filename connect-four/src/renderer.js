/* Connect Four — Canvas Renderer (board, discs, animations, win highlight) */

var Renderer = (function () {

  var hoverCol = -1;
  var winCells = null;
  var winTime = 0;

  // Disc drop animations
  var drops = [];  // { col, row, disc, y, targetY, vy, landed, bounceT }

  function reset() {
    hoverCol = -1;
    winCells = null;
    winTime = 0;
    drops = [];
  }

  /** Set the column the player is hovering over. */
  function setHoverCol(col) {
    hoverCol = col;
  }

  /** Set the winning cells for highlight animation. */
  function setWinCells(cells) {
    winCells = cells;
    winTime = 0;
  }

  /** Start a disc drop animation. Returns a promise-like object with onLand callback. */
  function animateDrop(col, row, disc) {
    var targetY = Config.headerHeight + Config.boardPadding + row * Config.cellSize + Config.cellSize / 2;
    var startY = Config.headerHeight - Config.cellSize / 2;

    var anim = {
      col: col,
      row: row,
      disc: disc,
      y: startY,
      targetY: targetY,
      vy: 0,
      landed: false,
      bounceT: 0,
      _onLand: null,
    };

    anim.onLand = function (fn) { anim._onLand = fn; };
    drops.push(anim);
    return anim;
  }

  /** Update drop animations. */
  function update(dt) {
    if (winCells) winTime += dt;

    for (var i = drops.length - 1; i >= 0; i--) {
      var d = drops[i];
      if (d.landed) {
        d.bounceT += dt;
        if (d.bounceT >= Config.bounceDuration) {
          // Animation complete — remove from drops
          drops.splice(i, 1);
          if (d._onLand) d._onLand();
        }
        continue;
      }

      // Gravity acceleration
      d.vy += Config.dropSpeed * 2.5 * dt;
      d.y += d.vy * dt;

      if (d.y >= d.targetY) {
        d.y = d.targetY;
        d.landed = true;
        d.bounceT = 0;
      }
    }
  }

  /** Draw the full board. */
  function draw(ctx) {
    var w = Config.canvasW;
    var h = Config.canvasH;

    // Clear
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Draw hover indicator (ghost disc above board)
    drawHoverIndicator(ctx);

    // Draw board background
    var bx = 0;
    var by = Config.headerHeight;
    ctx.fillStyle = Config.boardColor;
    roundRect(ctx, bx, by, Config.boardW, Config.boardH, 8);
    ctx.fill();

    // Draw empty holes first (so discs show through)
    drawHoles(ctx);

    // Draw placed discs (from board state, excluding currently animating)
    drawDiscs(ctx);

    // Draw animating discs
    drawDrops(ctx);

    // Draw board overlay (holes punched through the blue board)
    drawBoardOverlay(ctx);

    // Draw win highlight
    if (winCells) drawWinHighlight(ctx);
  }

  function drawHoverIndicator(ctx) {
    if (hoverCol < 0 || hoverCol >= Config.cols) return;
    if (winCells) return; // no hover during win

    var cx = Config.boardPadding + hoverCol * Config.cellSize + Config.cellSize / 2;
    var cy = Config.headerHeight / 2;

    // Small triangle pointing down
    ctx.fillStyle = Config.hoverColor;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 4);
    ctx.lineTo(cx + 8, cy - 4);
    ctx.lineTo(cx, cy + 6);
    ctx.closePath();
    ctx.fill();

    // Ghost disc at landing position
    var landRow = Board.landingRow(hoverCol);
    if (landRow >= 0) {
      var discCx = Config.boardPadding + hoverCol * Config.cellSize + Config.cellSize / 2;
      var discCy = Config.headerHeight + Config.boardPadding + landRow * Config.cellSize + Config.cellSize / 2;
      ctx.globalAlpha = Config.hoverAlpha;
      ctx.fillStyle = Config.playerColor;
      ctx.beginPath();
      ctx.arc(discCx, discCy, Config.discRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function drawHoles(ctx) {
    for (var r = 0; r < Config.rows; r++) {
      for (var c = 0; c < Config.cols; c++) {
        var cx = Config.boardPadding + c * Config.cellSize + Config.cellSize / 2;
        var cy = Config.headerHeight + Config.boardPadding + r * Config.cellSize + Config.cellSize / 2;

        ctx.fillStyle = Config.emptyHole;
        ctx.beginPath();
        ctx.arc(cx, cy, Config.discRadius + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawDiscs(ctx) {
    // Build set of currently animating positions to skip
    var animating = {};
    for (var i = 0; i < drops.length; i++) {
      animating[drops[i].row + ',' + drops[i].col] = true;
    }

    for (var r = 0; r < Config.rows; r++) {
      for (var c = 0; c < Config.cols; c++) {
        var disc = Board.getCell(r, c);
        if (disc === Config.empty) continue;
        if (animating[r + ',' + c]) continue;

        var cx = Config.boardPadding + c * Config.cellSize + Config.cellSize / 2;
        var cy = Config.headerHeight + Config.boardPadding + r * Config.cellSize + Config.cellSize / 2;

        drawDisc(ctx, cx, cy, disc);
      }
    }
  }

  function drawDrops(ctx) {
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      var cx = Config.boardPadding + d.col * Config.cellSize + Config.cellSize / 2;
      var cy = d.y;

      // Bounce effect
      if (d.landed) {
        var t = d.bounceT / Config.bounceDuration;
        var bounce = Math.sin(t * Math.PI) * Config.bounceHeight;
        cy = d.targetY - bounce;
      }

      drawDisc(ctx, cx, cy, d.disc);
    }
  }

  function drawDisc(ctx, cx, cy, disc) {
    var color = disc === Config.playerDisc ? Config.playerColor : Config.aiColor;
    var glow = disc === Config.playerDisc ? Config.playerGlow : Config.aiGlow;

    // Main disc
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, Config.discRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight (3D effect)
    ctx.fillStyle = glow;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(cx - Config.discRadius * 0.2, cy - Config.discRadius * 0.2,
            Config.discRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawBoardOverlay(ctx) {
    // Draw the blue board with holes cut out using compositing
    // We draw the board on top, then punch holes
    ctx.save();

    // Create a temporary approach: draw board color, then cut circles
    // Use destination-out to punch holes — but that affects everything.
    // Instead, just draw the board frame around each cell.

    // Draw subtle grid lines
    ctx.strokeStyle = Config.gridLine;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;

    for (var r = 0; r <= Config.rows; r++) {
      var y = Config.headerHeight + Config.boardPadding + r * Config.cellSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(Config.boardW, y);
      ctx.stroke();
    }
    for (var c = 0; c <= Config.cols; c++) {
      var x = Config.boardPadding + c * Config.cellSize;
      ctx.beginPath();
      ctx.moveTo(x, Config.headerHeight);
      ctx.lineTo(x, Config.headerHeight + Config.boardH);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawWinHighlight(ctx) {
    if (!winCells) return;

    var pulse = 0.6 + 0.4 * Math.sin(winTime * Config.winPulseSpeed * Math.PI * 2);

    for (var i = 0; i < winCells.length; i++) {
      var cell = winCells[i];
      var cx = Config.boardPadding + cell.col * Config.cellSize + Config.cellSize / 2;
      var cy = Config.headerHeight + Config.boardPadding + cell.row * Config.cellSize + Config.cellSize / 2;

      // Glowing ring
      ctx.strokeStyle = Config.winHighlight;
      ctx.lineWidth = 3;
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(cx, cy, Config.discRadius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  /** Check if there are active drop animations. */
  function isAnimating() {
    return drops.length > 0;
  }

  // --- Utility ---
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  return {
    reset: reset,
    setHoverCol: setHoverCol,
    setWinCells: setWinCells,
    animateDrop: animateDrop,
    update: update,
    draw: draw,
    isAnimating: isAnimating,
  };
})();
