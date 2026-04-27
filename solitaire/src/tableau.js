/* Solitaire — Tableau module
   7 columns of cards with Klondike stacking rules */

var Tableau = (function () {

  // 7 columns, each is an array of cards
  var columns = [];

  /** Deal cards into 7 tableau columns from a deck array.
      Returns remaining cards (for stock). */
  function deal(deck) {
    columns = [];
    var idx = 0;
    for (var col = 0; col < 7; col++) {
      columns[col] = [];
      for (var row = 0; row <= col; row++) {
        var card = deck[idx++];
        card.faceUp = (row === col); // only top card face-up
        columns[col].push(card);
      }
    }
    return deck.slice(idx); // remaining cards
  }

  /** Reset tableau to empty */
  function reset() {
    columns = [];
    for (var i = 0; i < 7; i++) {
      columns[i] = [];
    }
  }

  /** Get a column by index */
  function getColumn(colIdx) {
    return columns[colIdx] || [];
  }

  /** Get top card of a column */
  function topCard(colIdx) {
    var col = columns[colIdx];
    return col.length > 0 ? col[col.length - 1] : null;
  }

  /** Check if a card can be placed on a tableau column.
      Rules: descending rank, alternating colors.
      Empty columns accept only Kings. */
  function canPlace(card, colIdx) {
    var col = columns[colIdx];
    if (col.length === 0) {
      return Deck.isKing(card);
    }
    var top = col[col.length - 1];
    if (!top.faceUp) return false;
    return Deck.alternatingColor(card, top) && Deck.isOneBelow(card, top);
  }

  /** Check if a stack of cards (starting from card) can be placed on a column */
  function canPlaceStack(cards, colIdx) {
    if (cards.length === 0) return false;
    return canPlace(cards[0], colIdx);
  }

  /** Add a card to a column */
  function addCard(card, colIdx) {
    card.faceUp = true;
    columns[colIdx].push(card);
  }

  /** Add multiple cards to a column */
  function addCards(cards, colIdx) {
    for (var i = 0; i < cards.length; i++) {
      cards[i].faceUp = true;
      columns[colIdx].push(cards[i]);
    }
  }

  /** Remove and return the top card from a column.
      Flips the new top card face-up if needed. */
  function removeTop(colIdx) {
    var col = columns[colIdx];
    if (col.length === 0) return null;
    var card = col.pop();
    // Flip new top card face-up
    if (col.length > 0 && !col[col.length - 1].faceUp) {
      col[col.length - 1].faceUp = true;
    }
    return card;
  }

  /** Remove cards from colIdx starting at cardIndex.
      Returns the removed cards. Flips new top if needed. */
  function removeFrom(colIdx, cardIndex) {
    var col = columns[colIdx];
    var removed = col.splice(cardIndex);
    // Flip new top card face-up
    if (col.length > 0 && !col[col.length - 1].faceUp) {
      col[col.length - 1].faceUp = true;
    }
    return removed;
  }

  /** Get the index of a card in a column, or -1 */
  function cardIndex(colIdx, card) {
    var col = columns[colIdx];
    for (var i = 0; i < col.length; i++) {
      if (col[i] === card) return i;
    }
    return -1;
  }

  /** Get all face-up cards from a column starting at a given index */
  function getFaceUpStack(colIdx, startIdx) {
    var col = columns[colIdx];
    var stack = [];
    for (var i = startIdx; i < col.length; i++) {
      if (col[i].faceUp) {
        stack.push(col[i]);
      }
    }
    return stack;
  }

  /** Check if all cards in all columns are face-up */
  function allFaceUp() {
    for (var c = 0; c < 7; c++) {
      for (var i = 0; i < columns[c].length; i++) {
        if (!columns[c][i].faceUp) return false;
      }
    }
    return true;
  }

  /** Count total cards across all columns */
  function totalCards() {
    var count = 0;
    for (var c = 0; c < 7; c++) {
      count += columns[c].length;
    }
    return count;
  }

  /** Calculate the Y position of a card at a given index in a column */
  function cardY(colIdx, cardIdx) {
    var y = Config.tableauY;
    var col = columns[colIdx];
    for (var i = 0; i < cardIdx; i++) {
      y += col[i].faceUp ? Config.tableauFaceUpOffset : Config.tableauFaceDownOffset;
    }
    return y;
  }

  /** Calculate the X position of a column */
  function cardX(colIdx) {
    return Config.tableauX + colIdx * Config.tableauColWidth;
  }

  return {
    deal: deal,
    reset: reset,
    getColumn: getColumn,
    topCard: topCard,
    canPlace: canPlace,
    canPlaceStack: canPlaceStack,
    addCard: addCard,
    addCards: addCards,
    removeTop: removeTop,
    removeFrom: removeFrom,
    cardIndex: cardIndex,
    getFaceUpStack: getFaceUpStack,
    allFaceUp: allFaceUp,
    totalCards: totalCards,
    cardY: cardY,
    cardX: cardX,
    get columns() { return columns; },
  };
})();
