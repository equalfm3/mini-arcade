/* Gravity Well — Physics (gravity, satellite motion) */

var Physics = (function () {

  /**
   * Calculate gravitational acceleration on satellite from all planets.
   * Returns { ax, ay } total acceleration.
   */
  function gravity(sx, sy, planets) {
    var ax = 0, ay = 0;

    for (var i = 0; i < planets.length; i++) {
      var p = planets[i];
      var dx = p.x - sx;
      var dy = p.y - sy;
      var distSq = dx * dx + dy * dy;
      var dist = Math.sqrt(distSq);

      if (dist < p.radius) {
        // Inside planet — treat as collision
        continue;
      }

      // F = G * M / r^2, direction toward planet
      var force = Config.G * p.mass / distSq;
      ax += force * (dx / dist);
      ay += force * (dy / dist);
    }

    return { ax: ax, ay: ay };
  }

  /**
   * Check if satellite collides with any planet.
   */
  function collidesWithPlanet(sx, sy, planets) {
    for (var i = 0; i < planets.length; i++) {
      var p = planets[i];
      var dx = p.x - sx;
      var dy = p.y - sy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < p.radius + Config.satRadius) return true;
    }
    return false;
  }

  /**
   * Check if satellite is out of bounds.
   */
  function outOfBounds(sx, sy) {
    var margin = 50;
    return sx < -margin || sx > Config.canvasW + margin ||
           sy < -margin || sy > Config.canvasH + margin;
  }

  /**
   * Get distance from satellite to target orbit.
   * Returns distance from the orbit ring (0 = exactly on orbit).
   */
  function distToOrbit(sx, sy, targetPlanet, orbitRadius) {
    var dx = sx - targetPlanet.x;
    var dy = sy - targetPlanet.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    return Math.abs(dist - orbitRadius);
  }

  return {
    gravity: gravity,
    collidesWithPlanet: collidesWithPlanet,
    outOfBounds: outOfBounds,
    distToOrbit: distToOrbit,
  };
})();
