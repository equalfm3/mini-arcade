/* Typing Speed — DOM Renderer

   Builds the word display area with character-by-character coloring,
   current word highlight, scrolling lines, and stats bar.
*/

var Renderer = (function () {

  var container = null;    // main wrapper
  var linesEl = null;      // word lines container
  var inputEl = null;      // current word input display
  var statsEl = null;      // bottom stats bar
  var mobileNote = null;   // mobile note element

  // State references (set by game.js)
  var words = [];
  var wordIndex = 0;
  var typed = '';
  var lines = [];
  var currentLineIdx = 0;

  /** Build the DOM structure in the given area */
  function build(area) {
    area.innerHTML = '';

    container = document.createElement('div');
    container.className = 'ts-container';

    // Word display area — shows several lines of words
    linesEl = document.createElement('div');
    linesEl.className = 'ts-lines';
    container.appendChild(linesEl);

    // Current input display (shows what user is typing with coloring)
    inputEl = document.createElement('div');
    inputEl.className = 'ts-input';
    container.appendChild(inputEl);

    // Stats bar
    statsEl = document.createElement('div');
    statsEl.className = 'ts-stats';
    container.appendChild(statsEl);

    // Mobile note
    mobileNote = document.createElement('div');
    mobileNote.className = 'ts-mobile-note';
    mobileNote.textContent = 'Best on desktop with a physical keyboard';
    container.appendChild(mobileNote);

    area.appendChild(container);
  }

  /**
   * Update state references from game.js
   */
  function setState(opts) {
    words = opts.words || [];
    wordIndex = opts.wordIndex || 0;
    typed = opts.typed || '';
    lines = opts.lines || [];
    currentLineIdx = opts.currentLineIdx || 0;
  }

  /**
   * Find which line the current word is on
   */
  function findCurrentLine() {
    var count = 0;
    for (var i = 0; i < lines.length; i++) {
      count += lines[i].length;
      if (wordIndex < count) return i;
    }
    return lines.length - 1;
  }

  /**
   * Render the word lines display
   */
  function renderLines() {
    if (!linesEl) return;
    linesEl.innerHTML = '';

    var curLine = findCurrentLine();
    // Show lines starting from current line (scroll as player progresses)
    var startLine = curLine;
    var endLine = Math.min(startLine + Config.linesVisible, lines.length);

    // Track global word index for coloring
    var globalIdx = 0;
    for (var i = 0; i < startLine; i++) {
      globalIdx += lines[i].length;
    }

    for (var li = startLine; li < endLine; li++) {
      var lineDiv = document.createElement('div');
      lineDiv.className = 'ts-line';

      for (var wi = 0; wi < lines[li].length; wi++) {
        var word = lines[li][wi];
        var wIdx = globalIdx;
        globalIdx++;

        var wordSpan = document.createElement('span');

        if (wIdx < wordIndex) {
          // Already typed — dimmed
          wordSpan.className = 'ts-word ts-word-done';
          wordSpan.textContent = word;
        } else if (wIdx === wordIndex) {
          // Current word — character-by-character coloring
          wordSpan.className = 'ts-word ts-word-current';
          renderCurrentWord(wordSpan, word, typed);
        } else {
          // Upcoming — normal
          wordSpan.className = 'ts-word ts-word-upcoming';
          wordSpan.textContent = word;
        }

        lineDiv.appendChild(wordSpan);

        // Add space between words (except last)
        if (wi < lines[li].length - 1) {
          var space = document.createElement('span');
          space.className = 'ts-space';
          space.textContent = ' ';
          if (wIdx < wordIndex) {
            space.classList.add('ts-word-done');
          }
          lineDiv.appendChild(space);
        }
      }

      linesEl.appendChild(lineDiv);
    }
  }

  /**
   * Render the current word with character coloring
   */
  function renderCurrentWord(span, word, typedStr) {
    for (var i = 0; i < word.length; i++) {
      var ch = document.createElement('span');
      ch.textContent = word[i];

      if (i < typedStr.length) {
        if (typedStr[i] === word[i]) {
          ch.className = 'ts-char-correct';
        } else {
          ch.className = 'ts-char-wrong';
        }
      } else if (i === typedStr.length) {
        // Cursor position
        ch.className = 'ts-char-cursor';
      } else {
        ch.className = 'ts-char-pending';
      }

      span.appendChild(ch);
    }

    // If typed more characters than the word length, show extra wrong chars
    if (typedStr.length > word.length) {
      for (var j = word.length; j < typedStr.length; j++) {
        var extra = document.createElement('span');
        extra.textContent = typedStr[j];
        extra.className = 'ts-char-extra';
        span.appendChild(extra);
      }
    }
  }

  /**
   * Render the input display showing what user is currently typing
   */
  function renderInput() {
    if (!inputEl) return;
    var currentWord = words[wordIndex] || '';
    inputEl.innerHTML = '';

    var label = document.createElement('span');
    label.className = 'ts-input-label';
    label.textContent = 'Type: ';
    inputEl.appendChild(label);

    var wordDisplay = document.createElement('span');
    wordDisplay.className = 'ts-input-word';

    for (var i = 0; i < currentWord.length; i++) {
      var ch = document.createElement('span');
      ch.textContent = currentWord[i];

      if (i < typed.length) {
        ch.className = typed[i] === currentWord[i] ? 'ts-char-correct' : 'ts-char-wrong';
      } else {
        ch.className = 'ts-char-pending';
      }

      wordDisplay.appendChild(ch);
    }

    // Extra typed characters beyond word length
    if (typed.length > currentWord.length) {
      for (var j = currentWord.length; j < typed.length; j++) {
        var extra = document.createElement('span');
        extra.textContent = typed[j];
        extra.className = 'ts-char-extra';
        wordDisplay.appendChild(extra);
      }
    }

    inputEl.appendChild(wordDisplay);
  }

  /**
   * Render the stats bar
   */
  function renderStats(wpm, accuracy, wordsTyped, correctChars, totalChars) {
    if (!statsEl) return;
    statsEl.innerHTML =
      '<span class="ts-stat"><span class="ts-stat-label">WPM</span> <span class="ts-stat-value">' + wpm + '</span></span>' +
      '<span class="ts-stat"><span class="ts-stat-label">Accuracy</span> <span class="ts-stat-value">' + accuracy + '%</span></span>' +
      '<span class="ts-stat"><span class="ts-stat-label">Words</span> <span class="ts-stat-value">' + wordsTyped + '</span></span>' +
      '<span class="ts-stat"><span class="ts-stat-label">Chars</span> <span class="ts-stat-value">' + correctChars + '/' + totalChars + '</span></span>';
  }

  /**
   * Full render pass
   */
  function render(wpm, accuracy, wordsTyped, correctChars, totalChars) {
    renderLines();
    renderInput();
    renderStats(wpm, accuracy, wordsTyped, correctChars, totalChars);
  }

  return {
    build: build,
    setState: setState,
    render: render,
    renderLines: renderLines,
    renderInput: renderInput,
    renderStats: renderStats,
  };
})();

