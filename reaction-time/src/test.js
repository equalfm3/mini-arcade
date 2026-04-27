/* Reaction Time — Challenge State Machine

   States:
     idle      — between matches
     ready     — random delay before signal (red screen)
     go        — signal appeared — react NOW!
     seqshow   — sequence challenge: showing symbols
     seqinput  — sequence challenge: waiting for player input
     result    — shows round result
     early     — tapped too soon
     wrong     — wrong answer
     summary   — end-of-match summary

   Challenge types:
     tap        — classic: wait for green, tap
     color      — Stroop: tap if color matches word, reject if not
     direction  — arrow appears, press matching key
     sequence   — memorize 3 symbols, tap them back in order
     doubletap  — tap exactly twice quickly
     math       — equation shown, tap if correct, reject if wrong
     oddoneout  — 4 shapes, tap the different one
*/

var ReactionTest = (function () {

  var state = 'idle';

  // Match state
  var round = 0;
  var roundTimes = [];
  var roundTypes = [];
  var streak = 0;
  var bestStreak = 0;

  // Round state
  var delayTimer = 0;
  var goTimestamp = 0;
  var reactionMs = 0;
  var earlyTimer = 0;
  var wrongTimer = 0;
  var resultTimer = 0;
  var summaryTimer = 0;

  // Current challenge details
  var challengeType = 'tap';

  // Color challenge
  var colorWord = null;
  var colorDisplay = null;
  var colorIsMatch = false;

  // Direction challenge
  var directionArrow = null;

  // Sequence challenge
  var seqTarget = [];         // the correct sequence of symbols
  var seqInput = [];          // player's input so far
  var seqShowTimer = 0;       // countdown while showing sequence
  var seqInputTimestamp = 0;  // when input phase started

  // Double-tap challenge
  var dtTapCount = 0;
  var dtFirstTapTime = 0;
  var dtWindowTimer = 0;

  // Math challenge
  var mathA = 0;
  var mathB = 0;
  var mathOp = '+';
  var mathShown = 0;          // the answer shown to player
  var mathIsCorrect = false;

  // Odd-one-out challenge
  var oddItems = [];          // array of { symbol, isOdd }
  var oddCorrectIndex = -1;
  var oddInputTimestamp = 0;

  // Persistent
  var bestAvg = 0;
  var totalMatches = 0;

  // Track wrong reason for renderer
  var wrongReason = '';

  function reset() {
    state = 'idle';
    round = 0;
    roundTimes = [];
    roundTypes = [];
    streak = 0;
    bestStreak = 0;
    delayTimer = 0;
    goTimestamp = 0;
    reactionMs = 0;
    earlyTimer = 0;
    wrongTimer = 0;
    resultTimer = 0;
    summaryTimer = 0;
    challengeType = 'tap';
    colorWord = null;
    colorDisplay = null;
    colorIsMatch = false;
    directionArrow = null;
    seqTarget = [];
    seqInput = [];
    seqShowTimer = 0;
    dtTapCount = 0;
    dtFirstTapTime = 0;
    dtWindowTimer = 0;
    mathA = 0;
    mathB = 0;
    mathOp = '+';
    mathShown = 0;
    mathIsCorrect = false;
    oddItems = [];
    oddCorrectIndex = -1;
    wrongReason = '';
  }

  function pickChallenge(roundNum) {
    if (roundNum === 1) return 'tap';
    var types = Config.challenges;
    return types[Math.floor(Math.random() * types.length)];
  }

  function getWaitRange(roundNum) {
    var shrink = (roundNum - 1) * Config.waitShrink;
    var maxW = Math.max(Config.waitMax - shrink, Config.waitMinCap);
    return { min: Config.waitMin, max: maxW };
  }

  // ---- Setup functions for each challenge type ----

  function setupColorChallenge() {
    var words = Config.colorWords;
    colorWord = words[Math.floor(Math.random() * words.length)];
    colorIsMatch = Math.random() < Config.colorMatchChance;
    if (colorIsMatch) {
      colorDisplay = colorWord.color;
    } else {
      var others = words.filter(function (w) { return w.word !== colorWord.word; });
      colorDisplay = others[Math.floor(Math.random() * others.length)].color;
    }
  }

  function setupDirectionChallenge() {
    var dirs = Config.directions;
    directionArrow = dirs[Math.floor(Math.random() * dirs.length)];
  }

  function setupSequenceChallenge() {
    seqTarget = [];
    seqInput = [];
    var syms = Config.sequenceSymbols;
    for (var i = 0; i < Config.sequenceLength; i++) {
      seqTarget.push(syms[Math.floor(Math.random() * syms.length)]);
    }
    seqShowTimer = Config.sequenceShowTime;
  }

  function setupDoubleTapChallenge() {
    dtTapCount = 0;
    dtFirstTapTime = 0;
    dtWindowTimer = 0;
  }

  function setupMathChallenge() {
    var ops = ['+', '-', '×'];
    mathOp = ops[Math.floor(Math.random() * ops.length)];
    mathA = Math.floor(Math.random() * Config.mathMaxNum) + 1;
    mathB = Math.floor(Math.random() * Config.mathMaxNum) + 1;

    // Ensure subtraction doesn't go negative
    if (mathOp === '-' && mathB > mathA) {
      var tmp = mathA; mathA = mathB; mathB = tmp;
    }

    var correctAnswer;
    if (mathOp === '+') correctAnswer = mathA + mathB;
    else if (mathOp === '-') correctAnswer = mathA - mathB;
    else correctAnswer = mathA * mathB;

    mathIsCorrect = Math.random() < Config.mathCorrectChance;
    if (mathIsCorrect) {
      mathShown = correctAnswer;
    } else {
      // Show a wrong answer that's close
      var offset = Math.floor(Math.random() * 5) + 1;
      if (Math.random() < 0.5) offset = -offset;
      mathShown = correctAnswer + offset;
      if (mathShown === correctAnswer) mathShown = correctAnswer + 1;
    }
  }

  function setupOddOneOutChallenge() {
    var shapes = Config.oddShapes;
    // Pick the majority shape and the odd shape
    var majorIdx = Math.floor(Math.random() * shapes.length);
    var oddIdx = majorIdx;
    while (oddIdx === majorIdx) {
      oddIdx = Math.floor(Math.random() * shapes.length);
    }

    var majorShape = shapes[majorIdx];
    var oddShape = shapes[oddIdx];

    oddItems = [];
    oddCorrectIndex = Math.floor(Math.random() * Config.oddGridSize);
    for (var i = 0; i < Config.oddGridSize; i++) {
      if (i === oddCorrectIndex) {
        oddItems.push({ symbol: oddShape, isOdd: true });
      } else {
        oddItems.push({ symbol: majorShape, isOdd: false });
      }
    }
  }

  // ---- Round lifecycle ----

  function startRound() {
    round++;
    challengeType = pickChallenge(round);
    roundTypes.push(challengeType);
    wrongReason = '';

    if (challengeType === 'color') setupColorChallenge();
    else if (challengeType === 'direction') setupDirectionChallenge();
    else if (challengeType === 'sequence') setupSequenceChallenge();
    else if (challengeType === 'doubletap') setupDoubleTapChallenge();
    else if (challengeType === 'math') setupMathChallenge();
    else if (challengeType === 'oddoneout') setupOddOneOutChallenge();

    state = 'ready';
    var range = getWaitRange(round);
    delayTimer = range.min + Math.random() * (range.max - range.min);
    goTimestamp = 0;
    reactionMs = 0;
  }

  function startMatch() {
    round = 0;
    roundTimes = [];
    roundTypes = [];
    streak = 0;
    bestStreak = 0;
    startRound();
  }

  function finishMatch() {
    totalMatches++;
    state = 'summary';
    summaryTimer = Config.summaryMinDuration;
  }

  function advanceOrFinish() {
    if (round >= Config.roundsPerMatch) {
      finishMatch();
    } else {
      startRound();
    }
  }

  // ---- Update ----

  function update(dt) {
    if (state === 'ready') {
      delayTimer -= dt;
      if (delayTimer <= 0) {
        if (challengeType === 'sequence') {
          // Show the sequence first
          state = 'seqshow';
          seqShowTimer = Config.sequenceShowTime;
        } else {
          state = 'go';
          goTimestamp = performance.now();
        }
      }
    } else if (state === 'seqshow') {
      seqShowTimer -= dt;
      if (seqShowTimer <= 0) {
        state = 'seqinput';
        seqInputTimestamp = performance.now();
        seqInput = [];
      }
    } else if (state === 'go' && challengeType === 'doubletap') {
      // Check if double-tap window expired
      if (dtTapCount === 1) {
        dtWindowTimer -= dt;
        if (dtWindowTimer <= 0) {
          // Only tapped once — too slow for second tap
          wrongReason = 'Only 1 tap! Need 2 quick taps.';
          reactionMs = Math.round(performance.now() - goTimestamp);
          state = 'wrong';
          wrongTimer = Config.wrongMessageDuration;
        }
      }
    } else if (state === 'early') {
      earlyTimer -= dt;
      if (earlyTimer <= 0) {
        roundTimes.push(999);
        streak = 0;
        advanceOrFinish();
      }
    } else if (state === 'wrong') {
      wrongTimer -= dt;
      if (wrongTimer <= 0) {
        var ms = reactionMs + Config.wrongPenaltyMs;
        roundTimes.push(ms);
        streak = 0;
        advanceOrFinish();
      }
    } else if (state === 'result') {
      if (resultTimer > 0) resultTimer -= dt;
    } else if (state === 'summary') {
      if (summaryTimer > 0) summaryTimer -= dt;
    }
  }

  // ---- Player actions ----

  /** Generic tap (click / space / touch) */
  function tap() {
    if (state === 'idle') {
      startMatch();
      return 'started';
    }

    if (state === 'ready') {
      state = 'early';
      earlyTimer = Config.earlyMessageDuration;
      return 'early';
    }

    if (state === 'seqshow') {
      // Tapping during sequence display = early
      state = 'early';
      earlyTimer = Config.earlyMessageDuration;
      return 'early';
    }

    if (state === 'go') {
      if (challengeType === 'tap') {
        return recordResult();
      }
      if (challengeType === 'color') {
        // Tap = "they match"
        return colorIsMatch ? recordResult() : recordWrong('Not a match!');
      }
      if (challengeType === 'direction') {
        return recordWrong('Use arrow keys!');
      }
      if (challengeType === 'doubletap') {
        return handleDoubleTap();
      }
      if (challengeType === 'math') {
        // Tap = "equation is correct"
        return mathIsCorrect ? recordResult() : recordWrong('Wrong! ' + mathA + ' ' + mathOp + ' ' + mathB + ' ≠ ' + mathShown);
      }
      if (challengeType === 'oddoneout') {
        // Generic tap doesn't work — need to tap a specific item
        return 'ignore';
      }
    }

    if (state === 'seqinput') {
      // Generic tap doesn't work for sequence — need specific symbol
      return 'ignore';
    }

    if (state === 'result' && resultTimer <= 0) {
      if (round >= Config.roundsPerMatch) {
        finishMatch();
        return 'summary';
      }
      startRound();
      return 'started';
    }

    if (state === 'summary' && summaryTimer <= 0) {
      startMatch();
      return 'started';
    }

    return 'ignore';
  }

  /** Direction key pressed */
  function pressDirection(key) {
    if (state === 'go' && challengeType === 'direction') {
      var validKeys = Config.directionKeys[directionArrow] || [];
      if (validKeys.indexOf(key) !== -1) {
        return recordResult();
      } else {
        return recordWrong('Wrong direction!');
      }
    }
    return 'ignore';
  }

  /** Reject (swipe down / N key) — for color and math challenges */
  function reject() {
    if (state === 'go' && challengeType === 'color') {
      return !colorIsMatch ? recordResult() : recordWrong('It was a match!');
    }
    if (state === 'go' && challengeType === 'math') {
      return !mathIsCorrect ? recordResult() : recordWrong('It was correct!');
    }
    return 'ignore';
  }

  /** Sequence symbol tapped */
  function tapSequenceSymbol(symbol) {
    if (state !== 'seqinput') return 'ignore';

    var expectedIndex = seqInput.length;
    var expected = seqTarget[expectedIndex];

    if (symbol === expected) {
      seqInput.push(symbol);
      if (seqInput.length === seqTarget.length) {
        // Completed the sequence correctly
        reactionMs = Math.round(performance.now() - seqInputTimestamp);
        return recordResultDirect();
      }
      return 'seqprogress';
    } else {
      reactionMs = Math.round(performance.now() - seqInputTimestamp);
      return recordWrong('Wrong symbol! Expected ' + expected);
    }
  }

  /** Odd-one-out item tapped by index */
  function tapOddItem(index) {
    if (state !== 'go' || challengeType !== 'oddoneout') return 'ignore';

    if (index === oddCorrectIndex) {
      return recordResult();
    } else {
      return recordWrong('Not the odd one!');
    }
  }

  /** Handle double-tap logic */
  function handleDoubleTap() {
    dtTapCount++;
    if (dtTapCount === 1) {
      dtFirstTapTime = performance.now();
      dtWindowTimer = Config.doubleTapWindow;
      return 'dtfirst';
    }
    if (dtTapCount === 2) {
      // Success — measure from go signal to second tap
      return recordResult();
    }
    // Extra taps after 2
    return 'ignore';
  }

  // ---- Result recording ----

  function recordResult() {
    reactionMs = Math.round(performance.now() - goTimestamp);
    return recordResultDirect();
  }

  function recordResultDirect() {
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    roundTimes.push(reactionMs);
    state = 'result';
    resultTimer = Config.resultMinDuration;
    return 'result';
  }

  function recordWrong(reason) {
    if (!reactionMs) reactionMs = Math.round(performance.now() - goTimestamp);
    wrongReason = reason || '';
    state = 'wrong';
    wrongTimer = Config.wrongMessageDuration;
    return 'wrong';
  }

  // ---- Helpers ----

  function getRating(ms) {
    for (var i = 0; i < Config.ratings.length; i++) {
      if (ms <= Config.ratings[i].max) return Config.ratings[i];
    }
    return Config.ratings[Config.ratings.length - 1];
  }

  function getAverage() {
    if (roundTimes.length === 0) return 0;
    var sum = 0;
    for (var i = 0; i < roundTimes.length; i++) sum += roundTimes[i];
    return Math.round(sum / roundTimes.length);
  }

  function getBestRound() {
    if (roundTimes.length === 0) return 0;
    var best = roundTimes[0];
    for (var i = 1; i < roundTimes.length; i++) {
      if (roundTimes[i] < best) best = roundTimes[i];
    }
    return best;
  }

  return {
    reset: reset,
    update: update,
    tap: tap,
    pressDirection: pressDirection,
    reject: reject,
    tapSequenceSymbol: tapSequenceSymbol,
    tapOddItem: tapOddItem,
    getRating: getRating,
    getAverage: getAverage,
    getBestRound: getBestRound,

    get state() { return state; },
    get round() { return round; },
    get roundTimes() { return roundTimes; },
    get roundTypes() { return roundTypes; },
    get reactionMs() { return reactionMs; },
    get streak() { return streak; },
    get bestStreak() { return bestStreak; },
    get challengeType() { return challengeType; },
    get colorWord() { return colorWord; },
    get colorDisplay() { return colorDisplay; },
    get colorIsMatch() { return colorIsMatch; },
    get directionArrow() { return directionArrow; },
    get seqTarget() { return seqTarget; },
    get seqInput() { return seqInput; },
    get seqShowTimer() { return seqShowTimer; },
    get dtTapCount() { return dtTapCount; },
    get mathA() { return mathA; },
    get mathB() { return mathB; },
    get mathOp() { return mathOp; },
    get mathShown() { return mathShown; },
    get mathIsCorrect() { return mathIsCorrect; },
    get oddItems() { return oddItems; },
    get oddCorrectIndex() { return oddCorrectIndex; },
    get wrongReason() { return wrongReason; },
    get totalMatches() { return totalMatches; },
    get bestAvg() { return bestAvg; },
    set bestAvg(v) { bestAvg = v; },
  };
})();
