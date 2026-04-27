/* Snake — Main game logic
   
   Modules loaded before this file:
   - Config  (src/config.js)  — constants
   - Board   (src/board.js)   — grid rendering
   - Snake   (src/snake.js)   — snake entity
   - Food    (src/food.js)    — food spawning/rendering
   
   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var score = 0;
  var best = loadHighScore('snake');
  var foodEaten = 0;
  var moveTimer = 0;
  var particles = Particles.create();

  function speed() {
    return Math.min(Config.baseSpeed + foodEaten * Config.speedIncrement, Config.maxSpeed);
  }

  // --- Engine setup ---
  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Arrow keys or swipe to move',

    init: function () {
      Input.init();
      Input.dpad();
      Shell.setStat('best', best);
    },

    reset: function () {
      score = 0;
      foodEaten = 0;
      moveTimer = 0;
      Snake.reset();
      Food.spawn(Snake.body);
      particles.clear();
      Shell.setStat('score', 0);
    },

    update: function (dt) {
      // --- Input ---
      if (Input.pressed('ArrowUp')    || Input.dir === 'up')    Snake.setDirection(0, -1);
      if (Input.pressed('ArrowDown')  || Input.dir === 'down')  Snake.setDirection(0, 1);
      if (Input.pressed('ArrowLeft')  || Input.dir === 'left')  Snake.setDirection(-1, 0);
      if (Input.pressed('ArrowRight') || Input.dir === 'right') Snake.setDirection(1, 0);
      if (Input.pressed('Escape') || Input.pressed('p'))        game.togglePause();

      // --- Tick-based movement ---
      moveTimer += dt;
      var interval = 1 / speed();

      while (moveTimer >= interval) {
        moveTimer -= interval;

        var result = Snake.step(Food.pos);

        if (!result.alive) {
          Audio8.play('gameover');
          particles.emit(
            Snake.head.x * Config.cellSize + Config.cellSize / 2,
            Snake.head.y * Config.cellSize + Config.cellSize / 2,
            { count: 25, colors: [Config.snakeHead, Config.snakeBody, '#fff'], speed: 150, life: 0.8 }
          );
          if (saveHighScore('snake', score)) {
            best = score;
            Shell.setStat('best', best);
          }
          game.gameOver('Score: ' + score);
          return;
        }

        if (result.ate) {
          foodEaten++;
          score += Config.pointsPerFood;

          // Bonus every N food
          if (foodEaten % Config.bonusThreshold === 0) {
            score += Config.pointsPerFood * 2;
            Shell.toast('+' + (Config.pointsPerFood * 2) + ' Bonus!');
            Audio8.play('clear');
          } else {
            Audio8.play('score');
          }

          Shell.setStat('score', score);

          // Particles at food position
          particles.emit(
            Food.pos.x * Config.cellSize + Config.cellSize / 2,
            Food.pos.y * Config.cellSize + Config.cellSize / 2,
            { count: 8, color: Config.food, speed: 80, life: 0.4, size: 3 }
          );

          Food.spawn(Snake.body);
        }
      }

      // --- Animate ---
      Food.update(dt);
      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      Board.draw(ctx);
      Food.draw(ctx);
      Snake.draw(ctx);
      particles.draw(ctx);
    },
  });

  game.start();

})();
