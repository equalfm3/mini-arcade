/* Solitaire — Main game logic (Klondike)

   Modules loaded before this file:
   - Config      (src/config.js)      — constants
   - Deck        (src/deck.js)        — card creation & helpers
   - Tableau     (src/tableau.js)     — 7 tableau columns
   - Foundation  (src/foundation.js)  — 4 foundation piles
   - Stock       (src/stock.js)       — stock & waste piles
   - Drag        (src/drag.js)        — drag-and-drop + tap
   - Renderer    (src/renderer.js)    — canvas rendering

   Shared globals available:
   - Engine, Input, Audio8, Shell, Timer, Particles, etc.
*/

(function () {

  var moves = 0;
  var particles = Particles.create();
  var timer = null;
  var autoCompleting = false;
  var autoCompleteTimer = 0;
  var winAnimating = false;
  var winTimer = 0;
  var winCards = [];

  // --- Engine setup ---
  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Drag cards or tap to select',

    init: function () {
      Input.init();

      timer = Timer.stopwatch(function (s) {
        Shell.setStat('time', Timer.format(s));
      });

      Drag.init(game.canvas, game.scale, {
        onMove: handleMove,
        onDraw: handleDraw,
        onAutoMove: handleAutoMove,
      });
    },

    reset: function () {
      moves = 0;
      autoCompleting = false;
      autoCompleteTimer = 0;
      winAnimating = false;
      winTimer = 0;
      winCards = [];
      particles.clear();

      Shell.setStat('moves', 0);
      timer.reset();
      timer.start();

      // Create and shuffle deck
      var deck = Deck.shuffle(Deck.createDeck());

      // Deal to tableau
      Tableau.reset();
      var remaining = Tableau.deal(deck);

      // Remaining cards go to stock
      Stock.init(remaining);
      Foundation.reset();
      Drag.clearSelection();
      Drag.updateScale(game.scale);
    },

    update: function (dt) {
      // Pause
      if (Input.pressed('Escape') || Input.pressed('p')) {
        if (!autoCompleting && !winAnimating) {
          game.togglePause();
          if (game.state === 'paused') {
            timer.pause();
          } else {
            timer.start();
          }
        }
      }

      // Auto-complete logic
      if (autoCompleting) {
        autoCompleteTimer += dt * 1000;
        if (autoCompleteTimer >= Config.autoCompleteDelay) {
          autoCompleteTimer = 0;
          if (!doAutoCompleteStep()) {
            autoCompleting = false;
            checkWin();
          }
        }
      }

      // Win animation
      if (winAnimating) {
        winTimer += dt * 1000;
        // Emit particles from random foundation cards
        if (Math.random() < 0.3) {
          var fi = randInt(0, 3);
          var fx = Foundation.pileX(fi) + Config.cardW / 2;
          var fy = Foundation.pileY() + Config.cardH / 2;
          particles.emit(fx, fy, {
            count: 3,
            colors: [Config.accentColor, '#ffd700', '#ff4444', '#44aaff', '#c084fc'],
            speed: 150,
            life: 1.2,
            size: 4,
            gravity: 200,
          });
        }
        if (winTimer >= Config.winAnimDuration) {
          winAnimating = false;
          timer.pause();
          game.win('Moves: ' + moves + '  Time: ' + Timer.format(timer.elapsed));
        }
      }

      // Update drag scale on resize
      Drag.updateScale(game.scale);

      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      Renderer.drawScene(ctx);
      particles.draw(ctx);
    },
  });

  // --- Move handling ---

  function handleMove(source, dest, cards) {
    if (!cards || cards.length === 0) return false;

    // Move to foundation
    if (dest.type === 'foundation') {
      if (cards.length !== 1) return false;
      var card = cards[0];
      if (!Foundation.canPlace(card, dest.pile)) return false;

      // Remove from source
      removeFromSource(source, cards);
      Foundation.addCard(card, dest.pile);
      incrementMoves();
      Audio8.play('score');

      particles.emit(Foundation.pileX(dest.pile) + Config.cardW / 2,
                      Foundation.pileY() + Config.cardH / 2, {
        count: 6,
        color: Config.accentColor,
        speed: 60,
        life: 0.4,
        size: 3,
      });

      checkAutoComplete();
      checkWin();
      return true;
    }

    // Move to tableau
    if (dest.type === 'tableau') {
      if (!Tableau.canPlaceStack(cards, dest.col)) return false;

      removeFromSource(source, cards);
      Tableau.addCards(cards, dest.col);
      incrementMoves();
      Audio8.play('move');
      return true;
    }

    return false;
  }

  function removeFromSource(source, cards) {
    if (source.type === 'tableau') {
      Tableau.removeFrom(source.col || source.index, source.cardIndex);
    } else if (source.type === 'waste') {
      Stock.takeFromWaste();
    } else if (source.type === 'foundation') {
      Foundation.removeTop(source.pile);
    }
  }

  function handleDraw() {
    Stock.draw();
    incrementMoves();
    Audio8.play('click');
  }

  function handleAutoMove(card, source) {
    // Try to move card to foundation
    var pileIdx = Foundation.findPile(card);
    if (pileIdx === -1) return;

    // Only single cards can go to foundation
    if (source.type === 'tableau') {
      var col = Tableau.getColumn(source.col);
      // Only auto-move if it's the top card
      if (col[col.length - 1] !== card) return;
      Tableau.removeTop(source.col);
    } else if (source.type === 'waste') {
      Stock.takeFromWaste();
    } else {
      return;
    }

    Foundation.addCard(card, pileIdx);
    incrementMoves();
    Audio8.play('score');

    particles.emit(Foundation.pileX(pileIdx) + Config.cardW / 2,
                    Foundation.pileY() + Config.cardH / 2, {
      count: 8,
      color: Config.accentColor,
      speed: 80,
      life: 0.5,
      size: 3,
    });

    checkAutoComplete();
    checkWin();
  }

  // --- Auto-complete ---

  function checkAutoComplete() {
    // Auto-complete when all cards are face-up and stock/waste are empty
    if (Stock.isEmpty() && Tableau.allFaceUp() && !autoCompleting) {
      autoCompleting = true;
      autoCompleteTimer = 0;
      Shell.toast('Auto-completing...');
    }
  }

  /** Perform one step of auto-complete. Returns true if a card was moved. */
  function doAutoCompleteStep() {
    // Try to move top card from each tableau column to foundation
    for (var c = 0; c < 7; c++) {
      var top = Tableau.topCard(c);
      if (!top) continue;
      var pileIdx = Foundation.findPile(top);
      if (pileIdx !== -1) {
        Tableau.removeTop(c);
        Foundation.addCard(top, pileIdx);
        incrementMoves();
        Audio8.play('score');

        particles.emit(Foundation.pileX(pileIdx) + Config.cardW / 2,
                        Foundation.pileY() + Config.cardH / 2, {
          count: 4,
          color: Config.accentColor,
          speed: 50,
          life: 0.3,
          size: 3,
        });
        return true;
      }
    }
    return false;
  }

  // --- Win detection ---

  function checkWin() {
    if (Foundation.isComplete() && !winAnimating) {
      winAnimating = true;
      winTimer = 0;
      Audio8.play('win');
    }
  }

  // --- Helpers ---

  function incrementMoves() {
    moves++;
    Shell.setStat('moves', moves);
  }

  game.start();

})();
