/* Doodle Jump — Camera module */

var Camera = (function () {

  var y = 0;          // camera top y (world coords, negative = up)
  var maxHeight = 0;  // highest point reached (most negative y)

  function reset() {
    y = 0;
    maxHeight = 0;
  }

  /** Update camera to follow player upward */
  function update(playerY) {
    // Camera threshold: player should stay in lower portion of screen
    var threshold = y + Config.canvasH * Config.cameraOffset;

    // Only scroll up, never down
    if (playerY < threshold) {
      y = playerY - Config.canvasH * Config.cameraOffset;
    }

    // Track max height
    if (y < maxHeight) {
      maxHeight = y;
    }

    // Generate new platforms above camera
    Platforms.generateAbove(y);

    // Remove platforms below camera
    Platforms.removeBelow(y + Config.canvasH);
  }

  /** Check if player has fallen below the camera view */
  function isPlayerBelow(playerY) {
    return playerY > y + Config.canvasH + 50;
  }

  /** Get score based on max height reached */
  function getScore() {
    return Math.floor(Math.abs(maxHeight) * Config.heightScale);
  }

  return {
    reset: reset,
    update: update,
    isPlayerBelow: isPlayerBelow,
    getScore: getScore,
    get y() { return y; },
    get maxHeight() { return maxHeight; },
  };
})();
