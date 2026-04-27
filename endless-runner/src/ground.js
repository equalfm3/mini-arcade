/* Endless Runner — Scrolling ground + parallax background */

var Ground = (function () {

  var groundOffset = 0;
  var stars = [];
  var clouds = [];
  var mountains = [];
  var hills = [];
  var inited = false;
  var cycleTimer = 0;

  function init() {
    if (inited) return;
    inited = true;

    // Generate stars
    stars = [];
    for (var i = 0; i < Config.starCount; i++) {
      stars.push({
        x: Math.random() * Config.canvasW,
        y: Math.random() * (Config.groundY - 40),
        size: 1 + Math.random(),
        opacity: 0.2 + Math.random() * 0.5,
      });
    }

    // Generate clouds
    clouds = [];
    for (var c = 0; c < Config.cloudCount; c++) {
      clouds.push({
        x: Math.random() * Config.canvasW,
        y: 15 + Math.random() * 40,
        w: 30 + Math.random() * 40,
        h: 8 + Math.random() * 6,
        speed: 0.05 + Math.random() * 0.05, // parallax factor
      });
    }

    // Generate mountains (far background)
    mountains = [];
    for (var m = 0; m < Config.mountainCount; m++) {
      mountains.push({
        x: m * (Config.canvasW / Config.mountainCount) + Math.random() * 40,
        w: 60 + Math.random() * 50,
        h: 30 + Math.random() * 25,
        speed: 0.08,
      });
    }

    // Generate hills (mid background)
    hills = [];
    for (var h = 0; h < Config.hillCount; h++) {
      hills.push({
        x: h * (Config.canvasW / Config.hillCount) + Math.random() * 30,
        w: 40 + Math.random() * 30,
        h: 15 + Math.random() * 15,
        speed: 0.15,
      });
    }
  }

  function reset() {
    groundOffset = 0;
    cycleTimer = 0;
  }

  function update(dt, speed) {
    groundOffset = (groundOffset + speed * dt) % 24;
    cycleTimer += dt;

    // Move clouds
    for (var c = 0; c < clouds.length; c++) {
      clouds[c].x -= speed * clouds[c].speed * dt;
      if (clouds[c].x + clouds[c].w < 0) {
        clouds[c].x = Config.canvasW + Math.random() * 40;
        clouds[c].y = 15 + Math.random() * 40;
      }
    }

    // Move mountains
    for (var m = 0; m < mountains.length; m++) {
      mountains[m].x -= speed * mountains[m].speed * dt;
      if (mountains[m].x + mountains[m].w < 0) {
        mountains[m].x = Config.canvasW + Math.random() * 60;
      }
    }

    // Move hills
    for (var h = 0; h < hills.length; h++) {
      hills[h].x -= speed * hills[h].speed * dt;
      if (hills[h].x + hills[h].w < 0) {
        hills[h].x = Config.canvasW + Math.random() * 40;
      }
    }
  }

  function getNightFactor() {
    // Oscillates between 0 (day) and 1 (night)
    var t = cycleTimer / Config.dayNightCycleDuration;
    return (Math.sin(t * Math.PI * 2) + 1) / 2;
  }

  return {
    init: init,
    reset: reset,
    update: update,
    getNightFactor: getNightFactor,
    get groundOffset() { return groundOffset; },
    get stars() { return stars; },
    get clouds() { return clouds; },
    get mountains() { return mountains; },
    get hills() { return hills; },
    get cycleTimer() { return cycleTimer; },
  };
})();
