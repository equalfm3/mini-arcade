/* Laser Reflect — Main game orchestrator

   Place and rotate mirrors on a grid to guide a laser beam
   from the emitter to the target. Click cells to place mirrors,
   click again to rotate, click a third time to remove.
*/

(function () {

  var currentLevel = 0;
  var level = null;
  var laserResult = null;
  var winDelay = 0;
  var won = false;

  function loadLevel(n) {
    level = Levels.getLevel(n);
    if (!level) {
      // All levels complete
      game.win('All levels complete!');
      return;
    }
    Mirrors.reset(level);
    won = false;
    winDelay = 0;
    traceLaser();
    Shell.setStat('level', n + 1);
  }

  function traceLaser() {
    laserResult = Laser.trace(Mirrors.getBoard(), level.emitter, level.target);
  }

  function handleClick(px, py) {
    if (won) return;
    var cs = Config.cellSize;
    var x = Math.floor(px / cs);
    var y = Math.floor(py / cs);

    if (x < 0 || x >= Config.cols || y < 0 || y >= Config.rows) return;

    // Can't click on emitter, target, walls, or fixed mirrors
    if (x === level.emitter.x && y === level.emitter.y) return;
    if (x === level.target.x && y === level.target.y) return;
    if (Mirrors.isFixed(x, y)) return;
    var cell = Mirrors.getBoard()[y][x];
    if (cell === 'wall') return;

    Mirrors.toggle(x, y, level.emitter, level.target);
    Audio8.play('click');
    traceLaser();

    // Check win
    if (laserResult.hit) {
      won = true;
      winDelay = 0;
      Audio8.play('win');
    }
  }

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Click to place mirrors, guide the laser to the target',

    init: function (ctx) {
      Input.init();
      Renderer.init();

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
      // Win delay — advance to next level after a moment
      if (won) {
        winDelay += dt;
        if (winDelay > 1.0) {
          currentLevel++;
          if (currentLevel >= Levels.count) {
            game.win('All ' + Levels.count + ' levels complete!');
          } else {
            Shell.toast('Level ' + currentLevel + ' complete!');
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
      Renderer.draw(ctx, level, laserResult ? laserResult.path : [], laserResult ? laserResult.hit : false);
    },
  });

  game.start();

})();
