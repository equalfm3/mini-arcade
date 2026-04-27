/* Doodle Jump — Platforms module */

var Platforms = (function () {

  // Platform types
  var NORMAL = 'normal';
  var MOVING = 'moving';
  var BREAKING = 'breaking';
  var SPRING = 'spring';

  var platforms = [];
  var highestY = 0;  // highest platform y generated so far (most negative)

  function reset() {
    platforms = [];
    highestY = 0;
  }

  /** Generate initial platforms filling the screen */
  function generateInitial() {
    platforms = [];
    // Ground platform — always there
    platforms.push({
      x: Config.canvasW / 2 - Config.platformW / 2,
      y: Config.canvasH - 40,
      w: Config.platformW,
      h: Config.platformH,
      type: NORMAL,
      broken: false,
      breakTimer: 0,
      moveDir: 1,
    });

    // Fill screen with platforms going upward
    var currentY = Config.canvasH - 40;
    highestY = currentY;

    while (currentY > -Config.canvasH) {
      var gap = getGap(Math.abs(currentY));
      currentY -= gap;
      var plat = createPlatform(currentY, Math.abs(currentY));
      platforms.push(plat);
      highestY = currentY;
    }
  }

  /** Get vertical gap based on height (difficulty ramp) */
  function getGap(height) {
    var base = Config.platformGap;
    var extra = height * Config.platformDifficultyRate;
    var gap = base + extra;
    return Math.min(gap, Config.platformMaxGap);
  }

  /** Choose platform type based on height */
  function choosePlatformType(height) {
    // Early game: mostly normal
    if (height < 500) return NORMAL;

    var roll = Math.random();
    if (roll < Config.normalChance) return NORMAL;
    if (roll < Config.movingChance) return MOVING;
    if (roll < Config.breakingChance) return BREAKING;
    return SPRING;
  }

  /** Create a single platform at given y */
  function createPlatform(y, height) {
    var type = choosePlatformType(height || 0);
    var x = Math.random() * (Config.canvasW - Config.platformW);

    return {
      x: x,
      y: y,
      w: Config.platformW,
      h: Config.platformH,
      type: type,
      broken: false,
      breakTimer: 0,
      moveDir: Math.random() < 0.5 ? 1 : -1,
    };
  }

  /** Generate new platforms above the camera */
  function generateAbove(cameraTop) {
    while (highestY > cameraTop - Config.canvasH) {
      var height = Math.abs(highestY);
      var gap = getGap(height);
      highestY -= gap;
      var plat = createPlatform(highestY, height);
      platforms.push(plat);
    }
  }

  /** Remove platforms below the camera */
  function removeBelow(cameraBottom) {
    for (var i = platforms.length - 1; i >= 0; i--) {
      if (platforms[i].y > cameraBottom + 50) {
        platforms.splice(i, 1);
      }
    }
  }

  /** Update moving platforms and breaking animations */
  function update(dt) {
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];

      // Moving platforms
      if (p.type === MOVING && !p.broken) {
        p.x += Config.movingSpeed * p.moveDir * dt;
        if (p.x <= 0) {
          p.x = 0;
          p.moveDir = 1;
        } else if (p.x + p.w >= Config.canvasW) {
          p.x = Config.canvasW - p.w;
          p.moveDir = -1;
        }
      }

      // Breaking platform animation
      if (p.broken) {
        p.breakTimer += dt;
      }
    }
  }

  /** Mark a breaking platform as broken */
  function breakPlatform(index) {
    if (index >= 0 && index < platforms.length) {
      platforms[index].broken = true;
      platforms[index].breakTimer = 0;
    }
  }

  function draw(ctx, cameraY) {
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      var screenY = p.y - cameraY;

      // Skip off-screen
      if (screenY > Config.canvasH + 20 || screenY < -30) continue;

      // Breaking platform that's fully broken — skip or draw falling pieces
      if (p.broken && p.breakTimer > 0.4) continue;

      if (p.broken) {
        // Crumbling animation
        drawBreakingAnim(ctx, p, screenY);
        continue;
      }

      var color, dark;
      switch (p.type) {
        case MOVING:
          color = Config.movingColor;
          dark = Config.movingDark;
          break;
        case BREAKING:
          color = Config.breakingColor;
          dark = Config.breakingDark;
          break;
        case SPRING:
          color = Config.normalColor;
          dark = Config.normalDark;
          break;
        default:
          color = Config.normalColor;
          dark = Config.normalDark;
      }

      // Platform body
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(p.x), Math.floor(screenY), p.w, p.h);

      // Top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(Math.floor(p.x), Math.floor(screenY), p.w, 2);

      // Bottom shadow
      ctx.fillStyle = dark;
      ctx.fillRect(Math.floor(p.x), Math.floor(screenY) + p.h - 3, p.w, 3);

      // Spring coil on spring platforms
      if (p.type === SPRING) {
        drawSpring(ctx, p.x, screenY);
      }
    }
  }

  function drawSpring(ctx, px, screenY) {
    var cx = px + Config.platformW / 2;
    var sy = screenY - 2;

    // Spring base
    ctx.fillStyle = Config.springColor;
    ctx.fillRect(cx - 6, sy - 8, 12, 8);

    // Coil lines
    ctx.fillStyle = Config.springDark;
    ctx.fillRect(cx - 5, sy - 7, 10, 2);
    ctx.fillRect(cx - 4, sy - 4, 8, 2);

    // Top cap
    ctx.fillStyle = Config.springColor;
    ctx.fillRect(cx - 7, sy - 10, 14, 3);
  }

  function drawBreakingAnim(ctx, p, screenY) {
    var t = p.breakTimer;
    var pieces = 4;
    var spread = t * 80;
    var fall = t * t * 400;

    ctx.fillStyle = Config.breakingBroken;
    for (var i = 0; i < pieces; i++) {
      var ox = (i - 1.5) * (p.w / pieces) + spread * (i % 2 === 0 ? -0.5 : 0.5);
      var oy = fall + Math.sin(i * 2) * spread * 0.3;
      ctx.globalAlpha = Math.max(0, 1 - t * 2.5);
      ctx.fillRect(
        Math.floor(p.x + i * (p.w / pieces) + ox),
        Math.floor(screenY + oy),
        p.w / pieces - 2,
        p.h - 2
      );
    }
    ctx.globalAlpha = 1;
  }

  return {
    NORMAL: NORMAL,
    MOVING: MOVING,
    BREAKING: BREAKING,
    SPRING: SPRING,
    reset: reset,
    generateInitial: generateInitial,
    generateAbove: generateAbove,
    removeBelow: removeBelow,
    update: update,
    breakPlatform: breakPlatform,
    draw: draw,
    get list() { return platforms; },
    get highestY() { return highestY; },
  };
})();
