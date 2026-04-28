/* Hex Merge — Main game orchestrator

   Hexagonal 2048: slide tiles in 6 directions on a hex grid.
   Swipe or use keys (Q/W/E/A/S/D or numpad) to move.

   Modules: Config, HexGrid, Tiles, Renderer
*/

(function () {

  var score = 0;
  var best = loadHighScore('hex-merge');
  var won = false;
  var gameOverFlag = false;

  // Map swipe angles to hex directions
  // Directions: 0=E, 1=NE, 2=NW, 3=W, 4=SW, 5=SE
  function angleToDir(angle) {
    // angle in degrees, 0 = right, clockwise
    // Normalize to 0-360
    while (angle < 0) angle += 360;
    angle = angle % 360;

    if (angle < 30 || angle >= 330) return 0;  // E
    if (angle >= 30 && angle < 90) return 5;   // SE
    if (angle >= 90 && angle < 150) return 4;  // SW
    if (angle >= 150 && angle < 210) return 3; // W
    if (angle >= 210 && angle < 270) return 2; // NW
    if (angle >= 270 && angle < 330) return 1; // NE
    return 0;
  }

  function handleMove(dirIndex) {
    if (gameOverFlag) return;

    var result = HexGrid.slide(dirIndex);
    if (!result.moved) return;

    score += result.score;
    Shell.setStat('score', score);
    Audio8.play('move');

    // Trigger merge animations
    for (var i = 0; i < result.merges.length; i++) {
      var m = result.merges[i];
      Tiles.merge(m.q, m.r, m.value);
    }
    if (result.merges.length > 0) Audio8.play('score');

    // Add new tile
    var newTile = HexGrid.addRandomTile();
    if (newTile) Tiles.spawn(newTile.q, newTile.r, newTile.value);

    // Update best
    if (score > best) {
      best = score;
      Shell.setStat('best', best);
    }

    // Check win
    if (!won && HexGrid.hasWon()) {
      won = true;
      Audio8.play('win');
      Shell.toast('2048!');
    }

    // Check game over
    if (!HexGrid.canMove()) {
      gameOverFlag = true;
      Audio8.play('gameover');
      saveHighScore('hex-merge', score);
      setTimeout(function () {
        game.gameOver('Score: ' + score);
      }, 400);
    }
  }

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Swipe or use Q/W/E/A/S/D keys',

    init: function (ctx) {
      Input.init();
      Renderer.init(ctx);
      Shell.setStat('best', best);

      // Swipe detection with angle
      var startX, startY;
      game.canvas.addEventListener('touchstart', function (e) {
        var t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
      });
      game.canvas.addEventListener('touchend', function (e) {
        var t = e.changedTouches[0];
        var dx = t.clientX - startX;
        var dy = t.clientY - startY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 30) return; // too short
        var angle = Math.atan2(dy, dx) * 180 / Math.PI;
        handleMove(angleToDir(angle));
      });

      // Mouse swipe
      var mDown = false, mx, my;
      game.canvas.addEventListener('mousedown', function (e) {
        mDown = true;
        mx = e.clientX;
        my = e.clientY;
      });
      game.canvas.addEventListener('mouseup', function (e) {
        if (!mDown) return;
        mDown = false;
        var dx = e.clientX - mx;
        var dy = e.clientY - my;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 30) return;
        var angle = Math.atan2(dy, dx) * 180 / Math.PI;
        handleMove(angleToDir(angle));
      });
    },

    reset: function (ctx) {
      score = 0;
      won = false;
      gameOverFlag = false;
      HexGrid.reset();
      Tiles.reset();

      // Add starting tiles
      for (var i = 0; i < Config.startTiles; i++) {
        var t = HexGrid.addRandomTile();
        if (t) Tiles.spawn(t.q, t.r, t.value);
      }

      Shell.setStat('score', 0);
      Shell.setStat('best', best);
    },

    update: function (dt) {
      Tiles.update(dt);

      // Keyboard: Q=NW, W=NE, E=E, A=W, S=SW, D=SE
      if (Input.pressed('KeyQ') || Input.pressed('Numpad7')) handleMove(2); // NW
      if (Input.pressed('KeyW') || Input.pressed('Numpad8') || Input.pressed('ArrowUp')) handleMove(1); // NE
      if (Input.pressed('KeyE') || Input.pressed('Numpad9')) handleMove(0); // E
      if (Input.pressed('KeyA') || Input.pressed('Numpad1') || Input.pressed('ArrowLeft')) handleMove(3); // W
      if (Input.pressed('KeyS') || Input.pressed('Numpad2') || Input.pressed('ArrowDown')) handleMove(4); // SW
      if (Input.pressed('KeyD') || Input.pressed('Numpad3') || Input.pressed('ArrowRight')) handleMove(5); // SE

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
      // Clear
      ctx.fillStyle = Config.gridBg;
      ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

      // Draw board
      Renderer.draw(ctx);
      Renderer.drawDirectionHints(ctx);
    },
  });

  game.start();

})();
