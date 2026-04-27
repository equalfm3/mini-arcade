/* Solitaire — Deck module
   52-card deck creation, shuffle, card data structures */

var Deck = (function () {

  /** Create a single card object */
  function createCard(suit, rank) {
    var isRed = suit === 'hearts' || suit === 'diamonds';
    return {
      suit: suit,
      rank: rank,
      value: Config.rankValues[rank],
      color: isRed ? 'red' : 'black',
      faceUp: false,
      // Position for rendering (set by layout)
      x: 0,
      y: 0,
      // Animation target
      targetX: 0,
      targetY: 0,
      animating: false,
    };
  }

  /** Create a full 52-card deck */
  function createDeck() {
    var cards = [];
    for (var s = 0; s < Config.suits.length; s++) {
      for (var r = 0; r < Config.ranks.length; r++) {
        cards.push(createCard(Config.suits[s], Config.ranks[r]));
      }
    }
    return cards;
  }

  /** Fisher-Yates shuffle */
  function shuffle(cards) {
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = cards[i];
      cards[i] = cards[j];
      cards[j] = temp;
    }
    return cards;
  }

  /** Check if two cards have alternating colors */
  function alternatingColor(cardA, cardB) {
    return cardA.color !== cardB.color;
  }

  /** Check if cardA is one rank lower than cardB */
  function isOneBelow(cardA, cardB) {
    return cardA.value === cardB.value - 1;
  }

  /** Check if cardA is one rank above cardB */
  function isOneAbove(cardA, cardB) {
    return cardA.value === cardB.value + 1;
  }

  /** Check if card is an Ace */
  function isAce(card) {
    return card.rank === 'A';
  }

  /** Check if card is a King */
  function isKing(card) {
    return card.rank === 'K';
  }

  return {
    createDeck: createDeck,
    shuffle: shuffle,
    alternatingColor: alternatingColor,
    isOneBelow: isOneBelow,
    isOneAbove: isOneAbove,
    isAce: isAce,
    isKing: isKing,
  };
})();
