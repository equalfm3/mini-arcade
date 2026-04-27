/* Color Switch — Configuration */

var Config = {
  // Canvas
  canvasW: 320,
  canvasH: 480,

  // Colors (4 game colors)
  colors: ['#ff4444', '#ffd700', '#44ff66', '#c084fc'],
  colorNames: ['red', 'yellow', 'green', 'purple'],

  // Ball
  ballRadius: 12,
  gravity: 550,           // px/s² downward (reduced for more float time)
  jumpTapForce: -180,     // px/s initial impulse on press (small hop)
  jumpHoldAccel: -900,    // px/s² upward boost while holding
  jumpHoldMax: 0.22,      // max seconds the hold boost applies
  jumpMinVy: -380,        // velocity cap — can't go faster than this upward
  maxFallSpeed: 350,      // terminal velocity (slower fall)

  // Obstacles
  ringRadius: 60,         // radius of rotating ring obstacles (slightly larger = more room)
  ringThickness: 12,      // thickness of ring arcs (thinner = easier to pass)
  rotationSpeed: 0.9,     // radians/s base rotation speed (much slower start)
  rotationSpeedMax: 2.2,  // max rotation speed at high scores (lower ceiling)
  rotationRampRate: 0.015,// speed increase per obstacle (gentler ramp)
  obstacleSpacing: 280,   // vertical distance between obstacles (more breathing room)
  firstObstacleY: -320,   // Y of first obstacle (further away = more warm-up time)
  easyObstacleCount: 5,   // first N obstacles are rings only

  // Cross obstacle
  crossArmLength: 45,
  crossArmWidth: 12,

  // Bar obstacle
  barWidth: 140,
  barHeight: 12,

  // Color switch star
  starSize: 18,           // radius of the color switch pickup (bigger = easier to see/collect)
  starPulseSpeed: 3,      // pulse animation speed

  // Camera
  cameraOffset: 0.6,      // ball stays in lower 60% of screen
  cameraSmooth: 5,        // camera lerp speed

  // Scoring
  pointsPerObstacle: 1,

  // Background
  bgColor: '#0a0a16',
  bgStarCount: 50,

  // UI
  textColor: '#e0e0e0',
  hudColor: '#ffd700',
  starColor: '#ffffff',
};

// Derived
Config.ringInner = Config.ringRadius - Config.ringThickness / 2;
Config.ringOuter = Config.ringRadius + Config.ringThickness / 2;
