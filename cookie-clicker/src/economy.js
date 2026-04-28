/* Cookie Clicker — Economy Module
   Manages cookie count, CPS, click value, and save/load. */

var Economy = (function () {

  var cookies = 0;
  var totalCookies = 0;       // lifetime total (for milestones)
  var cps = 0;                // cookies per second from auto-clickers
  var clickMultiplier = 1;    // from click upgrades
  var nextMilestone = 10;     // next milestone threshold
  var accum = 0;              // fractional CPS accumulator

  function reset() {
    cookies = 0;
    totalCookies = 0;
    cps = 0;
    clickMultiplier = 1;
    nextMilestone = 10;
    accum = 0;
  }

  /** Click the cookie — returns earned amount */
  function click() {
    var earned = Config.baseClickValue * clickMultiplier;
    cookies += earned;
    totalCookies += earned;
    checkMilestone();
    return earned;
  }

  /** Update auto-generation (called each frame) */
  function update(dt) {
    if (cps <= 0) return;
    accum += cps * dt;
    if (accum >= 1) {
      var whole = Math.floor(accum);
      cookies += whole;
      totalCookies += whole;
      accum -= whole;
      checkMilestone();
    }
  }

  /** Check if we crossed a milestone */
  function checkMilestone() {
    if (totalCookies >= nextMilestone) {
      Audio8.play('clear');
      Shell.toast(formatNumber(nextMilestone) + ' cookies!');
      nextMilestone *= Config.milestoneBase;
    }
  }

  /** Spend cookies — returns true if affordable */
  function spend(amount) {
    if (cookies >= amount) {
      cookies -= amount;
      return true;
    }
    return false;
  }

  /** Add to CPS */
  function addCPS(amount) {
    cps += amount;
  }

  /** Set click multiplier */
  function setClickMultiplier(mult) {
    clickMultiplier = mult;
  }

  /** Format large numbers: 1000 → 1K, 1000000 → 1M, etc. */
  function formatNumber(n) {
    if (n < 1000) return Math.floor(n).toLocaleString();
    var suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
    var tier = Math.floor(Math.log10(Math.abs(n)) / 3);
    if (tier >= suffixes.length) tier = suffixes.length - 1;
    if (tier === 0) return Math.floor(n).toLocaleString();
    var scale = Math.pow(10, tier * 3);
    var scaled = n / scale;
    return scaled.toFixed(scaled < 10 ? 1 : 0) + suffixes[tier];
  }

  /** Save game state to localStorage */
  function save(upgradeOwned, clickUpgradeLevel) {
    var data = {
      cookies: cookies,
      totalCookies: totalCookies,
      cps: cps,
      clickMultiplier: clickMultiplier,
      nextMilestone: nextMilestone,
      upgradeOwned: upgradeOwned,
      clickUpgradeLevel: clickUpgradeLevel,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(Config.saveKey, JSON.stringify(data));
    } catch (e) { /* storage full or unavailable */ }
  }

  /** Load game state from localStorage — returns saved data or null */
  function load() {
    try {
      var raw = localStorage.getItem(Config.saveKey);
      if (!raw) return null;
      var data = JSON.parse(raw);
      cookies = data.cookies || 0;
      totalCookies = data.totalCookies || 0;
      cps = data.cps || 0;
      clickMultiplier = data.clickMultiplier || 1;
      nextMilestone = data.nextMilestone || 10;

      // Calculate idle earnings
      if (data.timestamp && cps > 0) {
        var elapsed = (Date.now() - data.timestamp) / 1000;
        var idleEarned = Math.floor(cps * elapsed);
        if (idleEarned > 0) {
          cookies += idleEarned;
          totalCookies += idleEarned;
        }
      }

      return data;
    } catch (e) {
      return null;
    }
  }

  return {
    reset: reset,
    click: click,
    update: update,
    spend: spend,
    addCPS: addCPS,
    setClickMultiplier: setClickMultiplier,
    formatNumber: formatNumber,
    save: save,
    load: load,
    get cookies() { return cookies; },
    get cps() { return cps; },
    get clickMultiplier() { return clickMultiplier; },
    get clickValue() { return Config.baseClickValue * clickMultiplier; },
    get totalCookies() { return totalCookies; },
  };
})();
