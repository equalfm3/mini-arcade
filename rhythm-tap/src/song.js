/* Rhythm Tap — Procedural Song Generation

   Generates note patterns based on BPM and beat subdivisions.
   Patterns feel rhythmic — quarter, eighth, and sixteenth notes.
   Difficulty ramps over time: quarters → eighths → sixteenths.
*/

var Song = (function () {

  var notes = [];       // Array of { time, lane } — sorted by time
  var bpm = 140;
  var beatDuration = 0; // seconds per beat
  var songLength = 0;   // total duration in seconds

  // Pattern types for variety
  var PATTERN_SINGLE = 0;
  var PATTERN_DOUBLE = 1;
  var PATTERN_RUN = 2;
  var PATTERN_STAIRCASE = 3;

  function reset() {
    notes = [];
    bpm = Config.defaultBPM;
    beatDuration = 0;
    songLength = 0;
  }

  /** Generate a full song of notes for the given BPM */
  function generate(selectedBPM) {
    bpm = selectedBPM || Config.defaultBPM;
    beatDuration = 60 / bpm;
    songLength = Config.songDuration;
    notes = [];

    var time = beatDuration * 4; // 4-beat lead-in
    var lastNoteTimes = [0, 0, 0, 0]; // last note time per lane

    while (time < songLength) {
      var elapsed = time;
      var subdivision = getSubdivision(elapsed);
      var step = beatDuration / subdivision;

      // Pick a pattern
      var pattern = pickPattern(elapsed);

      switch (pattern) {
        case PATTERN_SINGLE:
          addSingleNote(time, lastNoteTimes);
          time += step;
          break;

        case PATTERN_DOUBLE:
          addDoubleNote(time, lastNoteTimes);
          time += step;
          break;

        case PATTERN_RUN:
          time = addRun(time, step, lastNoteTimes);
          break;

        case PATTERN_STAIRCASE:
          time = addStaircase(time, step, lastNoteTimes);
          break;

        default:
          time += step;
      }

      // Occasional rest (skip a beat) for breathing room
      if (Math.random() < getRestChance(elapsed)) {
        time += step;
      }
    }

    // Sort by time
    notes.sort(function (a, b) { return a.time - b.time; });

    return notes;
  }

  /** Get beat subdivision based on elapsed time */
  function getSubdivision(elapsed) {
    if (elapsed >= Config.sixteenthNoteTime) {
      // Mix of subdivisions, weighted toward harder
      var r = Math.random();
      if (r < 0.3) return 1;       // quarter
      if (r < 0.65) return 2;      // eighth
      return 4;                     // sixteenth
    }
    if (elapsed >= Config.eighthNoteTime) {
      var r2 = Math.random();
      if (r2 < 0.4) return 1;      // quarter
      return 2;                     // eighth
    }
    return 1; // quarter notes only at start
  }

  /** Pick a pattern type based on difficulty */
  function pickPattern(elapsed) {
    var r = Math.random();
    if (elapsed < Config.eighthNoteTime) {
      // Early: mostly singles
      return r < 0.85 ? PATTERN_SINGLE : PATTERN_DOUBLE;
    }
    if (elapsed < Config.sixteenthNoteTime) {
      // Mid: mix of singles, doubles, runs
      if (r < 0.5) return PATTERN_SINGLE;
      if (r < 0.7) return PATTERN_DOUBLE;
      if (r < 0.9) return PATTERN_RUN;
      return PATTERN_STAIRCASE;
    }
    // Late: everything
    if (r < 0.35) return PATTERN_SINGLE;
    if (r < 0.55) return PATTERN_DOUBLE;
    if (r < 0.8) return PATTERN_RUN;
    return PATTERN_STAIRCASE;
  }

  /** Rest chance decreases as song progresses */
  function getRestChance(elapsed) {
    if (elapsed < Config.eighthNoteTime) return 0.3;
    if (elapsed < Config.sixteenthNoteTime) return 0.2;
    return 0.1;
  }

  /** Add a single note in a random lane */
  function addSingleNote(time, lastNoteTimes) {
    var lane = pickLane(time, lastNoteTimes, 1);
    if (lane !== null) {
      notes.push({ time: time, lane: lane });
      lastNoteTimes[lane] = time;
    }
  }

  /** Add two simultaneous notes in different lanes */
  function addDoubleNote(time, lastNoteTimes) {
    var lanes = pickMultipleLanes(time, lastNoteTimes, 2);
    for (var i = 0; i < lanes.length; i++) {
      notes.push({ time: time, lane: lanes[i] });
      lastNoteTimes[lanes[i]] = time;
    }
  }

  /** Add a run of 3-4 notes in adjacent lanes */
  function addRun(time, step, lastNoteTimes) {
    var runLength = 3 + Math.floor(Math.random() * 2); // 3 or 4
    var startLane = Math.floor(Math.random() * Config.laneCount);
    var direction = Math.random() < 0.5 ? 1 : -1;

    for (var i = 0; i < runLength; i++) {
      var lane = startLane + i * direction;
      // Wrap around
      lane = ((lane % Config.laneCount) + Config.laneCount) % Config.laneCount;

      if (canPlaceNote(time, lane, lastNoteTimes)) {
        notes.push({ time: time, lane: lane });
        lastNoteTimes[lane] = time;
      }
      time += step;
    }
    return time;
  }

  /** Add a staircase pattern (ascending or descending) */
  function addStaircase(time, step, lastNoteTimes) {
    var ascending = Math.random() < 0.5;
    var start = ascending ? 0 : Config.laneCount - 1;
    var dir = ascending ? 1 : -1;

    for (var i = 0; i < Config.laneCount; i++) {
      var lane = start + i * dir;
      if (canPlaceNote(time, lane, lastNoteTimes)) {
        notes.push({ time: time, lane: lane });
        lastNoteTimes[lane] = time;
      }
      time += step;
    }
    return time;
  }

  /** Check if we can place a note in a lane (respects minimum gap) */
  function canPlaceNote(time, lane, lastNoteTimes) {
    var minGap = Config.minLaneGap * beatDuration;
    return (time - lastNoteTimes[lane]) >= minGap;
  }

  /** Pick a single lane that respects the minimum gap */
  function pickLane(time, lastNoteTimes, attempts) {
    var maxAttempts = attempts || 10;
    for (var i = 0; i < maxAttempts; i++) {
      var lane = Math.floor(Math.random() * Config.laneCount);
      if (canPlaceNote(time, lane, lastNoteTimes)) {
        return lane;
      }
    }
    // Fallback: find any valid lane
    for (var j = 0; j < Config.laneCount; j++) {
      if (canPlaceNote(time, j, lastNoteTimes)) return j;
    }
    return null;
  }

  /** Pick multiple lanes for simultaneous notes */
  function pickMultipleLanes(time, lastNoteTimes, count) {
    var available = [];
    for (var i = 0; i < Config.laneCount; i++) {
      if (canPlaceNote(time, i, lastNoteTimes)) {
        available.push(i);
      }
    }
    // Shuffle available lanes
    for (var j = available.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = available[j];
      available[j] = available[k];
      available[k] = tmp;
    }
    // Never exceed maxSimultaneous
    var max = Math.min(count, Config.maxSimultaneous, available.length);
    return available.slice(0, max);
  }

  return {
    reset: reset,
    generate: generate,
    get notes() { return notes; },
    get bpm() { return bpm; },
    get beatDuration() { return beatDuration; },
    get songLength() { return songLength; },
  };
})();
