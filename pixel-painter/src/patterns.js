/* Pixel Painter — Pre-defined Pixel Art Patterns

   Each pattern is an 8×8 grid where:
   - 0 = empty
   - 1-6 = color index (1=red, 2=orange, 3=yellow, 4=green, 5=blue, 6=purple)

   Patterns are grouped by difficulty:
   - Easy (1-2 colors): simple shapes
   - Medium (3-4 colors): letters, objects
   - Hard (5-6 colors): detailed pixel art
*/

var Patterns = (function () {

  // --- EASY patterns (1-2 colors) ---

  var easy = [
    { name: 'Heart', data: [
      [0,0,0,0,0,0,0,0],
      [0,1,1,0,0,1,1,0],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,0,0,0,0,0],
    ]},
    { name: 'Star', data: [
      [0,0,0,3,3,0,0,0],
      [0,0,0,3,3,0,0,0],
      [0,3,3,3,3,3,3,0],
      [3,3,3,3,3,3,3,3],
      [0,0,3,3,3,3,0,0],
      [0,3,3,0,0,3,3,0],
      [0,3,0,0,0,0,3,0],
      [0,0,0,0,0,0,0,0],
    ]},
    { name: 'Arrow Up', data: [
      [0,0,0,4,4,0,0,0],
      [0,0,4,4,4,4,0,0],
      [0,4,4,4,4,4,4,0],
      [4,4,0,4,4,0,4,4],
      [0,0,0,4,4,0,0,0],
      [0,0,0,4,4,0,0,0],
      [0,0,0,4,4,0,0,0],
      [0,0,0,4,4,0,0,0],
    ]},
    { name: 'Cross', data: [
      [0,0,0,5,5,0,0,0],
      [0,0,0,5,5,0,0,0],
      [0,0,0,5,5,0,0,0],
      [5,5,5,5,5,5,5,5],
      [5,5,5,5,5,5,5,5],
      [0,0,0,5,5,0,0,0],
      [0,0,0,5,5,0,0,0],
      [0,0,0,5,5,0,0,0],
    ]},
    { name: 'Diamond', data: [
      [0,0,0,6,6,0,0,0],
      [0,0,6,6,6,6,0,0],
      [0,6,6,6,6,6,6,0],
      [6,6,6,6,6,6,6,6],
      [6,6,6,6,6,6,6,6],
      [0,6,6,6,6,6,6,0],
      [0,0,6,6,6,6,0,0],
      [0,0,0,6,6,0,0,0],
    ]},
    { name: 'Circle', data: [
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0],
      [1,1,1,0,0,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,1,0,0,1,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],
    ]},
  ];

  // --- MEDIUM patterns (3-4 colors) ---

  var medium = [
    { name: 'Smiley', data: [
      [0,0,3,3,3,3,0,0],
      [0,3,3,3,3,3,3,0],
      [3,3,5,3,3,5,3,3],
      [3,3,5,3,3,5,3,3],
      [3,3,3,3,3,3,3,3],
      [3,1,3,3,3,3,1,3],
      [0,3,1,1,1,1,3,0],
      [0,0,3,3,3,3,0,0],
    ]},
    { name: 'House', data: [
      [0,0,0,1,1,0,0,0],
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1],
      [2,2,2,5,5,2,2,2],
      [2,2,2,5,5,2,2,2],
      [2,2,2,5,5,2,2,2],
      [2,2,2,2,2,2,2,2],
    ]},
    { name: 'Tree', data: [
      [0,0,0,4,4,0,0,0],
      [0,0,4,4,4,4,0,0],
      [0,4,4,4,4,4,4,0],
      [4,4,4,4,4,4,4,4],
      [0,4,4,4,4,4,4,0],
      [0,0,0,2,2,0,0,0],
      [0,0,0,2,2,0,0,0],
      [0,0,0,2,2,0,0,0],
    ]},
    { name: 'Letter A', data: [
      [0,0,1,1,1,1,0,0],
      [0,1,1,0,0,1,1,0],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,0,0,0,0,1,1],
      [1,1,0,0,0,0,1,1],
      [0,0,0,0,0,0,0,0],
    ]},
    { name: 'Boat', data: [
      [0,0,0,0,2,0,0,0],
      [0,0,0,0,2,0,0,0],
      [0,0,0,0,2,2,2,0],
      [0,0,0,0,2,0,0,0],
      [0,5,5,5,5,5,5,0],
      [5,5,5,5,5,5,5,5],
      [0,5,5,5,5,5,5,0],
      [0,0,5,5,5,5,0,0],
    ]},
    { name: 'Crown', data: [
      [0,0,0,0,0,0,0,0],
      [0,3,0,3,3,0,3,0],
      [0,3,3,3,3,3,3,0],
      [0,3,3,3,3,3,3,0],
      [0,3,3,3,3,3,3,0],
      [0,3,1,3,3,1,3,0],
      [0,3,3,3,3,3,3,0],
      [0,0,0,0,0,0,0,0],
    ]},
    { name: 'Umbrella', data: [
      [0,0,5,5,5,5,0,0],
      [0,5,5,5,5,5,5,0],
      [5,5,5,5,5,5,5,5],
      [0,0,0,6,6,0,0,0],
      [0,0,0,6,6,0,0,0],
      [0,0,0,6,6,0,0,0],
      [0,0,0,6,6,0,0,0],
      [0,0,6,6,0,0,0,0],
    ]},
  ];

  // --- HARD patterns (5-6 colors) ---

  var hard = [
    { name: 'Rocket', data: [
      [0,0,0,1,1,0,0,0],
      [0,0,1,6,6,1,0,0],
      [0,0,5,6,6,5,0,0],
      [0,0,5,6,6,5,0,0],
      [0,0,5,5,5,5,0,0],
      [0,1,5,5,5,5,1,0],
      [1,1,0,3,3,0,1,1],
      [0,0,0,2,2,0,0,0],
    ]},
    { name: 'Fish', data: [
      [0,0,0,5,5,0,0,0],
      [0,0,5,5,5,5,4,0],
      [0,5,5,3,5,5,5,4],
      [5,5,5,5,5,5,5,4],
      [5,5,5,5,5,5,5,4],
      [0,5,5,5,5,5,5,4],
      [0,0,5,5,5,5,4,0],
      [0,0,0,5,5,0,0,0],
    ]},
    { name: 'Mushroom', data: [
      [0,0,1,1,1,1,0,0],
      [0,1,1,6,6,1,1,0],
      [1,1,6,6,6,6,1,1],
      [1,6,6,1,1,6,6,1],
      [0,0,2,2,2,2,0,0],
      [0,0,2,6,6,2,0,0],
      [0,0,2,2,2,2,0,0],
      [0,4,4,4,4,4,4,0],
    ]},
    { name: 'Flower', data: [
      [0,0,1,1,1,1,0,0],
      [0,1,1,3,3,1,1,0],
      [1,1,3,3,3,3,1,1],
      [1,3,3,2,2,3,3,1],
      [1,3,3,2,2,3,3,1],
      [0,1,3,3,3,3,1,0],
      [0,0,0,4,4,0,0,0],
      [0,0,4,4,4,4,0,0],
    ]},
    { name: 'Alien', data: [
      [0,0,4,4,4,4,0,0],
      [0,4,4,4,4,4,4,0],
      [4,4,3,4,4,3,4,4],
      [4,4,3,4,4,3,4,4],
      [4,4,4,6,6,4,4,4],
      [0,4,4,4,4,4,4,0],
      [0,0,4,0,0,4,0,0],
      [0,4,0,0,0,0,4,0],
    ]},
    { name: 'Castle', data: [
      [1,0,1,0,0,1,0,1],
      [1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,0],
      [0,1,5,1,1,5,1,0],
      [0,1,5,1,1,5,1,0],
      [0,1,1,1,1,1,1,0],
      [0,1,1,2,2,1,1,0],
      [0,1,1,2,2,1,1,0],
    ]},
    { name: 'Butterfly', data: [
      [6,6,0,0,0,0,5,5],
      [6,6,6,0,0,5,5,5],
      [6,3,6,1,1,5,3,5],
      [6,6,6,1,1,5,5,5],
      [6,6,6,1,1,5,5,5],
      [6,3,6,1,1,5,3,5],
      [6,6,6,0,0,5,5,5],
      [6,6,0,0,0,0,5,5],
    ]},
  ];

  var allPatterns = { easy: easy, medium: medium, hard: hard };

  // Track used patterns per session to avoid repeats
  var usedEasy = [];
  var usedMedium = [];
  var usedHard = [];

  /** Reset used tracking */
  function resetUsed() {
    usedEasy = [];
    usedMedium = [];
    usedHard = [];
  }

  /** Pick a random pattern from a tier, avoiding recent repeats */
  function pickFromTier(tier, usedList) {
    var pool = allPatterns[tier];
    // Filter out recently used
    var available = [];
    for (var i = 0; i < pool.length; i++) {
      if (usedList.indexOf(i) === -1) available.push(i);
    }
    // If all used, reset
    if (available.length === 0) {
      usedList.length = 0;
      for (var j = 0; j < pool.length; j++) available.push(j);
    }
    var idx = available[Math.floor(Math.random() * available.length)];
    usedList.push(idx);
    return pool[idx];
  }

  /** Get a pattern appropriate for the given level */
  function getPattern(level) {
    if (level <= Config.easyMaxLevel) {
      return pickFromTier('easy', usedEasy);
    } else if (level <= Config.mediumMaxLevel) {
      return pickFromTier('medium', usedMedium);
    } else {
      return pickFromTier('hard', usedHard);
    }
  }

  /** Count non-empty cells in a pattern */
  function countFilled(data) {
    var count = 0;
    for (var y = 0; y < data.length; y++) {
      for (var x = 0; x < data[y].length; x++) {
        if (data[y][x] !== 0) count++;
      }
    }
    return count;
  }

  /** Compare player grid to target, return accuracy info */
  function compare(target, player) {
    var targetFilled = 0;
    var correct = 0;

    for (var y = 0; y < Config.rows; y++) {
      for (var x = 0; x < Config.cols; x++) {
        var t = target[y][x];
        var p = player[y][x];
        if (t !== 0) {
          targetFilled++;
          if (p === t) correct++;
        }
      }
    }

    var accuracy = targetFilled > 0 ? Math.round((correct / targetFilled) * 100) : 0;
    return {
      correct: correct,
      total: targetFilled,
      accuracy: accuracy,
      passed: accuracy >= Config.passThreshold,
    };
  }

  /** Create a deep copy of a pattern's data */
  function cloneData(data) {
    var copy = [];
    for (var y = 0; y < data.length; y++) {
      copy[y] = [];
      for (var x = 0; x < data[y].length; x++) {
        copy[y][x] = data[y][x];
      }
    }
    return copy;
  }

  /** Create an empty 8×8 grid */
  function createEmpty() {
    var grid = [];
    for (var y = 0; y < Config.rows; y++) {
      grid[y] = [];
      for (var x = 0; x < Config.cols; x++) {
        grid[y][x] = 0;
      }
    }
    return grid;
  }

  return {
    getPattern: getPattern,
    countFilled: countFilled,
    compare: compare,
    cloneData: cloneData,
    createEmpty: createEmpty,
    resetUsed: resetUsed,
  };
})();
