/* One-Button Duels — Main game logic

   Player vs AI. Pick Strike, Parry, or Dodge.
   AI picks independently (blind). Both revealed simultaneously.
   Best of 5 rounds, 3 HP per round.
*/

(function () {

  var particles = Particles.create();

  function getCanvasPos(e) {
    var rect = game.canvas.getBoundingClientRect();
    var scaleX = game.w / rect.width;
    var scaleY = game.h / rect.height;
    return {
      x: ((e.clientX || e.changedTouches[0].clientX) - rect.left) * scaleX,
      y: ((e.clientY || e.changedTouches[0].clientY) - rect.top) * scaleY,
    };
  }

  function hitTestButton(px, py) {
    if (py < Config.btnY || py > Config.btnY + Config.btnH) return null;
    for (var i = 0; i < Config.actions.length; i++) {
      var bx = Config.btnStartX + i * (Config.btnW + Config.btnGap);
      if (px >= bx && px <= bx + Config.btnW) {
        return Config.actions[i];
      }
    }
    return null;
  }

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Pick Strike, Parry, or Dodge to fight the AI!',

    init: function () {
      Input.init();

      if (game.canvas) {
        game.canvas.addEventListener('click', function (e) {
          if (!game.is('playing')) return;
          var pos = getCanvasPos(e);
          var action = hitTestButton(pos.x, pos.y);
          if (action) Combat.playerSelect(action);
        });

        game.canvas.addEventListener('touchend', function (e) {
          e.preventDefault();
          if (!game.is('playing')) return;
          var pos = getCanvasPos(e);
          var action = hitTestButton(pos.x, pos.y);
          if (action) Combat.playerSelect(action);
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
    },

    update: function (dt) {
      if (Input.pressed('Escape')) {
        game.togglePause();
        Input.endFrame();
        return;
      }

      // Keyboard shortcuts: 1=Strike, 2=Parry, 3=Dodge
      if (Input.pressed('1')) Combat.playerSelect('STRIKE');
      if (Input.pressed('2')) Combat.playerSelect('PARRY');
      if (Input.pressed('3')) Combat.playerSelect('DODGE');

      var prevPhase = Combat.phase;
      Combat.update(dt);

      // Effects on result
      if (prevPhase === 'resolving' && Combat.phase === 'result') {
        var result = Combat.lastResult;
        if (result && result.winner) {
          Renderer.triggerShake();
          Renderer.triggerFlash();
          var hitX = result.winner === 'player' ? Config.aiX : Config.playerX;
          var hitColor = result.winner === 'player' ? Config.aiColor : Config.playerColor;
          particles.emit(hitX, Config.fighterY, {
            count: 16, colors: [hitColor, '#ffffff', Config.goldColor],
            speed: 100, life: 0.5, size: 3,
          });
        }
      }

      Shell.setStat('p1', Combat.playerRoundWins);
      Shell.setStat('p2', Combat.aiRoundWins);

      if (Combat.phase === 'matchEnd') {
        Combat.phase = 'idle';
        var winner = Combat.playerRoundWins >= Config.roundsToWin ? 'You' : 'AI';
        Audio8.play(winner === 'You' ? 'win' : 'gameover');
        game.gameOver(winner + ' win! (' + Combat.playerRoundWins + '-' + Combat.aiRoundWins + ')');
      }

      Renderer.updateEffects(dt);
      particles.update(dt);
      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w; var h = game.h;

      Renderer.drawBackground(ctx, w, h);
      Renderer.drawArena(ctx, w, h);
      Renderer.drawRoundInfo(ctx, w);

      if (Combat.player && Combat.ai) {
        Renderer.drawHealthBar(ctx, Config.hpBarPlayerX, Config.hpBarY, Combat.player.hp, Config.hpPerRound, Config.playerColor);
        Renderer.drawHealthBar(ctx, Config.hpBarAIX, Config.hpBarY, Combat.ai.hp, Config.hpPerRound, Config.aiColor);
        Renderer.drawFighter(ctx, Combat.player, Config.playerX, true);
        Renderer.drawFighter(ctx, Combat.ai, Config.aiX, false);
      }

      if (Combat.phase === 'result' && Combat.lastResult) {
        Renderer.drawResultText(ctx, w, Combat.lastResult);
      }

      // Timer bar during choosing
      if (Combat.phase === 'choosing') {
        Renderer.drawTimerBar(ctx, w, Combat.chooseTimer / Config.chooseTime);
      }

      Renderer.drawChoosePrompt(ctx, w);
      Renderer.drawActionButtons(ctx, w, Combat.playerChoice, Combat.phase);
      Renderer.drawPhaseOverlay(ctx, w, h);
      particles.draw(ctx);
      Renderer.drawFlash(ctx, w, h);
    },
  });

  game.start();

})();
