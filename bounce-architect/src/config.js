/* Bounce Architect — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 560,

  // Ball
  ballRadius: 8,
  ballGravity: 420,         // px/s²
  ballBounceLoss: 0.9,      // speed multiplier per bounce
  ballMaxLifetime: 10,      // seconds before auto-fail
  ballTrailLength: 12,      // trail positions
  ballTrailAlpha: 0.3,
  ballColor: '#44aaff',
  ballTrailColor: '#2266cc',
  ballGlow: 10,

  // Pads
  padWidth: 60,             // length of pad line
  padThickness: 6,          // visual thickness
  padColor: '#44ff66',
  padGlowColor: '#22aa44',
  padGlowSize: 8,
  padPreviewColor: 'rgba(68,255,102,0.3)',
  padRotateSpeed: 2.0,      // radians per second (keyboard)
  padSnapAngle: Math.PI / 12, // 15° snap for fine control
  padMinDistance: 30,        // min distance from ball start / goal

  // Goal
  goalRadius: 20,
  goalColor: '#ffd700',
  goalGlowColor: '#ffaa00',
  goalPulseSpeed: 3,        // pulse frequency
  goalPulseMin: 0.7,
  goalPulseMax: 1.0,

  // Obstacles
  obstacleColor: '#444466',
  obstacleBorderColor: '#555588',

  // Trajectory preview
  trajectoryDots: 60,       // max dots in preview
  trajectoryDotSize: 2,
  trajectoryColor: 'rgba(68,170,255,0.25)',
  trajectoryBounceLimit: 4, // max bounces to preview
  trajectoryTimeStep: 0.016, // simulation step

  // Phases: 'place' | 'launch' | 'flying' | 'result'
  resultDelay: 1.5,         // seconds to show result before advancing

  // Background
  bgColor: '#0a0a16',
  bgGridColor: '#161625',
  bgGridSpacing: 30,

  // Particles
  burstCount: 16,
  burstSpeed: 150,
  burstLife: 0.7,
  burstSize: 3,

  // Wall bounce
  wallBounce: 0.95,         // speed retained on wall bounce

  // Colors
  uiTextColor: '#888888',
  uiHighlightColor: '#ffd700',
  phaseTextColor: '#44ff66',
};
