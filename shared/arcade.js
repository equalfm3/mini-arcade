/* ============================================
   arcade.js — Single-file loader for all shared modules.
   
   Each game includes just this one file:
     <script src="../shared/arcade.js"></script>
   
   It loads shared modules, then game source files
   declared in GAME.src (if any), then game.js.
   
   Example GAME config with sub-modules:
     var GAME = {
       id: 'snake',
       title: 'Snake',
       stats: [...],
       src: ['src/config.js', 'src/snake.js', 'src/food.js', 'src/board.js']
     };
   ============================================ */

(function () {
  var base = document.currentScript ? document.currentScript.src.replace(/[^/]*$/, '') : '../shared/';
  var sharedModules = [
    'icons.js',
    'game-shell.js',
    'utils.js',
    'engine.js',
    'input.js',
    'audio.js',
    'particles.js',
    'grid.js',
    'timer.js',
  ];

  // Game-specific source files declared in GAME.src
  var gameSrc = (window.GAME && window.GAME.src) || [];

  // Build full load queue: shared modules → game src → game.js
  var queue = [];
  for (var i = 0; i < sharedModules.length; i++) {
    queue.push(base + sharedModules[i]);
  }
  for (var j = 0; j < gameSrc.length; j++) {
    queue.push(gameSrc[j]);
  }
  queue.push('game.js');

  var idx = 0;

  function loadNext() {
    if (idx >= queue.length) return;
    var script = document.createElement('script');
    script.src = queue[idx];
    script.onload = function () {
      idx++;
      loadNext();
    };
    script.onerror = function () {
      console.warn('Failed to load: ' + queue[idx]);
      idx++;
      loadNext();
    };
    document.body.appendChild(script);
  }

  loadNext();
})();
