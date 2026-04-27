/* Bounce Architect — Level Definitions

   Each level defines:
   - ball: { x, y }           — ball start position
   - goal: { x, y }           — goal center
   - pads: number             — how many pads the player can place
   - obstacles: [{ x, y, w, h }]  — blocking rectangles
   - walls: [{ x1, y1, x2, y2 }]  — optional angled walls (line segments)

   All coordinates are in canvas space (400×560).
   Levels are designed to be solvable by construction.
*/

var Levels = (function () {

  var data = [
    // Level 1: Tutorial — ball drops straight into goal, 0 pads needed
    {
      ball: { x: 200, y: 60 },
      goal: { x: 200, y: 480 },
      pads: 0,
      obstacles: [],
    },

    // Level 2: Goal offset right, 1 pad to redirect
    {
      ball: { x: 200, y: 60 },
      goal: { x: 320, y: 480 },
      pads: 1,
      obstacles: [],
    },

    // Level 3: Wall blocks direct path, 1 pad to bounce around
    {
      ball: { x: 200, y: 60 },
      goal: { x: 200, y: 480 },
      pads: 1,
      obstacles: [
        { x: 120, y: 260, w: 160, h: 16 },
      ],
    },

    // Level 4: 2 pads, goal in corner, obstacle in middle
    {
      ball: { x: 80, y: 60 },
      goal: { x: 320, y: 480 },
      pads: 2,
      obstacles: [
        { x: 160, y: 200, w: 80, h: 16 },
        { x: 240, y: 360, w: 16, h: 100 },
      ],
    },

    // Level 5: 2 pads, zigzag path needed
    {
      ball: { x: 60, y: 60 },
      goal: { x: 60, y: 480 },
      pads: 2,
      obstacles: [
        { x: 0, y: 200, w: 200, h: 16 },
        { x: 200, y: 360, w: 200, h: 16 },
      ],
    },

    // Level 6: 2 pads, narrow corridor
    {
      ball: { x: 320, y: 60 },
      goal: { x: 80, y: 480 },
      pads: 2,
      obstacles: [
        { x: 160, y: 140, w: 16, h: 160 },
        { x: 100, y: 340, w: 200, h: 16 },
      ],
    },

    // Level 7: 3 pads, multiple bounces through obstacles
    {
      ball: { x: 200, y: 50 },
      goal: { x: 200, y: 500 },
      pads: 3,
      obstacles: [
        { x: 80, y: 160, w: 240, h: 16 },
        { x: 0, y: 300, w: 160, h: 16 },
        { x: 240, y: 300, w: 160, h: 16 },
        { x: 120, y: 420, w: 160, h: 16 },
      ],
    },

    // Level 8: 3 pads, side-to-side bouncing
    {
      ball: { x: 40, y: 50 },
      goal: { x: 360, y: 500 },
      pads: 3,
      obstacles: [
        { x: 120, y: 120, w: 16, h: 120 },
        { x: 264, y: 240, w: 16, h: 120 },
        { x: 120, y: 380, w: 16, h: 120 },
      ],
    },

    // Level 9: 3 pads, maze-like
    {
      ball: { x: 340, y: 50 },
      goal: { x: 60, y: 500 },
      pads: 3,
      obstacles: [
        { x: 200, y: 100, w: 200, h: 16 },
        { x: 0, y: 220, w: 240, h: 16 },
        { x: 160, y: 340, w: 240, h: 16 },
        { x: 0, y: 440, w: 160, h: 16 },
      ],
    },

    // Level 10: 4 pads, tight angles
    {
      ball: { x: 200, y: 40 },
      goal: { x: 200, y: 520 },
      pads: 4,
      obstacles: [
        { x: 60, y: 120, w: 280, h: 16 },
        { x: 100, y: 240, w: 16, h: 100 },
        { x: 284, y: 240, w: 16, h: 100 },
        { x: 60, y: 360, w: 280, h: 16 },
        { x: 160, y: 440, w: 80, h: 16 },
      ],
    },

    // Level 11: 4 pads, winding path
    {
      ball: { x: 60, y: 40 },
      goal: { x: 340, y: 520 },
      pads: 4,
      obstacles: [
        { x: 0, y: 130, w: 280, h: 16 },
        { x: 120, y: 230, w: 280, h: 16 },
        { x: 0, y: 330, w: 280, h: 16 },
        { x: 120, y: 430, w: 280, h: 16 },
      ],
    },

    // Level 12: 5 pads, ultimate challenge
    {
      ball: { x: 200, y: 30 },
      goal: { x: 200, y: 530 },
      pads: 5,
      obstacles: [
        { x: 80, y: 100, w: 240, h: 12 },
        { x: 0, y: 190, w: 160, h: 12 },
        { x: 240, y: 190, w: 160, h: 12 },
        { x: 120, y: 280, w: 160, h: 12 },
        { x: 0, y: 370, w: 180, h: 12 },
        { x: 220, y: 370, w: 180, h: 12 },
        { x: 140, y: 460, w: 120, h: 12 },
      ],
    },
  ];

  function get(levelNum) {
    var idx = clamp(levelNum - 1, 0, data.length - 1);
    // Deep copy to avoid mutation
    var src = data[idx];
    var lvl = {
      ball: { x: src.ball.x, y: src.ball.y },
      goal: { x: src.goal.x, y: src.goal.y },
      pads: src.pads,
      obstacles: [],
    };
    for (var i = 0; i < src.obstacles.length; i++) {
      var o = src.obstacles[i];
      lvl.obstacles.push({ x: o.x, y: o.y, w: o.w, h: o.h });
    }
    return lvl;
  }

  return {
    get: get,
    get count() { return data.length; },
  };
})();
