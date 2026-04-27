/* Gravity Flip — Corridors module

   Generates scrolling corridor walls with gaps.
   Gaps alternate between top and bottom walls, forcing gravity flips.
   Includes collectible orbs in gaps and difficulty ramping.
*/

var Corridors = (function () {

  // Wall segments: { x, topH, bottomH, hasGapTop, hasGapBottom, gapStart, gapEnd }
  var segments = [];
  // Orbs: { x, y, collected, radius }
  var orbs = [];

  var scrollX = 0;        // total distance scrolled
  var speed = 0;          // current scroll speed
  var nextGapX = 0;       // x position for next gap
  var nextGapSide = 0;    // 0 = top, 1 = bottom (alternates)
  var distance = 0;       // total distance for scoring

  function reset() {
    segments = [];
    orbs = [];
    scrollX = 0;
    speed = Config.corridorSpeed;
    distance = 0;
    nextGapX = Config.canvasW + 200;
    nextGapSide = 0;

    // Pre-generate segments to fill the screen + buffer
    generateSegments();
  }

  function generateSegments() {
    // Fill from current rightmost segment to well past the screen
    var rightEdge = 0;
    if (segments.length > 0) {
      rightEdge = segments[segments.length - 1].x + Config.segmentWidth;
    }

    var targetRight = Config.canvasW + Config.segmentWidth * 6;

    while (rightEdge < targetRight) {
      var seg = createSegment(rightEdge);
      segments.push(seg);
      rightEdge += Config.segmentWidth;
    }
  }

  function createSegment(x) {
    // Difficulty ramp: walls get thicker, gaps get narrower
    var difficultyFactor = clamp(distance / 5000, 0, 1);

    // Base wall thickness with some variation
    var baseTop = Config.wallThickness + Math.sin(x * 0.01) * 15;
    var baseBottom = Config.wallThickness + Math.cos(x * 0.013) * 15;

    // Walls get thicker with difficulty
    baseTop += difficultyFactor * 20;
    baseBottom += difficultyFactor * 20;

    // Safe zone: occasionally make walls thinner
    var isSafe = Math.random() < Config.safeZoneChance;
    if (isSafe) {
      baseTop = Config.wallMin;
      baseBottom = Config.wallMin;
    }

    baseTop = clamp(baseTop, Config.wallMin, Config.wallMax);
    baseBottom = clamp(baseBottom, Config.wallMin, Config.wallMax);

    var seg = {
      x: x,
      topH: baseTop,
      bottomH: baseBottom,
      hasGapTop: false,
      hasGapBottom: false,
      gapStart: 0,
      gapEnd: 0,
    };

    // Check if this segment should have a gap
    var worldX = x + scrollX;
    if (worldX >= nextGapX) {
      var gapW = Config.gapWidth - difficultyFactor * (Config.gapWidth - Config.gapWidthMin);
      gapW = Math.max(gapW, Config.gapWidthMin);

      if (nextGapSide === 0) {
        seg.hasGapTop = true;
      } else {
        seg.hasGapBottom = true;
      }
      seg.gapStart = x;
      seg.gapEnd = x + gapW;

      // Spawn orb in the gap
      if (Math.random() < Config.orbSpawnChance) {
        var orbY;
        if (seg.hasGapTop) {
          orbY = seg.topH / 2;
        } else {
          orbY = Config.canvasH - seg.bottomH / 2;
        }
        orbs.push({
          x: x + gapW / 2,
          y: orbY,
          collected: false,
          radius: Config.orbRadius,
        });
      }

      // Schedule next gap
      var spacing = randInt(Config.gapMinSpacing, Config.gapMaxSpacing);
      // Gaps get closer together with difficulty
      spacing -= Math.floor(difficultyFactor * 60);
      spacing = Math.max(spacing, Config.gapMinSpacing - 40);
      nextGapX = worldX + spacing;
      nextGapSide = 1 - nextGapSide; // alternate
    }

    return seg;
  }

  function update(dt) {
    // Accelerate
    speed += Config.corridorAccel * dt;
    if (speed > Config.corridorSpeedMax) speed = Config.corridorSpeedMax;

    var dx = speed * dt;
    scrollX += dx;
    distance += dx;

    // Move all segments left
    for (var i = 0; i < segments.length; i++) {
      segments[i].x -= dx;
      if (segments[i].gapStart) segments[i].gapStart -= dx;
      if (segments[i].gapEnd) segments[i].gapEnd -= dx;
    }

    // Move orbs left
    for (var j = 0; j < orbs.length; j++) {
      orbs[j].x -= dx;
    }

    // Remove segments that scrolled off the left
    while (segments.length > 0 && segments[0].x + Config.segmentWidth < -10) {
      segments.shift();
    }

    // Remove orbs that scrolled off
    for (var k = orbs.length - 1; k >= 0; k--) {
      if (orbs[k].x < -20) {
        orbs.splice(k, 1);
      }
    }

    // Generate new segments on the right
    generateSegments();
  }

  /**
   * Check collision between player hitbox and walls.
   * Returns 'die' if hitting a wall, null otherwise.
   */
  function checkWallCollision(hitbox) {
    var px = hitbox.x;
    var py = hitbox.y;
    var pw = hitbox.w;
    var ph = hitbox.h;

    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      var segLeft = seg.x;
      var segRight = seg.x + Config.segmentWidth;

      // Only check segments near the player
      if (segRight < px || segLeft > px + pw) continue;

      // Top wall collision
      var topH = seg.topH;
      if (seg.hasGapTop) {
        // Gap in top wall — check if player is within the gap horizontally
        var inGap = (px + pw > seg.gapStart && px < seg.gapEnd);
        if (!inGap && py < topH) {
          return 'die';
        }
      } else {
        if (py < topH) {
          return 'die';
        }
      }

      // Bottom wall collision
      var bottomY = Config.canvasH - seg.bottomH;
      if (seg.hasGapBottom) {
        var inGapB = (px + pw > seg.gapStart && px < seg.gapEnd);
        if (!inGapB && py + ph > bottomY) {
          return 'die';
        }
      } else {
        if (py + ph > bottomY) {
          return 'die';
        }
      }
    }

    return null;
  }

  /**
   * Check orb collection. Returns number of orbs collected.
   */
  function checkOrbCollection(hitbox) {
    var collected = 0;
    var cx = hitbox.x + hitbox.w / 2;
    var cy = hitbox.y + hitbox.h / 2;

    for (var i = 0; i < orbs.length; i++) {
      var orb = orbs[i];
      if (orb.collected) continue;
      var dx = cx - orb.x;
      var dy = cy - orb.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < Config.playerSize + orb.radius) {
        orb.collected = true;
        collected++;
      }
    }
    return collected;
  }

  return {
    reset: reset,
    update: update,
    checkWallCollision: checkWallCollision,
    checkOrbCollection: checkOrbCollection,
    get segments() { return segments; },
    get orbs() { return orbs; },
    get speed() { return speed; },
    get distance() { return distance; },
  };
})();
