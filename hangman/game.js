/* Hangman — Main game orchestrator

   Modules loaded before this file:
   - Config    (src/config.js)    — dimensions, colors, keyboard layout
   - Words     (src/words.js)     — word lists by category
   - Gallows   (src/gallows.js)   — progressive gallows drawing (7 stages)
   - Renderer  (src/renderer.js)  — canvas rendering: word, keyboard, status

   Shared globals available:
   - Engine, Input, Shell, Audio8, etc.

   This is a canvas game — Engine.create() with canvas option.
   Pause via Esc (NOT P — it's a letter key in Hangman).
*/

(function () {

  var wins = 0;
  var streak = 0;
  var bestStreak = loadHighScore('hangman');
  var gameActive = false;
  var selectedCategory = null;

  /** Handle a letter guess (from keyboard or canvas tap) */
  function guessLetter(letter) {
    if (!game.is('playing') || !gameActive) return;
    if (Renderer.isLetterGuessed(letter)) return;

    Audio8.play('click');

    var found = Renderer.revealLetter(letter);

    if (found) {
      Audio8.play('score');

      // Check win
      if (Renderer.isWordComplete()) {
        handleWin();
      }
    } else {
      Audio8.play('error');
      Gallows.addWrong();

      // Check lose
      if (Gallows.wrongCount >= Config.maxWrong) {
        handleLose();
      }
    }
  }

  function handleWin() {
    gameActive = false;
    wins++;
    streak++;
    if (saveHighScore('hangman', streak)) {
      bestStreak = streak;
    }

    Shell.setStat('wins', wins);
    Shell.setStat('streak', streak);

    Audio8.play('win');
    Renderer.setStatus('You got it!', Config.correctColor);

    setTimeout(function () {
      game.win('Streak: ' + streak);
    }, Config.endDelay * 1000);
  }

  function handleLose() {
    gameActive = false;
    streak = 0;

    Shell.setStat('streak', streak);

    Audio8.play('gameover');
    Renderer.revealAll();
    Renderer.setStatus('The word was: ' + Words.word, Config.wrongColor);

    setTimeout(function () {
      game.gameOver('The word was: ' + Words.word);
    }, Config.endDelay * 1000);
  }

  /** Get canvas-local coordinates from a mouse/touch event */
  function getLocalPos(e) {
    if (!game.canvas) return null;
    var rect = game.canvas.getBoundingClientRect();
    var scaleX = Config.canvasW / rect.width;
    var scaleY = Config.canvasH / rect.height;
    var clientX = e.clientX;
    var clientY = e.clientY;
    if (clientX === undefined && e.changedTouches && e.changedTouches[0]) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function onCanvasClick(e) {
    if (!game.is('playing') || !gameActive) return;
    var pos = getLocalPos(e);
    if (!pos) return;

    var letter = Renderer.getKeyAt(pos.x, pos.y, Config.canvasW);
    if (letter && !Renderer.isLetterGuessed(letter)) {
      guessLetter(letter);
    }
  }

  /** Show category selection overlay */
  function showCategoryChoice() {
    var overlay = document.getElementById('overlay');
    document.getElementById('overlay-title').textContent = 'Hangman';
    document.getElementById('overlay-subtitle').textContent = 'Choose a category';
    document.getElementById('overlay-score').textContent = '';

    var defaultBtn = document.getElementById('overlay-btn');
    if (defaultBtn) defaultBtn.style.display = 'none';

    // Remove old choice buttons
    var old = overlay.querySelector('.cat-choice');
    if (old) old.remove();

    var wrap = document.createElement('div');
    wrap.className = 'cat-choice';
    wrap.style.cssText = 'display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;justify-content:center;';

    // Random option
    var randBtn = document.createElement('button');
    randBtn.className = 'btn btn-primary';
    randBtn.textContent = 'Random';
    randBtn.style.cssText = 'min-width:100px;padding:10px 14px;';
    randBtn.addEventListener('click', function () {
      selectedCategory = null;
      cleanup();
      game.play();
    });
    wrap.appendChild(randBtn);

    // Category buttons
    var cats = Config.categories;
    for (var i = 0; i < cats.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = cats[i];
      btn.style.cssText = 'min-width:100px;padding:10px 14px;';
      btn.addEventListener('click', (function (cat) {
        return function () {
          selectedCategory = cat;
          cleanup();
          game.play();
        };
      })(cats[i]));
      wrap.appendChild(btn);
    }

    overlay.appendChild(wrap);
    overlay.removeAttribute('hidden');
    overlay.style.display = '';

    function cleanup() {
      var w = overlay.querySelector('.cat-choice');
      if (w) w.remove();
      if (defaultBtn) defaultBtn.style.display = '';
    }
  }

  // --- Engine setup (canvas game) ---
  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Guess the word letter by letter',

    init: function () {
      Input.init();

      // Canvas click/tap for on-screen keyboard
      game.canvas.addEventListener('click', onCanvasClick);
      game.canvas.addEventListener('touchend', function (e) {
        e.preventDefault();
        if (e.changedTouches && e.changedTouches[0]) {
          onCanvasClick({
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY
          });
        }
      });

      Shell.setStat('wins', wins);
      Shell.setStat('streak', streak);
    },

    reset: function () {
      var word = Words.pickWord(selectedCategory);
      Gallows.reset();
      Renderer.reset(word, Words.category);
      gameActive = true;

      Shell.setStat('wins', wins);
      Shell.setStat('streak', streak);
    },

    update: function (dt) {
      // Pause via Esc only (NOT P — it's a letter key)
      if (Input.pressed('Escape')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // Physical keyboard: A-Z letter guesses
      if (game.is('playing') && gameActive) {
        var letters = 'abcdefghijklmnopqrstuvwxyz';
        for (var i = 0; i < letters.length; i++) {
          if (Input.pressed(letters[i])) {
            var upper = letters[i].toUpperCase();
            if (!Renderer.isLetterGuessed(upper)) {
              guessLetter(upper);
            }
          }
        }
      }

      Input.endFrame();
    },

    draw: function (ctx) {
      Renderer.draw(ctx, game.w, game.h);
    },

    onRestart: function () {
      showCategoryChoice();
    },
  });

  // Boot: show category selection
  game.start();
  showCategoryChoice();

})();
