/* Solitaire — Drag & Tap module
   Handles mouse/touch drag-and-drop and tap-to-select-then-tap-destination.
   Also handles double-click/tap to auto-move to foundation. */

var Drag = (function () {

  var dragging = false;
  var dragCards = [];       // cards being dragged
  var dragSource = null;    // { type: 'tableau'|'waste'|'foundation', col/pile index }
  var dragOffsetX = 0;
  var dragOffsetY = 0;
  var dragX = 0;
  var dragY = 0;

  // Tap-to-select state
  var selected = null;      // { type, index, cards, cardIndex }

  // Double-click detection
  var lastClickTime = 0;
  var lastClickCard = null;
  var doubleClickThreshold = 350;

  // Canvas reference and scale
  var canvasEl = null;
  var canvasScale = 1;

  // Callbacks
  var onMove = null;        // function(source, dest, cards) — called on successful move
  var onDraw = null;        // function() — called when stock is clicked
  var onAutoMove = null;    // function(card, source) — called on double-click

  function init(canvas, scale, callbacks) {
    canvasEl = canvas;
    canvasScale = scale || 1;
    onMove = callbacks.onMove || null;
    onDraw = callbacks.onDraw || null;
    onAutoMove = callbacks.onAutoMove || null;

    canvas.addEventListener('mousedown', handleDown);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  function updateScale(scale) {
    canvasScale = scale || 1;
  }

  function getCanvasPos(e) {
    var rect = canvasEl.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / canvasScale,
      y: (e.clientY - rect.top) / canvasScale,
    };
  }

  // --- Hit testing ---

  /** Find what was clicked at (x, y).
      Returns { type, col, cardIndex, card } or null */
  function hitTest(x, y) {
    // Check stock pile
    if (hitRect(x, y, Config.stockX, Config.stockY, Config.cardW, Config.cardH)) {
      return { type: 'stock' };
    }

    // Check waste pile
    if (hitRect(x, y, Config.wasteX, Config.wasteY, Config.cardW, Config.cardH)) {
      var wt = Stock.wasteTop();
      if (wt) return { type: 'waste', card: wt };
      return null;
    }

    // Check foundation piles
    for (var f = 0; f < 4; f++) {
      var fx = Foundation.pileX(f);
      var fy = Foundation.pileY();
      if (hitRect(x, y, fx, fy, Config.cardW, Config.cardH)) {
        var ft = Foundation.topCard(f);
        return { type: 'foundation', pile: f, card: ft };
      }
    }

    // Check tableau columns (iterate in reverse to get topmost card)
    for (var c = 0; c < 7; c++) {
      var col = Tableau.getColumn(c);
      var cx = Tableau.cardX(c);

      // Check from top card down
      for (var i = col.length - 1; i >= 0; i--) {
        var card = col[i];
        var cy = Tableau.cardY(c, i);
        var ch = (i === col.length - 1) ? Config.cardH : (card.faceUp ? Config.tableauFaceUpOffset : Config.tableauFaceDownOffset);

        if (hitRect(x, y, cx, cy, Config.cardW, ch)) {
          if (!card.faceUp) return { type: 'tableau-facedown', col: c, cardIndex: i };
          return { type: 'tableau', col: c, cardIndex: i, card: card };
        }
      }

      // Check empty column slot
      if (col.length === 0 && hitRect(x, y, cx, Config.tableauY, Config.cardW, Config.cardH)) {
        return { type: 'tableau-empty', col: c };
      }
    }

    return null;
  }

  function hitRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  }

  // --- Mouse handlers ---

  function handleDown(e) {
    var pos = getCanvasPos(e);
    startInteraction(pos.x, pos.y);
  }

  function handleMove(e) {
    if (!dragging) return;
    var pos = getCanvasPos(e);
    dragX = pos.x - dragOffsetX;
    dragY = pos.y - dragOffsetY;
  }

  function handleUp(e) {
    var pos = getCanvasPos(e);
    endInteraction(pos.x, pos.y);
  }

  // --- Touch handlers ---

  function handleTouchStart(e) {
    e.preventDefault();
    var touch = e.touches[0];
    var pos = getCanvasPos(touch);
    startInteraction(pos.x, pos.y);
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if (!dragging) return;
    var touch = e.touches[0];
    var pos = getCanvasPos(touch);
    dragX = pos.x - dragOffsetX;
    dragY = pos.y - dragOffsetY;
  }

  function handleTouchEnd(e) {
    e.preventDefault();
    if (dragging) {
      // Use last known drag position for drop
      endInteraction(dragX + dragOffsetX, dragY + dragOffsetY);
    }
  }

  // --- Interaction logic ---

  function startInteraction(x, y) {
    var hit = hitTest(x, y);
    if (!hit) {
      clearSelection();
      return;
    }

    // Stock click — draw card
    if (hit.type === 'stock') {
      if (onDraw) onDraw();
      clearSelection();
      return;
    }

    // Face-down tableau card — can't interact
    if (hit.type === 'tableau-facedown') {
      clearSelection();
      return;
    }

    // Double-click detection
    var now = Date.now();
    if (hit.card && hit.card === lastClickCard && (now - lastClickTime) < doubleClickThreshold) {
      if (onAutoMove) onAutoMove(hit.card, hit);
      clearSelection();
      lastClickCard = null;
      lastClickTime = 0;
      return;
    }
    lastClickTime = now;
    lastClickCard = hit.card || null;

    // If we have a selection and clicked a valid destination
    if (selected && hit.type !== selected.type) {
      // Try to move selected to this destination
      var dest = null;
      if (hit.type === 'tableau' || hit.type === 'tableau-empty') {
        dest = { type: 'tableau', col: hit.col };
      } else if (hit.type === 'foundation') {
        dest = { type: 'foundation', pile: hit.pile };
      }
      if (dest && onMove) {
        var moved = onMove(selected, dest, selected.cards);
        if (moved) {
          clearSelection();
          return;
        }
      }
    }

    // Start drag for tableau cards
    if (hit.type === 'tableau') {
      var stack = Tableau.getFaceUpStack(hit.col, hit.cardIndex);
      if (stack.length > 0) {
        dragging = true;
        dragCards = stack;
        dragSource = { type: 'tableau', col: hit.col, cardIndex: hit.cardIndex };
        var cardX = Tableau.cardX(hit.col);
        var cardY = Tableau.cardY(hit.col, hit.cardIndex);
        dragOffsetX = x - cardX;
        dragOffsetY = y - cardY;
        dragX = cardX;
        dragY = cardY;

        // Set selection too (for tap-to-move fallback)
        selected = { type: 'tableau', index: hit.col, cards: stack, cardIndex: hit.cardIndex };
      }
      return;
    }

    // Start drag for waste card
    if (hit.type === 'waste' && hit.card) {
      dragging = true;
      dragCards = [hit.card];
      dragSource = { type: 'waste' };
      dragOffsetX = x - Config.wasteX;
      dragOffsetY = y - Config.wasteY;
      dragX = Config.wasteX;
      dragY = Config.wasteY;

      selected = { type: 'waste', index: 0, cards: [hit.card], cardIndex: 0 };
      return;
    }

    // Click on empty tableau column with selection
    if (hit.type === 'tableau-empty' && selected) {
      var dest2 = { type: 'tableau', col: hit.col };
      if (onMove) {
        var moved2 = onMove(selected, dest2, selected.cards);
        if (moved2) {
          clearSelection();
          return;
        }
      }
    }

    // Click on foundation with selection
    if (hit.type === 'foundation' && selected) {
      var dest3 = { type: 'foundation', pile: hit.pile };
      if (onMove) {
        var moved3 = onMove(selected, dest3, selected.cards);
        if (moved3) {
          clearSelection();
          return;
        }
      }
    }
  }

  function endInteraction(x, y) {
    if (!dragging) return;

    // Find drop target
    var dropTarget = findDropTarget(dragX + Config.cardW / 2, dragY + Config.cardH / 2);

    if (dropTarget && onMove) {
      onMove(dragSource, dropTarget, dragCards);
    }

    dragging = false;
    dragCards = [];
    dragSource = null;
  }

  /** Find the best drop target near the drag position */
  function findDropTarget(x, y) {
    // Check foundation piles
    for (var f = 0; f < 4; f++) {
      var fx = Foundation.pileX(f) + Config.cardW / 2;
      var fy = Foundation.pileY() + Config.cardH / 2;
      var dist = Math.sqrt((x - fx) * (x - fx) + (y - fy) * (y - fy));
      if (dist < Config.dragSnapDist + Config.cardW / 2) {
        return { type: 'foundation', pile: f };
      }
    }

    // Check tableau columns
    for (var c = 0; c < 7; c++) {
      var col = Tableau.getColumn(c);
      var cx = Tableau.cardX(c) + Config.cardW / 2;
      var cy;
      if (col.length === 0) {
        cy = Config.tableauY + Config.cardH / 2;
      } else {
        cy = Tableau.cardY(c, col.length - 1) + Config.cardH / 2;
      }
      var d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      if (d < Config.dragSnapDist + Config.cardW / 2) {
        return { type: 'tableau', col: c };
      }
    }

    return null;
  }

  function clearSelection() {
    selected = null;
    dragging = false;
    dragCards = [];
    dragSource = null;
  }

  return {
    init: init,
    updateScale: updateScale,
    clearSelection: clearSelection,
    get dragging() { return dragging; },
    get dragCards() { return dragCards; },
    get dragSource() { return dragSource; },
    get dragX() { return dragX; },
    get dragY() { return dragY; },
    get selected() { return selected; },
  };
})();
