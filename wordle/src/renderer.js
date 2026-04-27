/* Wordle — DOM Renderer

   Builds the 6×5 tile grid and manages:
   - Letter placement in current row
   - Flip animation when revealing results
   - Shake animation for invalid words
   - Status text display
*/

var Renderer = (function () {

  var gridEl = null;
  var statusEl = null;
  var tileEls = [];  // [row][col] — 2D array of tile elements

  /** Build the grid in the given container */
  function build(container) {
    container.innerHTML = '';
    tileEls = [];

    var wrapper = document.createElement('div');
    wrapper.className = 'wrd-wrapper';

    gridEl = document.createElement('div');
    gridEl.className = 'wrd-grid';

    for (var r = 0; r < Config.maxGuesses; r++) {
      var rowEl = document.createElement('div');
      rowEl.className = 'wrd-row';
      var rowTiles = [];

      for (var c = 0; c < Config.wordLength; c++) {
        var tile = document.createElement('div');
        tile.className = 'wrd-tile';

        var front = document.createElement('div');
        front.className = 'wrd-tile-front';

        var back = document.createElement('div');
        back.className = 'wrd-tile-back';

        tile.appendChild(front);
        tile.appendChild(back);
        rowEl.appendChild(tile);
        rowTiles.push(tile);
      }

      gridEl.appendChild(rowEl);
      tileEls.push(rowTiles);
    }

    wrapper.appendChild(gridEl);

    // Status message — absolute positioned
    statusEl = document.createElement('div');
    statusEl.className = 'wrd-status';
    wrapper.appendChild(statusEl);

    container.appendChild(wrapper);
  }

  /** Set a letter in a tile (current typing row) */
  function setLetter(row, col, letter) {
    var tile = tileEls[row][col];
    var front = tile.querySelector('.wrd-tile-front');
    front.textContent = letter || '';

    if (letter) {
      tile.classList.add('wrd-tile-filled');
    } else {
      tile.classList.remove('wrd-tile-filled');
    }
  }

  /** Pop animation when typing a letter */
  function popTile(row, col) {
    var tile = tileEls[row][col];
    tile.classList.remove('wrd-tile-pop');
    // Force reflow to restart animation
    void tile.offsetWidth;
    tile.classList.add('wrd-tile-pop');
  }

  /**
   * Reveal a row with flip animation.
   * Each tile flips sequentially with a delay.
   * @param {number} row — row index
   * @param {string} word — the guessed word (lowercase)
   * @param {string[]} results — array of states from Evaluator
   * @param {function} onComplete — called when all tiles have flipped
   */
  function revealRow(row, word, results, onComplete) {
    var tiles = tileEls[row];
    var count = tiles.length;
    var done = 0;

    for (var i = 0; i < count; i++) {
      (function (idx) {
        setTimeout(function () {
          var tile = tiles[idx];
          var back = tile.querySelector('.wrd-tile-back');
          back.textContent = word[idx].toUpperCase();
          tile.classList.add('wrd-tile-flip');
          tile.dataset.state = results[idx];

          // After flip animation completes
          setTimeout(function () {
            done++;
            if (done === count && onComplete) {
              onComplete();
            }
          }, Config.flipDuration * 1000);
        }, idx * Config.flipDelay * 1000);
      })(i);
    }
  }

  /** Shake a row (invalid word) */
  function shakeRow(row) {
    var rowEl = tileEls[row][0].parentNode;
    rowEl.classList.remove('wrd-row-shake');
    void rowEl.offsetWidth;
    rowEl.classList.add('wrd-row-shake');
  }

  /** Bounce tiles in a row (win celebration) */
  function bounceRow(row) {
    var tiles = tileEls[row];
    for (var i = 0; i < tiles.length; i++) {
      (function (idx) {
        setTimeout(function () {
          tiles[idx].classList.add('wrd-tile-bounce');
        }, idx * 100);
      })(i);
    }
  }

  /** Set status message */
  function setStatus(text, type) {
    if (!statusEl) return;
    statusEl.textContent = text || '';
    statusEl.className = 'wrd-status';
    if (type) statusEl.classList.add('wrd-status-' + type);
  }

  /** Clear the entire grid */
  function clear() {
    for (var r = 0; r < tileEls.length; r++) {
      for (var c = 0; c < tileEls[r].length; c++) {
        var tile = tileEls[r][c];
        tile.className = 'wrd-tile';
        tile.dataset.state = '';
        var front = tile.querySelector('.wrd-tile-front');
        var back = tile.querySelector('.wrd-tile-back');
        if (front) front.textContent = '';
        if (back) back.textContent = '';
      }
      // Remove shake class from row
      var rowEl = tileEls[r][0].parentNode;
      rowEl.classList.remove('wrd-row-shake');
    }
    setStatus('');
  }

  return {
    build: build,
    setLetter: setLetter,
    popTile: popTile,
    revealRow: revealRow,
    shakeRow: shakeRow,
    bounceRow: bounceRow,
    setStatus: setStatus,
    clear: clear,
  };
})();
