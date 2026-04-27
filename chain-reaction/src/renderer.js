/* Chain Reaction — Renderer
   Draws dots with glow and trails, explosion rings with glow,
   chain counter, score popups, screen flash, and background.
*/

var Renderer = (function () {

  var screenFlash = 0;
  var chainDisplayCount = 0;
  var chainDisplayScale = 1;
  var chainDisplayAlpha = 0;
  var lastChainCount = 0;

  function reset() {
    screenFlash = 0;
    chainDisplayCount = 0;
    chainDisplayScale = 1;
    chainDisplayAlpha = 0;
    lastChainCount = 0;
  }

  function triggerFlash() {
    screenFlash = Config.screenFlashDuration;
  }

  function updateEffects(dt, currentChain) {
    // Screen flash
    if (screenFlash > 0) {
      screenFlash -= dt;
    }

    // Chain counter animation
    if (currentChain > lastChainCount) {
      chainDisplayCount = currentChain;
      chainDisplayScale = Config.chainCounterScaleMax;
      chainDisplayAlpha = 1;
    }
    lastChainCount = currentChain;

    // Ease scale back to 1
    if (chainDisplayScale > 1) {
      chainDisplayScale -= (chainDisplayScale - 1) * 5 * dt;
      if (chainDisplayScale < 1.01) chainDisplayScale = 1;
    }

    // Fade out when chain is over
    if (!Explosions.chainActive && chainDisplayAlpha > 0) {
      chainDisplayAlpha -= dt / Config.chainCounterFadeTime;
      if (chainDisplayAlpha < 0) chainDisplayAlpha = 0;
    }
  }

  function drawBackground(ctx, w, h) {
    // Solid background
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = Config.bgGridColor;
    ctx.lineWidth = 0.5;
    var sp = Config.bgGridSpacing;
    for (var x = sp; x < w; x += sp) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (var y = sp; y < h; y += sp) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function drawDots(ctx) {
    var dots = Dots.pool;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      if (!d.alive) continue;

      // Draw trail
      for (var t = 0; t < d.trail.length; t++) {
        var tp = d.trail[t];
        var trailAlpha = Config.dotTrailAlpha * (t / d.trail.length);
        ctx.globalAlpha = trailAlpha;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        var trailR = d.radius * (0.3 + 0.5 * (t / d.trail.length));
        ctx.arc(tp.x, tp.y, trailR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Outer glow
      var grd = ctx.createRadialGradient(d.x, d.y, d.radius * 0.3, d.x, d.y, d.radius + Config.dotGlow);
      grd.addColorStop(0, d.color);
      grd.addColorStop(0.6, d.color);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius + Config.dotGlow, 0, Math.PI * 2);
      ctx.fill();

      // Solid dot
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.arc(d.x - d.radius * 0.25, d.y - d.radius * 0.25, d.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawExplosions(ctx) {
    var exps = Explosions.pool;
    for (var i = 0; i < exps.length; i++) {
      var e = exps[i];
      if (e.radius <= 0) continue;

      ctx.globalAlpha = e.alpha * 0.15;

      // Filled circle (subtle glow fill)
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = e.alpha * 0.6;

      // Outer glow ring
      ctx.shadowColor = e.color;
      ctx.shadowBlur = Config.explosionGlowSize;
      ctx.strokeStyle = e.color;
      ctx.lineWidth = Config.explosionRingWidth;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner bright ring
      ctx.globalAlpha = e.alpha * 0.9;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius * 0.95, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
    }
  }

  function drawPopups(ctx) {
    var pops = Explosions.popups;
    for (var i = 0; i < pops.length; i++) {
      var p = pops[i];
      var alpha = 1 - (p.age / Config.popupLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.font = 'bold ' + Config.popupSize + 'px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawChainCounter(ctx, w, h) {
    if (chainDisplayAlpha <= 0 || chainDisplayCount <= 0) return;

    ctx.globalAlpha = chainDisplayAlpha * 0.8;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold ' + Math.floor(Config.chainCounterSize * chainDisplayScale) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chainDisplayCount + '', w / 2, h / 2 - 20);

    // Label below
    ctx.font = 'bold 14px monospace';
    ctx.globalAlpha = chainDisplayAlpha * 0.5;
    ctx.fillText('CHAIN', w / 2, h / 2 + 25);

    ctx.globalAlpha = 1;
  }

  function drawScreenFlash(ctx, w, h) {
    if (screenFlash <= 0) return;
    var alpha = (screenFlash / Config.screenFlashDuration) * 0.3;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  function drawLevelInfo(ctx, w, h, level, target, popped, attempts, maxAttempts, state) {
    // Draw target info at top
    if (state === 'waiting') {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Click to start a chain reaction!', w / 2, 8);
      ctx.font = '12px monospace';
      ctx.fillText('Pop ' + target + ' dots to pass', w / 2, 28);
      if (attempts > 0) {
        ctx.fillStyle = '#ff8844';
        ctx.fillText('Attempt ' + (attempts + 1) + '/' + maxAttempts, w / 2, 46);
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawResultMessage(ctx, w, h, passed, popped, target) {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = passed ? '#44ff66' : '#ff4444';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(passed ? 'LEVEL CLEAR!' : 'NOT ENOUGH!', w / 2, h / 2 - 20);
    ctx.font = '16px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Popped ' + popped + '/' + target, w / 2, h / 2 + 15);
    ctx.globalAlpha = 1;
  }

  return {
    reset: reset,
    triggerFlash: triggerFlash,
    updateEffects: updateEffects,
    drawBackground: drawBackground,
    drawDots: drawDots,
    drawExplosions: drawExplosions,
    drawPopups: drawPopups,
    drawChainCounter: drawChainCounter,
    drawScreenFlash: drawScreenFlash,
    drawLevelInfo: drawLevelInfo,
    drawResultMessage: drawResultMessage,
  };
})();
