/* Lights Out — Main game orchestrator

   Classic puzzle: click a cell to toggle it and its neighbors.
   Turn all lights off to win. Levels get progressively harder.
*/

(function () {

  var currentLevel = 0;
  var solved = false;
  var solveDelay = 0;

  function loadLevel(n) {
    if (n >= Config.levelToggles.length) {
      game.win('All ' + Config.levelToggles.length + ' levels complete!');
      return;
    }
    var toggles = Config.levelToggles[n];
    Board.generate(toggles);
    Renderer.reset();
    solved = false;
    solveDelay = 0;
    Shell.setStat('moves', 0);
    Shell.setStat('level', n + 1);
  }

  function handleClick(px, py) {
    if (solved) return;

    var cs = Config.cellSize;
    var gap = Config.cellGap;

    // Convert pixel to grid coords
    var x = Math.floor((px - gap) / (cs + gap));
    var y = Math.floor((py - gap) / (cs + gap));

    if (x < 0 || x >= Config.cols || y < 0 || y >= Config.rows) return;

    // Check click is within cell bounds (not in gap)
    var cellLeft = gap + x * (cs + gap);
    var cellTop = gap + y * (cs + gap);
    if (px < cellLeft || px > cellLeft + cs) return;
    if (py < cellTop || py > cellTop + cs) return;

    Board.toggle(x, y);
    Renderer.addFlash(x, y);
    Audio8.play('click');
    Shell.setStat('moves', Board.moves);

    // Check win
    if (Board.isSolved()) {
      solved = true;
      solveDelay = 0;
      Audio8.play('win');
    }
  }

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Click a light to toggle it and its neighbors',

    init: function (ctx) {
      Input.init();

      // Click/tap handling
      game.canvas.addEventListener('click', function (e) {
        if (!game.is('playing')) return;
        var rect = game.canvas.getBoundingClientRect();
        var scaleX = Config.canvasW / rect.width;
        var scaleY = Config.canvasH / rect.height;
        var px = (e.clientX - rect.left) * scaleX;
        var py = (e.clientY - rect.top) * scaleY;
        handleClick(px, py);
      });
    },

    reset: function (ctx) {
      currentLevel = 0;
      loadLevel(currentLevel);
    },

    update: function (dt) {
      Renderer.update(dt);

      if (solved) {
        solveDelay += dt;
        if (solveDelay > 1.0) {
          currentLevel++;
          if (currentLevel >= Config.levelToggles.length) {
            game.win('All ' + Config.levelToggles.length + ' levels complete!');
          } else {
            Shell.toast('Level ' + currentLevel + ' complete! Moves: ' + Board.moves);
            loadLevel(currentLevel);
          }
        }
      }

      // Pause
      if (Input.pressed('Escape')) {
        Shell.showOverlay({
          title: 'Paused',
          btn: 'Resume',
          onAction: function () {
            var overlay = document.getElementById('overlay');
            if (overlay) { var rb = overlay.querySelector('.restart-btn'); if (rb) rb.remove(); }
            Shell.hideOverlay();
            game.play();
          }
        });
        var overlay = document.getElementById('overlay');
        if (overlay) {
          var existing = overlay.querySelector('.restart-btn');
          if (existing) existing.remove();
          var rb = document.createElement('button');
          rb.className = 'btn restart-btn';
          rb.textContent = 'Restart';
          rb.style.cssText = 'margin-top:8px;';
          rb.addEventListener('click', function (e) {
            e.stopPropagation();
            var o = document.getElementById('overlay');
            if (o) { var r = o.querySelector('.restart-btn'); if (r) r.remove(); }
            Shell.hideOverlay();
            game.restart();
          });
          overlay.appendChild(rb);
        }
        game.pause();
      }

      Input.endFrame();
    },

    draw: function (ctx) {
      Renderer.draw(ctx);
    },
  });

  game.start();

})();
