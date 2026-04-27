/* Pong — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 500,

  // Paddles
  paddleW: 10,
  paddleH: 70,
  paddleSpeed: 350,       // px/s
  paddleMargin: 20,       // distance from edge
  paddleColor: '#e0e0e0',

  // Ball
  ballSize: 8,            // half-width (square ball for pixel look)
  ballBaseSpeed: 250,
  ballSpeedIncrement: 15, // per hit
  ballMaxSpeed: 500,
  ballColor: '#ffffff',

  // Scoring
  winScore: 7,

  // Difficulty presets
  difficulties: {
    easy: {
      aiSpeed: 180,
      aiReaction: 0.45,
      aiPrediction: false,
      label: 'EASY',
    },
    hard: {
      aiSpeed: 380,
      aiReaction: 0.97,
      aiPrediction: true,
      label: 'UNBEATABLE',
    },
  },
  defaultDifficulty: 'easy',

  // Active AI settings (set by setDifficulty)
  aiSpeed: 180,
  aiReaction: 0.45,
  aiPrediction: false,

  // Visuals
  bgColor: '#0e0e1a',
  lineColor: '#2a2a40',
  scoreColor: '#333',
  scoreFontSize: 60,
};

Config.setDifficulty = function (name) {
  var d = Config.difficulties[name] || Config.difficulties.easy;
  Config.aiSpeed = d.aiSpeed;
  Config.aiReaction = d.aiReaction;
  Config.aiPrediction = d.aiPrediction;
};

Config.setDifficulty(Config.defaultDifficulty);
