/* Gravity Flip — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 300,

  // Player
  playerX: 80,            // fixed horizontal position
  playerSize: 12,         // half-size of the square
  gravity: 400,           // px/s² acceleration toward floor/ceiling
  terminalVel: 220,       // max fall speed
  tapImpulse: 160,        // instant velocity on quick tap
  holdImpulseRate: 600,   // velocity added per second while holding
  maxHoldVel: 260,        // max velocity from holding
  dampingOnRelease: 0.7,  // velocity multiplier when releasing hold

  // Squish animation on flip
  squishDuration: 0.18,   // seconds
  squishScaleX: 0.6,      // compressed axis
  squishScaleY: 1.5,      // stretched axis

  // Trail
  trailLength: 12,        // number of trail positions
  trailSpacing: 0.016,    // seconds between trail samples

  // Glow pulse
  glowBase: 8,
  glowMax: 18,
  glowPulseSpeed: 4,

  // Corridor
  corridorSpeed: 140,     // px/s base scroll speed
  corridorSpeedMax: 320,  // max scroll speed
  corridorAccel: 0.8,     // speed increase per second
  wallThickness: 30,      // base wall thickness (top + bottom)
  wallMin: 20,            // minimum wall thickness
  wallMax: 70,            // maximum wall thickness
  gapWidth: 100,          // width of gaps in walls
  gapWidthMin: 60,        // minimum gap width at high difficulty
  gapShrinkRate: 0.15,    // gap shrinks per 100 distance
  segmentWidth: 60,       // width of each corridor segment
  safeZoneChance: 0.12,   // chance of a wider safe zone segment

  // Gap generation
  gapMinSpacing: 180,     // min px between gaps
  gapMaxSpacing: 320,     // max px between gaps

  // Orbs (collectibles in gaps)
  orbRadius: 6,
  orbPoints: 5,
  orbSpawnChance: 0.7,    // chance an orb spawns in a gap

  // Neon colors — cycle through these
  neonColors: [
    '#00ffcc',  // cyan-green
    '#ff00ff',  // magenta
    '#00ccff',  // sky blue
    '#ffff00',  // yellow
    '#ff6600',  // orange
    '#cc00ff',  // purple
  ],
  playerColor: '#00ffcc',
  wallColor: '#0044aa',
  wallEdgeColor: '#00aaff',
  bgColor: '#050510',
  bgLineColor: '#0a0a20',

  // Color cycling
  hueShiftSpeed: 15,      // degrees per second

  // Speed lines
  speedLineCount: 20,
  speedLineColor: '#ffffff',
  speedLineAlpha: 0.04,

  // Camera
  cameraOffsetSmooth: 4,  // vertical camera follow speed

  // Particles
  flipParticleCount: 10,
  flipParticleSpeed: 180,
  flipParticleLife: 0.35,
  flipParticleSize: 3,

  // Death
  shakeIntensity: 8,
  shakeDuration: 0.3,

  // Scoring
  scoreRate: 10,          // points per second of survival (distance-based)
};

// Derived
Config.corridorTop = 0;
Config.corridorBottom = Config.canvasH;
Config.playerStartY = Config.canvasH / 2;
