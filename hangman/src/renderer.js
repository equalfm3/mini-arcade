/* Hangman — Canvas Renderer */

var Renderer = (function () {

  var guessedLetters = {};   // { A: 'correct'|'wrong', ... }
  var revealedWord = [];     // array of chars or null for each position
  var word = '';
  var category = '';
  var statusText = '';
  var statusColor = '';

  function reset(newWord, newCategory) {
    word = newWord || '';
    category = newCategory || '';
    guessedLetters = {};
    revealedWord = [];
    statusText = '';
    statusColor = '';
    for (var i = 0; i < word.length; i++) {
      revealedWord.push(null);
    }
  }

  function revealLetter(letter) {
    var found = false;
    for (var i = 0; i < word.length; i++) {
      if (word[i] === letter) {
        revealedWord[i] = letter;
        found = true;
      }
    }
    guessedLetters[letter] = found ? 'correct' : 'wrong';
    return found;
  }

  function revealAll() {
    for (var i = 0; i < word.length; i++) {
      revealedWord[i] = word[i];
    }
  }

  function isWordComplete() {
    for (var i = 0; i < revealedWord.length; i++) {
      if (revealedWord[i] === null) return false;
    }
    return true;
  }

  function setStatus(text, color) {
    statusText = text || '';
    statusColor = color || Config.letterColor;
  }

  function draw(ctx, w, h) {
    // Clear
    ctx.fillStyle = Config.bg;
    ctx.fillRect(0, 0, w, h);

    // Draw gallows
    Gallows.draw(ctx);

    // Draw category label
    drawCategory(ctx, w);

    // Draw word blanks / letters
    drawWord(ctx, w);

    // Draw keyboard
    drawKeyboard(ctx, w);

    // Draw status text
    if (statusText) {
      drawStatus(ctx, w);
    }
  }

  function drawCategory(ctx, w) {
    ctx.font = '13px monospace';
    ctx.fillStyle = Config.categoryColor;
    ctx.textAlign = 'center';
    ctx.fillText('Category: ' + category, w / 2, Config.gallowsY + 15);
  }

  function drawWord(ctx, w) {
    var len = word.length;
    var totalW = len * Config.blankWidth + (len - 1) * Config.letterGap;
    var startX = (w - totalW) / 2;
    var y = Config.wordY;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    for (var i = 0; i < len; i++) {
      var x = startX + i * (Config.blankWidth + Config.letterGap) + Config.blankWidth / 2;

      // Draw blank line
      ctx.strokeStyle = Config.blankColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - Config.blankWidth / 2, y + 4);
      ctx.lineTo(x + Config.blankWidth / 2, y + 4);
      ctx.stroke();

      // Draw letter if revealed
      if (revealedWord[i]) {
        ctx.font = 'bold ' + Config.letterSize + 'px monospace';
        var isGuessed = guessedLetters[revealedWord[i]];
        ctx.fillStyle = isGuessed === 'correct' ? Config.correctColor : Config.letterColor;
        ctx.fillText(revealedWord[i], x, y);
      }
    }
  }

  function drawKeyboard(ctx, w) {
    var rows = Config.keyboardRows;
    var ks = Config.keySize;
    var kg = Config.keyGap;

    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var rowW = row.length * ks + (row.length - 1) * kg;
      var startX = (w - rowW) / 2;
      var y = Config.keyboardY + r * (ks + kg);

      for (var c = 0; c < row.length; c++) {
        var letter = row[c];
        var x = startX + c * (ks + kg);
        var state = guessedLetters[letter]; // 'correct', 'wrong', or undefined

        // Key background
        if (state === 'correct') {
          ctx.fillStyle = Config.keyUsedCorrect;
        } else if (state === 'wrong') {
          ctx.fillStyle = Config.keyUsedWrong;
        } else {
          ctx.fillStyle = Config.keyBg;
        }

        roundRect(ctx, x, y, ks, ks, Config.keyRadius);
        ctx.fill();

        // Key border
        ctx.strokeStyle = Config.keyBorder;
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, ks, ks, Config.keyRadius);
        ctx.stroke();

        // Key letter
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = state ? Config.keyUsedText : Config.keyText;
        ctx.fillText(letter, x + ks / 2, y + ks / 2);
      }
    }
  }

  function drawStatus(ctx, w) {
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = statusColor;
    ctx.fillText(statusText, w / 2, Config.wordY + 30);
  }

  /** Get which keyboard letter was clicked/tapped */
  function getKeyAt(localX, localY, canvasW) {
    var rows = Config.keyboardRows;
    var ks = Config.keySize;
    var kg = Config.keyGap;

    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var rowW = row.length * ks + (row.length - 1) * kg;
      var startX = (canvasW - rowW) / 2;
      var y = Config.keyboardY + r * (ks + kg);

      if (localY < y || localY > y + ks) continue;

      for (var c = 0; c < row.length; c++) {
        var x = startX + c * (ks + kg);
        if (localX >= x && localX <= x + ks) {
          return row[c];
        }
      }
    }
    return null;
  }

  function isLetterGuessed(letter) {
    return !!guessedLetters[letter];
  }

  // --- Helpers ---
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  return {
    reset: reset,
    revealLetter: revealLetter,
    revealAll: revealAll,
    isWordComplete: isWordComplete,
    isLetterGuessed: isLetterGuessed,
    setStatus: setStatus,
    draw: draw,
    getKeyAt: getKeyAt,
  };
})();
