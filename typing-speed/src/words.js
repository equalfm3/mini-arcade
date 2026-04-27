/* Typing Speed — Word Pool & Passage Generation

   Provides a pool of common English words and
   generates random passages for typing tests.
*/

var Words = (function () {

  // 200 common English words — mixed lengths for natural typing
  var pool = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
    'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
    'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
    'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
    'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
    'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
    'any', 'these', 'give', 'day', 'most', 'us', 'great', 'between', 'need',
    'large', 'under', 'never', 'each', 'right', 'hand', 'high', 'place',
    'small', 'found', 'live', 'where', 'own', 'while', 'last', 'long',
    'same', 'another', 'group', 'world', 'still', 'keep', 'point', 'start',
    'three', 'every', 'begin', 'life', 'those', 'help', 'part', 'house',
    'might', 'next', 'much', 'home', 'water', 'room', 'mother', 'area',
    'money', 'story', 'young', 'fact', 'month', 'lot', 'right', 'study',
    'book', 'eye', 'job', 'word', 'side', 'kind', 'head', 'far', 'black',
    'old', 'number', 'write', 'school', 'night', 'city', 'tree', 'cross',
    'care', 'line', 'plan', 'run', 'move', 'close', 'open', 'door', 'set',
    'play', 'power', 'learn', 'early', 'food', 'sun', 'state', 'talk',
    'form', 'family', 'body', 'music', 'mind', 'class', 'field', 'table',
    'face', 'north', 'love', 'game', 'feel', 'air', 'best', 'change',
    'child', 'real', 'leave', 'turn', 'sure', 'watch', 'color', 'paper'
  ];

  /** Pick n random words from the pool */
  function pickWords(n) {
    var words = [];
    for (var i = 0; i < n; i++) {
      words.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return words;
  }

  /** Generate a passage — array of words */
  function generatePassage() {
    return pickWords(Config.wordsPerPassage);
  }

  /**
   * Break words into display lines based on character width.
   * Returns array of arrays: [[word, word, ...], [word, ...], ...]
   */
  function wrapLines(words, maxChars) {
    var lines = [];
    var currentLine = [];
    var currentLen = 0;
    var max = maxChars || Config.lineWidthChars;

    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      var needed = currentLen === 0 ? w.length : w.length + 1; // +1 for space

      if (currentLen + needed > max && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [w];
        currentLen = w.length;
      } else {
        currentLine.push(w);
        currentLen += needed;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  return {
    pool: pool,
    pickWords: pickWords,
    generatePassage: generatePassage,
    wrapLines: wrapLines,
  };
})();

