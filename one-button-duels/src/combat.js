/* One-Button Duels — Combat Module

   Player vs AI with simultaneous blind pick.
   Player picks an action from 3 buttons.
   AI picks independently (weighted random, NO cheating).
   Both revealed simultaneously.

   Actions: STRIKE > DODGE > PARRY > STRIKE
*/

var Combat = (function () {

  var player = null;
  var ai = null;
  var roundNum = 0;
  var playerRoundWins = 0;
  var aiRoundWins = 0;
  var phase = 'idle';       // idle, choosing, resolving, result, roundEnd, matchEnd
  var phaseTimer = 0;
  var chooseTimer = 0;
  var playerChoice = null;  // player's chosen action (null until picked)
  var aiChoice = null;      // AI's chosen action (picked when player picks)
  var lastResult = null;
  var aiPersonalityIdx = 0;
  var aiConsecutiveLosses = 0;

  function createFighter(side) {
    return {
      side: side,
      hp: Config.hpPerRound,
      animState: 'idle',
      animTimer: 0,
      offsetX: 0,
    };
  }

  function reset() {
    player = createFighter('player');
    ai = createFighter('ai');
    roundNum = 1;
    playerRoundWins = 0;
    aiRoundWins = 0;
    phase = 'idle';
    phaseTimer = 0;
    chooseTimer = 0;
    playerChoice = null;
    aiChoice = null;
    lastResult = null;
    aiPersonalityIdx = 0;
    aiConsecutiveLosses = 0;
  }

  function startRound() {
    player.hp = Config.hpPerRound;
    ai.hp = Config.hpPerRound;
    player.animState = 'idle';
    ai.animState = 'idle';
    player.offsetX = 0;
    ai.offsetX = 0;
    playerChoice = null;
    aiChoice = null;
    lastResult = null;
    chooseTimer = Config.chooseTime;
    phase = 'choosing';
  }

  function startExchange() {
    player.animState = 'idle';
    ai.animState = 'idle';
    player.offsetX = 0;
    ai.offsetX = 0;
    playerChoice = null;
    aiChoice = null;
    lastResult = null;
    chooseTimer = Config.chooseTime;
    phase = 'choosing';
  }

  /** AI picks an action based on weighted personality (NO cheating) */
  function aiPick() {
    var personality = Config.aiPersonalities[aiPersonalityIdx % Config.aiPersonalities.length];
    var weights = personality.weights;
    var roll = Math.random();
    var cumulative = 0;

    for (var i = 0; i < Config.actions.length; i++) {
      cumulative += weights[Config.actions[i]];
      if (roll <= cumulative) return Config.actions[i];
    }
    return Config.actions[Config.actions.length - 1];
  }

  /** Player selects an action */
  function playerSelect(action) {
    if (phase !== 'choosing' || playerChoice !== null) return false;
    if (Config.actions.indexOf(action) === -1) return false;

    playerChoice = action;
    // AI picks simultaneously (blind — doesn't know player's choice)
    aiChoice = aiPick();

    Audio8.play('click');
    phase = 'resolving';
    phaseTimer = Config.resolveDelay;
    return true;
  }

  /** Resolve the exchange */
  function resolveExchange() {
    var res = Config.resolution[playerChoice][aiChoice];
    var winner = null;
    var text = '';

    if (res === 'win') {
      winner = 'player';
      ai.hp -= Config.exchangeDamage;
      text = playerChoice + ' beats ' + aiChoice + '!';
      player.animState = playerChoice.toLowerCase();
      ai.animState = 'hit';
      aiConsecutiveLosses++;
    } else if (res === 'lose') {
      winner = 'ai';
      player.hp -= Config.exchangeDamage;
      text = aiChoice + ' beats ' + playerChoice + '!';
      ai.animState = aiChoice.toLowerCase();
      player.animState = 'hit';
      aiConsecutiveLosses = 0;
    } else {
      text = 'DRAW — both ' + playerChoice + '!';
      player.animState = playerChoice.toLowerCase();
      ai.animState = aiChoice.toLowerCase();
      aiConsecutiveLosses = 0;
    }

    // Animation offsets
    setAnimOffset(player, 1);
    setAnimOffset(ai, -1);

    // AI adapts personality after consecutive losses
    if (aiConsecutiveLosses >= Config.aiAdaptThreshold) {
      aiPersonalityIdx = (aiPersonalityIdx + 1) % Config.aiPersonalities.length;
      aiConsecutiveLosses = 0;
    }

    lastResult = {
      playerAction: playerChoice,
      aiAction: aiChoice,
      winner: winner,
      text: text,
    };

    if (winner) {
      Audio8.play('hit');
    } else {
      Audio8.play('move');
    }

    player.animTimer = Config.animDuration;
    ai.animTimer = Config.animDuration;
    phase = 'result';
    phaseTimer = Config.resultDisplayTime;
  }

  function setAnimOffset(fighter, dir) {
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

  function update(dt) {
    // Animation timers
    if (player.animTimer > 0) {
      player.animTimer -= dt;
      if (player.animTimer <= 0) { player.animState = 'idle'; player.offsetX = 0; }
    }
    if (ai.animTimer > 0) {
      ai.animTimer -= dt;
      if (ai.animTimer <= 0) { ai.animState = 'idle'; ai.offsetX = 0; }
    }

    if (phase === 'choosing') {
      chooseTimer -= dt;
      // Auto-pick random if timeout
      if (chooseTimer <= 0 && playerChoice === null) {
        var randomAction = Config.actions[Math.floor(Math.random() * Config.actions.length)];
        playerSelect(randomAction);
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
        if (player.hp <= 0 || ai.hp <= 0) {
          if (player.hp <= 0) { aiRoundWins++; ai.animState = 'win'; }
          if (ai.hp <= 0) { playerRoundWins++; player.animState = 'win'; }
          Audio8.play('score');

          if (playerRoundWins >= Config.roundsToWin || aiRoundWins >= Config.roundsToWin) {
            phase = 'matchEnd';
            phaseTimer = Config.matchEndDelay;
          } else {
            phase = 'roundEnd';
            phaseTimer = Config.roundEndDelay;
          }
        } else {
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
  }

  return {
    reset: reset,
    startRound: startRound,
    update: update,
    playerSelect: playerSelect,
    get player() { return player; },
    get ai() { return ai; },
    get phase() { return phase; },
    set phase(v) { phase = v; },
    get phaseTimer() { return phaseTimer; },
    get chooseTimer() { return chooseTimer; },
    get playerChoice() { return playerChoice; },
    get aiChoice() { return aiChoice; },
    get roundNum() { return roundNum; },
    get playerRoundWins() { return playerRoundWins; },
    get aiRoundWins() { return aiRoundWins; },
    get lastResult() { return lastResult; },
    get aiPersonalityName() {
      return Config.aiPersonalities[aiPersonalityIdx % Config.aiPersonalities.length].name;
    },
  };
})();
