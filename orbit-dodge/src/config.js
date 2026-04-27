/* Orbit Dodge — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 400,

  // Two orbit rings
  orbits: [70, 120],         // inner and outer radii
  orbitGlowWidth: 2,
  orbitGlowColor: 'rgba(68, 170, 255, 0.25)',
  orbitGlowOuter: 10,
  orbitInactiveAlpha: 0.1,   // dimmed ring when player isn't on it

  // Player
  playerRadius: 6,
  playerColor: '#44aaff',
  playerGlow: '#44aaff',
  angularSpeed: 2.2,
  trailLength: 18,
  trailMaxAlpha: 0.5,
  hopDuration: 0.12,         // seconds to animate orbit hop

  // Obstacles — projectiles (cross through both orbits)
  projectileSpeed: 150,
  projectileRadius: 5,
  projectileColor: '#ff4444',
  projectileGlow: '#ff6644',

  // Obstacles — arcs (sweep along ONE orbit ring)
  arcSpeed: 1.2,
  arcWidth: 0.4,
  arcThickness: 8,
  arcColor: '#ff8844',
  arcGlow: '#ff6622',

  // Obstacle spawning
  spawnInterval: 1.8,
  spawnIntervalMin: 0.5,
  spawnRampRate: 0.015,
  speedRampRate: 0.06,
  arcChance: 0.3,
  arcChanceMax: 0.5,

  // Rule: max 1 arc per orbit ring at a time
  maxArcsPerOrbit: 1,

  // Stars
  starRadius: 5,
  starColor: '#ffd700',
  starGlow: '#ffaa00',
  starPoints: 50,
  starSpawnInterval: 4.0,
  starLifetime: 3.5,
  starPulseSpeed: 6,

  // Collision
  hitDistance: 10,
  starPickupDistance: 14,
  orbitHitTolerance: 15,     // how close to orbit ring for arc collision

  // Scoring
  scorePerSecond: 10,

  // Visual
  bgColor: '#0a0a16',
  bgStarCount: 60,
  bgStarColor: '#ffffff',
  centerDotRadius: 3,
  centerDotColor: '#2a2a40',
  flashDuration: 0.2,
  trailArcWidth: 3,
};

// Derived
Config.centerX = Config.canvasW / 2;
Config.centerY = Config.canvasH / 2;
Config.orbitCount = Config.orbits.length;
