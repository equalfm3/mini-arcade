/* Word Chain — Chain State & Validation

   Manages the word chain: tracks history, validates submissions,
   enforces the chain rule, and calculates scores.
*/

var Chain = (function () {

  var history = [];        // array of { word, player, points }
  var usedWords = {};      // set of used words for duplicate check
  var requiredLetter = ''; // the letter the next word must start with ('' = any)
  var score = 0;           // total score (player points only in vs mode, all in solo)

  /** Reset chain state for a new game */
  function reset() {
    history = [];
    usedWords = {};
    requiredLetter = '';
    score = 0;
  }

  /** Calculate points for a word — 1 point per letter */
  function calcPoints(word) {
    return word.length;
  }

  /** Get the score label for a word (if any) */
  function getScoreLabel(word) {
    var thresholds = Config.scoreLabelThresholds;
    for (var i = thresholds.length - 1; i >= 0; i--) {
      if (word.length >= thresholds[i][0]) {
        return '+' + word.length + 'pts ' + thresholds[i][1];
      }
    }
    return null;
  }

  /**
   * Validate and submit a word.
   * player: 'player' or 'ai'
   * Returns { valid: bool, error: string|null, points: number }
   */
  function submit(word, player) {
    var w = word.toLowerCase().trim();
    var who = player || 'player';

    // Check minimum length
    if (w.length < Config.minWordLength) {
      return { valid: false, error: 'Too short (min ' + Config.minWordLength + ' letters)', points: 0 };
    }

    // Check if in dictionary
    if (!Dictionary.isValid(w)) {
      return { valid: false, error: 'Not in dictionary', points: 0 };
    }

    // Check starting letter (skip for first word)
    if (requiredLetter && w[0] !== requiredLetter) {
      return { valid: false, error: 'Must start with "' + requiredLetter.toUpperCase() + '"', points: 0 };
    }

    // Check if already used
    if (usedWords[w]) {
      return { valid: false, error: 'Already used', points: 0 };
    }

    // Valid! Add to chain
    var pts = calcPoints(w);
    history.push({ word: w, player: who, points: pts });
    usedWords[w] = true;
    requiredLetter = Dictionary.lastLetter(w);
    score += pts;

    return { valid: true, error: null, points: pts };
  }

  return {
    reset: reset,
    submit: submit,
    calcPoints: calcPoints,
    getScoreLabel: getScoreLabel,
    get history() { return history; },
    get words() { return history.map(function (h) { return h.word; }); },
    get length() { return history.length; },
    get score() { return score; },
    get requiredLetter() { return requiredLetter; },
    get usedWords() { return usedWords; },
    get lastWord() { return history.length > 0 ? history[history.length - 1].word : null; },
    get lastEntry() { return history.length > 0 ? history[history.length - 1] : null; },
  };
})();
