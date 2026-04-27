/* Color Switch — Renderer

   Draws: background stars, rotating ring/cross/bar obstacles,
   color-switch stars, and the ball.
*/

var Renderer = (function () {

  var bgStars = [];
  var inited = false;

  function init() {
    if (inited) return;
    inited = true;

    bgStars = [];
    for (var i = 0; i < Config.bgStarCount; i++) {
      bgStars.push({
        x: Math.random() * Config.canvasW,
        y: Math.random() * 2000 - 1000,
        size: 1 + Math.random(),
        opacity: 0.2 + Math.random() * 0.4,
      });
    }
  }

  function drawBackground(ctx, cameraY) {
    ctx.fillStyle = Config.bgColor;
    ctx.fillRect(0, 0, Config.canvasW, Config.canvasH);

    // Parallax stars
    for (var i = 0; i < bgStars.length; i++) {
      var s = bgStars[i];
      var sy = ((s.y - cameraY * 0.3) % Config.canvasH + Config.canvasH) % Config.canvasH;
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(s.x), Math.floor(sy), Math.ceil(s.size), Math.ceil(s.size));
    }
    ctx.globalAlpha = 1;
  }

  function drawBall(ctx, ballX, ballY, cameraY, colorIndex) {
    var screenY = ballY - cameraY;
    var r = Config.ballRadius;
    var color = Config.colors[colorIndex];

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(ballX, screenY, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(ballX - r * 0.25, screenY - r * 0.25, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
  }

  function drawRing(ctx, ob, cameraY) {
    var cx = ob.x;
    var cy = ob.y - cameraY;
    var rOuter = Config.ringOuter;
    var rInner = Config.ringInner;
    var angle = ob.angle;

    for (var i = 0; i < 4; i++) {
      var startAngle = angle + i * Math.PI / 2;
      var endAngle = startAngle + Math.PI / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, startAngle, endAngle);
      ctx.arc(cx, cy, rInner, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = Config.colors[i];
      ctx.fill();
    }
  }

  function drawCross(ctx, ob, cameraY) {
    var cx = ob.x;
    var cy = ob.y - cameraY;
    var armLen = Config.crossArmLength;
    var armW = Config.crossArmWidth;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ob.angle);

    for (var i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 2);
      ctx.fillStyle = Config.colors[i];
      // Draw arm extending from center to armLen
      ctx.fillRect(0, -armW / 2, armLen, armW);
      // Rounded end cap
      ctx.beginPath();
      ctx.arc(armLen, 0, armW / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawBar(ctx, ob, cameraY) {
    var cx = ob.x;
    var cy = ob.y - cameraY;
    var halfW = Config.barWidth / 2;
    var halfH = Config.barHeight / 2;
    var segW = Config.barWidth / 4;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ob.angle);

    for (var i = 0; i < 4; i++) {
      ctx.fillStyle = Config.colors[i];
      var sx = -halfW + i * segW;
      ctx.fillRect(sx, -halfH, segW, Config.barHeight);
    }

    // Rounded ends
    ctx.fillStyle = Config.colors[0];
    ctx.beginPath();
    ctx.arc(-halfW, 0, halfH, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = Config.colors[3];
    ctx.beginPath();
    ctx.arc(halfW, 0, halfH, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawObstacles(ctx, cameraY) {
    var list = Obstacles.list;
    for (var i = 0; i < list.length; i++) {
      var ob = list[i];
      var screenY = ob.y - cameraY;
      // Skip if off screen
      if (screenY < -100 || screenY > Config.canvasH + 100) continue;

      if (ob.type === 'ring') {
        drawRing(ctx, ob, cameraY);
      } else if (ob.type === 'cross') {
        drawCross(ctx, ob, cameraY);
      } else if (ob.type === 'bar') {
        drawBar(ctx, ob, cameraY);
      }
    }
  }

  function drawStars(ctx, cameraY, time) {
    var list = Obstacles.starList;
    var pulse = Math.sin(time * Config.starPulseSpeed) * 0.2 + 1;

    for (var i = 0; i < list.length; i++) {
      var star = list[i];
      if (star.collected) continue;
      var sx = star.x;
      var sy = star.y - cameraY;
      if (sy < -30 || sy > Config.canvasH + 30) continue;

      var r = Config.starSize * pulse;

      // Draw a 4-color diamond/star shape
      for (var c = 0; c < 4; c++) {
        ctx.fillStyle = Config.colors[c];
        ctx.beginPath();
        var a = c * Math.PI / 2 - Math.PI / 4;
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
        ctx.lineTo(sx + Math.cos(a + Math.PI / 4) * r * 0.5, sy + Math.sin(a + Math.PI / 4) * r * 0.5);
        ctx.lineTo(sx + Math.cos(a + Math.PI / 2) * r, sy + Math.sin(a + Math.PI / 2) * r);
        ctx.closePath();
        ctx.fill();
      }

      // White center dot
      ctx.fillStyle = Config.starColor;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return {
    init: init,
    drawBackground: drawBackground,
    drawBall: drawBall,
    drawObstacles: drawObstacles,
    drawStars: drawStars,
  };
})();
