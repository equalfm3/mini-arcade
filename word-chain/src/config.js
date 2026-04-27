/* Word Chain — Configuration */

var Config = {
  // Timer
  timerDuration: 60,          // seconds
  bonusTime: 2,               // seconds added per valid word

  // Words
  minWordLength: 3,           // minimum letters in a valid word

  // Scoring — 1 point per letter (word length = points)
  scoreLabelThresholds: [
    // [minLength, label]  — celebratory messages for long words
    [7,  'Great!'],
    [9,  'Amazing!'],
    [11, 'Incredible!'],
  ],

  // AI (vs mode)
  aiDelayMin: 100,            // ms — minimum AI "thinking" time
  aiDelayMax: 300,            // ms — maximum AI "thinking" time
  aiPreferLong: 0.3,          // probability AI picks a longer word

  // Display
  historyVisible: 8,          // max words shown in history list
  shakeMs: 500,               // input shake animation duration
  errorShowMs: 1500,          // how long error message stays visible

  // Colors
  accent:          '#ff8844',
  letterBg:        '#ff8844',
  letterText:      '#0a0a16',
  inputBg:         '#12121f',
  inputBorder:     '#2a2a40',
  inputFocus:      '#ff8844',
  historyWord:     '#cccccc',
  historyArrow:    '#555555',
  historyNew:      '#ff8844',
  timerBar:        '#ff8844',
  timerBarLow:     '#ff4444',
  timerLowThresh:  10,        // seconds — bar turns red below this
  errorText:       '#ff4444',
  successText:     '#44ff66',
  dimText:         '#666666',
  brightText:      '#ffffff',
  longWordLength:  6,         // words this long or longer trigger 'clear' sound
  aiColor:         '#44aaff',
  playerColor:     '#ff8844',
};
