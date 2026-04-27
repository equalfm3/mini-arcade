/* Whack-a-Mole — Mole spawn logic */

var Moles = (function () {

  // Each hole: { active, type, timer, showDuration, whacked }
  var holes = [];
  var spawnTimer = 0;
  var nextSpawnInterval = 0;
  var elapsed = 0;       // time elapsed in round (for difficulty ramp)
  var lastHoleIndex = -1; // avoid spawning in same hole twice in a row

  function reset() {
    holes = [];
    for (var i = 0; i < Config.totalHoles; i++) {
      holes.push({
        active: false,
        type: null,
        timer: 0,
        showDuration: 0,
        whacked: false,
      });
    }
    spawnTimer = 0;
    nextSpawnInterval = randFloat(Config.spawnIntervalMin, Config.spawnIntervalMax);
    elapsed = 0;
    lastHoleIndex = -1;
  }

  /** Get difficulty-adjusted value (decreases over time) */
  function adjusted(base) {
    return Math.max(base - elapsed * Config.difficultyRamp, base * 0.3);
  }

  /** Random float between min and max */
  function randFloat(min, max) {
    return min + Math.random() * (max - min);
  }

  /** Pick a random mole type based on weighted chances */
  function pickMoleType() {
    var roll = Math.random();
    var cumulative = 0;
    var types = Config.moleTypes;
    for (var key in types) {
      cumulative += types[key].chance;
      if (roll <= cumulative) return key;
    }
    return 'normal';
  }

  /** Pick a random empty hole (avoids last used hole) */
  function pickHole() {
    var empty = [];
    for (var i = 0; i < holes.length; i++) {
      if (!holes[i].active && i !== lastHoleIndex) {
        empty.push(i);
      }
    }
    if (empty.length === 0) {
      // Fallback: allow last hole too
      for (var j = 0; j < holes.length; j++) {
        if (!holes[j].active) empty.push(j);
      }
    }
    if (empty.length === 0) return -1;
    return empty[Math.floor(Math.random() * empty.length)];
  }

  /** Count currently active moles */
  function activeCount() {
    var count = 0;
    for (var i = 0; i < holes.length; i++) {
      if (holes[i].active) count++;
    }
    return count;
  }

  /** Spawn a mole in a random hole */
  function spawnMole() {
    if (activeCount() >= Config.maxActiveMoles) return;

    var idx = pickHole();
    if (idx < 0) return;

    var type = pickMoleType();
    var showMin = adjusted(Config.moleShowMin);
    var showMax = adjusted(Config.moleShowMax);

    holes[idx].active = true;
    holes[idx].type = type;
    holes[idx].timer = 0;
    holes[idx].showDuration = randFloat(showMin, showMax);
    holes[idx].whacked = false;
    lastHoleIndex = idx;
  }

  /** Update mole timers, hide expired moles */
  function update(dt) {
    elapsed += dt;
    spawnTimer += dt;

    // Spawn new moles
    if (spawnTimer >= nextSpawnInterval) {
      spawnTimer = 0;
      var spawnMin = adjusted(Config.spawnIntervalMin);
      var spawnMax = adjusted(Config.spawnIntervalMax);
      nextSpawnInterval = randFloat(spawnMin, spawnMax);
      spawnMole();
    }

    // Update active moles
    var expired = [];
    for (var i = 0; i < holes.length; i++) {
      var h = holes[i];
      if (!h.active) continue;

      h.timer += dt;

      // Mole time expired — it escaped
      if (h.timer >= h.showDuration && !h.whacked) {
        expired.push(i);
      }

      // Whacked mole — hide after brief delay
      if (h.whacked && h.timer >= 0.3) {
        h.active = false;
        h.type = null;
        h.whacked = false;
      }
    }

    // Hide expired moles
    for (var j = 0; j < expired.length; j++) {
      var hole = holes[expired[j]];
      hole.active = false;
      hole.type = null;
    }

    return expired; // indices of moles that escaped (for miss tracking)
  }

  /** Attempt to whack a mole at the given hole index.
   *  Returns { hit: true, type: 'normal'|'golden'|'bomb' } or { hit: false }
   */
  function whack(index) {
    var h = holes[index];
    if (!h || !h.active || h.whacked) return { hit: false };

    var type = h.type;
    h.whacked = true;
    h.timer = 0; // reset timer for whack animation

    return { hit: true, type: type };
  }

  /** Get hole state for rendering */
  function getHoles() {
    return holes;
  }

  /** Get progress ratio (0-1) for a mole's visibility (for animation) */
  function getProgress(index) {
    var h = holes[index];
    if (!h || !h.active) return 0;
    if (h.whacked) return 1;
    // Pop-up phase (first 0.15s)
    if (h.timer < 0.15) return h.timer / 0.15;
    // Visible phase
    var remaining = h.showDuration - h.timer;
    // Hide phase (last 0.15s)
    if (remaining < 0.15) return Math.max(0, remaining / 0.15);
    return 1;
  }

  return {
    reset: reset,
    update: update,
    whack: whack,
    getHoles: getHoles,
    getProgress: getProgress,
    get activeCount() { return activeCount(); },
  };
})();
