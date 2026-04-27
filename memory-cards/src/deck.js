/* Memory Cards — Deck module (card data management) */

var Deck = (function () {

  var cards = [];  // Array of { id, symbolIndex, symbolName, color, matched, flipped }

  /** Fisher-Yates shuffle */
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  /** Create cards (pairs based on Config.totalPairs), shuffle them */
  function reset() {
    cards = [];
    for (var i = 0; i < Config.totalPairs; i++) {
      var sym = Symbols.get(i);
      cards.push({
        id: i * 2,
        symbolIndex: i,
        symbolName: sym.name,
        color: sym.color,
        matched: false,
        flipped: false,
      });
      cards.push({
        id: i * 2 + 1,
        symbolIndex: i,
        symbolName: sym.name,
        color: sym.color,
        matched: false,
        flipped: false,
      });
    }
    shuffle(cards);
  }

  function getCard(index) {
    if (index < 0 || index >= cards.length) return null;
    return cards[index];
  }

  function flip(index) {
    var card = getCard(index);
    if (card) card.flipped = true;
    return card;
  }

  function unflip(index) {
    var card = getCard(index);
    if (card) card.flipped = false;
  }

  function match(i1, i2) {
    var c1 = getCard(i1);
    var c2 = getCard(i2);
    if (c1) c1.matched = true;
    if (c2) c2.matched = true;
  }

  function isAllMatched() {
    for (var i = 0; i < cards.length; i++) {
      if (!cards[i].matched) return false;
    }
    return true;
  }

  function getCards() {
    return cards;
  }

  return {
    reset: reset,
    getCard: getCard,
    flip: flip,
    unflip: unflip,
    match: match,
    isAllMatched: isAllMatched,
    getCards: getCards,
  };
})();
