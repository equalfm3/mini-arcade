/* Solitaire — Stock & Waste module
   Stock pile (draw pile) and waste pile with draw-1 mechanic */

var Stock = (function () {

  var stockPile = [];  // face-down draw pile
  var wastePile = [];  // face-up discard pile

  /** Initialize stock with remaining cards after tableau deal */
  function init(cards) {
    stockPile = [];
    wastePile = [];
    for (var i = 0; i < cards.length; i++) {
      cards[i].faceUp = false;
      stockPile.push(cards[i]);
    }
  }

  /** Reset stock and waste */
  function reset() {
    stockPile = [];
    wastePile = [];
  }

  /** Draw one card from stock to waste.
      If stock is empty, recycle waste back to stock. 
      Returns true if a card was drawn or recycled. */
  function draw() {
    if (stockPile.length === 0) {
      // Recycle waste back to stock
      if (wastePile.length === 0) return false;
      while (wastePile.length > 0) {
        var card = wastePile.pop();
        card.faceUp = false;
        stockPile.push(card);
      }
      return true; // recycled
    }
    // Draw top card from stock to waste
    var card = stockPile.pop();
    card.faceUp = true;
    wastePile.push(card);
    return true;
  }

  /** Get the top card of the waste pile (playable card) */
  function wasteTop() {
    return wastePile.length > 0 ? wastePile[wastePile.length - 1] : null;
  }

  /** Remove and return the top card from waste */
  function takeFromWaste() {
    if (wastePile.length === 0) return null;
    return wastePile.pop();
  }

  /** Return a card to the waste pile (for undo or cancel) */
  function returnToWaste(card) {
    card.faceUp = true;
    wastePile.push(card);
  }

  /** Check if stock is empty */
  function stockEmpty() {
    return stockPile.length === 0;
  }

  /** Check if waste is empty */
  function wasteEmpty() {
    return wastePile.length === 0;
  }

  /** Check if both stock and waste are empty */
  function isEmpty() {
    return stockPile.length === 0 && wastePile.length === 0;
  }

  return {
    init: init,
    reset: reset,
    draw: draw,
    wasteTop: wasteTop,
    takeFromWaste: takeFromWaste,
    returnToWaste: returnToWaste,
    stockEmpty: stockEmpty,
    wasteEmpty: wasteEmpty,
    isEmpty: isEmpty,
    get stockPile() { return stockPile; },
    get wastePile() { return wastePile; },
  };
})();
