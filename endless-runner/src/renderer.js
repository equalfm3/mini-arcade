/* Endless Runner — Pixel art renderer */

var Renderer = (function () {

  function drawBackground(ctx, w, h) {
    var nightFactor = Ground.getNightFactor();

    // Sky gradient based on day/night
    var r = Math.floor(14 - nightFactor * 8);
    var g = Math.floor(14 - nightFactor * 8);
    var b = Math.floor(26 - nightFactor * 12);
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.fillRect(0, 0, w, h);

    // Stars (brighter at night)
    var stars = Ground.stars;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.globalAlpha = s.opacity * (0.3 + nightFactor * 0.7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.ceil(s.size), Math.ceil(s.size));
    }
    ctx.globalAlpha = 1;

    // Mountains (far parallax)
    var mountains = Ground.mountains;
    ctx.fillStyle = Config.mountainColor;
    for (var m = 0; m < mountains.length; m++) {
      var mt = mountains[m];
      drawTriangle(ctx, mt.x, Config.groundY, mt.w, mt.h);
    }

    // Hills (mid parallax)
    var hills = Ground.hills;
    ctx.fillStyle = Config.hillColor;
    for (var hi = 0; hi < hills.length; hi++) {
      var hl = hills[hi];
      drawTriangle(ctx, hl.x, Config.groundY, hl.w, hl.h);
    }

    // Clouds
    var clouds = Ground.clouds;
    for (var c = 0; c < clouds.length; c++) {
      var cl = clouds[c];
      ctx.fillStyle = Config.cloudColor;
      ctx.globalAlpha = 0.5 + nightFactor * 0.3;
      // Simple pixel cloud: rounded rect
      ctx.fillRect(Math.floor(cl.x), Math.floor(cl.y), Math.floor(cl.w), Math.floor(cl.h));
      // Top bumps
      ctx.fillRect(Math.floor(cl.x + cl.w * 0.15), Math.floor(cl.y - cl.h * 0.5), Math.floor(cl.w * 0.3), Math.floor(cl.h * 0.6));
      ctx.fillRect(Math.floor(cl.x + cl.w * 0.45), Math.floor(cl.y - cl.h * 0.7), Math.floor(cl.w * 0.35), Math.floor(cl.h * 0.8));
    }
    ctx.globalAlpha = 1;
  }

  function drawTriangle(ctx, x, baseY, w, h) {
    ctx.beginPath();
    ctx.moveTo(Math.floor(x), Math.floor(baseY));
    ctx.lineTo(Math.floor(x + w / 2), Math.floor(baseY - h));
    ctx.lineTo(Math.floor(x + w), Math.floor(baseY));
    ctx.closePath();
    ctx.fill();
  }

  function drawGround(ctx, w) {
    var gY = Config.groundY;
    var offset = Ground.groundOffset;

    // Ground fill
    ctx.fillStyle = Config.groundColor;
    ctx.fillRect(0, gY, w, Config.groundH);

    // Top line
    ctx.fillStyle = Config.groundLine;
    ctx.fillRect(0, gY, w, 2);

    // Scrolling texture dots
    var spacing = 24;
    ctx.fillStyle = Config.groundDot;
    for (var x = -offset; x < w; x += spacing) {
      ctx.fillRect(Math.floor(x), gY + 6, 8, 2);
      ctx.fillRect(Math.floor(x + spacing / 2), gY + 14, 6, 2);
    }
  }

  function drawPlayer(ctx) {
    var px = Config.playerX;
    var py = Player.y;

    ctx.save();

    if (Player.isDucking) {
      // Ducking: wider, shorter body
      var dw = Config.duckW;
      var dh = Config.duckH;
      var dy = Config.playerDuckY;

      // Body
      ctx.fillStyle = Config.playerBody;
      ctx.fillRect(px, dy, dw, dh);

      // Dark stripe
      ctx.fillStyle = Config.playerDark;
      ctx.fillRect(px, dy + dh - 4, dw, 4);

      // Eye
      ctx.fillStyle = Config.playerEye;
      ctx.fillRect(px + dw - 6, dy + 4, 4, 4);

      // Legs (short, running)
      var legPhase = Math.floor(Player.legTimer * 2) % 2;
      ctx.fillStyle = Config.playerBody;
      if (legPhase === 0) {
        ctx.fillRect(px + 4, dy + dh, 4, 4);
        ctx.fillRect(px + dw - 10, dy + dh, 4, 4);
      } else {
        ctx.fillRect(px + 8, dy + dh, 4, 4);
        ctx.fillRect(px + dw - 14, dy + dh, 4, 4);
      }
    } else {
      // Standing / jumping
      var pw = Config.playerW;
      var ph = Config.playerH;

      // Body
      ctx.fillStyle = Config.playerBody;
      ctx.fillRect(px, py, pw, ph);

      // Head (slightly wider at top)
      ctx.fillRect(px - 2, py, pw + 4, 12);

      // Eye
      ctx.fillStyle = Config.playerEye;
      ctx.fillRect(px + pw - 4, py + 3, 4, 4);

      // Dark stripe on body
      ctx.fillStyle = Config.playerDark;
      ctx.fillRect(px, py + ph - 6, pw, 6);

      // Arms
      ctx.fillStyle = Config.playerBody;
      var armPhase = Math.sin(Player.legTimer * 3) * 3;
      ctx.fillRect(px + pw, py + 14 + armPhase, 6, 3);

      if (Player.isJumping) {
        // Legs together when jumping
        ctx.fillRect(px + 4, py + ph, 4, 6);
        ctx.fillRect(px + pw - 8, py + ph, 4, 6);
      } else {
        // Running legs animation
        var legPhase2 = Math.floor(Player.legTimer * 2) % 4;
        ctx.fillStyle = Config.playerBody;
        switch (legPhase2) {
          case 0:
            ctx.fillRect(px + 2, py + ph, 4, 8);
            ctx.fillRect(px + pw - 8, py + ph, 4, 4);
            break;
          case 1:
            ctx.fillRect(px + 4, py + ph, 4, 6);
            ctx.fillRect(px + pw - 6, py + ph, 4, 6);
            break;
          case 2:
            ctx.fillRect(px + 2, py + ph, 4, 4);
            ctx.fillRect(px + pw - 8, py + ph, 4, 8);
            break;
          case 3:
            ctx.fillRect(px + 4, py + ph, 4, 6);
            ctx.fillRect(px + pw - 6, py + ph, 4, 6);
            break;
        }
      }
    }

    ctx.restore();
  }

  function drawObstacles(ctx) {
    var list = Obstacles.list;
    for (var i = 0; i < list.length; i++) {
      var obs = list[i];
      switch (obs.type) {
        case Config.SMALL_CACTUS:
          drawSmallCactus(ctx, obs.x, obs.y);
          break;
        case Config.LARGE_CACTUS:
          drawLargeCactus(ctx, obs.x, obs.y);
          break;
        case Config.DOUBLE_CACTUS:
          drawDoubleCactus(ctx, obs.x, obs.y);
          break;
        case Config.BIRD:
          drawBird(ctx, obs.x, obs.y, obs.flapTimer);
          break;
      }
    }
  }

  function drawSmallCactus(ctx, x, y) {
    var w = Config.smallCactusW;
    var h = Config.smallCactusH;

    // Main trunk
    ctx.fillStyle = Config.cactusColor;
    ctx.fillRect(Math.floor(x + 3), Math.floor(y), Math.floor(w - 6), Math.floor(h));

    // Left arm
    ctx.fillRect(Math.floor(x), Math.floor(y + 8), 4, 10);
    ctx.fillRect(Math.floor(x), Math.floor(y + 8), 6, 4);

    // Right arm
    ctx.fillRect(Math.floor(x + w - 4), Math.floor(y + 12), 4, 8);
    ctx.fillRect(Math.floor(x + w - 6), Math.floor(y + 12), 6, 4);

    // Dark edge
    ctx.fillStyle = Config.cactusDark;
    ctx.fillRect(Math.floor(x + 3), Math.floor(y), 2, Math.floor(h));
  }

  function drawLargeCactus(ctx, x, y) {
    var w = Config.largeCactusW;
    var h = Config.largeCactusH;

    // Main trunk
    ctx.fillStyle = Config.cactusColor;
    ctx.fillRect(Math.floor(x + 4), Math.floor(y), Math.floor(w - 8), Math.floor(h));

    // Left arm
    ctx.fillRect(Math.floor(x), Math.floor(y + 10), 5, 14);
    ctx.fillRect(Math.floor(x), Math.floor(y + 10), 7, 4);

    // Right arm
    ctx.fillRect(Math.floor(x + w - 5), Math.floor(y + 16), 5, 12);
    ctx.fillRect(Math.floor(x + w - 7), Math.floor(y + 16), 7, 4);

    // Dark edge
    ctx.fillStyle = Config.cactusDark;
    ctx.fillRect(Math.floor(x + 4), Math.floor(y), 2, Math.floor(h));

    // Top spikes
    ctx.fillStyle = Config.cactusColor;
    ctx.fillRect(Math.floor(x + 6), Math.floor(y - 3), 2, 4);
    ctx.fillRect(Math.floor(x + w - 8), Math.floor(y - 2), 2, 3);
  }

  function drawDoubleCactus(ctx, x, y) {
    // Two small cacti side by side
    drawSmallCactus(ctx, x, y);
    drawSmallCactus(ctx, x + 16, y);
  }

  function drawBird(ctx, x, y, flapTimer) {
    var w = Config.birdW;
    var h = Config.birdH;
    var wingUp = Math.sin(flapTimer * Math.PI * 2) > 0;

    // Body
    ctx.fillStyle = Config.birdColor;
    ctx.fillRect(Math.floor(x + 4), Math.floor(y + 6), Math.floor(w - 8), Math.floor(h - 10));

    // Head
    ctx.fillRect(Math.floor(x + w - 10), Math.floor(y + 4), 8, 10);

    // Beak
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(Math.floor(x + w - 4), Math.floor(y + 7), 4, 3);

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.floor(x + w - 8), Math.floor(y + 5), 3, 3);
    ctx.fillStyle = '#0a0a16';
    ctx.fillRect(Math.floor(x + w - 7), Math.floor(y + 6), 2, 2);

    // Wings
    ctx.fillStyle = Config.birdDark;
    if (wingUp) {
      // Wings up
      ctx.fillRect(Math.floor(x + 6), Math.floor(y), Math.floor(w - 16), 6);
    } else {
      // Wings down
      ctx.fillRect(Math.floor(x + 6), Math.floor(y + h - 6), Math.floor(w - 16), 6);
    }

    // Tail
    ctx.fillStyle = Config.birdColor;
    ctx.fillRect(Math.floor(x), Math.floor(y + 6), 6, 4);
    ctx.fillRect(Math.floor(x - 2), Math.floor(y + 4), 4, 3);
  }

  function drawNightOverlay(ctx, w, h) {
    var nightFactor = Ground.getNightFactor();
    if (nightFactor > 0.1) {
      ctx.fillStyle = Config.nightTint;
      ctx.globalAlpha = nightFactor * 0.3;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  }

  return {
    drawBackground: drawBackground,
    drawGround: drawGround,
    drawPlayer: drawPlayer,
    drawObstacles: drawObstacles,
    drawNightOverlay: drawNightOverlay,
  };
})();
