/* Mini Arcade — Shared Utilities */

/**
 * Get a canvas context scaled for high-DPI displays
 */
function createCanvas(container, width, height) {
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  container.appendChild(canvas);
  return { canvas, ctx, width, height };
}

/**
 * Responsive canvas sizing — fits container while maintaining aspect ratio
 */
function fitCanvas(canvas, maxWidth, maxHeight) {
  const parent = canvas.parentElement;
  const pw = parent.clientWidth;
  const scale = Math.min(pw / maxWidth, 1);
  const w = Math.floor(maxWidth * scale);
  const h = Math.floor(maxHeight * scale);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width: w, height: h, scale };
}

/**
 * Simple touch/swipe detection
 */
function onSwipe(element, callback) {
  let startX, startY, startTime;
  const threshold = 30;
  const maxTime = 500;

  element.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
  }, { passive: true });

  element.addEventListener('touchend', (e) => {
    if (!startX || !startY) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const dt = Date.now() - startTime;

    if (dt > maxTime) return;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < threshold) {
      callback('tap');
      return;
    }

    if (absDx > absDy) {
      callback(dx > 0 ? 'right' : 'left');
    } else {
      callback(dy > 0 ? 'down' : 'up');
    }

    startX = startY = null;
  }, { passive: true });
}

/**
 * Save / load high score from localStorage
 */
function saveHighScore(gameId, score) {
  const key = `mini-arcade-${gameId}-highscore`;
  const current = parseInt(localStorage.getItem(key)) || 0;
  if (score > current) {
    localStorage.setItem(key, score);
    return true; // new high score
  }
  return false;
}

function loadHighScore(gameId) {
  return parseInt(localStorage.getItem(`mini-arcade-${gameId}-highscore`)) || 0;
}

/**
 * Random integer between min (inclusive) and max (inclusive)
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random item from array
 */
function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Clamp value between min and max
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Simple collision detection (axis-aligned bounding boxes)
 */
function collides(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * Prevent default on touch to avoid scrolling during gameplay
 */
function preventScroll(element) {
  element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
}
