/* Rhythm Tap — Note Management & Hit Detection

   Manages active notes on screen, scrolling, hit detection
   with timing grades, and miss detection.
*/

var Notes = (function () {

  var activeNotes = [];   // Notes currently on screen
  var allNotes = [];      // Full song note list
  var nextNoteIndex = 0;  // Index into allNotes for spawning
  var songTime = 0;       // Current song time in seconds
  var combo = 0;
  var maxCombo = 0;
  var score = 0;
  var totalPerfect = 0;
  var totalGreat = 0;
  var totalGood = 0;
  var totalMiss = 0;
  var lastGrade = null;
  var gradeTimer = 0;
  var gradeLane = -1;

  // Hit flash per lane
  var hitFlash = [0, 0, 0, 0];
  var hitFlashGrade = [null, null, null, null];

  // Pre-calculate: how far ahead (in seconds) to spawn notes
  // so they appear at the top and scroll down to the hit zone
  var spawnLeadTime = 0;

  function reset(noteList) {
    allNotes = noteList || [];
    nextNoteIndex = 0;
    activeNotes = [];
    songTime = 0;
    combo = 0;
    maxCombo = 0;
    score = 0;
    totalPerfect = 0;
    totalGreat = 0;
    totalGood = 0;
    totalMiss = 0;
    lastGrade = null;
    gradeTimer = 0;
    gradeLane = -1;
    hitFlash = [0, 0, 0, 0];
    hitFlashGrade = [null, null, null, null];

    // Time for a note to travel from top of canvas to hit zone
    spawnLeadTime = Config.hitZoneY / Config.noteSpeed;
  }

  function update(dt) {
    songTime += dt;

    // Spawn notes that are about to come on screen
    while (nextNoteIndex < allNotes.length) {
      var note = allNotes[nextNoteIndex];
      if (note.time - songTime <= spawnLeadTime) {
        activeNotes.push({
          time: note.time,
          lane: note.lane,
          hit: false,
          missed: false,
          y: 0, // will be calculated in draw
        });
        nextNoteIndex++;
      } else {
        break;
      }
    }

    // Update note positions and check for misses
    for (var i = activeNotes.length - 1; i >= 0; i--) {
      var n = activeNotes[i];
      // Calculate Y position based on time difference
      var timeDiff = n.time - songTime;
      n.y = Config.hitZoneY - timeDiff * Config.noteSpeed;

      // Miss detection: note passed the hit zone beyond the good window
      if (!n.hit && !n.missed && songTime > n.time + Config.timingGood) {
        n.missed = true;
        combo = 0;
        totalMiss++;
        lastGrade = 'miss';
        gradeTimer = Config.gradePopupDuration;
        gradeLane = n.lane;
      }

      // Remove notes that are well past the screen
      if (n.y > Config.canvasH + 50) {
        activeNotes.splice(i, 1);
      }
    }

    // Update hit flash timers
    for (var j = 0; j < Config.laneCount; j++) {
      if (hitFlash[j] > 0) {
        hitFlash[j] -= dt;
        if (hitFlash[j] < 0) hitFlash[j] = 0;
      }
    }

    // Update grade popup timer
    if (gradeTimer > 0) {
      gradeTimer -= dt;
      if (gradeTimer < 0) gradeTimer = 0;
    }
  }

  /** Try to hit a note in the given lane. Returns the grade or null. */
  function tryHit(lane) {
    var bestNote = null;
    var bestDiff = Infinity;

    // Find the closest unhit note in this lane
    for (var i = 0; i < activeNotes.length; i++) {
      var n = activeNotes[i];
      if (n.lane !== lane || n.hit || n.missed) continue;

      var diff = Math.abs(songTime - n.time);
      if (diff < bestDiff && diff <= Config.timingGood) {
        bestDiff = diff;
        bestNote = n;
      }
    }

    if (!bestNote) return null;

    bestNote.hit = true;

    // Determine grade
    var grade;
    if (bestDiff <= Config.timingPerfect) {
      grade = 'perfect';
      totalPerfect++;
    } else if (bestDiff <= Config.timingGreat) {
      grade = 'great';
      totalGreat++;
    } else {
      grade = 'good';
      totalGood++;
    }

    // Update combo
    combo++;
    if (combo > maxCombo) maxCombo = combo;

    // Calculate score with multiplier
    var multiplier = getMultiplier();
    var baseScore = grade === 'perfect' ? Config.scorePerPerfect :
                    grade === 'great' ? Config.scorePerGreat :
                    Config.scorePerGood;
    score += baseScore * multiplier;

    // Set hit flash
    hitFlash[lane] = Config.hitFlashDuration;
    hitFlashGrade[lane] = grade;

    // Set grade popup
    lastGrade = grade;
    gradeTimer = Config.gradePopupDuration;
    gradeLane = lane;

    return grade;
  }

  /** Get current combo multiplier */
  function getMultiplier() {
    for (var i = 0; i < Config.comboThresholds.length; i++) {
      if (combo >= Config.comboThresholds[i].combo) {
        return Config.comboThresholds[i].multiplier;
      }
    }
    return 1;
  }

  /** Check if the song is finished (all notes played or missed) */
  function isSongComplete() {
    return nextNoteIndex >= allNotes.length && activeNotes.length === 0;
  }

  return {
    reset: reset,
    update: update,
    tryHit: tryHit,
    getMultiplier: getMultiplier,
    isSongComplete: isSongComplete,
    get activeNotes() { return activeNotes; },
    get songTime() { return songTime; },
    get combo() { return combo; },
    get maxCombo() { return maxCombo; },
    get score() { return score; },
    get totalPerfect() { return totalPerfect; },
    get totalGreat() { return totalGreat; },
    get totalGood() { return totalGood; },
    get totalMiss() { return totalMiss; },
    get lastGrade() { return lastGrade; },
    get gradeTimer() { return gradeTimer; },
    get gradeLane() { return gradeLane; },
    get hitFlash() { return hitFlash; },
    get hitFlashGrade() { return hitFlashGrade; },
  };
})();
