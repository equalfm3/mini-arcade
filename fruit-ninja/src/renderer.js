/* Fruit Ninja — Renderer: fruits, halves, blade trail, background */

var Renderer = (function () {

  /** Draw the background gradient */
  function drawBackground(ctx, w, h) {
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, Config.bgGradientTop);
    grad.addColorStop(1, Config.bgGradientBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  /** Draw a single fruit (circle with highlight) */
  function drawFruit(ctx, f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rotation);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.arc(2, 2, f.radius, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = f.body;
    ctx.beginPath();
    ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
    ctx.fill();

    // Dark edge (bottom half)
    ctx.fillStyle = f.dark;
    ctx.beginPath();
    ctx.arc(0, 0, f.radius, 0.1, Math.PI - 0.1);
    ctx.fill();

    // Re-draw top half body
    ctx.fillStyle = f.body;
    ctx.beginPath();
    ctx.arc(0, 0, f.radius, Math.PI, Math.PI * 2);
    ctx.fill();

    // Highlight (top-left)
    ctx.fillStyle = f.highlight;
    ctx.beginPath();
    ctx.arc(-f.radius * 0.25, -f.radius * 0.25, f.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Small white shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(-f.radius * 0.3, -f.radius * 0.35, f.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Leaf/stem for certain fruits
    if (f.name === 'apple' || f.name === 'orange') {
      ctx.fillStyle = '#44aa44';
      ctx.fillRect(-2, -f.radius - 6, 4, 8);
      // Small leaf
      ctx.beginPath();
      ctx.ellipse(4, -f.radius - 3, 5, 3, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /** Draw a bomb */
  function drawBomb(ctx, f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rotation);

    // Body
    ctx.fillStyle = Config.bombColor;
    ctx.beginPath();
    ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = Config.bombHighlight;
    ctx.beginPath();
    ctx.arc(-f.radius * 0.2, -f.radius * 0.2, f.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Fuse
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -f.radius);
    ctx.quadraticCurveTo(8, -f.radius - 12, 4, -f.radius - 16);
    ctx.stroke();

    // Fuse spark
    ctx.fillStyle = Config.bombFuseColor;
    ctx.beginPath();
    ctx.arc(4, -f.radius - 16, 3, 0, Math.PI * 2);
    ctx.fill();

    // Glow
    ctx.fillStyle = '#ff8844';
    ctx.beginPath();
    ctx.arc(4, -f.radius - 16, 5, 0, Math.PI * 2);
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;

    // X mark on bomb
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(6, 6);
    ctx.moveTo(6, -6);
    ctx.lineTo(-6, 6);
    ctx.stroke();

    ctx.restore();
  }

  /** Draw all active fruits */
  function drawFruits(ctx) {
    var fruits = Fruits.active;
    for (var i = 0; i < fruits.length; i++) {
      var f = fruits[i];
      if (f.sliced) continue;
      if (f.type === 'bomb') {
        drawBomb(ctx, f);
      } else {
        drawFruit(ctx, f);
      }
    }
  }

  /** Draw a sliced half */
  function drawHalf(ctx, h) {
    var alpha = Math.max(0, h.life / Config.halfFadeTime);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rotation);

    // Clip to half circle
    ctx.beginPath();
    if (h.side === 'left') {
      ctx.arc(0, 0, h.radius, Math.PI * 0.5, Math.PI * 1.5);
    } else {
      ctx.arc(0, 0, h.radius, -Math.PI * 0.5, Math.PI * 0.5);
    }
    ctx.closePath();
    ctx.clip();

    // Flesh (interior)
    ctx.fillStyle = h.flesh;
    ctx.beginPath();
    ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
    ctx.fill();

    // Skin (outer ring)
    ctx.strokeStyle = h.body;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, h.radius - 1.5, 0, Math.PI * 2);
    ctx.stroke();

    // Seeds for watermelon
    if (h.name === 'watermelon') {
      ctx.fillStyle = '#222222';
      var seeds = [
        { x: -4, y: -5 }, { x: 3, y: -2 },
        { x: -2, y: 4 }, { x: 5, y: 3 },
      ];
      for (var s = 0; s < seeds.length; s++) {
        ctx.beginPath();
        ctx.ellipse(seeds[s].x, seeds[s].y, 2, 1.2, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /** Draw all sliced halves */
  function drawHalves(ctx) {
    var halves = Fruits.halves;
    for (var i = 0; i < halves.length; i++) {
      drawHalf(ctx, halves[i]);
    }
  }

  /** Draw the blade trail */
  function drawBlade(ctx) {
    var trail = Blade.trail;
    if (trail.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (var i = 1; i < trail.length; i++) {
      var t = i / trail.length; // 0 = oldest, 1 = newest
      var alpha = t * 0.8;
      var width = Config.bladeTrailWidth * t;

      ctx.strokeStyle = 'rgba(255, 255, 255, ' + alpha + ')';
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }

    // Bright tip
    if (trail.length > 0) {
      var tip = trail[trail.length - 1];
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /** Draw lives as hearts */
  function drawLives(ctx, lives, maxLives) {
    var heartSize = 14;
    var spacing = 22;
    var startX = Config.canvasW - maxLives * spacing - 6;
    var y = 10;

    for (var i = 0; i < maxLives; i++) {
      var x = startX + i * spacing;
      ctx.fillStyle = i < lives ? Config.heartColor : Config.heartEmpty;
      drawHeart(ctx, x + heartSize / 2, y + heartSize / 2, heartSize);
    }
  }

  /** Draw a heart shape */
  function drawHeart(ctx, cx, cy, size) {
    var s = size / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.4);
    ctx.bezierCurveTo(cx - s, cy - s * 0.2, cx - s, cy - s * 0.8, cx, cy - s * 0.4);
    ctx.bezierCurveTo(cx + s, cy - s * 0.8, cx + s, cy - s * 0.2, cx, cy + s * 0.4);
    ctx.fill();
  }

  /** Draw combo text */
  function drawCombo(ctx, combo, comboTimer) {
    if (combo < Config.comboMinCount || comboTimer <= 0) return;
    var alpha = Math.min(1, comboTimer * 2);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(combo + 'x COMBO!', Config.canvasW / 2, 80);
    ctx.restore();
  }

  return {
    drawBackground: drawBackground,
    drawFruits: drawFruits,
    drawHalves: drawHalves,
    drawBlade: drawBlade,
    drawLives: drawLives,
    drawCombo: drawCombo,
  };
})();
