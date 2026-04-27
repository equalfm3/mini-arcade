/* Tetris — Piece definitions & 7-bag randomizer */

var Pieces = (function () {

  // SRS piece data: each piece has 4 rotation states
  // Stored as 4x4 grids (I) or 3x3 grids (others)
  // 0 = empty, 1 = filled

  var SHAPES = {
    // I piece — 4x4 grid
    I: [
      [[0,0,0,0],
       [1,1,1,1],
       [0,0,0,0],
       [0,0,0,0]],

      [[0,0,1,0],
       [0,0,1,0],
       [0,0,1,0],
       [0,0,1,0]],

      [[0,0,0,0],
       [0,0,0,0],
       [1,1,1,1],
       [0,0,0,0]],

      [[0,1,0,0],
       [0,1,0,0],
       [0,1,0,0],
       [0,1,0,0]]
    ],

    // O piece — 3x3 grid (effectively 2x2, centered)
    O: [
      [[1,1],
       [1,1]],

      [[1,1],
       [1,1]],

      [[1,1],
       [1,1]],

      [[1,1],
       [1,1]]
    ],

    // T piece
    T: [
      [[0,1,0],
       [1,1,1],
       [0,0,0]],

      [[0,1,0],
       [0,1,1],
       [0,1,0]],

      [[0,0,0],
       [1,1,1],
       [0,1,0]],

      [[0,1,0],
       [1,1,0],
       [0,1,0]]
    ],

    // S piece
    S: [
      [[0,1,1],
       [1,1,0],
       [0,0,0]],

      [[0,1,0],
       [0,1,1],
       [0,0,1]],

      [[0,0,0],
       [0,1,1],
       [1,1,0]],

      [[1,0,0],
       [1,1,0],
       [0,1,0]]
    ],

    // Z piece
    Z: [
      [[1,1,0],
       [0,1,1],
       [0,0,0]],

      [[0,0,1],
       [0,1,1],
       [0,1,0]],

      [[0,0,0],
       [1,1,0],
       [0,1,1]],

      [[0,1,0],
       [1,1,0],
       [1,0,0]]
    ],

    // J piece
    J: [
      [[1,0,0],
       [1,1,1],
       [0,0,0]],

      [[0,1,1],
       [0,1,0],
       [0,1,0]],

      [[0,0,0],
       [1,1,1],
       [0,0,1]],

      [[0,1,0],
       [0,1,0],
       [1,1,0]]
    ],

    // L piece
    L: [
      [[0,0,1],
       [1,1,1],
       [0,0,0]],

      [[0,1,0],
       [0,1,0],
       [0,1,1]],

      [[0,0,0],
       [1,1,1],
       [1,0,0]],

      [[1,1,0],
       [0,1,0],
       [0,1,0]]
    ]
  };

  // Piece types in order matching Config.colors indices
  var TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

  // SRS wall kick data
  // For J, L, S, T, Z pieces
  var KICK_JLSTZ = {
    '0>1': [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
    '1>0': [[ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
    '1>2': [[ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
    '2>1': [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
    '2>3': [[ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
    '3>2': [[ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
    '3>0': [[ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
    '0>3': [[ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]]
  };

  // For I piece
  var KICK_I = {
    '0>1': [[ 0, 0], [-2, 0], [ 1, 0], [-2, 1], [ 1,-2]],
    '1>0': [[ 0, 0], [ 2, 0], [-1, 0], [ 2,-1], [-1, 2]],
    '1>2': [[ 0, 0], [-1, 0], [ 2, 0], [-1,-2], [ 2, 1]],
    '2>1': [[ 0, 0], [ 1, 0], [-2, 0], [ 1, 2], [-2,-1]],
    '2>3': [[ 0, 0], [ 2, 0], [-1, 0], [ 2,-1], [-1, 2]],
    '3>2': [[ 0, 0], [-2, 0], [ 1, 0], [-2, 1], [ 1,-2]],
    '3>0': [[ 0, 0], [ 1, 0], [-2, 0], [ 1, 2], [-2,-1]],
    '0>3': [[ 0, 0], [-1, 0], [ 2, 0], [-1,-2], [ 2, 1]]
  };

  // 7-bag randomizer state
  var bag = [];

  function fillBag() {
    bag = [0, 1, 2, 3, 4, 5, 6];
    // Fisher-Yates shuffle
    for (var i = bag.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = bag[i];
      bag[i] = bag[j];
      bag[j] = tmp;
    }
  }

  /** Get a random piece using 7-bag randomizer */
  function random() {
    if (bag.length === 0) fillBag();
    var typeIdx = bag.pop();
    var type = TYPES[typeIdx];
    var shape = SHAPES[type][0];
    // Spawn position: centered horizontally, at top
    var x = Math.floor((Config.cols - shape[0].length) / 2);
    var y = 0;
    return {
      type: type,
      typeIdx: typeIdx,
      rotation: 0,
      shape: shape,
      color: typeIdx,
      x: x,
      y: y
    };
  }

  /** Get shape grid for a piece type at given rotation */
  function getShape(type, rotation) {
    return SHAPES[type][rotation];
  }

  /** Calculate new rotation index */
  function rotate(piece, dir) {
    var total = SHAPES[piece.type].length;
    return ((piece.rotation + dir) % total + total) % total;
  }

  /** Try SRS wall kicks, return valid {x, y, rotation} or null */
  function wallKick(piece, newRotation, isValidFn) {
    var kickTable = (piece.type === 'I') ? KICK_I : KICK_JLSTZ;
    var key = piece.rotation + '>' + newRotation;
    var kicks = kickTable[key];

    if (!kicks) return null;

    var newShape = SHAPES[piece.type][newRotation];

    for (var i = 0; i < kicks.length; i++) {
      var dx = kicks[i][0];
      var dy = -kicks[i][1]; // SRS uses y-up, we use y-down
      var nx = piece.x + dx;
      var ny = piece.y + dy;

      if (isValidFn(piece.type, nx, ny, newRotation)) {
        return { x: nx, y: ny, rotation: newRotation };
      }
    }

    return null;
  }

  /** Reset the bag (for new game) */
  function reset() {
    bag = [];
  }

  return {
    random: random,
    rotate: rotate,
    getShape: getShape,
    wallKick: wallKick,
    reset: reset,
    get TYPES() { return TYPES; },
    get SHAPES() { return SHAPES; }
  };
})();
