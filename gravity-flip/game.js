/* Gravity Flip — Main game logic

   Modules loaded before this file:
   - Config     (src/config.js)     — constants
   - Player     (src/player.js)     — gravity physics, tap/hold mechanic, trail
   - Corridors  (src/corridors.js)  — wall generation, scrolling, collision, orbs
   - Renderer   (src/renderer.js)   — neon glow rendering, trail, speed lines

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.

   Controls:
   - Quick tap (Space/Up/Down/Tap): small impulse against gravity
   - Hold (Space/Up held): continuous thrust against gravity
   - Double-tap or press both Up+Down: flip gravity direction
*/

(function () {

  var score = 0;
  var best = loadHighScore('gravity-flip');
  var particles = Particles.create();
  var time = 0;
  var shakeTime = 0;
  var cameraOffsetY = 0;
  var wasHolding = false;

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Tap to hop, hold to thrust, double-tap to flip gravity',

    init: function () {
      Input.init();
      Input.actionBtn('FLIP');
      Shell.setStat('best', best);
      Renderer.init();
    },

    reset: function () {
      score = 0;
      time = 0;
      shakeTime = 0;
      cameraOffsetY = 0;
      wasHolding = false;
      Player.reset();
      Corridors.reset();
      particles.clear();
      Shell.setStat('score', 0);
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        game.togglePause();
      }

      if (!Player.alive) {
        shakeTime -= dt;
        if (shakeTime < 0) shakeTime = 0;
        particles.update(dt);
        Input.endFrame();
        return;
      }

      // --- Input: tap vs hold ---
      var justPressed = Input.pressed(' ') || Input.pressed('ArrowUp') || Input.tapped;
      var isHeld = Input.held(' ') || Input.held('ArrowUp');
      var flipGravity = Input.pressed('ArrowDown');

      // Flip gravity on down arrow
      if (flipGravity && Player.alive) {
        Player.flipGravity();
        Audio8.play('click');
        Audio8.note(80, 0.15, 'sine', 0.12);
        particles.emit(Config.playerX, Player.y, {
          count: Config.flipParticleCount,
          colors: Config.neonColors,
          speed: Config.flipParticleSpeed,
          life: Config.flipParticleLife,
          size: Config.flipParticleSize,
        });
      }

      // Tap/hold for thrust against gravity
      if (justPressed && Player.alive && !flipGravity) {
        Player.startHold();
        Audio8.play('click');
        particles.emit(Config.playerX, Player.y, {
          count: 5,
          colors: Config.neonColors,
          speed: 80,
          life: 0.2,
          size: 2,
        });
      }

      // Detect hold release
      if (wasHolding && !isHeld && Player.alive) {
        Player.endHold();
      }
      wasHolding = isHeld;

      time += dt;

      // --- Update ---
      Player.update(dt);
      Corridors.update(dt);
      Renderer.updateHue(dt);

      // Camera offset follows gravity direction
      var targetOffset = Player.gravityDir * -6;
      cameraOffsetY += (targetOffset - cameraOffsetY) * Config.cameraOffsetSmooth * dt;

      // --- Score ---
      var newScore = Math.floor(Corridors.distance * Config.scoreRate / 100);
      if (newScore > score) {
        score = newScore;
        Shell.setStat('score', score);
      }

      // --- Orb collection ---
      var hitbox = Player.getHitbox();
      var orbsCollected = Corridors.checkOrbCollection(hitbox);
      if (orbsCollected > 0) {
        score += orbsCollected * Config.orbPoints;
        Shell.setStat('score', score);
        Audio8.play('score');
        particles.emit(Config.playerX, Player.y, {
          count: 8,
          color: '#ffff00',
          speed: 100,
          life: 0.3,
          size: 2,
        });
      }

      // --- Wall collision ---
      var wallHit = Corridors.checkWallCollision(hitbox);
      if (wallHit === 'die') {
        Player.die();
        Audio8.play('hit');
        Audio8.play('gameover');
        shakeTime = Config.shakeDuration;
        particles.emit(Config.playerX, Player.y, {
          count: 25,
          colors: Config.neonColors,
          speed: 200,
          life: 0.6,
          size: 4,
        });
        if (saveHighScore('gravity-flip', score)) {
          best = score;
          Shell.setStat('best', best);
        }
        game.gameOver('Score: ' + score);
      }

      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      ctx.save();
      Renderer.applyScreenShake(ctx, shakeTime);
      ctx.translate(0, cameraOffsetY);

      Renderer.drawBackground(ctx, time, Corridors.speed);
      Renderer.drawSpeedLines(ctx, Corridors.speed, 1 / 60);
      Renderer.drawWalls(ctx, Corridors.segments, time);
      Renderer.drawOrbs(ctx, Corridors.orbs, time);
      Renderer.drawTrail(ctx, Player.trail, time);

      var squish = Player.getSquish();
      var glow = Player.getGlow(Corridors.speed);
      Renderer.drawPlayer(ctx, Player.y, squish, glow, time);
      Renderer.drawGravityIndicator(ctx, Player.gravityDir, Player.y);

      particles.draw(ctx);
      ctx.restore();
    },
  });

  game.start();

})();
