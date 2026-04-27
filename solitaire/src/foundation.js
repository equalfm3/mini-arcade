/* Solitaire — Foundation module
   4 foundation piles, build up from Ace to King by suit */

var Foundation = (function () {

  // 4 piles, one per suit (indexed 0-3)
  var piles = [];

  /** Reset all foundation piles to empty */
  function reset() {
    piles = [[], [], [], []];
  }

  /** Get a pile by index */
  function getPile(pileIdx) {
    return piles[pileIdx] || [];
  }

  /** Get top card of a pile */
  function topCard(pileIdx) {
    var pile = piles[pileIdx];
    return pile.length > 0 ? pile[pile.length - 1] : null;
  }

  /** Check if a card can be placed on a specific foundation pile.
      Rules: must be same suit, ascending rank (Ace first, then 2, 3... K).
      Empty pile accepts only Aces. */
  function canPlace(card, pileIdx) {
    var pile = piles[pileIdx];
    if (pile.length === 0) {
      return Deck.isAce(card);
    }
    var top = pile[pile.length - 1];
    return card.suit === top.suit && Deck.isOneAbove(card, top);
  }

  /** Find which foundation pile (if any) can accept this card.
      Returns pile index or -1. */
  function findPile(card) {
    for (var i = 0; i < 4; i++) {
      if (canPlace(card, i)) return i;
    }
    return -1;
  }

  /** Add a card to a foundation pile */
  function addCard(card, pileIdx) {
    card.faceUp = true;
    piles[pileIdx].push(card);
  }

  /** Remove and return the top card from a pile */
  function removeTop(pileIdx) {
    var pile = piles[pileIdx];
    if (pile.length === 0) return null;
    return pile.pop();
  }

  /** Check if all 4 foundations are complete (13 cards each) */
  function isComplete() {
    for (var i = 0; i < 4; i++) {
      if (piles[i].length !== 13) return false;
    }
    return true;
  }

  /** Total cards across all foundations */
  function totalCards() {
    var count = 0;
    for (var i = 0; i < 4; i++) {
      count += piles[i].length;
    }
    return count;
  }

  /** Calculate X position of a foundation pile */
  function pileX(pileIdx) {
    return Config.foundationX + pileIdx * Config.foundationColWidth;
  }

  /** Y position of foundations */
  function pileY() {
    return Config.foundationY;
  }

  return {
    reset: reset,
    getPile: getPile,
    topCard: topCard,
    canPlace: canPlace,
    findPile: findPile,
    addCard: addCard,
    removeTop: removeTop,
    isComplete: isComplete,
    totalCards: totalCards,
    pileX: pileX,
    pileY: pileY,
    get piles() { return piles; },
  };
})();
