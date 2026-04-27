/* Chain Reaction — Floating Dots
   Manages the colored dots that bounce around the canvas.
   Each dot has position, velocity, color, and a trail history.
*/

var Dots = (function () {

  var pool = [];
  var canvasW = 0;
  var canvasH = 0;

  function init(w, h) {
    canvasW = w;
    canvasH = h;
  }

  function spawn(count) {
    pool = [];
    var r = Config.dotRadius;
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = Config.dotMinSpeed + Math.random() * (Config.dotMaxSpeed - Config.dotMinSpeed);
      var dot = {
        x: r + Math.random() * (canvasW - r * 2),
        y: r + Math.random() * (canvasH - r * 2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: r,
        color: Config.dotColors[Math.floor(Math.random() * Config.dotColors.length)],
        alive: true,
        trail: [],
      };
      pool.push(dot);
    }
  }

  function update(dt) {
    var r = Config.dotRadius;
    for (var i = 0; i < pool.length; i++) {
      var d = pool[i];
      if (!d.alive) continue;

      // Store trail position
      d.trail.push({ x: d.x, y: d.y });
      if (d.trail.length > Config.dotTrailLength) {
        d.trail.shift();
      }

      // Move
      d.x += d.vx * dt;
      d.y += d.vy * dt;

      // Slight random speed variation for organic feel
      d.vx += (Math.random() - 0.5) * 10 * dt;
      d.vy += (Math.random() - 0.5) * 10 * dt;

      // Clamp speed
      var spd = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
      if (spd > Config.dotMaxSpeed) {
        d.vx = (d.vx / spd) * Config.dotMaxSpeed;
        d.vy = (d.vy / spd) * Config.dotMaxSpeed;
      }
      if (spd < Config.dotMinSpeed) {
        d.vx = (d.vx / spd) * Config.dotMinSpeed;
        d.vy = (d.vy / spd) * Config.dotMinSpeed;
      }

      // Bounce off walls
      if (d.x - r < 0) { d.x = r; d.vx = Math.abs(d.vx); }
      if (d.x + r > canvasW) { d.x = canvasW - r; d.vx = -Math.abs(d.vx); }
      if (d.y - r < 0) { d.y = r; d.vy = Math.abs(d.vy); }
      if (d.y + r > canvasH) { d.y = canvasH - r; d.vy = -Math.abs(d.vy); }
    }
  }

  function kill(dot) {
    dot.alive = false;
  }

  function aliveCount() {
    var c = 0;
    for (var i = 0; i < pool.length; i++) {
      if (pool[i].alive) c++;
    }
    return c;
  }

  function reset() {
    pool = [];
  }

  return {
    init: init,
    spawn: spawn,
    update: update,
    kill: kill,
    reset: reset,
    aliveCount: aliveCount,
    get pool() { return pool; },
  };
})();
