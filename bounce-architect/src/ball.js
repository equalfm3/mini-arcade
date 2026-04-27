/* Bounce Architect — Ball Physics

   The ball falls under gravity and bounces off pads, walls, and obstacles.
   Uses angle-of-incidence = angle-of-reflection for pad bounces.
*/

var Ball = (function () {

  var x, y, vx, vy;
  var alive, lifetime;
  var trail;
  var startX, startY;

  function reset(sx, sy) {
    startX = sx;
    startY = sy;
    x = sx;
    y = sy;
    vx = 0;
    vy = 0;
    alive = false;
    lifetime = 0;
    trail = [];
  }

  function launch() {
    alive = true;
    lifetime = 0;
    vx = 0;
    vy = 0;
    trail = [];
  }

  // Reflect velocity off a surface with given normal (nx, ny)
  function reflect(nx, ny) {
    var dot = vx * nx + vy * ny;
    vx = vx - 2 * dot * nx;
    vy = vy - 2 * dot * ny;
  }

  // Check collision with a pad (thick line segment) and bounce
  function collidePad(pad) {
    var px1 = pad.x1;
    var py1 = pad.y1;
    var px2 = pad.x2;
    var py2 = pad.y2;

    // Line segment direction
    var dx = px2 - px1;
    var dy = py2 - py1;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return false;

    // Unit direction along pad
    var ux = dx / len;
    var uy = dy / len;

    // Normal (perpendicular to pad)
    var nx = -uy;
    var ny = ux;

    // Vector from pad start to ball
    var bx = x - px1;
    var by = y - py1;

    // Project onto pad direction (how far along the pad)
    var along = bx * ux + by * uy;

    // Project onto pad normal (signed distance from pad line)
    var perp = bx * nx + by * ny;

    // Effective collision radius = ball radius + half pad thickness
    var hitDist = Config.ballRadius + Config.padThickness / 2;

    // Check if ball is within the pad's length (with some end-cap tolerance)
    if (along < -Config.ballRadius || along > len + Config.ballRadius) return false;

    // Check if ball is close enough to the pad line
    if (Math.abs(perp) >= hitDist) return false;

    // Ball is overlapping the pad — resolve collision
    // Determine which side the ball is on (use perp sign)
    var side = perp >= 0 ? 1 : -1;
    var resolveNx = nx * side;
    var resolveNy = ny * side;

    // Push ball out to the surface
    var pushDist = hitDist - Math.abs(perp);
    x += resolveNx * pushDist;
    y += resolveNy * pushDist;

    // Reflect velocity off the pad surface (only if moving into the pad)
    var velDot = vx * resolveNx + vy * resolveNy;
    if (velDot < 0) {
      reflect(resolveNx, resolveNy);
    }

    return true;
  }

  // Check collision with an obstacle (rectangle)
  function collideObstacle(obs) {
    // Find closest point on rectangle to ball
    var cx = clamp(x, obs.x, obs.x + obs.w);
    var cy = clamp(y, obs.y, obs.y + obs.h);

    var dx = x - cx;
    var dy = y - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < Config.ballRadius) {
      // Determine which face was hit
      var nx = 0;
      var ny = 0;
      if (dist > 0) {
        nx = dx / dist;
        ny = dy / dist;
      } else {
        // Ball center is inside obstacle — push out based on velocity
        if (Math.abs(vx) > Math.abs(vy)) {
          nx = vx > 0 ? -1 : 1;
        } else {
          ny = vy > 0 ? -1 : 1;
        }
      }

      reflect(nx, ny);

      // Push out
      var overlap = Config.ballRadius - dist;
      if (overlap > 0) {
        x += nx * overlap;
        y += ny * overlap;
      }
      return true;
    }
    return false;
  }

  // Check wall bounces (canvas edges)
  function collideWalls(w, h) {
    var bounced = false;
    if (x - Config.ballRadius < 0) {
      x = Config.ballRadius;
      vx = Math.abs(vx);
      bounced = true;
    }
    if (x + Config.ballRadius > w) {
      x = w - Config.ballRadius;
      vx = -Math.abs(vx);
      bounced = true;
    }
    if (y - Config.ballRadius < 0) {
      y = Config.ballRadius;
      vy = Math.abs(vy);
      bounced = true;
    }
    // No bottom wall — ball falls off screen
    return bounced;
  }

  // Check if ball reached the goal
  function checkGoal(goal) {
    var dx = x - goal.x;
    var dy = y - goal.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    return dist < Config.goalRadius + Config.ballRadius;
  }

  // Check if ball is off screen or timed out
  function isLost(h) {
    return y - Config.ballRadius > h || lifetime > Config.ballMaxLifetime;
  }

  function update(dt) {
    if (!alive) return;

    lifetime += dt;

    // Substep to prevent tunneling through thin pads
    var speed = Math.sqrt(vx * vx + vy * vy);
    var maxStep = Config.ballRadius * 0.5;
    var steps = Math.max(1, Math.ceil(speed * dt / maxStep));
    var subDt = dt / steps;

    for (var s = 0; s < steps; s++) {
      vy += Config.ballGravity * subDt;
      x += vx * subDt;
      y += vy * subDt;
    }

    // Record trail
    trail.push({ x: x, y: y });
    if (trail.length > Config.ballTrailLength) {
      trail.shift();
    }
  }

  /** Full physics step with collision — call this instead of update + separate collision checks */
  function updateWithCollisions(dt, pads, obstacles, canvasW, canvasH) {
    if (!alive) return { bounced: false, goal: false, lost: false };

    lifetime += dt;

    var speed = Math.sqrt(vx * vx + vy * vy);
    var maxStep = Config.ballRadius * 0.5;
    var steps = Math.max(1, Math.ceil(speed * dt / maxStep));
    var subDt = dt / steps;
    var bounced = false;

    for (var s = 0; s < steps; s++) {
      vy += Config.ballGravity * subDt;
      x += vx * subDt;
      y += vy * subDt;

      // Check pad collisions at each substep
      for (var p = 0; p < pads.length; p++) {
        if (collidePad(pads[p])) {
          bounced = true;
        }
      }

      // Check obstacle collisions
      for (var o = 0; o < obstacles.length; o++) {
        if (collideObstacle(obstacles[o])) {
          bounced = true;
        }
      }

      // Wall bounces
      if (collideWalls(canvasW, canvasH)) {
        bounced = true;
      }
    }

    // Record trail
    trail.push({ x: x, y: y });
    if (trail.length > Config.ballTrailLength) {
      trail.shift();
    }

    return { bounced: bounced };
  }

  // Simulate trajectory for preview (returns array of {x,y} points)
  function simulateTrajectory(pads, obstacles, canvasW, canvasH) {
    var sx = startX;
    var sy = startY;
    var svx = 0;
    var svy = 0;
    var points = [{ x: sx, y: sy }];
    var bounces = 0;
    var steps = 0;
    var maxSteps = Config.trajectoryDots * 10;

    while (points.length < Config.trajectoryDots && bounces <= Config.trajectoryBounceLimit && steps < maxSteps) {
      steps++;
      var tdt = Config.trajectoryTimeStep;

      svy += Config.ballGravity * tdt;
      sx += svx * tdt;
      sy += svy * tdt;

      // Wall bounces
      if (sx - Config.ballRadius < 0) {
        sx = Config.ballRadius;
        svx = Math.abs(svx) * Config.wallBounce;
        bounces++;
      }
      if (sx + Config.ballRadius > canvasW) {
        sx = canvasW - Config.ballRadius;
        svx = -Math.abs(svx) * Config.wallBounce;
        bounces++;
      }
      if (sy - Config.ballRadius < 0) {
        sy = Config.ballRadius;
        svy = Math.abs(svy) * Config.wallBounce;
        bounces++;
      }

      // Pad bounces
      for (var p = 0; p < pads.length; p++) {
        var pad = pads[p];
        var dx = pad.x2 - pad.x1;
        var dy = pad.y2 - pad.y1;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) continue;

        var nx = -dy / len;
        var ny = dx / len;

        var bx = sx - pad.x1;
        var by = sy - pad.y1;
        var t = (bx * dx + by * dy) / (len * len);
        t = clamp(t, 0, 1);

        var cx = pad.x1 + t * dx;
        var cy = pad.y1 + t * dy;
        var ddx = sx - cx;
        var ddy = sy - cy;
        var dist = Math.sqrt(ddx * ddx + ddy * ddy);

        if (dist < Config.ballRadius + Config.padThickness / 2) {
          var velDot = svx * nx + svy * ny;
          if (velDot > 0) { nx = -nx; ny = -ny; velDot = -velDot; }
          if (velDot < 0) {
            var dot2 = svx * nx + svy * ny;
            svx = svx - 2 * dot2 * nx;
            svy = svy - 2 * dot2 * ny;
            var overlap = Config.ballRadius + Config.padThickness / 2 - dist;
            if (overlap > 0) { sx -= nx * overlap; sy -= ny * overlap; }
            bounces++;
          }
        }
      }

      // Obstacle bounces
      for (var o = 0; o < obstacles.length; o++) {
        var obs = obstacles[o];
        var ocx = clamp(sx, obs.x, obs.x + obs.w);
        var ocy = clamp(sy, obs.y, obs.y + obs.h);
        var odx = sx - ocx;
        var ody = sy - ocy;
        var odist = Math.sqrt(odx * odx + ody * ody);

        if (odist < Config.ballRadius) {
          var onx = 0;
          var ony = 0;
          if (odist > 0) { onx = odx / odist; ony = ody / odist; }
          else { ony = svy > 0 ? -1 : 1; }
          var odot = svx * onx + svy * ony;
          svx = svx - 2 * odot * onx;
          svy = svy - 2 * odot * ony;
          var ooverlap = Config.ballRadius - odist;
          if (ooverlap > 0) { sx += onx * ooverlap; sy += ony * ooverlap; }
          bounces++;
        }
      }

      // Off screen
      if (sy > canvasH + 20) break;

      // Record every few steps for dotted line
      if (steps % 3 === 0) {
        points.push({ x: sx, y: sy });
      }
    }

    return points;
  }

  return {
    reset: reset,
    launch: launch,
    update: update,
    updateWithCollisions: updateWithCollisions,
    collidePad: collidePad,
    collideObstacle: collideObstacle,
    collideWalls: collideWalls,
    checkGoal: checkGoal,
    isLost: isLost,
    simulateTrajectory: simulateTrajectory,
    get x() { return x; },
    get y() { return y; },
    get vx() { return vx; },
    get vy() { return vy; },
    get alive() { return alive; },
    get trail() { return trail; },
    get lifetime() { return lifetime; },
  };
})();
