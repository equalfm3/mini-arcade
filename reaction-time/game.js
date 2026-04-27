/* Reaction Time — Main game orchestrator

   Multi-round challenge mode with 7 challenge types:
   - Tap (classic green screen)
   - Color Match (Stroop-style)
   - Direction (arrow keys)
   - Sequence (memorize & replay symbols)
   - Double Tap (tap twice quickly)
   - Math (verify equation)
   - Odd One Out (spot the different shape)

   7 rounds per match, average score, streaks, progressive difficulty.
*/

(function () {

  var STORAGE_KEY = 'mini-arcade-reaction-time-best-avg';

  function saveBestAvg(avg) {
    var current = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
    if (current === 0 || avg < current) {
      localStorage.setItem(STORAGE_KEY, avg);
      return true;
    }
    return false;
  }

  function loadBestAvg() {
    return parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
  }

  function handleTap() {
    if (!game.is('playing')) return;
    var result = ReactionTest.tap();
    handleResult(result);
  }

  function handleDirection(key) {
    if (!game.is('playing')) return;
    var result = ReactionTest.pressDirection(key);
    handleResult(result);
  }

  function handleReject() {
    if (!game.is('playing')) return;
    var result = ReactionTest.reject();
    handleResult(result);
  }

  function handleSeqSymbol(symbol) {
    if (!game.is('playing')) return;
    var result = ReactionTest.tapSequenceSymbol(symbol);
    handleResult(result);
  }

  function handleOddItem(index) {
    if (!game.is('playing')) return;
    var result = ReactionTest.tapOddItem(index);
    handleResult(result);
  }

  function handleResult(result) {
    if (result === 'started') {
      Audio8.play('click');
      Renderer.render();
    } else if (result === 'early') {
      Audio8.play('error');
      Renderer.render();
    } else if (result === 'wrong') {
      Audio8.play('error');
      Renderer.render();
    } else if (result === 'result') {
      Audio8.play('score');
      Shell.setStat('last', ReactionTest.reactionMs + 'ms');
      Renderer.render();
    } else if (result === 'summary') {
      showSummary();
    } else if (result === 'seqprogress') {
      Audio8.play('click');
      Renderer.render();
    } else if (result === 'dtfirst') {
      Audio8.play('tick');
      Renderer.render();
    }
  }

  function showSummary() {
    var avg = ReactionTest.getAverage();
    Shell.setStat('last', avg + 'ms avg');

    var isNewBest = saveBestAvg(avg);
    if (isNewBest) {
      ReactionTest.bestAvg = avg;
      Shell.setStat('best', avg + 'ms');
      Audio8.play('win');
      Shell.toast('New Best Average!');
    } else {
      Audio8.play('clear');
    }

    Renderer.render();
  }

  var game = Engine.create({
    startHint: '7 challenge types · Test your reflexes!',

    init: function () {
      Input.init();

      var bestAvg = loadBestAvg();
      if (bestAvg > 0) {
        Shell.setStat('best', bestAvg + 'ms');
        ReactionTest.bestAvg = bestAvg;
      }
    },

    reset: function () {
      ReactionTest.reset();

      var bestAvg = loadBestAvg();
      if (bestAvg > 0) {
        ReactionTest.bestAvg = bestAvg;
      }

      Shell.setStat('last', '—');

      Renderer.build(Shell.area);
      Renderer.setCallbacks(handleSeqSymbol, handleOddItem);
      Renderer.render();

      // Click/tap on the container
      var container = Shell.area.querySelector('.rt-container');
      if (container) {
        container.addEventListener('click', function (e) {
          // Don't handle if click was on a button inside
          if (e.target.closest('.rt-seq-btn') || e.target.closest('.rt-odd-btn')) return;
          e.stopPropagation();
          handleTap();
        });

        var touchStartY = 0;
        container.addEventListener('touchstart', function (e) {
          touchStartY = e.touches[0].clientY;
        }, { passive: true });

        container.addEventListener('touchmove', function (e) {
          e.preventDefault();
        }, { passive: false });

        container.addEventListener('touchend', function (e) {
          // Don't handle if touch was on a button inside
          if (e.target.closest('.rt-seq-btn') || e.target.closest('.rt-odd-btn')) return;

          e.preventDefault();
          e.stopPropagation();

          // Check for swipe-down to reject (color / math)
          var st = ReactionTest.state;
          var ct = ReactionTest.challengeType;
          if (st === 'go' && (ct === 'color' || ct === 'math')) {
            var endY = e.changedTouches[0].clientY;
            var dy = endY - touchStartY;
            if (dy > 40) {
              handleReject();
              return;
            }
          }

          handleTap();
        }, { passive: false });
      }
    },

    update: function (dt) {
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // Direction keys
      var dirKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
      for (var i = 0; i < dirKeys.length; i++) {
        if (Input.pressed(dirKeys[i])) {
          if (ReactionTest.state === 'go' && ReactionTest.challengeType === 'direction') {
            handleDirection(dirKeys[i]);
            Input.endFrame();
            return;
          }
        }
      }

      // N key — reject (color / math)
      if (Input.pressed('n') || Input.pressed('N')) {
        var st = ReactionTest.state;
        var ct = ReactionTest.challengeType;
        if (st === 'go' && (ct === 'color' || ct === 'math')) {
          handleReject();
          Input.endFrame();
          return;
        }
      }

      // Number keys 1-6 for sequence input
      if (ReactionTest.state === 'seqinput') {
        var syms = Config.sequenceSymbols;
        for (var k = 0; k < syms.length && k < 9; k++) {
          if (Input.pressed(String(k + 1))) {
            handleSeqSymbol(syms[k]);
            Input.endFrame();
            return;
          }
        }
      }

      // Space / Enter as generic tap
      if (Input.pressed(' ') || Input.pressed('Enter')) {
        handleTap();
      }

      // Update state machine
      var prevState = ReactionTest.state;
      ReactionTest.update(dt);
      var newState = ReactionTest.state;

      if (prevState !== newState) {
        if (newState === 'go') Audio8.play('tick');
        if (newState === 'seqinput') Audio8.play('click');
        if (newState === 'summary') showSummary();
        Renderer.render();
      }

      Input.endFrame();
    },
  });

  game.start();

})();
