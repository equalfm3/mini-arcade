/* Pong — AI module */

var AI = (function () {

  var _targetY = 0;
  var _error = 0;
  var _reactionDelay = 0;  // time before AI starts tracking a new ball direction
  var _lastBallDir = 0;

  function predictY(ballData, paddleX) {
    var bx = ballData.x;
    var by = ballData.y;
    var bvx = ballData.vx;
    var bvy = ballData.vy;

    if (bvx <= 0) return Config.canvasH / 2;

    var timeToReach = (paddleX - bx) / bvx;
    if (timeToReach < 0) return Config.canvasH / 2;

    var predictedY = by + bvy * timeToReach;

    // Simulate bounces off top/bottom
    var half = Config.ballSize;
    var minY = half;
    var maxY = Config.canvasH - half;
    var range = maxY - minY;

    if (range > 0) {
      predictedY = predictedY - minY;
      var bounces = Math.floor(Math.abs(predictedY) / range);
      predictedY = Math.abs(predictedY) % range;
      if (bounces % 2 !== 0) {
        predictedY = range - predictedY;
      }
      predictedY = predictedY + minY;
    }

    return predictedY;
  }

  function update(dt, ballData, paddleData) {
    var paddleCenterY = paddleData.y + paddleData.h / 2;
    var canvasCenter = Config.canvasH / 2;

    // Detect direction change — add reaction delay on easy
    var ballDir = ballData.vx > 0 ? 1 : -1;
    if (ballDir !== _lastBallDir) {
      _reactionDelay = (1 - Config.aiReaction) * 0.5; // up to 0.275s delay on easy
      _lastBallDir = ballDir;
    }

    if (_reactionDelay > 0) {
      _reactionDelay -= dt;
      // During delay, drift toward center (AI hasn't "noticed" yet)
      _targetY = canvasCenter;
    } else if (ballData.vx > 0) {
      // Ball moving toward AI
      if (Config.aiPrediction) {
        _targetY = predictY(ballData, paddleData.x);
      } else {
        // Without prediction, just track current ball Y (always late)
        _targetY = ballData.y;
      }

      // Add wandering error — bigger on easy mode
      var errorStrength = (1 - Config.aiReaction) * 300;
      _error += (Math.random() - 0.5) * errorStrength * dt;
      _error = clamp(_error, -80, 80);
      _targetY += _error;
    } else {
      // Ball moving away — drift toward center slowly
      _targetY = canvasCenter;
      _error *= 0.9;
    }

    // Move toward target at limited speed
    var diff = _targetY - paddleCenterY;
    var maxMove = Config.aiSpeed * dt;

    if (Math.abs(diff) > 4) {
      var move = Math.min(Math.abs(diff), maxMove);
      if (diff < 0) move = -move;
      Paddle.moveP2(move);
    }
  }

  return {
    update: update,
  };
})();
