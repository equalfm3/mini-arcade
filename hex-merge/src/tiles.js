/* Hex Merge — Tile animations (pop on merge, spawn) */

var Tiles = (function () {

  var anims = []; // { q, r, type, t, duration, value }

  function reset() {
    anims = [];
  }

  /** Add a spawn animation */
  function spawn(q, r, value) {
    anims.push({ q: q, r: r, type: 'spawn', t: 0, duration: 0.15, value: value });
  }

  /** Add a merge pop animation */
  function merge(q, r, value) {
    anims.push({ q: q, r: r, type: 'merge', t: 0, duration: Config.popDuration, value: value });
  }

  /** Update animations, return active list */
  function update(dt) {
    for (var i = anims.length - 1; i >= 0; i--) {
      anims[i].t += dt;
      if (anims[i].t >= anims[i].duration) {
        anims.splice(i, 1);
      }
    }
  }

  /** Get scale factor for a cell if it has an active animation */
  function getScale(q, r) {
    for (var i = 0; i < anims.length; i++) {
      var a = anims[i];
      if (a.q === q && a.r === r) {
        var progress = a.t / a.duration;
        if (a.type === 'spawn') {
          // Scale from 0 to 1
          return progress;
        } else if (a.type === 'merge') {
          // Pop: scale up to 1.2 then back to 1
          if (progress < 0.5) {
            return 1 + 0.2 * (progress / 0.5);
          } else {
            return 1.2 - 0.2 * ((progress - 0.5) / 0.5);
          }
        }
      }
    }
    return 1;
  }

  return {
    reset: reset,
    spawn: spawn,
    merge: merge,
    update: update,
    getScale: getScale,
  };
})();
