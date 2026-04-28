/* Asteroids — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 400,

  // Ship
  shipSize: 12,           // radius of ship triangle
  shipRotSpeed: 4.5,      // radians per second
  shipThrust: 200,        // acceleration px/s²
  shipMaxSpeed: 250,      // max velocity magnitude
  shipDrag: 0,            // no friction in space
  shipRespawnTime: 3.5,   // invulnerability seconds (longer to be safe)
  shipBlinkRate: 0.1,     // blink interval during respawn

  // Bullets
  bulletSpeed: 350,       // px per second
  bulletLife: 2.0,        // seconds before disappearing
  bulletRadius: 2,
  maxBullets: 4,
  shootCooldown: 0.15,    // seconds between shots

  // Asteroids
  asteroidSizes: {
    large:  { radius: 40, speed: 40,  points: 20  },
    medium: { radius: 20, speed: 70,  points: 50  },
    small:  { radius: 10, speed: 100, points: 100 },
  },
  asteroidVertices: 10,   // number of vertices per asteroid
  asteroidJaggedness: 0.4,// how irregular the shape is (0-1)
  asteroidRotSpeed: 1.5,  // max rotation speed (radians/s)
  startingAsteroids: 4,   // wave 1 count
  asteroidSpawnMargin: 80,// min distance from ship when spawning

  // Lives
  lives: 3,

  // Stars
  starCount: 60,

  // Colors — classic vector style
  bgColor: '#000000',
  shipColor: '#ffffff',
  shipThrustColor: '#ff6600',
  bulletColor: '#ffffff',
  asteroidColor: '#aaaaaa',
  textColor: '#ffffff',
  hudColor: '#ffd700',
  uiDim: '#666666',
};
