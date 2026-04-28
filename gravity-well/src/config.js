/* Gravity Well — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 400,

  // Physics
  G: 800,              // Gravitational constant
  maxSpeed: 300,       // Cap satellite speed
  trailLength: 60,     // Trail points to keep

  // Satellite
  satRadius: 5,
  satColor: '#44ffdd',
  satTrailColor: '#44ffdd44',
  launchPower: 200,    // Base launch velocity multiplier
  maxFuel: 100,
  thrustForce: 150,    // Thrust acceleration
  fuelBurnRate: 25,    // Fuel per second while thrusting

  // Planets
  planetColors: ['#ff8844', '#44aaff', '#c084fc', '#44ff66', '#ffd700'],
  gravityFieldAlpha: 0.08,

  // Target orbit
  targetColor: '#ffd700',
  targetWidth: 2,
  orbitTolerance: 20,  // How close to target orbit counts
  orbitTime: 2.0,      // Seconds in orbit zone to win

  // Visuals
  bgColor: '#0a0a16',
  starCount: 80,

  // Levels
  levels: [
    // Level 1: Single planet, simple orbit
    {
      planets: [{ x: 200, y: 200, mass: 5000, radius: 25 }],
      target: { planet: 0, orbitRadius: 80 },
      startPos: { x: 50, y: 200 },
      fuel: 100,
    },
    // Level 2: Reach outer orbit
    {
      planets: [{ x: 200, y: 200, mass: 6000, radius: 30 }],
      target: { planet: 0, orbitRadius: 130 },
      startPos: { x: 50, y: 350 },
      fuel: 100,
    },
    // Level 3: Two planets
    {
      planets: [
        { x: 140, y: 200, mass: 4000, radius: 20 },
        { x: 300, y: 200, mass: 4000, radius: 20 },
      ],
      target: { planet: 1, orbitRadius: 70 },
      startPos: { x: 30, y: 200 },
      fuel: 100,
    },
    // Level 4: Navigate between planets
    {
      planets: [
        { x: 120, y: 120, mass: 3500, radius: 18 },
        { x: 300, y: 300, mass: 5000, radius: 25 },
      ],
      target: { planet: 1, orbitRadius: 90 },
      startPos: { x: 30, y: 30 },
      fuel: 120,
    },
    // Level 5: Three planets
    {
      planets: [
        { x: 100, y: 200, mass: 3000, radius: 16 },
        { x: 250, y: 100, mass: 4000, radius: 20 },
        { x: 300, y: 320, mass: 3500, radius: 18 },
      ],
      target: { planet: 2, orbitRadius: 70 },
      startPos: { x: 30, y: 370 },
      fuel: 130,
    },
    // Level 6: Tight orbit
    {
      planets: [
        { x: 200, y: 200, mass: 7000, radius: 35 },
        { x: 350, y: 80, mass: 2000, radius: 12 },
      ],
      target: { planet: 0, orbitRadius: 60 },
      startPos: { x: 380, y: 380 },
      fuel: 100,
    },
    // Level 7: Far transfer
    {
      planets: [
        { x: 80, y: 80, mass: 4000, radius: 20 },
        { x: 320, y: 320, mass: 4000, radius: 20 },
      ],
      target: { planet: 1, orbitRadius: 60 },
      startPos: { x: 80, y: 350 },
      fuel: 110,
    },
    // Level 8: Three body problem
    {
      planets: [
        { x: 200, y: 100, mass: 3000, radius: 16 },
        { x: 100, y: 300, mass: 3000, radius: 16 },
        { x: 300, y: 300, mass: 3000, radius: 16 },
      ],
      target: { planet: 0, orbitRadius: 55 },
      startPos: { x: 200, y: 380 },
      fuel: 120,
    },
  ],
};
