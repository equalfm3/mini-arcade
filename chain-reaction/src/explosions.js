/* Chain Reaction — Explosions
   Manages expanding explosion circles with expand → hold → fade lifecycle.
   Detects chain triggers when dots touch active explosions.
*/

var Explosions = (function () {

  var pool = [];
  var chainCount = 0;
  var chainActive = false;
  var popups = [];       // score popup floaters
  var playerClicked = false;

  function reset() {
    pool = [];
    chainCount = 0;
    chainActive = false;
    popups = [];
    playerClicked = false;
  }

  function create(x, y, color) {
    pool.push({
      x: x,
      y: y,
      color: color,
      age: 0,
      radius: 0,
      phase: 'expand',  // expand | hold | fade
      alpha: 1,
    });
    chainCount++;
    chainActive = true;

    // Score popup
    popups.push({
      x: x,
      y: y,
      text: '+1',
      age: 0,
      color: color,
    });
  }

  function createFromClick(x, y) {
    playerClicked = true;
    pool.push({
      x: x,
      y: y,
      color: '#ffffff',
      age: 0,
      radius: 0,
      phase: 'expand',
      alpha: 1,
    });
    // Player click doesn't count toward chain
  }

  function update(dt) {
    var expandTime = Config.explosionExpandTime;
    var holdTime = Config.explosionHoldTime;
    var fadeTime = Config.explosionFadeTime;
    var maxR = Config.explosionMaxRadius;

    // Update explosions
    for (var i = pool.length - 1; i >= 0; i--) {
      var e = pool[i];
      e.age += dt;

      if (e.phase === 'expand') {
        var t = Math.min(e.age / expandTime, 1);
        // Ease out for satisfying growth
        e.radius = maxR * (1 - (1 - t) * (1 - t));
        if (e.age >= expandTime) {
          e.phase = 'hold';
          e.age = 0;
        }
      } else if (e.phase === 'hold') {
        e.radius = maxR;
        if (e.age >= holdTime) {
          e.phase = 'fade';
          e.age = 0;
        }
      } else if (e.phase === 'fade') {
        var ft = Math.min(e.age / fadeTime, 1);
        e.alpha = 1 - ft;
        e.radius = maxR * (1 + ft * 0.2); // slight expand during fade
        if (e.age >= fadeTime) {
          pool.splice(i, 1);
          continue;
        }
      }
    }

    // Update popups
    for (var p = popups.length - 1; p >= 0; p--) {
      var pop = popups[p];
      pop.age += dt;
      pop.y -= Config.popupSpeed * dt;
      if (pop.age >= Config.popupLife) {
        popups.splice(p, 1);
      }
    }

    // Check if chain is over
    if (chainActive && pool.length === 0) {
      chainActive = false;
    }
  }

  // Check dots against active explosions, trigger chain reactions
  function checkChains(dots, particles, onPop) {
    var dotsPool = dots.pool;
    for (var i = 0; i < dotsPool.length; i++) {
      var d = dotsPool[i];
      if (!d.alive) continue;

      for (var j = 0; j < pool.length; j++) {
        var e = pool[j];
        if (e.phase === 'fade') continue; // can't trigger during fade

        var dx = d.x - e.x;
        var dy = d.y - e.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < e.radius + d.radius) {
          // Dot touched explosion — pop it!
          dots.kill(d);
          create(d.x, d.y, d.color);

          // Particle burst
          if (particles) {
            particles.emit(d.x, d.y, {
              count: Config.burstCount,
              color: d.color,
              speed: Config.burstSpeed,
              life: Config.burstLife,
              size: Config.burstSize,
              gravity: 100,
            });
          }

          if (onPop) onPop(d);
          break; // dot can only be popped once
        }
      }
    }
  }

  function isActive() {
    return pool.length > 0;
  }

  return {
    reset: reset,
    create: create,
    createFromClick: createFromClick,
    update: update,
    checkChains: checkChains,
    isActive: isActive,
    get pool() { return pool; },
    get chainCount() { return chainCount; },
    get chainActive() { return chainActive; },
    get popups() { return popups; },
    get playerClicked() { return playerClicked; },
  };
})();
