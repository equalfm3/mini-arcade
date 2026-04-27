/* Simon Says — Configuration */

var Config = {
  // Buttons (4 colored pads)
  buttons: [
    { id: 'green',  color: '#44ff66', activeColor: '#88ffaa', darkColor: '#22aa44', freq: 261.63, label: 'Green'  },
    { id: 'red',    color: '#ff4444', activeColor: '#ff8888', darkColor: '#cc2222', freq: 329.63, label: 'Red'    },
    { id: 'yellow', color: '#ffd700', activeColor: '#ffec66', darkColor: '#b89a00', freq: 392.00, label: 'Yellow' },
    { id: 'blue',   color: '#44aaff', activeColor: '#88ccff', darkColor: '#2266cc', freq: 523.25, label: 'Blue'   },
  ],

  // Layout: 2×2 grid
  cols: 2,
  rows: 2,

  // Tone settings
  toneDuration: 0.3,       // seconds each tone plays
  toneType: 'sine',        // oscillator waveform
  toneVolume: 0.18,        // volume (0-1)

  // Sequence playback timing (seconds)
  playbackInterval: 0.6,   // time between each step in playback
  playbackPause: 0.15,     // gap between tone end and next tone start
  prePlayDelay: 0.8,       // delay before sequence playback starts

  // Input timing
  inputTimeout: 5.0,       // seconds player has to press next button

  // Difficulty ramp — speed increases per round
  speedRamp: 0.03,         // reduce playbackInterval by this per round
  minPlaybackInterval: 0.25, // fastest playback speed

  // Button sizing
  buttonSize: 130,         // px per button
  buttonGap: 12,           // px gap between buttons
  buttonRadius: 12,        // px border radius

  // Colors
  bgColor: '#0e0e1a',
  gridBg: '#12121f',
  borderColor: '#2a2a40',
  statusColor: '#888',
  watchColor: '#ffd700',
  inputColor: '#44ff66',
  failColor: '#ff4444',
};

// Derived
Config.totalButtons = Config.buttons.length;
Config.gridSize = Config.cols * Config.buttonSize + (Config.cols - 1) * Config.buttonGap;
