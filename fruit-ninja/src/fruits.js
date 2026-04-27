/* Fruit Ninja — Fruit spawning, arc trajectory, rotation, slicing */

var Fruits = (function () {

  var active = [];    // fruits in the air
  var halves = [];    // sliced halves falling
  var spawnTimer = 0;

  function reset() {
    active.length = 0;
    halves.length = 0;
    spawnTimer = Config.spawnInterval * 0.5; // first wave comes quickly
  }

  /** Spawn a wave of fruits from the bottom */
  function spawnWave(score) {
    // Increase difficulty with score
    var count = randInt(Config.spawnCountMin, Math.min(Config.spawnCountMax, Config.spawnCountMin + Math.floor(score / 10)));
    var interval = Math.max(Config.spawnIntervalMin, Config.spawnInterval - score * 0.01);
    spawnTimer = interval;

    for (var i = 0; i < count; i++) {
      spawnOne(score);
    }
  }

  function spawnOne(score) {
    var isBomb = Math.random() < Config.bombChance;
    var margin = Config.spawnMarginX;
    var x = margin + Math.random() * (Config.canvasW - margin * 2);
    var vy = Config.throwMinVY + Math.random() * (Config.throwMaxVY - Config.throwMinVY);
    var vx = Config.throwMinVX + Math.random() * (Config.throwMaxVX - Config.throwMinVX);
    // Bias horizontal velocity toward center
    if (x < Config.canvasW * 0.3) vx = Math.abs(vx);
    else if (x > Config.canvasW * 0.7) vx = -Math.abs(vx);

    var spin = Config.throwSpinMin + Math.random() * (Config.throwSpinMax - Config.throwSpinMin);

    if (isBomb) {
      active.push({
        type: 'bomb',
        x: x,
        y: Config.canvasH + Config.bombRadius,
        vx: vx,
        vy: vy,
        radius: Config.bombRadius,
        rotation: 0,
        spin: spin,
        sliced: false,
        missed: false,
      });
    } else {
      var fruitDef = Config.fruits[randInt(0, Config.fruits.length - 1)];
      active.push({
        type: 'fruit',
        name: fruitDef.name,
        x: x,
        y: Config.canvasH + fruitDef.radius,
        vx: vx,
        vy: vy,
        radius: fruitDef.radius,
        rotation: 0,
        spin: spin,
        body: fruitDef.body,
        highlight: fruitDef.highlight,
        dark: fruitDef.dark,
        sliced: false,
        missed: false,
      });
    }
  }

  /** Update all active fruits and halves */
  function update(dt, score) {
    // Spawn timer
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnWave(score);
    }

    // Update active fruits
    for (var i = active.length - 1; i >= 0; i--) {
      var f = active[i];
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vy += Config.gravity * dt;
      f.rotation += f.spin * dt;

      // Check if fruit fell off screen without being sliced
      if (f.y > Config.canvasH + f.radius * 2 && f.vy > 0) {
        if (!f.sliced && f.type === 'fruit') {
          f.missed = true;
        }
        active.splice(i, 1);
      }
    }

    // Update halves
    for (var j = halves.length - 1; j >= 0; j--) {
      var h = halves[j];
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.vy += Config.halfGravity * dt;
      h.rotation += h.spin * dt;
      h.life -= dt;
      if (h.life <= 0) {
        halves.splice(j, 1);
      }
    }
  }

  /** Slice a fruit — creates two halves, returns slice info */
  function slice(fruit) {
    fruit.sliced = true;

    var fleshColor = Config.fruitFlesh[fruit.name] || '#ffcccc';

    // Create two halves that fly apart
    var spreadVX = 60 + Math.random() * 40;
    var spreadVY = -80 - Math.random() * 60;

    halves.push({
      name: fruit.name,
      x: fruit.x - fruit.radius * 0.3,
      y: fruit.y,
      vx: fruit.vx - spreadVX,
      vy: fruit.vy + spreadVY,
      radius: fruit.radius,
      rotation: fruit.rotation,
      spin: -Config.halfSpinSpeed,
      body: fruit.body,
      dark: fruit.dark,
      flesh: fleshColor,
      life: Config.halfFadeTime,
      side: 'left',
    });

    halves.push({
      name: fruit.name,
      x: fruit.x + fruit.radius * 0.3,
      y: fruit.y,
      vx: fruit.vx + spreadVX,
      vy: fruit.vy + spreadVY,
      radius: fruit.radius,
      rotation: fruit.rotation,
      spin: Config.halfSpinSpeed,
      body: fruit.body,
      dark: fruit.dark,
      flesh: fleshColor,
      life: Config.halfFadeTime,
      side: 'right',
    });
  }

  /** Get missed fruits this frame and remove them */
  function collectMissed() {
    var missed = [];
    for (var i = active.length - 1; i >= 0; i--) {
      if (active[i].missed) {
        missed.push(active[i]);
        active.splice(i, 1);
      }
    }
    return missed;
  }

  return {
    reset: reset,
    update: update,
    slice: slice,
    collectMissed: collectMissed,
    get active() { return active; },
    get halves() { return halves; },
  };
})();
