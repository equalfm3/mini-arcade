/* Bounce Architect — Pad Placement & Management

   Pads are line segments the player places during the PLACE phase.
   Each pad has a center (cx, cy) and an angle.
   The pad endpoints are computed from center + angle + half-width.
*/

var Pads = (function () {

  var placed;       // array of { cx, cy, angle, x1, y1, x2, y2 }
  var maxPads;
  var ghostPad;     // preview pad being placed (or null)
  var dragging;     // true if currently dragging to set angle
  var dragStartX, dragStartY;

  function reset(max) {
    placed = [];
    maxPads = max || 3;
    ghostPad = null;
    dragging = false;
  }

  function computeEndpoints(cx, cy, angle) {
    var hw = Config.padWidth / 2;
    var dx = Math.cos(angle) * hw;
    var dy = Math.sin(angle) * hw;
    return {
      cx: cx, cy: cy, angle: angle,
      x1: cx - dx, y1: cy - dy,
      x2: cx + dx, y2: cy + dy,
    };
  }

  function canPlace() {
    return placed.length < maxPads;
  }

  // Start placing a pad at (x, y)
  function startPlace(x, y) {
    if (!canPlace()) return;
    ghostPad = computeEndpoints(x, y, -Math.PI / 4); // default 45° angle
    dragging = true;
    dragStartX = x;
    dragStartY = y;
  }

  // Update ghost pad angle based on drag position
  function updateDrag(mx, my) {
    if (!ghostPad || !dragging) return;
    var dx = mx - ghostPad.cx;
    var dy = my - ghostPad.cy;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      var angle = Math.atan2(dy, dx);
      ghostPad = computeEndpoints(ghostPad.cx, ghostPad.cy, angle);
    }
  }

  // Rotate ghost pad with keyboard
  function rotateGhost(delta) {
    if (!ghostPad) return;
    var angle = ghostPad.angle + delta;
    ghostPad = computeEndpoints(ghostPad.cx, ghostPad.cy, angle);
  }

  // Confirm placement of ghost pad
  function confirmPlace() {
    if (!ghostPad) return false;
    placed.push({
      cx: ghostPad.cx,
      cy: ghostPad.cy,
      angle: ghostPad.angle,
      x1: ghostPad.x1,
      y1: ghostPad.y1,
      x2: ghostPad.x2,
      y2: ghostPad.y2,
    });
    ghostPad = null;
    dragging = false;
    return true;
  }

  // Cancel current placement
  function cancelPlace() {
    ghostPad = null;
    dragging = false;
  }

  // Remove a pad near (x, y) — returns true if removed
  function removeAt(x, y) {
    for (var i = placed.length - 1; i >= 0; i--) {
      var p = placed[i];
      var dx = x - p.cx;
      var dy = y - p.cy;
      if (Math.sqrt(dx * dx + dy * dy) < Config.padWidth / 2 + 10) {
        placed.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  // Get all placed pads as line segments
  function getAll() {
    return placed;
  }

  return {
    reset: reset,
    canPlace: canPlace,
    startPlace: startPlace,
    updateDrag: updateDrag,
    rotateGhost: rotateGhost,
    confirmPlace: confirmPlace,
    cancelPlace: cancelPlace,
    removeAt: removeAt,
    getAll: getAll,
    get ghost() { return ghostPad; },
    get count() { return placed.length; },
    get max() { return maxPads; },
    get dragging() { return dragging; },
  };
})();
