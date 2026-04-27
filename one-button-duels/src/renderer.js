/* One-Button Duels — Renderer Module */

var Renderer = (function () {

  var shakeTimer = 0;
  var shakeX = 0;
  var shakeY = 0;
  var flashTimer = 0;
  var bgStars = [];

  function reset() {
    shakeTimer = 0; shakeX = 0; shakeY = 0; flashTimer = 0;
    bgStars = [];
    for (var i = 0; i < 40; i++) {
      bgStars.push({ x: Math.random() * Config.canvasW, y: Math.random() * Config.canvasH,
        size: 0.5 + Math.random() * 1.5, alpha: 0.05 + Math.random() * 0.12 });
    }
  }

  function triggerShake() { shakeTimer = Config.shakeDuration; }
  function triggerFlash() { flashTimer = 0.15; }

  function updateEffects(dt) {
    if (shakeTimer > 0) {
      shakeTimer -= dt;
      var intensity = Config.shakeIntensity * (shakeTimer / Config.shakeDuration);
      shakeX = (Math.random() - 0.5) * 2 * intensity;
      shakeY = (Math.random() - 0.5) * 2 * intensity;
    } else { shakeX = 0; shakeY = 0; }
    if (flashTimer > 0) flashTimer -= dt;
  }

  function drawBackground(ctx, w, h) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, w, h);
    for (var i = 0; i < bgStars.length; i++) {
      var s = bgStars[i];
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.ceil(s.size), Math.ceil(s.size));
    }
    ctx.globalAlpha = 1;
  }

  function drawArena(ctx, w, h) {
    var groundY = Config.fighterY + Config.fighterH / 2 + 10;
    ctx.strokeStyle = '#2a2a40'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, groundY); ctx.lineTo(w - 30, groundY); ctx.stroke();
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(w / 2 - 1, groundY - 80, 2, 80);
  }

  function drawFighter(ctx, fighter, baseX, isPlayer) {
    var x = baseX + fighter.offsetX + shakeX;
    var y = Config.fighterY + shakeY;
    var fh = Config.fighterH;
    var color = isPlayer ? Config.playerColor : Config.aiColor;
    var colorDark = isPlayer ? Config.playerColorDark : Config.aiColorDark;
    var dir = isPlayer ? 1 : -1;

    ctx.save(); ctx.translate(x, y);

    // Head
    ctx.fillStyle = color;
    ctx.fillRect(-8, -fh / 2, 16, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4 + dir * 2, -fh / 2 + 4, 3, 3);
    ctx.fillRect(2 + dir * 2, -fh / 2 + 4, 3, 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(-3 + dir * 2, -fh / 2 + 5, 2, 2);
    ctx.fillRect(3 + dir * 2, -fh / 2 + 5, 2, 2);

    // Torso
    ctx.fillStyle = colorDark;
    ctx.fillRect(-10, -fh / 2 + 18, 20, 16);

    // Arms based on state
    ctx.fillStyle = color;
    if (fighter.animState === 'strike') {
      ctx.fillRect(dir * 10, -fh / 2 + 18, dir * 20, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dir * 28, -fh / 2 + 16, 8, 10);
    } else if (fighter.animState === 'parry') {
      ctx.fillRect(-6, -fh / 2 + 16, 12, 8);
      ctx.fillStyle = '#aaaacc';
      ctx.fillRect(dir * 4, -fh / 2 + 14, 14, 12);
    } else if (fighter.animState === 'dodge') {
      ctx.fillRect(-dir * 8, -fh / 2 + 20, -dir * 12, 5);
    } else if (fighter.animState === 'hit') {
      ctx.fillRect(-dir * 6, -fh / 2 + 16, -dir * 14, 5);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(dir * -12, -fh / 2 + 8, 4, 4);
      ctx.fillRect(dir * -10, -fh / 2 + 6, 4, 4);
    } else if (fighter.animState === 'win') {
      ctx.fillRect(-12, -fh / 2 + 10, 6, -14);
      ctx.fillRect(6, -fh / 2 + 10, 6, -14);
    } else {
      ctx.fillRect(-14, -fh / 2 + 18, 5, 12);
      ctx.fillRect(9, -fh / 2 + 18, 5, 12);
    }

    // Legs
    ctx.fillStyle = colorDark;
    ctx.fillRect(-8, -fh / 2 + 34, 6, 14);
    ctx.fillRect(2, -fh / 2 + 34, 6, 14);

    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isPlayer ? 'YOU' : 'AI', 0, -fh / 2 - 8);

    ctx.restore();
  }

  function drawHealthBar(ctx, x, y, hp, maxHp, color) {
    var w = Config.hpBarWidth; var h = Config.hpBarHeight;
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#2a2a40'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
    var fillW = (hp / maxHp) * (w - 2);
    ctx.fillStyle = color; ctx.fillRect(x + 1, y + 1, fillW, h - 2);
    for (var i = 1; i < maxHp; i++) {
      ctx.fillStyle = '#0a0a16'; ctx.fillRect(x + (i / maxHp) * w - 0.5, y, 1, h);
    }
  }

  function drawRoundInfo(ctx, w) {
    ctx.fillStyle = Config.dimColor; ctx.font = '11px monospace'; ctx.textAlign = 'center';
    ctx.fillText('ROUND ' + Combat.roundNum, w / 2, 22);

    var pipSize = 8; var pipGap = 4;
    var totalW = Config.roundsToWin * (pipSize + pipGap) - pipGap;

    // Player pips
    for (var i = 0; i < Config.roundsToWin; i++) {
      ctx.fillStyle = i < Combat.playerRoundWins ? Config.playerColor : '#1a1a2e';
      ctx.fillRect(w / 2 - 50 - totalW + i * (pipSize + pipGap), 30, pipSize, pipSize);
      ctx.strokeStyle = '#2a2a40'; ctx.lineWidth = 0.5;
      ctx.strokeRect(w / 2 - 50 - totalW + i * (pipSize + pipGap), 30, pipSize, pipSize);
    }
    // AI pips
    for (var j = 0; j < Config.roundsToWin; j++) {
      ctx.fillStyle = j < Combat.aiRoundWins ? Config.aiColor : '#1a1a2e';
      ctx.fillRect(w / 2 + 50 + j * (pipSize + pipGap), 30, pipSize, pipSize);
      ctx.strokeStyle = '#2a2a40'; ctx.lineWidth = 0.5;
      ctx.strokeRect(w / 2 + 50 + j * (pipSize + pipGap), 30, pipSize, pipSize);
    }

    ctx.fillStyle = '#333'; ctx.font = 'bold 14px monospace';
    ctx.fillText('VS', w / 2, 40);
    ctx.textAlign = 'left';
  }

  /** Draw the 3 action buttons */
  function drawActionButtons(ctx, w, playerChoice, phase) {
    var actions = Config.actions;
    for (var i = 0; i < actions.length; i++) {
      var action = actions[i];
      var bx = Config.btnStartX + i * (Config.btnW + Config.btnGap);
      var by = Config.btnY;
      var bw = Config.btnW;
      var bh = Config.btnH;
      var isChosen = playerChoice === action;
      var isDisabled = phase !== 'choosing' || playerChoice !== null;

      // Button background
      if (isChosen) {
        ctx.fillStyle = Config.actionColors[action];
        ctx.globalAlpha = 0.3;
      } else if (isDisabled) {
        ctx.fillStyle = Config.btnDisabled;
        ctx.globalAlpha = 0.5;
      } else {
        ctx.fillStyle = Config.btnBg;
        ctx.globalAlpha = 1;
      }
      roundRect(ctx, bx, by, bw, bh, Config.btnRadius);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Border
      ctx.strokeStyle = isChosen ? Config.btnSelected : Config.btnBorder;
      ctx.lineWidth = isChosen ? 2 : 1;
      roundRect(ctx, bx, by, bw, bh, Config.btnRadius);
      ctx.stroke();

      // Icon + label
      ctx.fillStyle = isDisabled && !isChosen ? '#444' : Config.actionColors[action];
      ctx.font = '18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(Config.actionIcons[action], bx + bw / 2, by + 22);
      ctx.font = 'bold 9px monospace';
      ctx.fillText(action, bx + bw / 2, by + 38);

      // Key hint
      ctx.fillStyle = '#444'; ctx.font = '8px monospace';
      ctx.fillText('[' + Config.actionKeys[action] + ']', bx + bw / 2, by + bh + 12);
    }
    ctx.textAlign = 'left';
  }

  /** Draw timer bar during choosing phase */
  function drawTimerBar(ctx, w, fraction) {
    var barW = Config.totalBtnW;
    var bx = Config.btnStartX;
    var by = Config.timerBarY;
    var bh = Config.timerBarH;

    ctx.fillStyle = '#1a1a2e';
    roundRect(ctx, bx, by, barW, bh, 3); ctx.fill();

    if (fraction > 0) {
      ctx.fillStyle = fraction > 0.3 ? Config.goldColor : '#ff4444';
      roundRect(ctx, bx, by, barW * fraction, bh, 3); ctx.fill();
    }
  }

  /** Draw result text in its own zone between HP bars and fighters */
  function drawResultText(ctx, w, result) {
    if (!result) return;
    var y = Config.resultY;

    // Clear background behind result text
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, y - 14, w, 36);

    ctx.fillStyle = result.winner === 'player' ? Config.playerColor :
                    result.winner === 'ai' ? Config.aiColor : Config.goldColor;
    ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
    ctx.fillText(result.text, w / 2, y);

    // Show both choices
    ctx.font = '11px monospace';
    ctx.fillStyle = Config.playerColor;
    ctx.fillText(Config.actionIcons[result.playerAction] + ' ' + result.playerAction, w / 2 - 70, y + 16);
    ctx.fillStyle = Config.aiColor;
    ctx.fillText(result.aiAction + ' ' + Config.actionIcons[result.aiAction], w / 2 + 70, y + 16);

    ctx.textAlign = 'left';
  }

  function drawPhaseOverlay(ctx, w, h) {
    if (Combat.phase === 'roundEnd') {
      ctx.fillStyle = 'rgba(10, 10, 22, 0.7)'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = Config.goldColor; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center';
      ctx.fillText('ROUND ' + (Combat.roundNum + 1), w / 2, h / 2 - 20);
      ctx.fillStyle = Config.textColor; ctx.font = '14px monospace';
      ctx.fillText('GET READY', w / 2, h / 2 + 10);
      ctx.textAlign = 'left';
    }
    if (Combat.phase === 'resolving') {
      ctx.fillStyle = 'rgba(10, 10, 22, 0.4)'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = Config.goldColor; ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
      ctx.fillText('REVEALING...', w / 2, h / 2 - 20);
      ctx.textAlign = 'left';
    }
  }

  function drawChoosePrompt(ctx, w) {
    if (Combat.phase !== 'choosing') return;
    ctx.fillStyle = Config.goldColor; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
    ctx.fillText('CHOOSE YOUR ACTION!', w / 2, Config.promptY);
    ctx.textAlign = 'left';
  }

  function drawFlash(ctx, w, h) {
    if (flashTimer > 0) {
      ctx.globalAlpha = flashTimer * 4; ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  reset();

  return {
    reset: reset, triggerShake: triggerShake, triggerFlash: triggerFlash, updateEffects: updateEffects,
    drawBackground: drawBackground, drawArena: drawArena, drawFighter: drawFighter,
    drawHealthBar: drawHealthBar, drawRoundInfo: drawRoundInfo,
    drawActionButtons: drawActionButtons, drawTimerBar: drawTimerBar,
    drawResultText: drawResultText, drawPhaseOverlay: drawPhaseOverlay,
    drawChoosePrompt: drawChoosePrompt, drawFlash: drawFlash,
  };
})();
