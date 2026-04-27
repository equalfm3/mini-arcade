/* Word Chain — DOM Renderer

   Builds and updates the game UI:
   - Mode selector (Solo / vs AI)
   - Required starting letter (big, animated)
   - Text input field
   - Word history scrolling list with scores and player tags
   - Timer bar
   - Error/success messages

   Uses inline pixel SVG icons (no emojis).
*/

var Renderer = (function () {

  var container = null;
  var modeSelectorEl = null;
  var letterEl = null;
  var letterLabel = null;
  var inputEl = null;
  var historyEl = null;
  var timerBarOuter = null;
  var timerBarInner = null;
  var messageEl = null;
  var turnIndicator = null;
  var mobileNote = null;

  var shakeTimeout = null;
  var messageTimeout = null;

  /* ---- Pixel SVG icons (8x8 grid) ---- */

  var ICON_PALETTE = {
    '.': 'transparent',
    'w': '#ffffff',
    'o': '#ff8844',
    'b': '#44aaff',
    'd': '#666666',
    'k': '#222222',
    'g': '#44ff66',
    'n': '#ddbb88',
  };

  var ICON_DATA = {
    player: [
      '...ww...',
      '..wwww..',
      '..wkwk..',
      '..wwww..',
      '...oo...',
      '..oooo..',
      '..o..o..',
      '..o..o..',
    ],
    ai: [
      '.bbbbbb.',
      '.b.bb.b.',
      'bbbbbbbb',
      'bb.bb.bb',
      'bbbbbbbb',
      '.bbbbbb.',
      '..b..b..',
      '.bb..bb.',
    ],
    trophy: [
      '.oooooo.',
      '.oooooo.',
      '..oooo..',
      '..oooo..',
      '...oo...',
      '...oo...',
      '..oooo..',
      '.oooooo.',
    ],
  };

  /** Build an inline SVG string from 8x8 icon data */
  function pixelIcon(name, size) {
    var grid = ICON_DATA[name];
    if (!grid) return '';
    var s = size || 16;
    var px = s / 8;
    var rects = '';
    for (var y = 0; y < 8; y++) {
      for (var x = 0; x < 8; x++) {
        var ch = grid[y][x];
        if (!ch || ch === '.') continue;
        var color = ICON_PALETTE[ch] || '#888';
        rects += '<rect x="' + (x * px) + '" y="' + (y * px) +
          '" width="' + px + '" height="' + px + '" fill="' + color + '"/>';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + s + ' ' + s +
      '" width="' + s + '" height="' + s +
      '" style="vertical-align:middle" shape-rendering="crispEdges">' + rects + '</svg>';
  }

  /** Build mode selector UI */
  function buildModeSelector(area, onSelect) {
    area.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'wc-mode-select';

    var title = document.createElement('div');
    title.className = 'wc-mode-title';
    title.textContent = 'Choose Mode';
    wrap.appendChild(title);

    var btns = document.createElement('div');
    btns.className = 'wc-mode-btns';

    var soloBtn = document.createElement('button');
    soloBtn.className = 'wc-mode-btn';
    soloBtn.innerHTML =
      '<span class="wc-mode-icon">' + pixelIcon('player', 32) + '</span>' +
      '<span class="wc-mode-label">Solo</span>' +
      '<span class="wc-mode-desc">Beat the clock</span>';
    soloBtn.addEventListener('click', function () { onSelect('solo'); });

    var vsBtn = document.createElement('button');
    vsBtn.className = 'wc-mode-btn wc-mode-btn-ai';
    vsBtn.innerHTML =
      '<span class="wc-mode-icon">' + pixelIcon('ai', 32) + '</span>' +
      '<span class="wc-mode-label">vs AI</span>' +
      '<span class="wc-mode-desc">Take turns</span>';
    vsBtn.addEventListener('click', function () { onSelect('vs'); });

    btns.appendChild(soloBtn);
    btns.appendChild(vsBtn);
    wrap.appendChild(btns);
    area.appendChild(wrap);

    modeSelectorEl = wrap;
  }

  /** Build the main game DOM structure */
  function build(area) {
    area.innerHTML = '';

    container = document.createElement('div');
    container.className = 'wc-container';

    // Turn indicator (vs mode only, hidden by default)
    turnIndicator = document.createElement('div');
    turnIndicator.className = 'wc-turn';
    turnIndicator.style.display = 'none';
    container.appendChild(turnIndicator);

    // Required letter display
    var letterWrap = document.createElement('div');
    letterWrap.className = 'wc-letter-wrap';

    letterLabel = document.createElement('div');
    letterLabel.className = 'wc-letter-label';
    letterLabel.textContent = 'Type any word to start!';
    letterWrap.appendChild(letterLabel);

    letterEl = document.createElement('div');
    letterEl.className = 'wc-letter';
    letterEl.textContent = '?';
    letterWrap.appendChild(letterEl);

    container.appendChild(letterWrap);

    // Message area
    messageEl = document.createElement('div');
    messageEl.className = 'wc-message';
    messageEl.textContent = '';
    container.appendChild(messageEl);

    // Text input
    inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.className = 'wc-input';
    inputEl.setAttribute('placeholder', 'Type a word...');
    inputEl.setAttribute('autocomplete', 'off');
    inputEl.setAttribute('autocorrect', 'off');
    inputEl.setAttribute('autocapitalize', 'off');
    inputEl.setAttribute('spellcheck', 'false');
    inputEl.setAttribute('maxlength', '30');
    container.appendChild(inputEl);

    // Word history
    historyEl = document.createElement('div');
    historyEl.className = 'wc-history';
    container.appendChild(historyEl);

    // Timer bar
    timerBarOuter = document.createElement('div');
    timerBarOuter.className = 'wc-timer-bar';

    timerBarInner = document.createElement('div');
    timerBarInner.className = 'wc-timer-fill';
    timerBarOuter.appendChild(timerBarInner);

    container.appendChild(timerBarOuter);

    // Mobile note
    mobileNote = document.createElement('div');
    mobileNote.className = 'wc-mobile-note';
    mobileNote.textContent = 'Best on desktop with a physical keyboard';
    container.appendChild(mobileNote);

    area.appendChild(container);
  }

  /** Update the required letter display */
  function setRequiredLetter(letter) {
    if (!letterEl) return;
    if (letter) {
      letterEl.textContent = letter.toUpperCase();
      letterEl.classList.add('wc-letter-active');
      letterLabel.textContent = 'Next word starts with:';
    } else {
      letterEl.textContent = '?';
      letterEl.classList.remove('wc-letter-active');
      letterLabel.textContent = 'Type any word to start!';
    }
  }

  /** Pulse the letter on valid word */
  function pulseLetter() {
    if (!letterEl) return;
    letterEl.classList.remove('wc-letter-pulse');
    void letterEl.offsetWidth;
    letterEl.classList.add('wc-letter-pulse');
  }

  /** Show/hide turn indicator */
  function setTurn(who) {
    if (!turnIndicator) return;
    if (!who) {
      turnIndicator.style.display = 'none';
      return;
    }
    turnIndicator.style.display = '';
    if (who === 'player') {
      turnIndicator.innerHTML = pixelIcon('player', 14) + ' Your turn';
      turnIndicator.className = 'wc-turn wc-turn-player';
    } else {
      turnIndicator.innerHTML = pixelIcon('ai', 14) + ' AI thinking...';
      turnIndicator.className = 'wc-turn wc-turn-ai';
    }
  }

  /** Show error or success message */
  function showMessage(text, type) {
    if (!messageEl) return;
    clearTimeout(messageTimeout);
    messageEl.textContent = text;
    messageEl.className = 'wc-message';
    if (type === 'error') {
      messageEl.classList.add('wc-message-error');
    } else if (type === 'success') {
      messageEl.classList.add('wc-message-success');
    }
    messageTimeout = setTimeout(function () {
      messageEl.textContent = '';
      messageEl.className = 'wc-message';
    }, Config.errorShowMs);
  }

  /** Shake the input field */
  function shakeInput() {
    if (!inputEl) return;
    clearTimeout(shakeTimeout);
    inputEl.classList.add('wc-input-shake');
    shakeTimeout = setTimeout(function () {
      inputEl.classList.remove('wc-input-shake');
    }, Config.shakeMs);
  }

  /** Clear the input field */
  function clearInput() {
    if (inputEl) inputEl.value = '';
  }

  /** Focus the input field */
  function focusInput() {
    if (inputEl) inputEl.focus();
  }

  /** Enable/disable input */
  function setInputEnabled(enabled) {
    if (!inputEl) return;
    inputEl.disabled = !enabled;
    if (enabled) {
      inputEl.classList.remove('wc-input-disabled');
    } else {
      inputEl.classList.add('wc-input-disabled');
    }
  }

  /** Get the input element */
  function getInput() {
    return inputEl;
  }

  /** Get current input value */
  function getInputValue() {
    return inputEl ? inputEl.value : '';
  }

  /** Update the word history display with scores and player tags */
  function renderHistory(entries) {
    if (!historyEl) return;
    historyEl.innerHTML = '';

    var start = Math.max(0, entries.length - Config.historyVisible);
    for (var i = entries.length - 1; i >= start; i--) {
      var entry = entries[i];
      var item = document.createElement('div');
      item.className = 'wc-history-item';
      if (i === entries.length - 1) {
        item.classList.add('wc-history-new');
      }
      if (entry.player === 'ai') {
        item.classList.add('wc-history-ai');
      }

      var num = document.createElement('span');
      num.className = 'wc-history-num';
      num.textContent = (i + 1) + '.';
      item.appendChild(num);

      // Player tag icon
      if (entry.player) {
        var tag = document.createElement('span');
        tag.className = 'wc-history-tag';
        if (entry.player === 'ai') {
          tag.innerHTML = pixelIcon('ai', 12);
          tag.classList.add('wc-tag-ai');
        } else {
          tag.innerHTML = pixelIcon('player', 12);
          tag.classList.add('wc-tag-player');
        }
        item.appendChild(tag);
      }

      var word = document.createElement('span');
      word.className = 'wc-history-word';
      word.textContent = entry.word;
      item.appendChild(word);

      // Points badge
      var pts = document.createElement('span');
      pts.className = 'wc-history-pts';
      pts.textContent = '+' + entry.points;
      item.appendChild(pts);

      // Chain arrow
      if (i < entries.length - 1) {
        var arrow = document.createElement('span');
        arrow.className = 'wc-history-arrow';
        var lastCh = entry.word[entry.word.length - 1].toUpperCase();
        arrow.textContent = '\u2192 ' + lastCh;
        item.appendChild(arrow);
      }

      historyEl.appendChild(item);
    }

    if (start > 0) {
      var more = document.createElement('div');
      more.className = 'wc-history-more';
      more.textContent = '+ ' + start + ' more';
      historyEl.appendChild(more);
    }
  }

  /** Update the timer bar */
  function setTimer(remaining, total) {
    if (!timerBarInner) return;
    var pct = Math.max(0, (remaining / total) * 100);
    timerBarInner.style.width = pct + '%';

    if (remaining <= Config.timerLowThresh) {
      timerBarInner.classList.add('wc-timer-low');
    } else {
      timerBarInner.classList.remove('wc-timer-low');
    }
  }

  return {
    pixelIcon: pixelIcon,
    buildModeSelector: buildModeSelector,
    build: build,
    setRequiredLetter: setRequiredLetter,
    pulseLetter: pulseLetter,
    setTurn: setTurn,
    showMessage: showMessage,
    shakeInput: shakeInput,
    clearInput: clearInput,
    focusInput: focusInput,
    setInputEnabled: setInputEnabled,
    getInput: getInput,
    getInputValue: getInputValue,
    renderHistory: renderHistory,
    setTimer: setTimer,
  };
})();
