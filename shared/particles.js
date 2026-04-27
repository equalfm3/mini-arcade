/* ============================================
   particles.js — Lightweight particle system
   
   Usage:
     var ps = Particles.create();
     ps.emit(x, y, { count: 20, color: '#ffd700' });
     // In game loop:
     ps.update(dt);
     ps.draw(ctx);
   ============================================ */

var Particles = (function () {

  function create() {
    var pool = [];

    function emit(x, y, opts) {
      var o = opts || {};
      var count = o.count || 12;
      var color = o.color || '#ffd700';
      var colors = o.colors || null; // array of colors to pick from
      var speed = o.speed || 120;
      var life = o.life || 0.6;
      var size = o.size || 3;
      var gravity = o.gravity || 0;

      for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var spd = speed * (0.3 + Math.random() * 0.7);
        pool.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: life * (0.5 + Math.random() * 0.5),
          maxLife: life,
          size: size * (0.5 + Math.random() * 0.5),
          color: colors ? colors[Math.floor(Math.random() * colors.length)] : color,
          gravity: gravity,
        });
      }
    }

    function update(dt) {
      for (var i = pool.length - 1; i >= 0; i--) {
        var p = pool[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += p.gravity * dt;
        p.life -= dt;
        if (p.life <= 0) {
          pool.splice(i, 1);
        }
      }
    }

    function draw(ctx) {
      for (var i = 0; i < pool.length; i++) {
        var p = pool[i];
        var alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(
          Math.floor(p.x - p.size / 2),
          Math.floor(p.y - p.size / 2),
          Math.ceil(p.size),
          Math.ceil(p.size)
        );
      }
      ctx.globalAlpha = 1;
    }

    function clear() {
      pool.length = 0;
    }

    return {
      emit: emit,
      update: update,
      draw: draw,
      clear: clear,
      get count() { return pool.length; },
    };
  }

  return { create: create };
})();
