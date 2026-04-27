/* Solitaire — Renderer module
   Canvas-based card rendering with retro pixel style */

var Renderer = (function () {

  /** Draw the background felt */
  function drawBackground(ctx) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);
  }

  /** Draw an empty card slot (placeholder) */
  function drawEmptySlot(ctx, x, y, label) {
    ctx.strokeStyle = Config.emptySlotBorder;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    roundRect(ctx, x, y, Config.cardW, Config.cardH, Config.cardRadius);
    ctx.stroke();
    ctx.setLineDash([]);

    if (label) {
      ctx.fillStyle = Config.emptySlotBorder;
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + Config.cardW / 2, y + Config.cardH / 2);
    }
  }

  /** Draw a face-down card */
  function drawCardBack(ctx, x, y) {
    // Card body
    ctx.fillStyle = Config.cardBack;
    roundRectFill(ctx, x, y, Config.cardW, Config.cardH, Config.cardRadius);

    // Border
    ctx.strokeStyle = Config.cardBorder;
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, Config.cardW, Config.cardH, Config.cardRadius);
    ctx.stroke();

    // Cross-hatch pattern
    ctx.strokeStyle = Config.cardBackPattern;
    ctx.lineWidth = 1;
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, x + 1, y + 1, Config.cardW - 2, Config.cardH - 2, Config.cardRadius);
    ctx.clip();

    for (var i = -Config.cardH; i < Config.cardW + Config.cardH; i += 8) {
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i + Config.cardH, y + Config.cardH);
      ctx.moveTo(x + i + Config.cardH, y);
      ctx.lineTo(x + i, y + Config.cardH);
    }
    ctx.stroke();
    ctx.restore();

    // Inner border
    ctx.strokeStyle = Config.cardBorder;
    ctx.lineWidth = 1;
    roundRect(ctx, x + 3, y + 3, Config.cardW - 6, Config.cardH - 6, 2);
    ctx.stroke();
  }

  /** Draw a face-up card */
  function drawCardFace(ctx, card, x, y, highlight) {
    var cw = Config.cardW;
    var ch = Config.cardH;
    var suitColor = Config.suitColors[card.suit];
    var suitSym = Config.suitSymbols[card.suit];

    // Card body
    ctx.fillStyle = Config.cardFace;
    roundRectFill(ctx, x, y, cw, ch, Config.cardRadius);

    // Border
    ctx.strokeStyle = highlight ? Config.cardHighlight : Config.cardBorder;
    ctx.lineWidth = highlight ? 2 : 1;
    roundRect(ctx, x, y, cw, ch, Config.cardRadius);
    ctx.stroke();

    // Top-left rank
    ctx.fillStyle = suitColor;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(card.rank, x + 4, y + 4);

    // Top-left suit symbol
    ctx.font = '10px monospace';
    ctx.fillText(suitSym, x + 4, y + 18);

    // Bottom-right rank (inverted)
    ctx.save();
    ctx.translate(x + cw - 4, y + ch - 4);
    ctx.rotate(Math.PI);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(card.rank, 0, 0);
    ctx.font = '10px monospace';
    ctx.fillText(suitSym, 0, 14);
    ctx.restore();

    // Center suit symbol (large)
    ctx.fillStyle = suitColor;
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(suitSym, x + cw / 2, y + ch / 2);
  }

  /** Draw a card (face-up or face-down) */
  function drawCard(ctx, card, x, y, highlight) {
    if (card.faceUp) {
      drawCardFace(ctx, card, x, y, highlight);
    } else {
      drawCardBack(ctx, x, y);
    }
  }

  /** Draw the stock pile */
  function drawStock(ctx) {
    var x = Config.stockX;
    var y = Config.stockY;

    if (Stock.stockEmpty()) {
      // Draw recycle indicator
      drawEmptySlot(ctx, x, y);
      ctx.fillStyle = Config.emptySlotBorder;
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u21BB', x + Config.cardW / 2, y + Config.cardH / 2);
    } else {
      // Draw stock pile (stacked backs)
      var count = Math.min(Stock.stockPile.length, 3);
      for (var i = 0; i < count; i++) {
        drawCardBack(ctx, x + i, y + i);
      }
    }
  }

  /** Draw the waste pile */
  function drawWaste(ctx) {
    var x = Config.wasteX;
    var y = Config.wasteY;
    var top = Stock.wasteTop();

    if (!top) {
      drawEmptySlot(ctx, x, y);
    } else {
      drawCardFace(ctx, top, x, y, false);
    }
  }

  /** Draw the 4 foundation piles */
  function drawFoundations(ctx) {
    for (var i = 0; i < 4; i++) {
      var x = Foundation.pileX(i);
      var y = Foundation.pileY();
      var top = Foundation.topCard(i);

      if (!top) {
        var suitSym = Config.suitSymbols[Config.suits[i]];
        drawEmptySlot(ctx, x, y, suitSym);
      } else {
        drawCardFace(ctx, top, x, y, false);
      }
    }
  }

  /** Draw the 7 tableau columns */
  function drawTableau(ctx, dragSource) {
    for (var c = 0; c < 7; c++) {
      var col = Tableau.getColumn(c);
      var cx = Tableau.cardX(c);

      if (col.length === 0) {
        drawEmptySlot(ctx, cx, Config.tableauY, 'K');
        continue;
      }

      for (var i = 0; i < col.length; i++) {
        var card = col[i];
        var cy = Tableau.cardY(c, i);

        // Skip cards being dragged
        if (dragSource && dragSource.type === 'tableau' &&
            dragSource.col === c && i >= dragSource.cardIndex) {
          continue;
        }

        // Highlight selected card
        var isSelected = Drag.selected &&
                         Drag.selected.type === 'tableau' &&
                         Drag.selected.index === c &&
                         i === Drag.selected.cardIndex;

        drawCard(ctx, card, cx, cy, isSelected);
      }
    }
  }

  /** Draw cards being dragged */
  function drawDragCards(ctx) {
    if (!Drag.dragging || Drag.dragCards.length === 0) return;

    var x = Drag.dragX;
    var y = Drag.dragY;

    for (var i = 0; i < Drag.dragCards.length; i++) {
      var card = Drag.dragCards[i];
      var cy = y + i * Config.tableauFaceUpOffset;
      drawCardFace(ctx, card, x, cy, true);
    }
  }

  /** Draw the selected card highlight for waste */
  function drawWasteHighlight(ctx) {
    if (!Drag.selected || Drag.selected.type !== 'waste') return;
    if (Drag.dragging) return;

    var top = Stock.wasteTop();
    if (top) {
      drawCardFace(ctx, top, Config.wasteX, Config.wasteY, true);
    }
  }

  /** Full scene draw */
  function drawScene(ctx) {
    drawBackground(ctx);
    drawStock(ctx);
    drawWaste(ctx);
    drawFoundations(ctx);
    drawTableau(ctx, Drag.dragging ? Drag.dragSource : null);
    drawWasteHighlight(ctx);
    drawDragCards(ctx);
  }

  // --- Helpers ---

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

  function roundRectFill(ctx, x, y, w, h, r) {
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
  }

  return {
    drawBackground: drawBackground,
    drawCard: drawCard,
    drawCardFace: drawCardFace,
    drawCardBack: drawCardBack,
    drawEmptySlot: drawEmptySlot,
    drawScene: drawScene,
    drawStock: drawStock,
    drawWaste: drawWaste,
    drawFoundations: drawFoundations,
    drawTableau: drawTableau,
    drawDragCards: drawDragCards,
  };
})();
