/* Shadow Match — Shape Generation & Transforms

   Generates polyomino-like shapes on a grid.
   Provides rotation, mirroring, and distractor creation.

   A shape is an array of {r, c} cell positions, normalized
   so the minimum row and column are 0.
*/

var Shapes = (function () {

  // --- Polyomino generation ---

  // Pre-defined polyomino sets by cell count for consistent quality
  var POLYOMINOES = {
    3: [
      [[0,0],[0,1],[0,2]],           // I horizontal
      [[0,0],[1,0],[2,0]],           // I vertical
      [[0,0],[0,1],[1,0]],           // L corner
      [[0,0],[0,1],[1,1]],           // S shape
      [[0,1],[1,0],[1,1]],           // reverse L
      [[0,0],[1,0],[1,1]],           // step
    ],
    4: [
      [[0,0],[0,1],[0,2],[0,3]],     // I
      [[0,0],[0,1],[1,0],[1,1]],     // O
      [[0,0],[0,1],[0,2],[1,0]],     // L
      [[0,0],[0,1],[0,2],[1,2]],     // J
      [[0,0],[0,1],[1,1],[1,2]],     // S
      [[0,1],[0,2],[1,0],[1,1]],     // Z
      [[0,0],[0,1],[0,2],[1,1]],     // T
      [[0,0],[1,0],[1,1],[2,1]],     // S vertical
      [[0,1],[1,0],[1,1],[2,0]],     // Z vertical
    ],
    5: [
      [[0,0],[0,1],[0,2],[0,3],[0,4]],   // I5
      [[0,0],[0,1],[0,2],[1,0],[1,1]],   // P
      [[0,0],[0,1],[0,2],[1,2],[1,3]],   // N
      [[0,0],[0,1],[1,1],[1,2],[2,2]],   // W
      [[0,0],[0,1],[0,2],[1,1],[2,1]],   // plus arm
      [[0,1],[1,0],[1,1],[1,2],[2,1]],   // plus
      [[0,0],[0,1],[0,2],[0,3],[1,0]],   // L5
      [[0,0],[0,1],[0,2],[0,3],[1,3]],   // J5
      [[0,0],[0,1],[1,1],[2,1],[2,2]],   // zigzag
      [[0,0],[1,0],[1,1],[1,2],[2,2]],   // stair
      [[0,0],[0,1],[0,2],[1,0],[2,0]],   // big L
      [[0,0],[0,1],[1,0],[2,0],[2,1]],   // U shape
    ],
    6: [
      [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]],   // 2x3 block
      [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1]],   // L6
      [[0,0],[0,1],[1,1],[1,2],[2,2],[2,3]],   // long zigzag
      [[0,1],[1,0],[1,1],[1,2],[2,0],[2,1]],   // fat T
      [[0,0],[0,1],[0,2],[1,2],[2,1],[2,2]],   // hook
      [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],   // 3x2 block
      [[0,0],[0,1],[0,2],[1,1],[2,0],[2,1]],   // arrow
      [[0,1],[0,2],[1,0],[1,1],[2,1],[2,2]],   // snake
      [[0,0],[0,1],[0,2],[0,3],[1,1],[1,2]],   // bridge
      [[0,0],[0,1],[1,1],[1,2],[2,0],[2,1]],   // S6
    ],
    7: [
      [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,1]],   // arrow7
      [[0,1],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],   // fat block
      [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2]],   // wide L
      [[0,0],[0,1],[0,2],[1,2],[2,0],[2,1],[2,2]],   // C shape
      [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1],[2,2]],   // boot
      [[0,0],[0,1],[0,2],[1,1],[2,0],[2,1],[2,2]],   // hourglass
      [[0,0],[0,1],[0,2],[0,3],[1,1],[2,0],[2,1]],   // complex
      [[0,0],[0,1],[1,1],[1,2],[1,3],[2,2],[2,3]],   // staircase
    ],
  };

  /**
   * Normalize a shape so min row=0, min col=0
   */
  function normalize(cells) {
    var minR = Infinity, minC = Infinity;
    for (var i = 0; i < cells.length; i++) {
      if (cells[i][0] < minR) minR = cells[i][0];
      if (cells[i][1] < minC) minC = cells[i][1];
    }
    var out = [];
    for (var j = 0; j < cells.length; j++) {
      out.push([cells[j][0] - minR, cells[j][1] - minC]);
    }
    // Sort for consistent comparison
    out.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    return out;
  }

  /**
   * Convert shape to a string key for comparison
   */
  function shapeKey(cells) {
    var n = normalize(cells);
    return n.map(function (c) { return c[0] + ',' + c[1]; }).join('|');
  }

  /**
   * Check if two shapes are identical (after normalization)
   */
  function shapesEqual(a, b) {
    return shapeKey(a) === shapeKey(b);
  }

  /**
   * Rotate shape 90° clockwise: (r, c) → (c, maxR - r)
   */
  function rotate90(cells) {
    var maxR = 0;
    for (var i = 0; i < cells.length; i++) {
      if (cells[i][0] > maxR) maxR = cells[i][0];
    }
    var out = [];
    for (var j = 0; j < cells.length; j++) {
      out.push([cells[j][1], maxR - cells[j][0]]);
    }
    return normalize(out);
  }

  /**
   * Rotate shape 180°
   */
  function rotate180(cells) {
    return rotate90(rotate90(cells));
  }

  /**
   * Rotate shape 270° (or 90° counter-clockwise)
   */
  function rotate270(cells) {
    return rotate90(rotate90(rotate90(cells)));
  }

  /**
   * Mirror shape horizontally: (r, c) → (r, maxC - c)
   */
  function mirrorH(cells) {
    var maxC = 0;
    for (var i = 0; i < cells.length; i++) {
      if (cells[i][1] > maxC) maxC = cells[i][1];
    }
    var out = [];
    for (var j = 0; j < cells.length; j++) {
      out.push([cells[j][0], maxC - cells[j][1]]);
    }
    return normalize(out);
  }

  /**
   * Mirror shape vertically: (r, c) → (maxR - r, c)
   */
  function mirrorV(cells) {
    var maxR = 0;
    for (var i = 0; i < cells.length; i++) {
      if (cells[i][0] > maxR) maxR = cells[i][0];
    }
    var out = [];
    for (var j = 0; j < cells.length; j++) {
      out.push([maxR - cells[j][0], cells[j][1]]);
    }
    return normalize(out);
  }

  /**
   * Remove one random cell from a shape (must keep connectivity)
   */
  function removeCell(cells) {
    var n = normalize(cells);
    // Try random cells until we find one that keeps shape connected
    var indices = [];
    for (var i = 0; i < n.length; i++) indices.push(i);
    shuffle(indices);

    for (var t = 0; t < indices.length; t++) {
      var idx = indices[t];
      var candidate = [];
      for (var j = 0; j < n.length; j++) {
        if (j !== idx) candidate.push([n[j][0], n[j][1]]);
      }
      if (isConnected(candidate)) {
        return normalize(candidate);
      }
    }
    // Fallback: just remove last
    return normalize(n.slice(0, n.length - 1));
  }

  /**
   * Add one random cell adjacent to the shape
   */
  function addCell(cells) {
    var n = normalize(cells);
    var set = {};
    for (var i = 0; i < n.length; i++) {
      set[n[i][0] + ',' + n[i][1]] = true;
    }

    // Find all empty neighbors
    var neighbors = [];
    var dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    for (var j = 0; j < n.length; j++) {
      for (var d = 0; d < dirs.length; d++) {
        var nr = n[j][0] + dirs[d][0];
        var nc = n[j][1] + dirs[d][1];
        var key = nr + ',' + nc;
        if (!set[key] && nr >= 0 && nc >= 0 && nr < Config.gridRows && nc < Config.gridCols) {
          set[key] = true; // prevent duplicates
          neighbors.push([nr, nc]);
        }
      }
    }

    if (neighbors.length === 0) return n;
    var pick = neighbors[randInt(0, neighbors.length - 1)];
    var result = n.slice();
    result.push(pick);
    return normalize(result);
  }

  /**
   * Check if a set of cells is connected (BFS)
   */
  function isConnected(cells) {
    if (cells.length <= 1) return true;
    var set = {};
    for (var i = 0; i < cells.length; i++) {
      set[cells[i][0] + ',' + cells[i][1]] = true;
    }
    var visited = {};
    var queue = [cells[0][0] + ',' + cells[0][1]];
    visited[queue[0]] = true;
    var count = 0;
    var dirs = [[0,1],[0,-1],[1,0],[-1,0]];

    while (queue.length > 0) {
      var cur = queue.shift();
      count++;
      var parts = cur.split(',');
      var r = parseInt(parts[0]);
      var c = parseInt(parts[1]);
      for (var d = 0; d < dirs.length; d++) {
        var key = (r + dirs[d][0]) + ',' + (c + dirs[d][1]);
        if (set[key] && !visited[key]) {
          visited[key] = true;
          queue.push(key);
        }
      }
    }
    return count === cells.length;
  }

  /**
   * Fisher-Yates shuffle
   */
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = randInt(0, i);
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  /**
   * Pick a random shape with the given cell count
   */
  function randomShape(cellCount) {
    var count = clamp(cellCount, 3, 7);
    var pool = POLYOMINOES[count];
    if (!pool || pool.length === 0) pool = POLYOMINOES[5];
    var idx = randInt(0, pool.length - 1);
    return normalize(pool[idx].slice());
  }

  /**
   * Generate all unique transforms of a shape
   */
  function allTransforms(cells) {
    var transforms = [
      rotate90(cells),
      rotate180(cells),
      rotate270(cells),
      mirrorH(cells),
      mirrorV(cells),
      mirrorH(rotate90(cells)),
      mirrorV(rotate90(cells)),
    ];
    return transforms;
  }

  /**
   * Create distractors for a given shape based on difficulty mode
   * Returns array of 3 distractor shapes (all different from original and each other)
   */
  function createDistractors(original, mode) {
    var distractors = [];
    var usedKeys = {};
    var origKey = shapeKey(original);
    usedKeys[origKey] = true;

    var transforms = allTransforms(original);

    // Filter out transforms identical to original
    var validTransforms = [];
    for (var i = 0; i < transforms.length; i++) {
      var k = shapeKey(transforms[i]);
      if (!usedKeys[k]) {
        validTransforms.push(transforms[i]);
        usedKeys[k] = true;
      }
    }

    // Reset usedKeys for actual selection (keep origKey blocked)
    usedKeys = {};
    usedKeys[origKey] = true;

    if (mode === 'easy') {
      // Only 90° rotations
      var easyPool = [rotate90(original), rotate180(original), rotate270(original)];
      addFromPool(easyPool, distractors, usedKeys, 3);
    } else if (mode === 'medium') {
      // Rotations + mirrors
      var medPool = [
        rotate90(original), rotate180(original), rotate270(original),
        mirrorH(original), mirrorV(original),
      ];
      addFromPool(medPool, distractors, usedKeys, 3);
    } else if (mode === 'hard') {
      // Rotations + mirrors + cell modifications
      var hardPool = [
        rotate90(original), mirrorH(original),
        mirrorH(rotate90(original)),
      ];
      addFromPool(hardPool, distractors, usedKeys, 2);
      // Add a cell-modified version
      var modified = Math.random() < 0.5 ? removeCell(original) : addCell(original);
      addFromPool([modified], distractors, usedKeys, 1);
    } else {
      // Expert: very subtle — mirrors and single-cell changes
      var expertPool = [
        mirrorH(original),
        mirrorV(original),
      ];
      addFromPool(expertPool, distractors, usedKeys, 1);
      // Two cell-modified versions
      var mod1 = removeCell(original);
      var mod2 = addCell(original);
      addFromPool([mod1, mod2], distractors, usedKeys, 2);
    }

    // If we still need more distractors, fill with any unique transform
    if (distractors.length < 3) {
      var fallback = allTransforms(original);
      // Also try cell modifications
      for (var f = 0; f < 5; f++) {
        fallback.push(removeCell(original));
        fallback.push(addCell(original));
      }
      addFromPool(fallback, distractors, usedKeys, 3 - distractors.length);
    }

    // Last resort: generate random shapes of same size
    while (distractors.length < 3) {
      var rnd = randomShape(original.length);
      var rk = shapeKey(rnd);
      if (!usedKeys[rk]) {
        usedKeys[rk] = true;
        distractors.push(rnd);
      }
    }

    return distractors;
  }

  /**
   * Add unique shapes from pool to distractors array
   */
  function addFromPool(pool, distractors, usedKeys, count) {
    shuffle(pool);
    for (var i = 0; i < pool.length && distractors.length < distractors.length + count; i++) {
      var k = shapeKey(pool[i]);
      if (!usedKeys[k]) {
        usedKeys[k] = true;
        distractors.push(pool[i]);
        if (distractors.length >= count + (distractors.length - distractors.length)) break;
      }
      if (distractors.length >= 3) break;
    }
  }

  /**
   * Get level config for a given level number (1-based)
   */
  function getLevelConfig(level) {
    var idx = Math.min(level - 1, Config.levels.length - 1);
    return Config.levels[idx];
  }

  /**
   * Generate a round: original shape + 4 options (1 correct, 3 distractors)
   * Returns { original, options, correctIndex }
   */
  function generateRound(level) {
    var cfg = getLevelConfig(level);
    var original = randomShape(cfg.cells);
    var distractors = createDistractors(original, cfg.distractorMode);

    // Place correct answer at random position
    var correctIndex = randInt(0, Config.optionCount - 1);
    var options = [];
    var dIdx = 0;
    for (var i = 0; i < Config.optionCount; i++) {
      if (i === correctIndex) {
        options.push(normalize(original.slice()));
      } else {
        options.push(distractors[dIdx]);
        dIdx++;
      }
    }

    return {
      original: normalize(original),
      options: options,
      correctIndex: correctIndex,
      displayTime: cfg.displayTime,
    };
  }

  /**
   * Get shape bounding box { rows, cols }
   */
  function getBounds(cells) {
    var maxR = 0, maxC = 0;
    for (var i = 0; i < cells.length; i++) {
      if (cells[i][0] > maxR) maxR = cells[i][0];
      if (cells[i][1] > maxC) maxC = cells[i][1];
    }
    return { rows: maxR + 1, cols: maxC + 1 };
  }

  return {
    randomShape: randomShape,
    normalize: normalize,
    rotate90: rotate90,
    rotate180: rotate180,
    rotate270: rotate270,
    mirrorH: mirrorH,
    mirrorV: mirrorV,
    shapesEqual: shapesEqual,
    shapeKey: shapeKey,
    createDistractors: createDistractors,
    generateRound: generateRound,
    getLevelConfig: getLevelConfig,
    getBounds: getBounds,
  };
})();
