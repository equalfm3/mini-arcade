/* Color Switch — Obstacles module

   Obstacle types:
   - ring:  rotating circle divided into 4 colored arcs
   - cross: rotating plus-sign with 4 colored arms
   - bar:   horizontal bar split into 4 colored segments, rotating

   Each obstacle has a color-switch star placed between it and the next.
*/

var Obstacles = (function () {

  var obstacles = [];   // { type, x, y, angle, speed, passed }
  var stars = [];        // { x, y, collected }
  var nextY = 0;         // world Y for next obstacle spawn
  var obstacleCount = 0;

  var TYPES = ['ring', 'ring', 'ring', 'cross', 'bar'];

  function reset() {
    obstacles = [];
    stars = [];
    obstacleCount = 0;
    nextY = Config.firstObstacleY;
    // Generate initial set of obstacles
    generateAhead(0);
  }

  /** Generate obstacles ahead of the camera */
  function generateAhead(cameraY) {
    var generateUntil = cameraY - Config.canvasH * 1.5;
    while (nextY > generateUntil) {
      spawnObstacle(nextY);
      nextY -= Config.obstacleSpacing;
    }
  }

  function spawnObstacle(wy) {
    // First N obstacles are rings only (easier to learn)
    var type;
    if (obstacleCount < Config.easyObstacleCount) {
      type = 'ring';
    } else {
      type = TYPES[Math.floor(Math.random() * TYPES.length)];
    }
    var rampRate = Config.rotationRampRate || 0.015;
    var speedMult = 1 + obstacleCount * rampRate;
    var speed = Config.rotationSpeed * speedMult;
    if (speed > Config.rotationSpeedMax) speed = Config.rotationSpeedMax;

    // Alternate rotation direction
    var dir = (obstacleCount % 2 === 0) ? 1 : -1;

    obstacles.push({
      type: type,
      x: Config.canvasW / 2,
      y: wy,
      angle: Math.random() * Math.PI * 2,
      speed: speed * dir,
      passed: false,
    });

    // Place a color-switch star between this obstacle and the previous one
    // (halfway between this and the next obstacle above)
    var starY = wy + Config.obstacleSpacing / 2;
    // Don't place star above the very first obstacle
    if (obstacleCount > 0) {
      stars.push({
        x: Config.canvasW / 2,
        y: starY,
        collected: false,
      });
    }

    obstacleCount++;
  }

  function update(dt, cameraY) {
    // Rotate obstacles
    for (var i = 0; i < obstacles.length; i++) {
      obstacles[i].angle += obstacles[i].speed * dt;
    }

    // Generate more obstacles as camera moves up
    generateAhead(cameraY);

    // Remove obstacles far below camera
    var removeBelow = cameraY + Config.canvasH;
    for (var j = obstacles.length - 1; j >= 0; j--) {
      if (obstacles[j].y > removeBelow) {
        obstacles.splice(j, 1);
      }
    }
    for (var k = stars.length - 1; k >= 0; k--) {
      if (stars[k].y > removeBelow) {
        stars.splice(k, 1);
      }
    }
  }

  /**
   * Check if ball collides with any obstacle.
   * Returns: 'pass' if ball passed an obstacle (score),
   *          'die' if ball hit wrong color,
   *          'star' if ball collected a color switch star,
   *          null if nothing happened.
   */
  function checkCollision(ballX, ballY, ballColorIndex) {
    var result = null;

    // Check star collection first
    for (var s = 0; s < stars.length; s++) {
      var star = stars[s];
      if (star.collected) continue;
      var sdx = ballX - star.x;
      var sdy = ballY - star.y;
      var sdist = Math.sqrt(sdx * sdx + sdy * sdy);
      if (sdist < Config.ballRadius + Config.starSize) {
        star.collected = true;
        return 'star';
      }
    }

    // Check obstacle collision
    for (var i = 0; i < obstacles.length; i++) {
      var ob = obstacles[i];

      // Check if ball passed this obstacle (score)
      if (!ob.passed && ballY < ob.y - Config.ringOuter) {
        ob.passed = true;
        result = 'pass';
      }

      // Only check collision if ball is near the obstacle
      var dy = ballY - ob.y;
      var dx = ballX - ob.x;

      if (ob.type === 'ring') {
        var hitResult = checkRingCollision(dx, dy, ob.angle, ballColorIndex);
        if (hitResult === 'die') return 'die';
      } else if (ob.type === 'cross') {
        var crossResult = checkCrossCollision(dx, dy, ob.angle, ballColorIndex);
        if (crossResult === 'die') return 'die';
      } else if (ob.type === 'bar') {
        var barResult = checkBarCollision(dx, dy, ob.angle, ballColorIndex);
        if (barResult === 'die') return 'die';
      }
    }

    return result;
  }

  /**
   * Ring collision: check if ball overlaps the ring band,
   * and if so, which color arc it's in.
   */
  function checkRingCollision(dx, dy, angle, ballColorIndex) {
    var dist = Math.sqrt(dx * dx + dy * dy);
    var br = Config.ballRadius;

    // Ball must overlap the ring band
    if (dist + br < Config.ringInner || dist - br > Config.ringOuter) {
      return null; // not touching ring
    }

    // Ball is in the ring band — determine which arc segment
    var ballAngle = Math.atan2(dy, dx);
    // Adjust for ring rotation
    var relAngle = ballAngle - angle;
    // Normalize to [0, 2π)
    relAngle = ((relAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // Each arc spans π/2 (90°). Color order: 0, 1, 2, 3
    var arcIndex = Math.floor(relAngle / (Math.PI / 2));
    if (arcIndex > 3) arcIndex = 3;

    if (arcIndex !== ballColorIndex) {
      return 'die';
    }
    return null; // safe — matching color
  }

  /**
   * Cross collision: 4 arms extending from center.
   * Each arm is a rectangle at 90° intervals.
   */
  function checkCrossCollision(dx, dy, angle, ballColorIndex) {
    var dist = Math.sqrt(dx * dx + dy * dy);
    var br = Config.ballRadius;
    var armLen = Config.crossArmLength;
    var armW = Config.crossArmWidth / 2;

    // Quick distance check
    if (dist > armLen + br + armW) return null;
    if (dist < armW - br) return null; // inside center gap

    // Check each arm
    for (var i = 0; i < 4; i++) {
      var armAngle = angle + i * Math.PI / 2;
      // Rotate ball position into arm's local space
      var cos = Math.cos(-armAngle);
      var sin = Math.sin(-armAngle);
      var lx = dx * cos - dy * sin;
      var ly = dx * sin + dy * cos;

      // Arm extends from 0 to armLen along local X, width is ±armW along Y
      if (lx > -br && lx < armLen + br && ly > -armW - br && ly < armW + br) {
        // Ball overlaps this arm
        if (i !== ballColorIndex) {
          return 'die';
        }
        return null; // matching color
      }
    }

    return null;
  }

  /**
   * Bar collision: horizontal bar split into 4 colored segments, rotating.
   */
  function checkBarCollision(dx, dy, angle, ballColorIndex) {
    var br = Config.ballRadius;
    var halfW = Config.barWidth / 2;
    var halfH = Config.barHeight / 2;

    // Rotate ball into bar's local space
    var cos = Math.cos(-angle);
    var sin = Math.sin(-angle);
    var lx = dx * cos - dy * sin;
    var ly = dx * sin + dy * cos;

    // Check if ball overlaps the bar rectangle
    if (lx < -halfW - br || lx > halfW + br || ly < -halfH - br || ly > halfH + br) {
      return null;
    }

    // Determine which segment (4 equal segments along the bar width)
    var segWidth = Config.barWidth / 4;
    var segIndex = Math.floor((lx + halfW) / segWidth);
    if (segIndex < 0) segIndex = 0;
    if (segIndex > 3) segIndex = 3;

    if (segIndex !== ballColorIndex) {
      return 'die';
    }
    return null;
  }

  return {
    reset: reset,
    update: update,
    checkCollision: checkCollision,
    get list() { return obstacles; },
    get starList() { return stars; },
  };
})();
