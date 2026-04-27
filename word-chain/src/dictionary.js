/* Word Chain — Dictionary

   ~370k English words from dwyl/english-words (public domain).
   Word data is loaded via data/words.js which sets _WORD_DATA
   as a newline-delimited string. Words are parsed into a Set
   for O(1) lookup.

   Also builds per-letter arrays for AI word selection.
*/

var Dictionary = (function () {

  var wordSet = new Set();
  var byLetter = {};  // { 'a': ['aardvark', ...], 'b': [...], ... }

  // Initialize letter buckets
  for (var c = 97; c <= 122; c++) {
    byLetter[String.fromCharCode(c)] = [];
  }

  // Parse the word data string into a Set and letter buckets
  if (typeof _WORD_DATA === 'string') {
    var words = _WORD_DATA.split('\n');
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (w.length >= Config.minWordLength) {
        wordSet.add(w);
        var first = w[0];
        if (byLetter[first]) {
          byLetter[first].push(w);
        }
      }
    }
  }

  // Free the raw string from memory
  _WORD_DATA = null;

  /** Check if a word is in the dictionary */
  function isValid(word) {
    if (!word || word.length < Config.minWordLength) return false;
    return wordSet.has(word.toLowerCase());
  }

  /** Get the last letter of a word */
  function lastLetter(word) {
    if (!word || word.length === 0) return '';
    return word[word.length - 1].toLowerCase();
  }

  /**
   * Get a random valid word starting with the given letter.
   * Excludes words in the usedSet. If preferLong is true,
   * biases toward longer words.
   * Returns null if no word is available.
   */
  function getRandomWord(letter, usedSet, preferLong) {
    var ch = letter.toLowerCase();
    var bucket = byLetter[ch];
    if (!bucket || bucket.length === 0) return null;

    // If preferring long words, try to find one >= 7 letters first
    if (preferLong) {
      var longWords = [];
      for (var i = 0; i < bucket.length; i++) {
        if (bucket[i].length >= 7 && !usedSet[bucket[i]]) {
          longWords.push(bucket[i]);
        }
      }
      if (longWords.length > 0) {
        return longWords[Math.floor(Math.random() * longWords.length)];
      }
    }

    // Random selection with retry (avoid used words)
    var attempts = 0;
    var maxAttempts = 100;
    while (attempts < maxAttempts) {
      var idx = Math.floor(Math.random() * bucket.length);
      var candidate = bucket[idx];
      if (!usedSet[candidate]) {
        return candidate;
      }
      attempts++;
    }

    // Fallback: linear scan
    for (var j = 0; j < bucket.length; j++) {
      if (!usedSet[bucket[j]]) {
        return bucket[j];
      }
    }

    return null; // All words used (extremely unlikely)
  }

  return {
    isValid: isValid,
    lastLetter: lastLetter,
    getRandomWord: getRandomWord,
    get count() { return wordSet.size; },
  };
})();
