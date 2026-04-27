/* One-Button Duels — Renderer Module

   Draws fighters, timing bars, health bars, round info,
   action animations, and screen effects.
*/

var Renderer = (function () {

  var shakeTimer = 0;
  var shakeX = 0;
  var shakeY = 0;
  var flashTimer = 0;
  var bgStars = [];

  function reset() {
    shakeTimer = 0;
    shakeX = 0;
    shakeY = 0;
    flashTimer = 0;
    bgStars = [];
    for (var i = 0; i < 40; i++) {
      bgStars.push({
        x: Math.random() * Config.canvasW,
        y: Math.random() * Config.canvasH,
        size: 0.5 + Math.random() * 1.5,
        alpha: 0.05 + Math.random() * 0.12,
      });
    }
  }

  function triggerShake() {
    shakeTimer = Config.shakeDuration;
  }

  function triggerFlash() {
    flashTimer = 0.15;
  }

  function updateEffects(dt) {
    if (shakeTimer > 0) {
      shakeTimer -= dt;
      var intensity = Config.shakeIntensity * (shakeTimer / Config.shakeDuration);
      shakeX = (Math.random() - 0.5) * 2 * intensity;
      shakeY = (Math.random() - 0.5) * 2 * intensity;
    } else {
      shakeX = 0;
      shakeY = 0;
    }
    if (flashTimer > 0) flashTimer -= dt;
  }

  // --- Background ---
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

  // --- Arena floor ---
  function drawArena(ctx, w, h) {
    // Ground line
    var groundY = Config.fighterY + Config.fighterH / 2 + 10;
    ctx.strokeStyle = '#2a2a40';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, groundY);
    ctx.lineTo(w - 30, groundY);
    ctx.stroke();

    // VS divider (subtle)
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(w / 2 - 1, groundY - 80, 2, 80);
  }

  // --- Fighter drawing ---
  function drawFighter(ctx, fighter, baseX) {
    var x = baseX + fighter.offsetX + shakeX;
    var y = Config.fighterY + shakeY;
    var fw = Config.fighterW;
    var fh = Config.fighterH;
    var isP1 = fighter.side === 'p1';
    var color = isP1 ? Config.p1Color : Config.p2Color;
    var colorDark = isP1 ? Config.p1ColorDark : Config.p2ColorDark;
    var dir = isP1 ? 1 : -1;

    ctx.save();
    ctx.translate(x, y);

    // Body (block character)
    // Head
    ctx.fillStyle = color;
    ctx.fillRect(-8, -fh / 2, 16, 16);
    // Eyes
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
      // Punching arm extended forward
      ctx.fillRect(dir * 10, -fh / 2 + 18, dir * 20, 6);
      // Fist
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dir * 28, -fh / 2 + 16, 8, 10);
    } else if (fighter.animState === 'parry') {
      // Shield/block pose — arms crossed in front
      ctx.fillRect(-6, -fh / 2 + 16, 12, 8);
      ctx.fillStyle = '#aaaacc';
      ctx.fillRect(dir * 4, -fh / 2 + 14, 14, 12);
      // Shield highlight
      ctx.fillStyle = '#ccccee';
      ctx.fillRect(dir * 6, -fh / 2 + 16, 4, 4);
    } else if (fighter.animState === 'dodge') {
      // Arms back, leaning away
      ctx.fillRect(-dir * 8, -fh / 2 + 20, -dir * 12, 5);
      ctx.fillRect(-dir * 4, -fh / 2 + 22, -dir * 10, 5);
    } else if (fighter.animState === 'hit') {
      // Recoiling — arms flailing
      ctx.fillRect(-dir * 6, -fh / 2 + 16, -dir * 14, 5);
      ctx.fillRect(-dir * 4, -fh / 2 + 24, -dir * 10, 5);
      // Pain indicator
      drawStarburst(ctx, dir * -12, -fh / 2 + 10, 6, '#ffd700');
    } else if (fighter.animState === 'win') {
      // Arms raised in victory
      ctx.fillRect(-12, -fh / 2 + 10, 6, -14);
      ctx.fillRect(6, -fh / 2 + 10, 6, -14);
    } else {
      // Idle — arms at sides, ready stance
      ctx.fillRect(-14, -fh / 2 + 18, 5, 12);
      ctx.fillRect(9, -fh / 2 + 18, 5, 12);
    }

    // Legs
    ctx.fillStyle = colorDark;
    ctx.fillRect(-8, -fh / 2 + 34, 6, 14);
    ctx.fillRect(2, -fh / 2 + 34, 6, 14);

    ctx.restore();
  }

  function drawStarburst(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x - size, y - 1, size * 2, 2);
    ctx.fillRect(x - 1, y - size, 2, size * 2);
    ctx.fillRect(x - size * 0.7, y - size * 0.7, size * 0.5, size * 0.5);
    ctx.fillRect(x + size * 0.3, y - size * 0.7, size * 0.5, size * 0.5);
    ctx.fillRect(x - size * 0.7, y + size * 0.3, size * 0.5, size * 0.5);
    ctx.fillRect(x + size * 0.3, y + size * 0.3, size * 0.5, size * 0.5);
  }

  // --- Health bars ---
  function drawHealthBar(ctx, x, y, hp, maxHp, color) {
    var w = Config.hpBarWidth;
    var h = Config.hpBarHeight;

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#2a2a40';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Fill
    var fillW = (hp / maxHp) * (w - 2);
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, fillW, h - 2);

    // HP pips
    for (var i = 1; i < maxHp; i++) {
      var pipX = x + (i / maxHp) * w;
      ctx.fillStyle = '#0a0a16';
      ctx.fillRect(pipX - 0.5, y, 1, h);
    }
  }

  // --- Timing bar ---
  function drawTimingBar(ctx, x, y, cursor, locked, lockedAction, isP1) {
    var w = Config.barWidth;
    var h = Config.barHeight;

    // Draw zones
    var zoneX = x;
    for (var i = 0; i < Config.zones.length; i++) {
      var zone = Config.zones[i];
      var zw = zone.width * w;
      ctx.fillStyle = locked ? dimColor(zone.color, 0.3) : zone.color;
      ctx.globalAlpha = locked ? 0.4 : 0.7;
      ctx.fillRect(zoneX, y, zw, h);

      // Zone label
      ctx.globalAlpha = locked ? 0.3 : 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(zone.name.charAt(0), zoneX + zw / 2, y + h / 2 + 2.5);

      zoneX += zw;
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

    // Border
    ctx.strokeStyle = locked ? '#444' : '#888';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Cursor (sweeping indicator)
    if (!locked) {
      var cursorX = x + cursor * w;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cursorX - 1.5, y - 3, 3, h + 6);
      ctx.fillStyle = Config.goldColor;
      ctx.fillRect(cursorX - 0.5, y - 2, 1, h + 4);
    }

    // Locked indicator
    if (locked && lockedAction) {
      var actionColor = getActionColor(lockedAction);
      ctx.fillStyle = actionColor;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(lockedAction, x + w / 2, y - 6);
      ctx.textAlign = 'left';

      // Lock icon (small padlock)
      ctx.fillStyle = Config.goldColor;
      ctx.fillRect(x + w / 2 + 28, y + 2, 6, 5);
      ctx.fillRect(x + w / 2 + 29, y - 1, 4, 4);
    }

    // Player label
    ctx.fillStyle = isP1 ? Config.p1Color : Config.p2Color;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isP1 ? 'P1 [Q]' : 'P2 [P]', x + w / 2, y + h + 14);
    ctx.textAlign = 'left';
  }

  function getActionColor(action) {
    for (var i = 0; i < Config.zones.length; i++) {
      if (Config.zones[i].name === action) return Config.zones[i].color;
    }
    return '#ffffff';
  }

  function dimColor(hex, amount) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    r = Math.floor(r * amount);
    g = Math.floor(g * amount);
    b = Math.floor(b * amount);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // --- Round / match info ---
  function drawRoundInfo(ctx, w, roundNum, p1Wins, p2Wins, roundsToWin) {
    // Round number
    ctx.fillStyle = Config.dimColor;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ROUND ' + roundNum, w / 2, 25);

    // Win pips
    var pipSize = 8;
    var pipGap = 4;
    var totalW = roundsToWin * (pipSize + pipGap) - pipGap;

    // P1 pips (left side)
    var p1StartX = w / 2 - 50 - totalW;
    for (var i = 0; i < roundsToWin; i++) {
      var px = p1StartX + i * (pipSize + pipGap);
      ctx.fillStyle = i < p1Wins ? Config.p1Color : '#1a1a2e';
      ctx.fillRect(px, 32, pipSize, pipSize);
      ctx.strokeStyle = '#2a2a40';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, 32, pipSize, pipSize);
    }

    // P2 pips (right side)
    var p2StartX = w / 2 + 50;
    for (var j = 0; j < roundsToWin; j++) {
      var px2 = p2StartX + j * (pipSize + pipGap);
      ctx.fillStyle = j < p2Wins ? Config.p2Color : '#1a1a2e';
      ctx.fillRect(px2, 32, pipSize, pipSize);
      ctx.strokeStyle = '#2a2a40';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px2, 32, pipSize, pipSize);
    }

    // VS text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('VS', w / 2, 42);

    ctx.textAlign = 'left';
  }

  // --- Result text ---
  function drawResultText(ctx, w, result) {
    if (!result) return;

    var y = Config.fighterY - 50;

    // Result text
    ctx.fillStyle = result.winner ? (result.winner === 'p1' ? Config.p1Color : Config.p2Color) : Config.goldColor;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(result.text, w / 2, y);

    // Action icons
    drawActionIcon(ctx, w / 2 - 60, y + 12, result.p1Action, Config.p1Color);
    drawActionIcon(ctx, w / 2 + 40, y + 12, result.p2Action, Config.p2Color);

    ctx.textAlign = 'left';
  }

  function drawActionIcon(ctx, x, y, action, color) {
    ctx.fillStyle = color;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(action, x + 10, y + 10);
    ctx.textAlign = 'left';
  }

  // --- Phase overlays ---
  function drawPhaseOverlay(ctx, w, h, phase, phaseTimer, roundNum, p1Wins, p2Wins) {
    if (phase === 'roundEnd') {
      ctx.fillStyle = 'rgba(10, 10, 22, 0.6)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = Config.goldColor;
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ROUND ' + (roundNum + 1), w / 2, h / 2 - 10);
      ctx.fillStyle = Config.textColor;
      ctx.font = '12px monospace';
      ctx.fillText('GET READY', w / 2, h / 2 + 15);
      ctx.textAlign = 'left';
    }

    if (phase === 'resolving') {
      // Dramatic pause — dim screen slightly
      ctx.fillStyle = 'rgba(10, 10, 22, 0.3)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = Config.goldColor;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('...', w / 2, h / 2 - 40);
      ctx.textAlign = 'left';
    }
  }

  // --- Screen flash ---
  function drawFlash(ctx, w, h) {
    if (flashTimer > 0) {
      ctx.globalAlpha = flashTimer * 4;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  }

  // --- Mobile touch zones ---
  function drawTouchZones(ctx, w, h, phase) {
    if (phase !== 'timing') return;
    // Subtle divider showing tap zones
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(w / 2, h - 60);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 0.15;
    ctx.fillStyle = Config.p1Color;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TAP P1', w / 4, h - 10);
    ctx.fillStyle = Config.p2Color;
    ctx.fillText('TAP P2', w * 3 / 4, h - 10);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  // --- Speed indicator ---
  function drawSpeedIndicator(ctx, w, speed) {
    ctx.fillStyle = Config.dimColor;
    ctx.font = '8px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('SPD ' + speed.toFixed(1) + 'x', w - 10, Config.barY - 8);
    ctx.textAlign = 'left';
  }

  reset();

  return {
    reset: reset,
    triggerShake: triggerShake,
    triggerFlash: triggerFlash,
    updateEffects: updateEffects,
    drawBackground: drawBackground,
    drawArena: drawArena,
    drawFighter: drawFighter,
    drawHealthBar: drawHealthBar,
    drawTimingBar: drawTimingBar,
    drawRoundInfo: drawRoundInfo,
    drawResultText: drawResultText,
    drawPhaseOverlay: drawPhaseOverlay,
    drawFlash: drawFlash,
    drawTouchZones: drawTouchZones,
    drawSpeedIndicator: drawSpeedIndicator,
    get shakeX() { return shakeX; },
    get shakeY() { return shakeY; },
  };
})();
