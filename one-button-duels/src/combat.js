/* One-Button Duels — Combat Module

   Manages the timing bars, action locking, combat resolution,
   round/match state, and AI fallback for single-player mode.

   Actions: STRIKE > DODGE > PARRY > STRIKE (rock-paper-scissors)
*/

var Combat = (function () {

  // --- State ---
  var p1 = null;
  var p2 = null;
  var barCursor = 0;          // 0..1 position on timing bar
  var barDirection = 1;        // 1 = forward, -1 = backward
  var currentSpeed = 0;
  var roundNum = 0;
  var p1RoundWins = 0;
  var p2RoundWins = 0;
  var phase = 'idle';         // idle, timing, resolving, result, roundEnd, matchEnd
  var phaseTimer = 0;
  var lockTimer = 0;          // time since exchange started (for AI timeout)
  var lastResult = null;      // { p1Action, p2Action, winner, text }
  var aiSide = null;          // null, 'p1', or 'p2' — which side is AI
  var aiLockDelay = 0;
  var aiLockTimer = 0;

  function createFighter(side) {
    return {
      side: side,
      hp: Config.hpPerRound,
      action: null,           // locked action: 'STRIKE', 'PARRY', 'DODGE'
      locked: false,
      animState: 'idle',      // idle, strike, parry, dodge, hit, win
      animTimer: 0,
      offsetX: 0,             // animation offset from base position
    };
  }

  function reset() {
    p1 = createFighter('p1');
    p2 = createFighter('p2');
    barCursor = 0;
    barDirection = 1;
    currentSpeed = Config.barSpeed;
    roundNum = 1;
    p1RoundWins = 0;
    p2RoundWins = 0;
    phase = 'idle';
    phaseTimer = 0;
    lockTimer = 0;
    lastResult = null;
    aiSide = null;
    aiLockDelay = 0;
    aiLockTimer = 0;
  }

  function startRound() {
    p1.hp = Config.hpPerRound;
    p2.hp = Config.hpPerRound;
    p1.action = null;
    p1.locked = false;
    p2.action = null;
    p2.locked = false;
    p1.animState = 'idle';
    p2.animState = 'idle';
    p1.offsetX = 0;
    p2.offsetX = 0;
    currentSpeed = Math.min(Config.barSpeed + (roundNum - 1) * Config.barSpeedIncrease, Config.barMaxSpeed);
    barCursor = 0;
    barDirection = 1;
    lockTimer = 0;
    lastResult = null;
    phase = 'timing';
    resetAI();
  }

  function startExchange() {
    p1.action = null;
    p1.locked = false;
    p2.action = null;
    p2.locked = false;
    p1.animState = 'idle';
    p2.animState = 'idle';
    p1.offsetX = 0;
    p2.offsetX = 0;
    barCursor = Math.random() * 0.3;
    barDirection = 1;
    lockTimer = 0;
    lastResult = null;
    phase = 'timing';
    resetAI();
  }

  function resetAI() {
    if (aiSide) {
      aiLockDelay = Config.aiMinDelay + Math.random() * (Config.aiMaxDelay - Config.aiMinDelay);
      aiLockTimer = 0;
    }
  }

  // --- Get zone from cursor position ---
  function getZone(cursor) {
    var pos = 0;
    for (var i = 0; i < Config.zones.length; i++) {
      pos += Config.zones[i].width;
      if (cursor <= pos) return Config.zones[i].name;
    }
    return Config.zones[Config.zones.length - 1].name;
  }

  // --- Lock action for a player ---
  function lockAction(fighter) {
    if (fighter.locked || phase !== 'timing') return;
    fighter.action = getZone(barCursor);
    fighter.locked = true;
    Audio8.play('click');

    // Check if both locked
    if (p1.locked && p2.locked) {
      phase = 'resolving';
      phaseTimer = Config.resolveDelay;
    }
  }

  // --- AI decision ---
  function aiChooseAction() {
    // Slight bias: if the other player already locked, AI tries to counter
    var otherFighter = aiSide === 'p1' ? p2 : p1;
    if (otherFighter.locked && Math.random() < Config.aiBias) {
      // Try to pick the counter
      var counter = getCounter(otherFighter.action);
      // Wait for cursor to be in the right zone, or just lock now
      var currentZone = getZone(barCursor);
      if (currentZone === counter) {
        return true; // lock now
      }
      // Otherwise random chance to lock anyway
      return Math.random() < 0.3;
    }
    return true; // lock at random timing
  }

  function getCounter(action) {
    if (action === 'STRIKE') return 'PARRY';
    if (action === 'PARRY') return 'DODGE';
    if (action === 'DODGE') return 'STRIKE';
    return 'STRIKE';
  }

  // --- Resolve combat ---
  function resolveExchange() {
    var res = Config.resolution[p1.action][p2.action];
    var winner = null;
    var text = '';

    if (res === 'win') {
      winner = 'p1';
      p2.hp -= Config.exchangeDamage;
      text = p1.action + ' beats ' + p2.action + '!';
      p1.animState = p1.action.toLowerCase();
      p2.animState = 'hit';
    } else if (res === 'lose') {
      winner = 'p2';
      p1.hp -= Config.exchangeDamage;
      text = p2.action + ' beats ' + p1.action + '!';
      p2.animState = p2.action.toLowerCase();
      p1.animState = 'hit';
    } else {
      text = 'DRAW — ' + p1.action + '!';
      p1.animState = p1.action.toLowerCase();
      p2.animState = p2.action.toLowerCase();
    }

    // Set animation offsets
    updateAnimOffsets(p1);
    updateAnimOffsets(p2);

    lastResult = {
      p1Action: p1.action,
      p2Action: p2.action,
      winner: winner,
      text: text,
    };

    // Play sounds
    if (winner) {
      Audio8.play('hit');
    } else {
      Audio8.play('move');
    }

    p1.animTimer = Config.animDuration;
    p2.animTimer = Config.animDuration;

    phase = 'result';
    phaseTimer = Config.resultDisplayTime;
  }

  function updateAnimOffsets(fighter) {
    var dir = fighter.side === 'p1' ? 1 : -1;
    if (fighter.animState === 'strike') {
      fighter.offsetX = Config.lungeDistance * dir;
    } else if (fighter.animState === 'dodge') {
      fighter.offsetX = -Config.dodgeDistance * dir;
    } else if (fighter.animState === 'hit') {
      fighter.offsetX = -8 * dir;
    } else {
      fighter.offsetX = 0;
    }
  }

  // --- Update ---
  function update(dt) {
    // Update animation timers
    if (p1.animTimer > 0) {
      p1.animTimer -= dt;
      if (p1.animTimer <= 0) {
        p1.animState = 'idle';
        p1.offsetX = 0;
      }
    }
    if (p2.animTimer > 0) {
      p2.animTimer -= dt;
      if (p2.animTimer <= 0) {
        p2.animState = 'idle';
        p2.offsetX = 0;
      }
    }

    if (phase === 'timing') {
      // Move cursor back and forth
      barCursor += barDirection * currentSpeed * dt;
      if (barCursor >= 1) {
        barCursor = 1;
        barDirection = -1;
      } else if (barCursor <= 0) {
        barCursor = 0;
        barDirection = 1;
      }

      // AI timeout — auto-lock if one player hasn't pressed
      lockTimer += dt;

      // AI logic
      if (aiSide) {
        var aiFighter = aiSide === 'p1' ? p1 : p2;
        if (!aiFighter.locked) {
          aiLockTimer += dt;
          if (aiLockTimer >= aiLockDelay && aiChooseAction()) {
            lockAction(aiFighter);
          }
        }
      }

      // Auto-AI activation: if only one player locked after timeout
      if (lockTimer >= Config.lockTimeout) {
        if (!p1.locked && !p2.locked) {
          // Both AFK — random lock both
          lockAction(p1);
          lockAction(p2);
        } else if (!p1.locked) {
          aiSide = 'p1';
          resetAI();
          aiLockTimer = Config.aiMinDelay; // lock soon
        } else if (!p2.locked) {
          aiSide = 'p2';
          resetAI();
          aiLockTimer = Config.aiMinDelay;
        }
      }
    }

    if (phase === 'resolving') {
      phaseTimer -= dt;
      if (phaseTimer <= 0) {
        resolveExchange();
      }
    }

    if (phase === 'result') {
      phaseTimer -= dt;
      if (phaseTimer <= 0) {
        // Check if round is over
        if (p1.hp <= 0 || p2.hp <= 0) {
          if (p1.hp <= 0) {
            p2RoundWins++;
            p2.animState = 'win';
          }
          if (p2.hp <= 0) {
            p1RoundWins++;
            p1.animState = 'win';
          }
          Audio8.play('score');

          // Check match over
          if (p1RoundWins >= Config.roundsToWin || p2RoundWins >= Config.roundsToWin) {
            phase = 'matchEnd';
            phaseTimer = Config.matchEndDelay;
          } else {
            phase = 'roundEnd';
            phaseTimer = Config.roundEndDelay;
          }
        } else {
          // Next exchange
          startExchange();
        }
      }
    }

    if (phase === 'roundEnd') {
      phaseTimer -= dt;
      if (phaseTimer <= 0) {
        roundNum++;
        startRound();
      }
    }

    // matchEnd is handled by game.js
  }

  // --- Public API ---
  return {
    reset: reset,
    startRound: startRound,
    update: update,

    lockP1: function () { lockAction(p1); },
    lockP2: function () { lockAction(p2); },

    get p1() { return p1; },
    get p2() { return p2; },
    get phase() { return phase; },
    set phase(v) { phase = v; },
    get phaseTimer() { return phaseTimer; },
    get barCursor() { return barCursor; },
    get roundNum() { return roundNum; },
    get p1RoundWins() { return p1RoundWins; },
    get p2RoundWins() { return p2RoundWins; },
    get lastResult() { return lastResult; },
    get currentSpeed() { return currentSpeed; },

    setAI: function (side) { aiSide = side; resetAI(); },
    get aiSide() { return aiSide; },

    getZone: getZone,
  };
})();
