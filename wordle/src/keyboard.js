/* Wordle — On-Screen Keyboard

   QWERTY layout with color-coded keys.
   Key colors update after each guess, keeping the best state:
     correct > present > absent > default

   Provides both visual keyboard and click/tap input.
   Physical keyboard input is handled separately in game.js.
*/

var Keyboard = (function () {

  var keyEls = {};       // letter → DOM element
  var keyStates = {};    // letter → current state ('correct', 'present', 'absent', or null)
  var containerEl = null;
  var onKeyPress = null; // callback(key) — 'A'-'Z', 'ENTER', 'BACK'

  /** Build the keyboard DOM inside the given container */
  function build(container, callback) {
    onKeyPress = callback;
    keyEls = {};
    keyStates = {};
    containerEl = document.createElement('div');
    containerEl.className = 'wrd-keyboard';

    var rows = Config.keyboardRows;
    for (var r = 0; r < rows.length; r++) {
      var rowEl = document.createElement('div');
      rowEl.className = 'wrd-kb-row';

      for (var k = 0; k < rows[r].length; k++) {
        var key = rows[r][k];
        var btn = document.createElement('button');
        btn.className = 'wrd-key';
        btn.dataset.key = key;

        if (key === 'ENTER') {
          btn.classList.add('wrd-key-wide');
          btn.textContent = '↵';
        } else if (key === 'BACK') {
          btn.classList.add('wrd-key-wide');
          btn.textContent = '⌫';
        } else {
          btn.textContent = key;
          keyEls[key] = btn;
          keyStates[key] = null;
        }

        btn.addEventListener('click', (function (k) {
          return function (e) {
            e.preventDefault();
            if (onKeyPress) onKeyPress(k);
          };
        })(key));

        btn.addEventListener('touchend', (function (k) {
          return function (e) {
            e.preventDefault();
            // click handler will fire
          };
        })(key));

        rowEl.appendChild(btn);
      }

      containerEl.appendChild(rowEl);
    }

    container.appendChild(containerEl);
  }

  /**
   * Update key colors after a guess.
   * Only upgrades — never downgrades a key's state.
   * @param {string} guess   — the guessed word (uppercase)
   * @param {string[]} results — array of states from Evaluator
   */
  function updateKeys(guess, results) {
    for (var i = 0; i < guess.length; i++) {
      var letter = guess[i].toUpperCase();
      var newState = results[i];
      var current = keyStates[letter];

      // Only upgrade: correct > present > absent > null
      var newPriority = Config.statePriority[newState] || 0;
      var curPriority = Config.statePriority[current] || 0;

      if (newPriority > curPriority) {
        keyStates[letter] = newState;
        var el = keyEls[letter];
        if (el) {
          el.className = 'wrd-key wrd-key-' + newState;
        }
      }
    }
  }

  /** Reset all key states to default */
  function reset() {
    for (var letter in keyEls) {
      keyStates[letter] = null;
      keyEls[letter].className = 'wrd-key';
    }
  }

  /** Remove keyboard from DOM */
  function destroy() {
    if (containerEl && containerEl.parentNode) {
      containerEl.parentNode.removeChild(containerEl);
    }
    containerEl = null;
    keyEls = {};
    keyStates = {};
  }

  return {
    build: build,
    updateKeys: updateKeys,
    reset: reset,
    destroy: destroy,
  };
})();
