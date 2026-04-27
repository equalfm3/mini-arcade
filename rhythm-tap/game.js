/* Rhythm Tap — Main Game Logic

   Modules loaded before this file:
   - Config     (src/config.js)     — constants, lane layout, timing windows
   - Song       (src/song.js)       — procedural note pattern generation
   - Notes      (src/notes.js)      — note spawning, scrolling, hit detection
   - Renderer   (src/renderer.js)   — all visual rendering

   Shared globals available:
   - Engine, Input, Audio8, Shell, Particles, etc.
*/

(function () {

  var best = loadHighScore('rhythm-tap');
  var particles = Particles.create();

  // Game phases: 'select' (BPM), 'playing', 'results'
  var phase = 'select';
  var selectedBPM = 1; // index into Config.bpmOptions (default: 140 BPM)
  var songNotes = [];
  var songStarted = false;

  // Touch tracking for mobile lane taps
  var touchLanes = {};

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'Hit notes to the beat — D F J K',

    init: function () {
      Input.init();
      Shell.setStat('combo', '0');
      Renderer.init();
      setupTouchControls();
    },

    reset: function () {
      phase = 'select';
      songStarted = false;
      particles.clear();
      Song.reset();
      Shell.setStat('score', 0);
      Shell.setStat('combo', 0);
    },

    update: function (dt) {
      // --- Pause ---
      if (Input.pressed('Escape') || Input.pressed('p')) {
        if (phase === 'playing') {
          game.togglePause();
          Input.endFrame();
          return;
        }
      }

      if (phase === 'select') {
        updateBPMSelect(dt);
      } else if (phase === 'playing') {
        updatePlaying(dt);
      } else if (phase === 'results') {
        updateResults(dt);
      }

      Input.endFrame();
    },

    draw: function (ctx) {
      var w = game.w;
      var h = game.h;

      if (phase === 'select') {
        Renderer.drawBPMSelect(ctx, w, h, selectedBPM);
      } else if (phase === 'playing') {
        drawPlaying(ctx, w, h);
      } else if (phase === 'results') {
        Renderer.drawResults(ctx, w, h, {
          score: Notes.score,
          perfect: Notes.totalPerfect,
          great: Notes.totalGreat,
          good: Notes.totalGood,
          miss: Notes.totalMiss,
          maxCombo: Notes.maxCombo,
          isNewBest: saveHighScore('rhythm-tap', Notes.score),
        });
      }
    },

    onStateChange: function (from, to) {
      if (to === 'playing' && !songStarted) {
        phase = 'select';
      }
    },
  });

  // --- BPM Selection Phase ---
  function updateBPMSelect(dt) {
    if (Input.pressed('ArrowUp') || Input.pressed('w')) {
      selectedBPM = Math.max(0, selectedBPM - 1);
      Audio8.play('click');
    }
    if (Input.pressed('ArrowDown') || Input.pressed('s')) {
      selectedBPM = Math.min(Config.bpmOptions.length - 1, selectedBPM + 1);
      Audio8.play('click');
    }
    if (Input.pressed('Enter') || Input.pressed(' ') || Input.tapped) {
      startSong(selectedBPM);
    }

    // Check for direct touch on BPM options
    handleBPMTouch();
  }

  function handleBPMTouch() {
    if (!game.canvas) return;
    // Touch handling is done via the canvas touch listener below
  }

  function startSong(bpmIndex) {
    var bpm = Config.bpmOptions[bpmIndex].bpm;
    songNotes = Song.generate(bpm);
    Notes.reset(songNotes);
    particles.clear();
    phase = 'playing';
    songStarted = true;
    Shell.setStat('score', 0);
    Shell.setStat('combo', 0);
    Audio8.play('click');
  }

  // --- Playing Phase ---
  function updatePlaying(dt) {
    Notes.update(dt);
    Renderer.updateBeat(Notes.songTime, Song.beatDuration);

    // --- Lane input (keyboard) ---
    for (var i = 0; i < Config.laneCount; i++) {
      var key = Config.laneKeys[i];
      if (Input.pressed(key)) {
        handleLaneHit(i);
      }
    }

    // --- Combo fire particles ---
    if (Notes.combo >= Config.comboFireThreshold) {
      // Emit particles from hit zone on each beat
      var beatPhase = Song.beatDuration > 0 ?
        (Notes.songTime % Song.beatDuration) / Song.beatDuration : 0;
      if (beatPhase < dt / Song.beatDuration * 2) {
        for (var j = 0; j < Config.laneCount; j++) {
          particles.emit(Config.laneCenters[j], Config.hitZoneY, {
            count: 3,
            color: Config.laneColors[j],
            speed: 60,
            life: 0.4,
            size: 3,
            gravity: -100,
          });
        }
      }
    }

    particles.update(dt);

    // Update HUD
    Shell.setStat('score', Notes.score);
    Shell.setStat('combo', Notes.combo > 0 ? Notes.combo : '0');

    // Check song completion
    if (Notes.songTime >= Config.songDuration && Notes.isSongComplete()) {
      phase = 'results';
      var isNew = saveHighScore('rhythm-tap', Notes.score);
      if (isNew) {
        best = Notes.score;
      }
      Audio8.play('win');
    }
  }

  function handleLaneHit(lane) {
    var grade = Notes.tryHit(lane);

    if (grade) {
      // Play lane pitch
      var pitch = Config.lanePitches[lane];
      var dur = grade === 'perfect' ? 0.15 : 0.1;
      Audio8.note(pitch, dur, 'triangle', 0.12);

      // Particles on hit
      var count = grade === 'perfect' ? 12 : grade === 'great' ? 8 : 5;
      particles.emit(Config.laneCenters[lane], Config.hitZoneY, {
        count: count,
        color: Config.gradeColors[grade],
        speed: 100,
        life: 0.4,
        size: 3,
        gravity: -80,
      });
    } else {
      // No note to hit — play a subtle tap sound
      Audio8.note(Config.lanePitches[lane], 0.03, 'square', 0.04);
    }
  }

  // --- Results Phase ---
  function updateResults(dt) {
    if (Input.pressed('Enter') || Input.pressed(' ') || Input.tapped) {
      phase = 'select';
      songStarted = false;
      Song.reset();
      particles.clear();
      Shell.setStat('score', 0);
      Shell.setStat('combo', 0);
    }
  }

  // --- Drawing ---
  function drawPlaying(ctx, w, h) {
    Renderer.drawBackground(ctx, w, h);
    Renderer.drawLanes(ctx, w, h, Notes.hitFlash, Notes.hitFlashGrade);
    Renderer.drawHitZone(ctx, w);
    Renderer.drawNotes(ctx, Notes.activeNotes);
    Renderer.drawTouchZones(ctx, w, h);
    particles.draw(ctx);
    Renderer.drawGradePopup(ctx, Notes.lastGrade, Notes.gradeTimer, Notes.gradeLane, w);
    Renderer.drawCombo(ctx, Notes.combo, Notes.getMultiplier(), w);
    Renderer.drawScore(ctx, Notes.score, w);
    Renderer.drawProgress(ctx, Notes.songTime, Config.songDuration, w);
  }

  // --- Touch Controls for Mobile ---
  function setupTouchControls() {
    if (!game.canvas) return;

    game.canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      var rect = game.canvas.getBoundingClientRect();
      var scaleX = game.w / rect.width;
      var scaleY = game.h / rect.height;

      for (var t = 0; t < e.changedTouches.length; t++) {
        var touch = e.changedTouches[t];
        var x = (touch.clientX - rect.left) * scaleX;
        var y = (touch.clientY - rect.top) * scaleY;

        if (phase === 'select') {
          // Check if touching a BPM option
          for (var i = 0; i < Config.bpmOptions.length; i++) {
            var optY = 200 + i * 70;
            if (y >= optY - 22 && y <= optY + 22 &&
                x >= game.w / 2 - 130 && x <= game.w / 2 + 130) {
              selectedBPM = i;
              startSong(i);
              return;
            }
          }
        } else if (phase === 'playing') {
          // Determine which lane was tapped
          var lane = getLaneFromX(x);
          if (lane >= 0) {
            handleLaneHit(lane);
          }
        } else if (phase === 'results') {
          phase = 'select';
          songStarted = false;
          Song.reset();
          particles.clear();
        }
      }
    }, { passive: false });

    game.canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
    }, { passive: false });
  }

  function getLaneFromX(x) {
    for (var i = 0; i < Config.laneCount; i++) {
      var lx = Config.laneLefts[i];
      if (x >= lx && x < lx + Config.laneWidth) {
        return i;
      }
    }
    return -1;
  }

  game.start();

})();
