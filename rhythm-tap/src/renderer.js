/* Rhythm Tap — Renderer

   Draws lanes, falling notes with glow, hit zone,
   grade popups, combo display, background pulse,
   and all visual effects.
*/

var Renderer = (function () {

  var beatPhase = 0; // 0-1 phase within current beat for pulse effects

  /** Polyfill for roundRect if not natively supported */
  function rRect(ctx, x, y, w, h, r) {
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }
  }

  function init() {
    // Nothing to initialize
  }

  /** Update beat phase for pulse effects */
  function updateBeat(songTime, beatDuration) {
    if (beatDuration > 0) {
      beatPhase = (songTime % beatDuration) / beatDuration;
    }
  }

  /** Draw the background with subtle beat pulse */
  function drawBackground(ctx, w, h) {
    // Base background
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Beat pulse — subtle brightness increase on the beat
    var pulseAlpha = Math.max(0, 1 - beatPhase * 4) * Config.bgPulseIntensity;
    if (pulseAlpha > 0.001) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + pulseAlpha + ')';
      ctx.fillRect(0, 0, w, h);
    }
  }

  /** Draw lane dividers and lane backgrounds */
  function drawLanes(ctx, w, h, hitFlash, hitFlashGrade) {
    for (var i = 0; i < Config.laneCount; i++) {
      var lx = Config.laneLefts[i];
      var lw = Config.laneWidth;

      // Lane background — very subtle color tint
      ctx.fillStyle = Config.laneColorsDim[i];
      ctx.globalAlpha = 0.15;
      ctx.fillRect(lx, 0, lw, h);
      ctx.globalAlpha = 1;

      // Hit flash — lane lights up on hit
      if (hitFlash[i] > 0) {
        var flashAlpha = hitFlash[i] / Config.hitFlashDuration;
        var flashColor = Config.gradeColors[hitFlashGrade[i]] || Config.laneColors[i];
        ctx.fillStyle = flashColor;
        ctx.globalAlpha = flashAlpha * 0.25;
        ctx.fillRect(lx, 0, lw, h);
        ctx.globalAlpha = 1;
      }

      // Lane dividers
      if (i > 0) {
        ctx.fillStyle = Config.dividerColor;
        ctx.fillRect(lx - Config.laneGap, 0, Config.laneGap, h);
      }
    }
  }

  /** Draw the hit zone line with beat pulse */
  function drawHitZone(ctx, w) {
    var y = Config.hitZoneY;
    var hh = Config.hitZoneHeight;

    // Pulse on beat
    var pulseScale = 1 + Math.max(0, 1 - beatPhase * 3) * 0.5;
    var pulseH = hh * pulseScale;
    var pulseY = y - pulseH / 2 + hh / 2;

    // Glow behind hit zone
    ctx.fillStyle = Config.hitZoneActiveColor;
    ctx.globalAlpha = Math.max(0, 1 - beatPhase * 3) * 0.15;
    ctx.fillRect(0, pulseY - 8, w, pulseH + 16);
    ctx.globalAlpha = 1;

    // Main hit zone line
    ctx.fillStyle = Config.hitZoneColor;
    ctx.fillRect(0, y, w, hh);

    // Bright center line
    ctx.fillStyle = Config.hitZoneActiveColor;
    ctx.globalAlpha = 0.4 + Math.max(0, 1 - beatPhase * 3) * 0.6;
    ctx.fillRect(0, y + 1, w, 2);
    ctx.globalAlpha = 1;

    // Lane hit targets (circles at hit zone)
    for (var i = 0; i < Config.laneCount; i++) {
      var cx = Config.laneCenters[i];
      var radius = 14;

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, y + hh / 2, radius, 0, Math.PI * 2);
      ctx.strokeStyle = Config.laneColors[i];
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Key label
      ctx.fillStyle = Config.laneColors[i];
      ctx.globalAlpha = 0.6;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Config.laneLabels[i], cx, y + hh / 2);
      ctx.globalAlpha = 1;
    }
  }

  /** Draw falling notes with glow effect */
  function drawNotes(ctx, activeNotes) {
    for (var i = 0; i < activeNotes.length; i++) {
      var n = activeNotes[i];
      if (n.hit || n.missed) continue;

      var cx = Config.laneCenters[n.lane];
      var lx = Config.laneLefts[n.lane];
      var lw = Config.laneWidth;
      var ny = n.y;
      var nh = Config.noteHeight;
      var color = Config.laneColors[n.lane];
      var brightColor = Config.laneColorsBright[n.lane];

      // Note glow (outer)
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      rRect(ctx, lx + 4 - Config.noteGlow / 2, ny - nh / 2 - Config.noteGlow / 2,
                     lw - 8 + Config.noteGlow, nh + Config.noteGlow, Config.noteRadius + 4);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Note body
      ctx.fillStyle = color;
      ctx.beginPath();
      rRect(ctx, lx + 6, ny - nh / 2, lw - 12, nh, Config.noteRadius);
      ctx.fill();

      // Note highlight (top edge)
      ctx.fillStyle = brightColor;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      rRect(ctx, lx + 8, ny - nh / 2, lw - 16, 4, 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /** Draw grade popup text ("PERFECT!", "GREAT!", etc.) */
  function drawGradePopup(ctx, grade, timer, lane, w) {
    if (!grade || timer <= 0) return;

    var progress = 1 - timer / Config.gradePopupDuration;
    var alpha = 1 - progress;
    var rise = progress * Config.gradePopupRise;

    var text = grade.toUpperCase();
    if (grade === 'perfect') text += '!';
    else if (grade === 'great') text += '!';

    var x = lane >= 0 ? Config.laneCenters[lane] : w / 2;
    var y = Config.hitZoneY - 40 - rise;

    ctx.save();
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.fillStyle = '#000';
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillText(text, x + 1, y + 1);

    // Main text
    ctx.fillStyle = Config.gradeColors[grade] || '#fff';
    ctx.globalAlpha = alpha;
    ctx.fillText(text, x, y);

    ctx.restore();
  }

  /** Draw combo counter and multiplier */
  function drawCombo(ctx, combo, multiplier, w) {
    if (combo < 2) return;

    var x = w / 2;
    var y = Config.hitZoneY - 75;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Combo number
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = Config.hudColor;
    ctx.globalAlpha = 0.9;
    ctx.fillText(combo + 'x', x, y);

    // Multiplier badge
    if (multiplier > 1) {
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#ff66aa';
      ctx.fillText(multiplier + 'x MULTI', x, y + 20);
    }

    ctx.restore();
  }

  /** Draw score at top */
  function drawScore(ctx, score, w) {
    ctx.save();
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = Config.textColor;
    ctx.globalAlpha = 0.7;
    ctx.fillText('SCORE', w / 2, 8);
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = Config.hudColor;
    ctx.globalAlpha = 1;
    ctx.fillText(score.toString(), w / 2, 24);
    ctx.restore();
  }

  /** Draw progress bar at the very top */
  function drawProgress(ctx, songTime, songLength, w) {
    var progress = Math.min(songTime / songLength, 1);
    var barH = 3;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, barH);

    // Gradient progress bar
    var grad = ctx.createLinearGradient(0, 0, w * progress, 0);
    grad.addColorStop(0, Config.laneColors[0]);
    grad.addColorStop(0.33, Config.laneColors[1]);
    grad.addColorStop(0.66, Config.laneColors[2]);
    grad.addColorStop(1, Config.laneColors[3]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w * progress, barH);
  }

  /** Draw mobile touch zones at the bottom */
  function drawTouchZones(ctx, w, h) {
    var zoneTop = h - Config.touchZoneHeight;

    for (var i = 0; i < Config.laneCount; i++) {
      var lx = Config.laneLefts[i];
      var lw = Config.laneWidth;

      // Touch zone background
      ctx.fillStyle = Config.laneColors[i];
      ctx.globalAlpha = 0.08;
      ctx.fillRect(lx, zoneTop, lw, Config.touchZoneHeight);
      ctx.globalAlpha = 1;

      // Touch zone label
      ctx.fillStyle = Config.laneColors[i];
      ctx.globalAlpha = 0.3;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Config.laneLabels[i], Config.laneCenters[i], zoneTop + Config.touchZoneHeight / 2);
      ctx.globalAlpha = 1;
    }
  }

  /** Draw BPM selection screen */
  function drawBPMSelect(ctx, w, h, selectedIndex) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.textAlign = 'center';

    // Title
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = Config.hudColor;
    ctx.fillText('SELECT TEMPO', w / 2, 120);

    // BPM options
    var options = Config.bpmOptions;
    for (var i = 0; i < options.length; i++) {
      var y = 200 + i * 70;
      var isSelected = i === selectedIndex;

      // Option box
      ctx.fillStyle = isSelected ? Config.laneColors[i] : '#1a1a2e';
      ctx.globalAlpha = isSelected ? 0.3 : 1;
      ctx.beginPath();
      rRect(ctx, w / 2 - 130, y - 22, 260, 44, 8);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Border
      ctx.strokeStyle = isSelected ? Config.laneColors[i] : '#333355';
      ctx.lineWidth = 2;
      ctx.beginPath();
      rRect(ctx, w / 2 - 130, y - 22, 260, 44, 8);
      ctx.stroke();

      // Label
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = isSelected ? '#fff' : Config.textColor;
      ctx.fillText(options[i].label, w / 2, y + 1);
    }

    // Instructions
    ctx.font = '12px monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('↑↓ to select · Enter to start', w / 2, h - 60);
    ctx.fillText('or tap an option', w / 2, h - 40);

    ctx.restore();
  }

  /** Draw end-of-song results screen */
  function drawResults(ctx, w, h, stats) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.textAlign = 'center';

    // Title
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = Config.hudColor;
    ctx.fillText('SONG COMPLETE', w / 2, 80);

    // Score
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(stats.score.toString(), w / 2, 140);

    // Grade breakdown
    var items = [
      { label: 'PERFECT', value: stats.perfect, color: Config.gradeColors.perfect },
      { label: 'GREAT', value: stats.great, color: Config.gradeColors.great },
      { label: 'GOOD', value: stats.good, color: Config.gradeColors.good },
      { label: 'MISS', value: stats.miss, color: Config.gradeColors.miss },
    ];

    for (var i = 0; i < items.length; i++) {
      var y = 200 + i * 36;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = items[i].color;
      ctx.fillText(items[i].label, w / 2 - 10, y);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff';
      ctx.fillText(items[i].value.toString(), w / 2 + 10, y);
    }

    // Max combo
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#ff66aa';
    ctx.fillText('MAX COMBO: ' + stats.maxCombo, w / 2, 370);

    // Best score
    if (stats.isNewBest) {
      ctx.fillStyle = Config.hudColor;
      ctx.font = 'bold 16px monospace';
      ctx.fillText('★ NEW BEST! ★', w / 2, 410);
    }

    ctx.restore();
  }

  return {
    init: init,
    updateBeat: updateBeat,
    drawBackground: drawBackground,
    drawLanes: drawLanes,
    drawHitZone: drawHitZone,
    drawNotes: drawNotes,
    drawGradePopup: drawGradePopup,
    drawCombo: drawCombo,
    drawScore: drawScore,
    drawProgress: drawProgress,
    drawTouchZones: drawTouchZones,
    drawBPMSelect: drawBPMSelect,
    drawResults: drawResults,
  };
})();
