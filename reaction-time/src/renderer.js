/* Reaction Time — Renderer

   DOM-based rendering with challenge-specific UI.
   Handles all 7 challenge types with appropriate visuals.
*/

var Renderer = (function () {

  var container = null;
  var mainText = null;
  var subText = null;
  var detailText = null;
  var roundDots = null;
  var instructionText = null;

  // Callbacks the game.js wires up
  var onSeqSymbolTap = null;
  var onOddItemTap = null;

  function build(area) {
    area.innerHTML = '';

    container = document.createElement('div');
    container.className = 'rt-container';
    area.appendChild(container);

    roundDots = document.createElement('div');
    roundDots.className = 'rt-dots';
    container.appendChild(roundDots);

    mainText = document.createElement('div');
    mainText.className = 'rt-main';
    container.appendChild(mainText);

    subText = document.createElement('div');
    subText.className = 'rt-sub';
    container.appendChild(subText);

    detailText = document.createElement('div');
    detailText.className = 'rt-detail';
    container.appendChild(detailText);

    instructionText = document.createElement('div');
    instructionText.className = 'rt-instruction';
    container.appendChild(instructionText);
  }

  function setCallbacks(seqCb, oddCb) {
    onSeqSymbolTap = seqCb;
    onOddItemTap = oddCb;
  }

  function renderDots() {
    if (!roundDots) return;
    var total = Config.roundsPerMatch;
    var current = ReactionTest.round;
    var times = ReactionTest.roundTimes;
    var html = '';
    for (var i = 0; i < total; i++) {
      var cls = 'rt-dot';
      if (i < times.length) {
        var ms = times[i];
        if (ms >= 999) cls += ' rt-dot--fail';
        else if (ms <= 250) cls += ' rt-dot--fast';
        else if (ms <= 400) cls += ' rt-dot--good';
        else cls += ' rt-dot--slow';
      } else if (i === current - 1) {
        cls += ' rt-dot--active';
      }
      html += '<span class="' + cls + '"></span>';
    }
    roundDots.innerHTML = html;
  }

  // ---- Challenge type icons for summary ----
  var typeIcons = {
    tap: '●',
    color: '◆',
    direction: '▲',
    sequence: '☰',
    doubletap: '⚡',
    math: '∑',
    oddoneout: '◎',
  };

  function render() {
    var state = ReactionTest.state;
    var type = ReactionTest.challengeType;

    renderDots();

    if (state === 'idle') renderIdle();
    else if (state === 'ready') renderReady(type);
    else if (state === 'seqshow') renderSeqShow();
    else if (state === 'seqinput') renderSeqInput();
    else if (state === 'go') renderGo(type);
    else if (state === 'result') renderResult();
    else if (state === 'early') renderEarly();
    else if (state === 'wrong') renderWrong();
    else if (state === 'summary') renderSummary();
  }

  // ---- State renderers ----

  function renderIdle() {
    container.style.background = Config.colors.wait;
    container.className = 'rt-container';
    mainText.textContent = 'Reaction Challenge';
    mainText.style.color = Config.textPrimary;
    subText.textContent = Config.roundsPerMatch + ' rounds · 7 challenge types';
    subText.style.color = Config.textSecondary;
    detailText.innerHTML = '<div class="rt-type-legend">' +
      '<span>● Tap</span><span>◆ Color</span><span>▲ Direction</span>' +
      '<span>☰ Sequence</span><span>⚡ Double</span><span>∑ Math</span><span>◎ Odd One</span>' +
      '</div>';
    detailText.style.color = '';
    instructionText.textContent = 'Tap to start';
    instructionText.style.color = Config.textDim;
  }

  function renderReady(type) {
    container.style.background = Config.colors.ready;
    container.className = 'rt-container rt-pulse';
    mainText.style.color = Config.textPrimary;
    subText.style.color = Config.textSecondary;
    detailText.innerHTML = '';
    detailText.style.color = '';

    var roundLabel = 'Round ' + ReactionTest.round + '/' + Config.roundsPerMatch;
    var typeLabel = {
      tap: 'Tap',
      color: 'Color Match',
      direction: 'Direction',
      sequence: 'Sequence',
      doubletap: 'Double Tap',
      math: 'Math',
      oddoneout: 'Odd One Out',
    };

    mainText.textContent = 'Wait…';
    subText.textContent = roundLabel + ' · ' + (typeLabel[type] || type);

    var hints = {
      tap: 'Tap when green',
      color: 'Tap = match · N/↓ = no match',
      direction: 'Press the matching arrow key',
      sequence: 'Memorize the symbols',
      doubletap: 'Tap twice quickly when green',
      math: 'Tap = correct · N/↓ = wrong',
      oddoneout: 'Tap the different shape',
    };
    instructionText.textContent = hints[type] || '';
    instructionText.style.color = 'rgba(255,255,255,0.4)';
  }

  function renderGo(type) {
    container.className = 'rt-container rt-flash';
    detailText.style.color = '';

    if (type === 'tap') {
      container.style.background = Config.colors.go;
      mainText.textContent = 'TAP!';
      mainText.style.color = Config.textPrimary;
      subText.textContent = '';
      detailText.innerHTML = '';
      instructionText.textContent = '';
    } else if (type === 'color') {
      container.style.background = '#1a1a2e';
      mainText.textContent = ReactionTest.colorWord.word;
      mainText.style.color = ReactionTest.colorDisplay;
      subText.textContent = 'Match?';
      subText.style.color = Config.textSecondary;
      detailText.innerHTML = '';
      instructionText.textContent = 'Tap = Yes · N/↓ = No';
      instructionText.style.color = 'rgba(255,255,255,0.5)';
    } else if (type === 'direction') {
      container.style.background = '#1a2a1a';
      mainText.textContent = ReactionTest.directionArrow;
      mainText.style.color = '#44ff66';
      subText.textContent = '';
      detailText.innerHTML = '';
      instructionText.textContent = 'Press the arrow key';
      instructionText.style.color = 'rgba(255,255,255,0.5)';
    } else if (type === 'doubletap') {
      container.style.background = Config.colors.go;
      var count = ReactionTest.dtTapCount;
      if (count === 0) {
        mainText.textContent = 'TAP ×2!';
        subText.textContent = 'Tap twice quickly';
      } else {
        mainText.textContent = '1…';
        subText.textContent = 'One more!';
      }
      mainText.style.color = Config.textPrimary;
      subText.style.color = Config.textSecondary;
      detailText.innerHTML = '';
      instructionText.textContent = '';
    } else if (type === 'math') {
      container.style.background = '#1a1a2e';
      mainText.textContent = ReactionTest.mathA + ' ' + ReactionTest.mathOp + ' ' + ReactionTest.mathB + ' = ' + ReactionTest.mathShown;
      mainText.style.color = '#ffdd44';
      subText.textContent = 'Correct?';
      subText.style.color = Config.textSecondary;
      detailText.innerHTML = '';
      instructionText.textContent = 'Tap = Yes · N/↓ = No';
      instructionText.style.color = 'rgba(255,255,255,0.5)';
    } else if (type === 'oddoneout') {
      container.style.background = '#1a1a2e';
      mainText.textContent = '';
      subText.textContent = '';
      renderOddGrid();
      instructionText.textContent = 'Tap the different one';
      instructionText.style.color = 'rgba(255,255,255,0.5)';
    }
  }

  function renderSeqShow() {
    container.style.background = '#1a2a3a';
    container.className = 'rt-container';
    var target = ReactionTest.seqTarget;
    mainText.textContent = target.join('  ');
    mainText.style.color = '#ffdd44';
    subText.textContent = 'Memorize!';
    subText.style.color = Config.textSecondary;
    detailText.innerHTML = '';
    detailText.style.color = '';
    instructionText.textContent = '';
  }

  function renderSeqInput() {
    container.style.background = '#1a2a3a';
    container.className = 'rt-container';
    var input = ReactionTest.seqInput;
    var target = ReactionTest.seqTarget;

    // Show progress
    var progress = '';
    for (var i = 0; i < target.length; i++) {
      if (i < input.length) {
        progress += '<span class="rt-seq-done">' + input[i] + '</span>';
      } else if (i === input.length) {
        progress += '<span class="rt-seq-current">?</span>';
      } else {
        progress += '<span class="rt-seq-pending">·</span>';
      }
    }
    mainText.innerHTML = progress;
    mainText.style.color = '';
    subText.textContent = 'Tap the symbols in order';
    subText.style.color = Config.textSecondary;

    // Render symbol buttons
    renderSeqButtons();
    instructionText.textContent = '';
  }

  function renderSeqButtons() {
    var syms = Config.sequenceSymbols;
    var html = '<div class="rt-seq-grid">';
    for (var i = 0; i < syms.length; i++) {
      html += '<button class="rt-seq-btn" data-sym="' + syms[i] + '">' + syms[i] + '</button>';
    }
    html += '</div>';
    detailText.innerHTML = html;
    detailText.style.color = '';

    // Wire up click handlers
    var btns = detailText.querySelectorAll('.rt-seq-btn');
    for (var j = 0; j < btns.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (onSeqSymbolTap) onSeqSymbolTap(btn.getAttribute('data-sym'));
        });
        btn.addEventListener('touchend', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (onSeqSymbolTap) onSeqSymbolTap(btn.getAttribute('data-sym'));
        });
      })(btns[j]);
    }
  }

  function renderOddGrid() {
    var items = ReactionTest.oddItems;
    var html = '<div class="rt-odd-grid">';
    for (var i = 0; i < items.length; i++) {
      html += '<button class="rt-odd-btn" data-idx="' + i + '">' + items[i].symbol + '</button>';
    }
    html += '</div>';
    detailText.innerHTML = html;
    detailText.style.color = '';

    var btns = detailText.querySelectorAll('.rt-odd-btn');
    for (var j = 0; j < btns.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (onOddItemTap) onOddItemTap(parseInt(btn.getAttribute('data-idx')));
        });
        btn.addEventListener('touchend', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (onOddItemTap) onOddItemTap(parseInt(btn.getAttribute('data-idx')));
        });
      })(btns[j]);
    }
  }

  function renderResult() {
    container.style.background = Config.colors.result;
    container.className = 'rt-container';
    var ms = ReactionTest.reactionMs;
    var rating = ReactionTest.getRating(ms);
    var stk = ReactionTest.streak;

    mainText.textContent = ms + ' ms';
    mainText.innerHTML = ms + ' ms';
    mainText.style.color = rating.color;
    subText.textContent = rating.label;
    subText.style.color = rating.color;

    var details = '';
    if (stk > 1) {
      details = '<span class="rt-streak">🔥 ' + stk + ' streak</span>';
    }
    detailText.innerHTML = details;
    detailText.style.color = '';
    instructionText.textContent = 'Tap to continue';
    instructionText.style.color = Config.textDim;
  }

  function renderEarly() {
    container.style.background = Config.colors.early;
    container.className = 'rt-container rt-shake';
    mainText.textContent = 'Too early!';
    mainText.style.color = Config.textPrimary;
    subText.textContent = 'Penalty: 999ms';
    subText.style.color = Config.textDanger;
    detailText.innerHTML = '';
    detailText.style.color = '';
    instructionText.textContent = '';
  }

  function renderWrong() {
    container.style.background = Config.colors.wrong;
    container.className = 'rt-container rt-shake';

    mainText.textContent = 'Wrong!';
    mainText.style.color = Config.textPrimary;
    subText.textContent = ReactionTest.wrongReason || '';
    subText.style.color = Config.textDanger;
    detailText.innerHTML = '+' + Config.wrongPenaltyMs + 'ms penalty';
    detailText.style.color = Config.textDanger;
    instructionText.textContent = '';
  }

  function renderSummary() {
    container.style.background = Config.colors.summary;
    container.className = 'rt-container';

    var avg = ReactionTest.getAverage();
    var best = ReactionTest.getBestRound();
    var rating = ReactionTest.getRating(avg);
    var bestStk = ReactionTest.bestStreak;

    mainText.textContent = 'Avg: ' + avg + ' ms';
    mainText.style.color = rating.color;
    subText.textContent = rating.label;
    subText.style.color = rating.color;

    var lines = [];
    lines.push('Best: ' + best + 'ms');
    if (bestStk > 1) lines.push('Streak: ' + bestStk + ' 🔥');

    var times = ReactionTest.roundTimes;
    var types = ReactionTest.roundTypes;
    var breakdown = '';
    for (var i = 0; i < times.length; i++) {
      var icon = typeIcons[types[i]] || '●';
      var t = times[i] >= 999 ? 'FAIL' : times[i] + 'ms';
      breakdown += '<span class="rt-round-item">' + icon + ' ' + t + '</span>';
    }

    detailText.innerHTML =
      '<div class="rt-summary-stats">' + lines.join(' · ') + '</div>' +
      '<div class="rt-round-breakdown">' + breakdown + '</div>';
    detailText.style.color = '';

    instructionText.textContent = 'Tap for new match';
    instructionText.style.color = Config.textDim;
  }

  return {
    build: build,
    render: render,
    setCallbacks: setCallbacks,
  };
})();
