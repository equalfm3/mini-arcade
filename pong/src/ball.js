/* Pong — Ball module */

var Ball = (function () {

  var _x = 0, _y = 0, _vx = 0, _vy = 0;
  var _speed = 0;
  var _serving = true;
  var _serveDir = 1;
  var _lastX = 0; // previous frame x for sweep collision

  function reset(dir) {
    _x = Config.canvasW / 2;
    _y = Config.canvasH / 2;
    _lastX = _x;
    _vx = 0;
    _vy = 0;
    _speed = Config.ballBaseSpeed;
    _serving = true;
    _serveDir = dir || 1;
  }

  function serve() {
    var angle = (Math.random() * 60 - 30) * Math.PI / 180;
    _vx = Math.cos(angle) * _speed * _serveDir;
    _vy = Math.sin(angle) * _speed;
    _serving = false;
  }

  function update(dt) {
    _lastX = _x;
    _x += _vx * dt;
    _y += _vy * dt;

    // Bounce off top/bottom walls
    var half = Config.ballSize;
    if (_y - half < 0) {
      _y = half;
      _vy = Math.abs(_vy);
    }
    if (_y + half > Config.canvasH) {
      _y = Config.canvasH - half;
      _vy = -Math.abs(_vy);
    }

    // Check if ball exits left or right (past paddle zone)
    if (_x + half < 0) {
      return 'p2scored';
    }
    if (_x - half > Config.canvasW) {
      return 'p1scored';
    }

    return 'ok';
  }

  function checkPaddleCollision(paddle) {
    var half = Config.ballSize;

    var pLeft = paddle.x;
    var pRight = paddle.x + paddle.w;
    var pTop = paddle.y;
    var pBottom = paddle.y + paddle.h;

    // Sweep check: did the ball cross the paddle's front edge this frame?
    // For left paddle (P1): front edge is pRight, ball moves left (vx < 0)
    // For right paddle (P2): front edge is pLeft, ball moves right (vx > 0)

    var ballFront, ballFrontLast;
    var crossedEdge = false;
    var isLeftPaddle = paddle.x < Config.canvasW / 2;

    if (isLeftPaddle && _vx < 0) {
      // Ball moving left toward P1
      ballFront = _x - half;
      ballFrontLast = _lastX - half;
      // Did ball front cross pRight this frame?
      crossedEdge = ballFrontLast >= pRight && ballFront <= pRight;
      // Also check simple overlap
      if (!crossedEdge) {
        crossedEdge = ballFront <= pRight && (_x + half) >= pLeft;
      }
    } else if (!isLeftPaddle && _vx > 0) {
      // Ball moving right toward P2
      ballFront = _x + half;
      ballFrontLast = _lastX + half;
      crossedEdge = ballFrontLast <= pLeft && ballFront >= pLeft;
      if (!crossedEdge) {
        crossedEdge = ballFront >= pLeft && (_x - half) <= pRight;
      }
    }

    if (!crossedEdge) return false;

    // Check Y overlap — is ball within paddle's vertical range?
    var bTop = _y - half;
    var bBottom = _y + half;
    if (bBottom < pTop || bTop > pBottom) return false;

    // Hit! Calculate hit position (0 = top, 1 = bottom)
    var hitPos = (_y - pTop) / (pBottom - pTop);
    hitPos = clamp(hitPos, 0, 1);

    // Map to angle: -60° to +60°
    var angle = (hitPos - 0.5) * 2 * 60 * Math.PI / 180;

    // Increase speed
    _speed = Math.min(_speed + Config.ballSpeedIncrement, Config.ballMaxSpeed);

    // Bounce direction
    var dir = isLeftPaddle ? 1 : -1;

    _vx = Math.cos(angle) * _speed * dir;
    _vy = Math.sin(angle) * _speed;

    // Push ball out of paddle
    if (isLeftPaddle) {
      _x = pRight + half + 1;
    } else {
      _x = pLeft - half - 1;
    }

    Audio8.play('hit');
    return true;
  }

  function draw(ctx) {
    var half = Config.ballSize;
    ctx.fillStyle = Config.ballColor;
    ctx.fillRect(Math.floor(_x - half), Math.floor(_y - half), half * 2, half * 2);
  }

  return {
    reset: reset,
    serve: serve,
    update: update,
    checkPaddleCollision: checkPaddleCollision,
    draw: draw,
    get x() { return _x; },
    get y() { return _y; },
    get vx() { return _vx; },
    get vy() { return _vy; },
    get serving() { return _serving; },
  };
})();
