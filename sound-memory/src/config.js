/* Sound Memory — Configuration */

var Config = {
  // 6 buttons, each with a unique musical note (C4 through A4 — major scale)
  buttons: [
    { id: 0, freq: 261.63, note: 'C4' },
    { id: 1, freq: 293.66, note: 'D4' },
    { id: 2, freq: 329.63, note: 'E4' },
    { id: 3, freq: 349.23, note: 'F4' },
    { id: 4, freq: 392.00, note: 'G4' },
    { id: 5, freq: 440.00, note: 'A4' },
  ],

  // Layout: 2 columns × 3 rows
  cols: 2,
  rows: 3,
  totalButtons: 6,

  // Tone settings
  toneDuration: 0.4,       // seconds each tone plays
  toneType: 'sine',        // oscillator waveform (sine = pure musical tone)
  toneVolume: 0.2,         // volume (0-1)

  // Learn phase timing (seconds)
  learnDelay: 0.6,         // delay before learn phase starts
  learnToneDuration: 0.5,  // how long each button highlights during learn
  learnGap: 0.3,           // gap between learn steps

  // Listen phase timing (seconds)
  listenPreDelay: 0.8,     // delay before sequence playback starts
  listenInterval: 0.7,     // time between each tone in sequence
  listenGap: 0.15,         // gap between tones

  // Play phase timing
  inputTimeout: 6.0,       // seconds player has to press next button

  // Difficulty ramp
  speedRamp: 0.02,         // reduce listenInterval per round
  minListenInterval: 0.35, // fastest playback speed

  // Button sizing
  buttonSize: 90,          // px per button
  buttonGap: 16,           // px gap between buttons
  buttonRadius: 50,        // px border radius (circular)

  // Waveform display
  waveformWidth: 180,
  waveformHeight: 60,
  waveformBars: 32,

  // Colors
  bgColor: '#0e0e1a',
  buttonColor: '#1a1a2e',
  buttonBorder: '#2a2a40',
  buttonGlow: '#ffffff',
  buttonGlowShadow: 'rgba(255, 255, 255, 0.5)',
  buttonPressed: '#2a2a4a',
  waveformColor: '#c084fc',
  waveformBg: '#12121f',
  statusColor: '#888',
  learnColor: '#c084fc',
  listenColor: '#ffd700',
  playColor: '#44ff66',
  failColor: '#ff4444',
  accentColor: '#c084fc',
};

// Derived
Config.gridWidth = Config.cols * Config.buttonSize + (Config.cols - 1) * Config.buttonGap;
Config.gridHeight = Config.rows * Config.buttonSize + (Config.rows - 1) * Config.buttonGap;
