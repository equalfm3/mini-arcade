/* 2048 — Main game orchestrator

   Modules loaded before this file:
   - Config    (src/config.js)   — constants, tile colors
   - Board     (src/board.js)    — grid state, slide/merge logic
   - Renderer  (src/renderer.js) — DOM grid rendering

   Shared globals available:
   - Shell, Audio8, Input, etc.

   This is a DOM game — no Engine.create with canvas.
*/

(function () {

  var best = loadHighScore('2048');
  var won = false;
  var gameOver = false;

  function startGame() {
    Shell.hideOverlay();
    Board.reset();
    won = false;
    gameOver = false;
    Renderer.build(Shell.area);

    // Add initial tiles
    for (var i = 0; i < Config.startTiles; i++) {
      Board.addRandomTile();
    }

    Renderer.update(Board.getGrid(), null, []);
    Shell.setStat('score', 0);
    Shell.setStat('best', best);
  }

  function handleMove(dir) {
    if (gameOver) return;

    var result = Board.slide(dir);
    if (!result.moved) return;

    // Update score
    Shell.setStat('score', Board.score);
    Audio8.play('move');

    // Add new tile
    var newTile = Board.addRandomTile();
    Renderer.update(Board.getGrid(), newTile, result.merges);

    if (result.merges.length > 0) Audio8.play('score');

    // Update best score live
    if (Board.score > best) {
      best = Board.score;
      Shell.setStat('best', best);
    }

    // Check win
    if (!won && Board.hasWon()) {
      won = true;
      Audio8.play('win');
      Shell.toast('2048!');
      // Don't stop — let player continue
    }

    // Check game over
    if (!Board.canMove()) {
      gameOver = true;
      Audio8.play('gameover');
      if (saveHighScore('2048', Board.score)) {
        best = Board.score;
        Shell.setStat('best', best);
      }
      setTimeout(function () {
        Shell.showOverlay({
          title: 'Game Over',
          score: 'Score: ' + Board.score,
          btn: 'Try Again',
          onAction: startGame
        });
      }, 600);
    }
  }

  // Input: arrow keys
  Input.init();
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp')    { e.preventDefault(); handleMove('up'); }
    if (e.key === 'ArrowDown')  { e.preventDefault(); handleMove('down'); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); handleMove('left'); }
    if (e.key === 'ArrowRight') { e.preventDefault(); handleMove('right'); }
  });

  // Swipe detection on game area
  onSwipe(Shell.area, function (dir) {
    if (dir === 'up' || dir === 'down' || dir === 'left' || dir === 'right') {
      handleMove(dir);
    }
  });

  // Show start screen
  Shell.showOverlay({
    title: GAME.title,
    subtitle: 'Swipe or use arrow keys',
    btn: 'Start',
    onAction: startGame
  });

})();
