/* Memory Cards — Main game orchestrator

   Modules loaded before this file:
   - Config    (src/config.js)   — grid sizes, timing, colors
   - Symbols   (src/symbols.js)  — 16x16 pixel art card icons
   - Deck      (src/deck.js)     — card data, shuffle, match tracking
   - Renderer  (src/renderer.js) — DOM card grid, flip/match animations

   Shared globals available:
   - Shell, Audio8, Timer, etc.

   This is a DOM game — no Engine.create with canvas.
*/

(function () {

  var moves = 0;
  var pairsFound = 0;
  var firstCard = null;
  var secondCard = null;
  var locked = false;
  var timer = null;
  var gridSize = Config.defaultSize;

  // --- Size selection overlay ---
  function showSizeChoice() {
    var overlay = document.getElementById('overlay');
    document.getElementById('overlay-title').textContent = 'Memory Cards';
    document.getElementById('overlay-subtitle').textContent = 'Choose grid size';
    document.getElementById('overlay-score').textContent = '';

    var defaultBtn = document.getElementById('overlay-btn');
    if (defaultBtn) defaultBtn.style.display = 'none';

    var old = overlay.querySelector('.size-choice');
    if (old) old.remove();

    var wrap = document.createElement('div');
    wrap.className = 'size-choice';
    wrap.style.cssText = 'display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;justify-content:center;';

    var sizes = ['small', 'medium', 'large'];
    for (var i = 0; i < sizes.length; i++) {
      var s = Config.sizes[sizes[i]];
      var btn = document.createElement('button');
      btn.className = 'btn' + (sizes[i] === 'medium' ? ' btn-primary' : '');
      btn.textContent = s.label + ' (' + s.pairs + ' pairs)';
      btn.style.cssText = 'min-width:100px;padding:10px 16px;';
      btn.addEventListener('click', (function (name) {
        return function () {
          gridSize = name;
          Config.setSize(name);
          cleanup();
          startGame();
        };
      })(sizes[i]));
      wrap.appendChild(btn);
    }

    overlay.appendChild(wrap);
    overlay.removeAttribute('hidden');
    overlay.style.display = '';

    function cleanup() {
      var w = overlay.querySelector('.size-choice');
      if (w) w.remove();
      if (defaultBtn) defaultBtn.style.display = '';
    }
  }

  function startGame() {
    Shell.hideOverlay();
    moves = 0;
    pairsFound = 0;
    firstCard = null;
    secondCard = null;
    locked = false;

    Deck.reset();
    Renderer.build(Shell.area, onCardClick);

    Shell.setStat('moves', 0);
    Shell.setStat('pairs', '0/' + Config.totalPairs);

    if (timer) timer.reset();
    timer = Timer.stopwatch(function () {});
    timer.start();
  }

  function onCardClick(index) {
    if (locked) return;

    var card = Deck.getCard(index);
    if (!card || card.flipped || card.matched) return;

    Deck.flip(index);
    Renderer.flipCard(index);
    Audio8.play('click');

    if (firstCard === null) {
      firstCard = index;
    } else {
      secondCard = index;
      moves++;
      Shell.setStat('moves', moves);
      locked = true;

      var c1 = Deck.getCard(firstCard);
      var c2 = Deck.getCard(secondCard);

      if (c1.symbolName === c2.symbolName) {
        setTimeout(function () {
          Deck.match(firstCard, secondCard);
          Renderer.matchCard(firstCard);
          Renderer.matchCard(secondCard);
          Audio8.play('score');
          pairsFound++;
          Shell.setStat('pairs', pairsFound + '/' + Config.totalPairs);

          firstCard = null;
          secondCard = null;
          locked = false;

          if (Deck.isAllMatched()) {
            timer.pause();
            Audio8.play('win');
            setTimeout(function () {
              Shell.showOverlay({
                title: 'You Win!',
                score: moves + ' moves — ' + Timer.format(timer.elapsed),
                btn: 'Play Again',
                onAction: showSizeChoice,
              });
            }, 500);
          }
        }, Config.matchDelay);
      } else {
        setTimeout(function () {
          Deck.unflip(firstCard);
          Deck.unflip(secondCard);
          Renderer.unflipCard(firstCard);
          Renderer.unflipCard(secondCard);
          Audio8.play('error');

          firstCard = null;
          secondCard = null;
          locked = false;
        }, Config.flipDelay);
      }
    }
  }

  // Boot: show size selection
  showSizeChoice();

})();
