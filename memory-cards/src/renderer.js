/* Memory Cards — DOM Renderer (builds and updates the card grid) */

var Renderer = (function () {

  var cardEls = [];
  var gridEl = null;

  function build(container, onCardClick) {
    container.innerHTML = '';
    cardEls = [];

    gridEl = document.createElement('div');
    gridEl.className = 'card-grid';
    gridEl.style.gridTemplateColumns = 'repeat(' + Config.cols + ', 72px)';

    var cards = Deck.getCards();

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];

      var cardDiv = document.createElement('div');
      cardDiv.className = 'card';
      cardDiv.dataset.index = i;

      var inner = document.createElement('div');
      inner.className = 'card-inner';

      var back = document.createElement('div');
      back.className = 'card-back';
      back.textContent = '?';

      var front = document.createElement('div');
      front.className = 'card-front';
      front.style.borderColor = card.color;
      // Insert pixel art SVG
      front.innerHTML = Symbols.svg(card.symbolName, Config.iconSize);

      inner.appendChild(back);
      inner.appendChild(front);
      cardDiv.appendChild(inner);

      cardDiv.addEventListener('click', (function (idx) {
        return function () { onCardClick(idx); };
      })(i));

      gridEl.appendChild(cardDiv);
      cardEls.push(cardDiv);
    }

    container.appendChild(gridEl);
  }

  function flipCard(index) {
    if (cardEls[index]) cardEls[index].classList.add('flipped');
  }

  function unflipCard(index) {
    if (cardEls[index]) cardEls[index].classList.remove('flipped');
  }

  function matchCard(index) {
    if (cardEls[index]) cardEls[index].classList.add('matched');
  }

  function reset() {
    for (var i = 0; i < cardEls.length; i++) {
      cardEls[i].classList.remove('flipped', 'matched');
    }
  }

  return {
    build: build,
    flipCard: flipCard,
    unflipCard: unflipCard,
    matchCard: matchCard,
    reset: reset,
  };
})();
