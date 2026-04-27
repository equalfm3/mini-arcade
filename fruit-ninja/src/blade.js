/* Fruit Ninja — Blade trail rendering & slice detection */

var Blade = (function () {

  var trail = [];       // array of {x, y, time} points
  var swiping = false;  // is the user currently swiping?
  var lastX = 0;
  var lastY = 0;
  var lastTime = 0;
  var canvas = null;

  function init(canvasEl) {
    canvas = canvasEl;

    // Mouse events
    canvas.addEventListener('mousedown', function (e) {
      var r = canvas.getBoundingClientRect();
      var scaleX = Config.canvasW / r.width;
      var scaleY = Config.canvasH / r.height;
      startSwipe(
        (e.clientX - r.left) * scaleX,
        (e.clientY - r.top) * scaleY
      );
    });

    canvas.addEventListener('mousemove', function (e) {
      if (!swiping) return;
      var r = canvas.getBoundingClientRect();
      var scaleX = Config.canvasW / r.width;
      var scaleY = Config.canvasH / r.height;
      moveSwipe(
        (e.clientX - r.left) * scaleX,
        (e.clientY - r.top) * scaleY
      );
    });

    canvas.addEventListener('mouseup', function () {
      endSwipe();
    });

    canvas.addEventListener('mouseleave', function () {
      endSwipe();
    });

    // Touch events
    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      var t = e.touches[0];
      var r = canvas.getBoundingClientRect();
      var scaleX = Config.canvasW / r.width;
      var scaleY = Config.canvasH / r.height;
      startSwipe(
        (t.clientX - r.left) * scaleX,
        (t.clientY - r.top) * scaleY
      );
    }, { passive: false });

    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      if (!swiping) return;
      var t = e.touches[0];
      var r = canvas.getBoundingClientRect();
      var scaleX = Config.canvasW / r.width;
      var scaleY = Config.canvasH / r.height;
      moveSwipe(
        (t.clientX - r.left) * scaleX,
        (t.clientY - r.top) * scaleY
      );
    }, { passive: false });

    canvas.addEventListener('touchend', function (e) {
      e.preventDefault();
      endSwipe();
    }, { passive: false });
  }

  function startSwipe(x, y) {
    swiping = true;
    trail.length = 0;
    lastX = x;
    lastY = y;
    lastTime = performance.now();
    trail.push({ x: x, y: y, time: lastTime });
  }

  function moveSwipe(x, y) {
    var now = performance.now();
    trail.push({ x: x, y: y, time: now });
    // Keep trail length limited
    while (trail.length > Config.bladeTrailLength) {
      trail.shift();
    }
    lastX = x;
    lastY = y;
    lastTime = now;
  }

  function endSwipe() {
    swiping = false;
  }

  function reset() {
    trail.length = 0;
    swiping = false;
  }

  /** Update trail — fade old points */
  function update(dt) {
    if (!swiping && trail.length > 0) {
      // Fade trail when not swiping
      trail.shift();
    }
  }

  /**
   * Check if the blade swipe intersects a circle (fruit).
   * Uses line-circle intersection between the last two trail points.
   * Returns true if the swipe is fast enough and intersects.
   */
  function checkSlice(cx, cy, radius) {
    if (trail.length < 2) return false;

    // Check speed between last two points
    var p1 = trail[trail.length - 2];
    var p2 = trail[trail.length - 1];
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var dt = (p2.time - p1.time) / 1000;
    if (dt <= 0) return false;

    var speed = Math.sqrt(dx * dx + dy * dy) / dt;
    if (speed < Config.bladeMinSpeed) return false;

    // Line-circle intersection test
    return lineIntersectsCircle(p1.x, p1.y, p2.x, p2.y, cx, cy, radius);
  }

  /**
   * Line segment (x1,y1)-(x2,y2) vs circle (cx,cy,r).
   * Returns true if the segment intersects or is inside the circle.
   */
  function lineIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var fx = x1 - cx;
    var fy = y1 - cy;

    var a = dx * dx + dy * dy;
    var b = 2 * (fx * dx + fy * dy);
    var c = fx * fx + fy * fy - r * r;

    // Check if either endpoint is inside the circle
    if (c <= 0) return true;
    var endDist = (x2 - cx) * (x2 - cx) + (y2 - cy) * (y2 - cy);
    if (endDist <= r * r) return true;

    var discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return false;

    var sqrtD = Math.sqrt(discriminant);
    var t1 = (-b - sqrtD) / (2 * a);
    var t2 = (-b + sqrtD) / (2 * a);

    // Check if intersection is within the segment [0, 1]
    if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) return true;
    // Check if segment is entirely inside circle
    if (t1 < 0 && t2 > 1) return true;

    return false;
  }

  return {
    init: init,
    reset: reset,
    update: update,
    checkSlice: checkSlice,
    get trail() { return trail; },
    get swiping() { return swiping; },
  };
})();
