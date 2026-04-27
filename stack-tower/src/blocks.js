/* Stack Tower — Blocks module

   Manages the block stack, the sliding current block,
   overhang calculation, perfect detection, and falling pieces.
*/

var Blocks = (function () {

  var stack = [];        // { x, w, y } — stacked blocks (bottom to top)
  var current = null;    // { x, w, y, dir } — sliding block
  var fallingPieces = []; // { x, w, y, vy, opacity } — overhang pieces
  var speed = 0;
  var perfectCount = 0;  // consecutive perfect placements

  function reset() {
    stack = [];
    current = null;
    fallingPieces = [];
    speed = Config.startSpeed;
    perfectCount = 0;

    // Base block
    stack.push({
      x: Config.startX,
      w: Config.startWidth,
      y: Config.baseY,
    });
  }

  /** Spawn a new sliding block above the stack */
  function spawnBlock() {
    var top = stack[stack.length - 1];
    var dir = (stack.length % 2 === 0) ? 1 : -1;
    var startX = dir === 1 ? -top.w : Config.canvasW;

    current = {
      x: startX,
      w: top.w,
      y: top.y - Config.blockHeight,
      dir: dir,
    };

    // Increase speed
    speed = Config.startSpeed + (stack.length - 1) * Config.speedIncrement;
    if (speed > Config.maxSpeed) speed = Config.maxSpeed;
  }

  /** Update sliding block position */
  function update(dt) {
    if (!current) return;

    current.x += current.dir * speed * dt;

    // Reverse direction at screen edges
    if (current.dir === 1 && current.x + current.w > Config.canvasW + 20) {
      current.dir = -1;
    } else if (current.dir === -1 && current.x < -20) {
      current.dir = 1;
    }

    // Update falling pieces
    for (var i = fallingPieces.length - 1; i >= 0; i--) {
      var fp = fallingPieces[i];
      fp.vy += Config.overhangGravity * dt;
      fp.y += fp.vy * dt;
      fp.opacity -= dt / Config.overhangFadeTime;
      if (fp.opacity <= 0) {
        fallingPieces.splice(i, 1);
      }
    }
  }

  /**
   * Place the current block. Returns:
   *   'perfect' — exact alignment (within tolerance)
   *   'placed'  — partial overlap
   *   'miss'    — no overlap (game over)
   */
  function place() {
    if (!current) return 'miss';

    var prev = stack[stack.length - 1];
    var curLeft = current.x;
    var curRight = current.x + current.w;
    var prevLeft = prev.x;
    var prevRight = prev.x + prev.w;

    // Calculate overlap region
    var overlapLeft = Math.max(curLeft, prevLeft);
    var overlapRight = Math.min(curRight, prevRight);
    var overlapW = overlapRight - overlapLeft;

    if (overlapW <= 0) {
      // Complete miss — create falling piece for entire block
      fallingPieces.push({
        x: current.x,
        w: current.w,
        y: current.y,
        vy: 0,
        opacity: 1,
        colorIndex: stack.length,
      });
      current = null;
      return 'miss';
    }

    // Check for perfect placement
    var leftDiff = Math.abs(curLeft - prevLeft);
    var rightDiff = Math.abs(curRight - prevRight);
    var isPerfect = leftDiff <= Config.perfectTolerance && rightDiff <= Config.perfectTolerance;

    if (isPerfect) {
      perfectCount++;
      // Snap to previous block position and add bonus width
      var bonusW = Math.min(Config.perfectBonus, Config.canvasW - prev.w);
      var newW = prev.w + bonusW;
      var newX = prev.x - bonusW / 2;
      // Clamp to canvas
      if (newX < 0) { newX = 0; }
      if (newX + newW > Config.canvasW) { newW = Config.canvasW - newX; }

      stack.push({
        x: newX,
        w: newW,
        y: current.y,
      });
      current = null;
      return 'perfect';
    }

    // Partial overlap — trim block
    perfectCount = 0;

    // Determine overhang side and create falling piece
    if (curLeft < prevLeft) {
      // Overhang on the left
      var overhangW = prevLeft - curLeft;
      fallingPieces.push({
        x: curLeft,
        w: overhangW,
        y: current.y,
        vy: 0,
        opacity: 1,
        colorIndex: stack.length,
      });
    }
    if (curRight > prevRight) {
      // Overhang on the right
      var overhangWR = curRight - prevRight;
      fallingPieces.push({
        x: prevRight,
        w: overhangWR,
        y: current.y,
        vy: 0,
        opacity: 1,
        colorIndex: stack.length,
      });
    }

    // Add trimmed block to stack
    stack.push({
      x: overlapLeft,
      w: overlapW,
      y: current.y,
    });
    current = null;
    return 'placed';
  }

  /** Get the color for a block at a given index */
  function getBlockColor(index) {
    var hue = (Config.baseHue + index * Config.hueStep) % 360;
    return {
      front: 'hsl(' + hue + ',' + Config.saturation + '%,' + Config.lightness + '%)',
      top: 'hsl(' + hue + ',' + Config.saturation + '%,' + (Config.lightness + Config.topLightnessBoost) + '%)',
      side: 'hsl(' + hue + ',' + Config.saturation + '%,' + (Config.lightness - Config.sideLightnessDrop) + '%)',
    };
  }

  return {
    reset: reset,
    spawnBlock: spawnBlock,
    update: update,
    place: place,
    getBlockColor: getBlockColor,
    get stack() { return stack; },
    get current() { return current; },
    get fallingPieces() { return fallingPieces; },
    get speed() { return speed; },
    get perfectCount() { return perfectCount; },
    get score() { return Math.max(0, stack.length - 1); },
  };
})();
