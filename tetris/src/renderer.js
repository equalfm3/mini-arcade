/* Tetris — Renderer (drawing functions) */

var Renderer = (function () {

  var cs = Config.cellSize;
  var pad = 1;

  /** Draw a single cell with 3D pixel look */
  function drawCell(ctx, px, py, colorIdx, alpha) {
    var color = Config.colors[colorIdx];
    var prevAlpha = ctx.globalAlpha;
    if (alpha !== undefined) ctx.globalAlpha = alpha;

    // Main fill
    ctx.fillStyle = color;
    ctx.fillRect(px + pad, py + pad, cs - pad * 2, cs - pad * 2);

    // Highlight (top-left edges)
    ctx.fillStyle = 'rgba(255,255,255,' + Config.highlightAlpha + ')';
    ctx.fillRect(px + pad, py + pad, cs - pad * 2, 2);
    ctx.fillRect(px + pad, py + pad, 2, cs - pad * 2);

    // Shadow (bottom-right edges)
    ctx.fillStyle = 'rgba(0,0,0,' + Config.shadowAlpha + ')';
    ctx.fillRect(px + pad, py + cs - pad - 2, cs - pad * 2, 2);
    ctx.fillRect(px + cs - pad - 2, py + pad, 2, cs - pad * 2);

    ctx.globalAlpha = prevAlpha;
  }

  /** Draw the playfield background + locked cells */
  function drawBoard(ctx, grid) {
    // Background
    ctx.fillStyle = Config.gridBg;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Grid lines
    ctx.strokeStyle = Config.gridLine;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (var x = 0; x <= Config.cols; x++) {
      ctx.moveTo(x * cs, 0);
      ctx.lineTo(x * cs, Config.canvasH);
    }
    for (var y = 0; y <= Config.rows; y++) {
      ctx.moveTo(0, y * cs);
      ctx.lineTo(Config.canvasW, y * cs);
    }
    ctx.stroke();

    // Locked cells
    for (var r = 0; r < Config.rows; r++) {
      for (var c = 0; c < Config.cols; c++) {
        if (grid[r][c] !== 0) {
          drawCell(ctx, c * cs, r * cs, grid[r][c] - 1);
        }
      }
    }
  }

  /** Draw the active piece at its position */
  function drawPiece(ctx, piece) {
    if (!piece) return;
    var shape = piece.shape;
    var rows = shape.length;
    var cols = shape[0].length;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (shape[r][c]) {
          var px = (piece.x + c) * cs;
          var py = (piece.y + r) * cs;
          if (piece.y + r >= 0) {
            drawCell(ctx, px, py, piece.color);
          }
        }
      }
    }
  }

  /** Draw ghost piece (transparent, at drop position) */
  function drawGhost(ctx, piece, ghostY) {
    if (!piece || ghostY === undefined) return;
    var shape = piece.shape;
    var rows = shape.length;
    var cols = shape[0].length;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (shape[r][c]) {
          var px = (piece.x + c) * cs;
          var py = (ghostY + r) * cs;
          if (ghostY + r >= 0) {
            drawCell(ctx, px, py, piece.color, Config.ghostAlpha);
          }
        }
      }
    }
  }

  /** Draw next piece preview in sidebar area */
  function drawNext(ctx, nextPiece) {
    if (!nextPiece) return;

    var sideX = Config.canvasW;

    // Sidebar background
    ctx.fillStyle = Config.sidebarBg;
    ctx.fillRect(sideX, 0, Config.sidebarW, Config.canvasH);

    // Separator line
    ctx.strokeStyle = Config.gridLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sideX, 0);
    ctx.lineTo(sideX, Config.canvasH);
    ctx.stroke();

    // "NEXT" label
    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NEXT', sideX + Config.sidebarW / 2, 20);

    // Draw the next piece centered in sidebar
    var shape = Pieces.getShape(nextPiece.type, 0);
    var rows = shape.length;
    var cols = shape[0].length;

    // Calculate piece bounding box (skip empty rows/cols)
    var minR = rows, maxR = 0, minC = cols, maxC = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (shape[r][c]) {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }

    var pieceW = (maxC - minC + 1) * cs;
    var pieceH = (maxR - minR + 1) * cs;
    var offsetX = sideX + (Config.sidebarW - pieceW) / 2 - minC * cs;
    var offsetY = 30 + (60 - pieceH) / 2 - minR * cs;

    for (var r2 = 0; r2 < rows; r2++) {
      for (var c2 = 0; c2 < cols; c2++) {
        if (shape[r2][c2]) {
          var px = offsetX + c2 * cs;
          var py = offsetY + r2 * cs;
          drawCell(ctx, px, py, nextPiece.color);
        }
      }
    }

    ctx.textAlign = 'left'; // reset
  }

  return {
    drawBoard: drawBoard,
    drawPiece: drawPiece,
    drawGhost: drawGhost,
    drawNext: drawNext
  };
})();
