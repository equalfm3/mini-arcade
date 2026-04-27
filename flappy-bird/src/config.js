/* Flappy Bird — Configuration */

var Config = {
  // Canvas
  canvasW: 320,
  canvasH: 480,

  // Bird
  birdX: 80,           // fixed horizontal position
  birdSize: 20,        // radius
  gravity: 1200,       // px/s² (acceleration downward)
  flapForce: -380,     // px/s (instant upward velocity on flap)
  maxFallSpeed: 600,   // terminal velocity

  // Bird colors
  birdBody: '#ffd700',
  birdWing: '#ffaa00',
  birdEye: '#ffffff',
  birdPupil: '#0a0a16',
  birdBeak: '#ff8844',

  // Pipes
  pipeWidth: 52,
  pipeGap: 140,        // vertical gap between top and bottom pipe
  pipeSpeed: 150,      // px/s horizontal scroll
  pipeSpawnInterval: 1.6, // seconds between pipe spawns
  pipeColor: '#44ff66',
  pipeDark: '#22aa44',
  pipeCapH: 16,        // height of the pipe cap

  // Ground
  groundH: 60,
  groundColor: '#2a2a40',
  groundLine: '#3a3a55',

  // Background
  bgColor: '#0e0e1a',
  bgStars: 30,         // number of background stars

  // Scoring
  pointsPerPipe: 1,
};
