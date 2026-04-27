/* Typing Speed — Configuration */

var Config = {
  // Round
  roundDuration: 60,          // seconds
  wordsPerPassage: 200,       // words to generate per round

  // Display
  linesVisible: 4,            // lines of words visible at once
  wordsPerLine: 8,            // approximate words per line (varies by word length)
  lineWidthChars: 35,         // max characters per line before wrapping

  // WPM rating thresholds
  ratings: [
    { min: 100, label: 'Blazing!',   color: '#ff44ff' },
    { min: 80,  label: 'Lightning!', color: '#ffd700' },
    { min: 60,  label: 'Fast!',      color: '#ff8844' },
    { min: 40,  label: 'Good',       color: '#44ff66' },
    { min: 25,  label: 'Average',    color: '#44aaff' },
    { min: 15,  label: 'Slow',       color: '#aaaaaa' },
    { min: 0,   label: 'Beginner',   color: '#888888' },
  ],

  // Colors
  bgWord:          '#0e0e1a',
  textNormal:      '#888888',    // upcoming words
  textCurrent:     '#ffffff',    // current word highlight
  textDone:        '#444444',    // already typed words (dimmed)
  textCorrect:     '#44ff66',    // correct character
  textWrong:       '#ff4444',    // wrong character
  textCursor:      '#ffd700',    // cursor underline
  currentWordBg:   '#1a2a3a',   // background highlight for current word
  statLabel:       '#888888',
  statValue:       '#ffffff',
  accent:          '#44aaff',

  // Timing
  cursorBlinkRate: 0.53,        // seconds per blink cycle
};

