/* Laser Reflect — Level definitions

   Each level:
   - emitter: { x, y, dir } — laser source position and direction
   - target: { x, y } — goal cell
   - walls: [{ x, y }] — blocked cells
   - mirrors: number of mirrors available to place
   - fixed: [{ x, y, type }] — pre-placed mirrors (cannot move)
*/

var Levels = (function () {

  var data = [
    // Level 1: Simple straight shot with one mirror
    {
      emitter: { x: 0, y: 3, dir: 'right' },
      target: { x: 3, y: 0 },
      walls: [],
      mirrors: 1,
      fixed: [],
    },
    // Level 2: Two mirrors needed
    {
      emitter: { x: 0, y: 0, dir: 'down' },
      target: { x: 7, y: 7 },
      walls: [],
      mirrors: 2,
      fixed: [],
    },
    // Level 3: Navigate around a wall
    {
      emitter: { x: 0, y: 4, dir: 'right' },
      target: { x: 7, y: 4 },
      walls: [{ x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }],
      mirrors: 2,
      fixed: [],
    },
    // Level 4: Fixed mirror + player mirrors
    {
      emitter: { x: 0, y: 0, dir: 'right' },
      target: { x: 0, y: 7 },
      walls: [],
      mirrors: 1,
      fixed: [{ x: 7, y: 0, type: '\\' }],
    },
    // Level 5: Zigzag path
    {
      emitter: { x: 0, y: 2, dir: 'right' },
      target: { x: 6, y: 6 },
      walls: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }],
      mirrors: 3,
      fixed: [],
    },
    // Level 6: Tight corridor
    {
      emitter: { x: 1, y: 0, dir: 'down' },
      target: { x: 6, y: 0 },
      walls: [{ x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 }],
      mirrors: 2,
      fixed: [],
    },
    // Level 7: Multiple fixed mirrors
    {
      emitter: { x: 0, y: 7, dir: 'right' },
      target: { x: 7, y: 0 },
      walls: [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 4 }],
      mirrors: 2,
      fixed: [{ x: 2, y: 7, type: '/' }],
    },
    // Level 8: Complex routing
    {
      emitter: { x: 7, y: 0, dir: 'down' },
      target: { x: 0, y: 0 },
      walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }],
      mirrors: 3,
      fixed: [{ x: 7, y: 5, type: '\\' }],
    },
    // Level 9: Maze-like
    {
      emitter: { x: 0, y: 0, dir: 'right' },
      target: { x: 7, y: 7 },
      walls: [
        { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 },
        { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 },
      ],
      mirrors: 4,
      fixed: [],
    },
    // Level 10: Grand finale
    {
      emitter: { x: 0, y: 4, dir: 'right' },
      target: { x: 7, y: 3 },
      walls: [
        { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
        { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 },
      ],
      mirrors: 4,
      fixed: [{ x: 3, y: 6, type: '/' }],
    },
  ];

  function getLevel(n) {
    if (n < 0 || n >= data.length) return null;
    return data[n];
  }

  return {
    getLevel: getLevel,
    get count() { return data.length; },
  };
})();
