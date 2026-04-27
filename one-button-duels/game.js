/* One-Button Duels — Main game logic

   Modules loaded before this file:
   - Config     (src/config.js)     — timing, combat, visual constants
   - Combat     (src/combat.js)     — timing bars, action resolution, round/match state
   - Renderer   (src/renderer.js)   — fighters, bars, effects, overlays

   Controls:
   - P1: Q key or left half of screen tap
   - P2: P key or right half of screen tap
   - Esc: pause/resume
*/

(function () {

  var particles = Particles.create();
  var touchEnabled = false;

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'P1: Q key · P2: P key · Press to lock action!',

    init: function () {
      Input.init();
      Shell.setStat('p1', 0);
      Shell.setStat('p2', 0);
      Shell.setStat('round', 1);

      // Mobile touch zones
      if (game.canvas) {
        game.canvas.addEventListener('touchstart', function (e) {
          e.preventDefault();
          touchEnabled = true;
          var rect = game.canvas.getBoundingClientRect();
          for (var i = 0; i < e.touches.length; i++) {
            var tx = e.touches[i].clientX - rect.left;
            var half = rect.width / 2;
            if (tx < half) {
              Combat.lockP1();
            } else {
              Combat.lockP2();
            }
          }
        }, { passive: false });
      }
    },

    reset: function () {
      particles.clear();
      Combat.reset();
      Renderer.reset();
      Combat.startRound();
      Shell.setStat('p1', 0);
      Shell.setStat('p2', 0);
      Shell.setStat('round', 1);
    },

    update: function (dt) {
      // Pause
      if (Input.pressed('Escape')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // Player input — lock actions
      if (Input.pressed('q') || Input.pressed('Q')) {
        Combat.lockP1();
      }
      if (Input.pressed('p')) {
        Combat.lockP2();
      }

      // Update combat
      var prevPhase = Combat.phase;
      Combat.update(dt);

      // Detect phase transitions for effects
      if (prevPhase === 'resolving' && Combat.phase === 'result') {
        var result = Combat.lastResult;
        if (result && result.winner) {
          Renderer.triggerShake();
          Renderer.triggerFlash();
          // Emit particles at the hit fighter
          var hitX = result.winner === 'p1' ? Config.p2X : Config.p1X;
          var hitColor = result.winner === 'p1' ? Config.p2Color : Config.p1Color;
          particles.emit(hitX, Config.fighterY, {
            count: 16,
            colors: [hitColor, '#ffffff', Config.goldColor],
            speed: 100,
            life: 0.5,
            size: 3,
          });
        }
      }

      // Update HUD
      Shell.setStat('p1', Combat.p1RoundWins);
      Shell.setStat('p2', Combat.p2RoundWins);
      Shell.setStat('round', Combat.roundNum);

      // Match end
      if (Combat.phase === 'matchEnd') {
        Combat.phase = 'idle';
        var winner = Combat.p1RoundWins >= Config.roundsToWin ? 'P1' : 'P2';
        var winColor = winner === 'P1' ? 'RED' : 'BLUE';
        if (winner === 'P1') {
          Audio8.play('win');
        } else {
          Audio8.play('win');
        }
        game.gameOver(winner + ' (' + winColor + ') WINS!');
      }

      // Effects
      Renderer.updateEffects(dt);
      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w;
      var h = game.h;

      // Background
      Renderer.drawBackground(ctx, w, h);
      Renderer.drawArena(ctx, w, h);

      // Round info
      Renderer.drawRoundInfo(ctx, w, Combat.roundNum, Combat.p1RoundWins, Combat.p2RoundWins, Config.roundsToWin);

      // Health bars
      if (Combat.p1 && Combat.p2) {
        Renderer.drawHealthBar(ctx, Config.hpBarP1X, Config.hpBarY, Combat.p1.hp, Config.hpPerRound, Config.p1Color);
        Renderer.drawHealthBar(ctx, Config.hpBarP2X, Config.hpBarY, Combat.p2.hp, Config.hpPerRound, Config.p2Color);

        // Player labels above health bars
        ctx.fillStyle = Config.p1Color;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('P1', Config.hpBarP1X + Config.hpBarWidth / 2, Config.hpBarY - 6);
        ctx.fillStyle = Config.p2Color;
        ctx.fillText('P2', Config.hpBarP2X + Config.hpBarWidth / 2, Config.hpBarY - 6);
        ctx.textAlign = 'left';

        // Fighters
        Renderer.drawFighter(ctx, Combat.p1, Config.p1X);
        Renderer.drawFighter(ctx, Combat.p2, Config.p2X);

        // Timing bars
        Renderer.drawTimingBar(ctx, Config.barP1X, Config.barY, Combat.barCursor, Combat.p1.locked, Combat.p1.action, true);
        Renderer.drawTimingBar(ctx, Config.barP2X, Config.barY, Combat.barCursor, Combat.p2.locked, Combat.p2.action, false);

        // Speed indicator
        Renderer.drawSpeedIndicator(ctx, w, Combat.currentSpeed);
      }

      // Result text
      if (Combat.phase === 'result' && Combat.lastResult) {
        Renderer.drawResultText(ctx, w, Combat.lastResult);
      }

      // Phase overlays
      Renderer.drawPhaseOverlay(ctx, w, h, Combat.phase, Combat.phaseTimer, Combat.roundNum, Combat.p1RoundWins, Combat.p2RoundWins);

      // Particles
      particles.draw(ctx);

      // Touch zones hint
      Renderer.drawTouchZones(ctx, w, h, Combat.phase);

      // Screen flash
      Renderer.drawFlash(ctx, w, h);
    },
  });

  game.start();

})();
