/* Wordle — Letter Evaluator

   Two-pass algorithm that correctly handles duplicate letters:

   Pass 1 — Exact matches:
     Mark letters that are in the correct position as 'correct'.
     Track remaining unmatched target letters.

   Pass 2 — Present / Absent:
     For each non-correct guess letter, check if it exists in the
     remaining unmatched target letters. If yes, mark 'present' and
     consume one instance. Otherwise mark 'absent'.

   Example: target "apple", guess "papal"
     Pass 1: p(skip) a(skip) p(correct) a(skip) l(correct)
     Remaining target letters: a, p, e  (the first 'a' and first 'p')
     Pass 2: p→present (consumes p), a→present (consumes a), -, a→absent, -
     Result: [present, present, correct, absent, correct]
*/

var Evaluator = (function () {

  /**
   * Evaluate a guess against the target word.
   * @param {string} guess  — 5-letter guess (lowercase)
   * @param {string} target — 5-letter target (lowercase)
   * @returns {string[]} Array of 5 states: 'correct', 'present', or 'absent'
   */
  function evaluate(guess, target) {
    var len = Config.wordLength;
    var result = new Array(len);
    var targetCounts = {};

    // Count all letters in target
    for (var i = 0; i < len; i++) {
      var t = target[i];
      targetCounts[t] = (targetCounts[t] || 0) + 1;
    }

    // Pass 1: Mark exact matches (correct)
    for (var i = 0; i < len; i++) {
      if (guess[i] === target[i]) {
        result[i] = Config.states.correct;
        targetCounts[guess[i]]--;
      } else {
        result[i] = null; // to be determined in pass 2
      }
    }

    // Pass 2: Mark present or absent
    for (var i = 0; i < len; i++) {
      if (result[i] !== null) continue; // already marked correct

      var g = guess[i];
      if (targetCounts[g] && targetCounts[g] > 0) {
        result[i] = Config.states.present;
        targetCounts[g]--;
      } else {
        result[i] = Config.states.absent;
      }
    }

    return result;
  }

  /**
   * Check if all results are 'correct' (win condition).
   */
  function isWin(results) {
    for (var i = 0; i < results.length; i++) {
      if (results[i] !== Config.states.correct) return false;
    }
    return true;
  }

  return {
    evaluate: evaluate,
    isWin: isWin,
  };
})();
