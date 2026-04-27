/* Rhythm Tap — Configuration */

var Config = {
  // Canvas
  canvasW: 400,
  canvasH: 600,

  // Lanes
  laneCount: 4,
  laneKeys: ['d', 'f', 'j', 'k'],
  laneLabels: ['D', 'F', 'J', 'K'],
  laneColors: ['#ff66aa', '#44ffdd', '#ffd700', '#44ff66'],
  laneColorsDim: ['#662244', '#1a6655', '#665500', '#1a6622'],
  laneColorsBright: ['#ff99cc', '#88ffee', '#ffee66', '#88ff99'],

  // Lane layout (derived below)
  laneWidth: 0,
  laneGap: 4,
  boardLeft: 0,

  // Notes
  noteHeight: 24,
  noteRadius: 6,
  noteGlow: 12,
  noteSpeed: 350,        // px/s — how fast notes fall

  // Hit zone
  hitZoneY: 520,         // Y position of the hit zone line
  hitZoneHeight: 6,

  // Timing windows (in seconds)
  timingPerfect: 0.040,  // ±40ms
  timingGreat: 0.080,    // ±80ms
  timingGood: 0.120,     // ±120ms
  // Anything beyond timingGood is a miss

  // Timing grade colors
  gradeColors: {
    perfect: '#ffd700',
    great: '#44ff66',
    good: '#44aaff',
    miss: '#ff4444',
  },

  // Scoring
  scorePerPerfect: 300,
  scorePerGreat: 200,
  scorePerGood: 100,
  scorePerMiss: 0,

  // Combo multiplier thresholds
  comboThresholds: [
    { combo: 50, multiplier: 4 },
    { combo: 25, multiplier: 3 },
    { combo: 10, multiplier: 2 },
    { combo: 0,  multiplier: 1 },
  ],

  // Combo fire particle threshold
  comboFireThreshold: 20,

  // BPM options
  bpmOptions: [
    { label: '120 BPM — Chill', bpm: 120 },
    { label: '140 BPM — Groove', bpm: 140 },
    { label: '160 BPM — Intense', bpm: 160 },
  ],
  defaultBPM: 140,

  // Song duration (seconds)
  songDuration: 60,

  // Note generation — difficulty ramp
  eighthNoteTime: 10,    // seconds before eighth notes appear
  sixteenthNoteTime: 30, // seconds before sixteenth notes appear

  // Minimum gap between notes in same lane (in beats)
  minLaneGap: 0.5,

  // Max simultaneous notes
  maxSimultaneous: 3,    // never all 4 lanes at once

  // Note pitches per lane (Hz) — C4, E4, G4, B4
  lanePitches: [261.63, 329.63, 392.00, 493.88],
  missPitch: 100,

  // Grade popup
  gradePopupDuration: 0.5,
  gradePopupRise: 30,

  // Hit flash duration
  hitFlashDuration: 0.15,

  // Background
  bgColor: '#0a0a16',
  bgPulseColor: '#12121f',
  bgPulseIntensity: 0.15,

  // Divider
  dividerColor: '#1a1a2e',

  // Hit zone
  hitZoneColor: '#333355',
  hitZoneActiveColor: '#ffd700',

  // Mobile touch zone height
  touchZoneHeight: 100,

  // Text
  textColor: '#e0e0e0',
  hudColor: '#ffd700',
};

// Derived values
Config.laneWidth = Math.floor((Config.canvasW - Config.laneGap * (Config.laneCount + 1)) / Config.laneCount);
Config.boardLeft = Config.laneGap;

// Lane center X positions
Config.laneCenters = [];
for (var i = 0; i < Config.laneCount; i++) {
  Config.laneCenters[i] = Config.boardLeft + i * (Config.laneWidth + Config.laneGap) + Config.laneWidth / 2;
}

// Lane left X positions
Config.laneLefts = [];
for (var j = 0; j < Config.laneCount; j++) {
  Config.laneLefts[j] = Config.boardLeft + j * (Config.laneWidth + Config.laneGap);
}
