/* Cookie Clicker — Upgrades Module
   Manages auto-clicker tiers and click multiplier upgrades. */

var Upgrades = (function () {

  // How many of each auto-clicker tier the player owns
  var owned = [];
  // Current click upgrade level (0 = none, 1 = double, 2 = triple, 3 = mega)
  var clickLevel = 0;

  function reset() {
    owned = [];
    for (var i = 0; i < Config.upgrades.length; i++) {
      owned.push(0);
    }
    clickLevel = 0;
  }

  /** Get current cost for an auto-clicker tier */
  function getCost(tierIndex) {
    var tier = Config.upgrades[tierIndex];
    return Math.floor(tier.baseCost * Math.pow(Config.costScale, owned[tierIndex]));
  }

  /** Buy an auto-clicker tier — returns true if purchased */
  function buyUpgrade(tierIndex) {
    var cost = getCost(tierIndex);
    if (Economy.spend(cost)) {
      owned[tierIndex]++;
      Economy.addCPS(Config.upgrades[tierIndex].cps);
      Audio8.play('score');
      return true;
    }
    Audio8.play('error');
    return false;
  }

  /** Get next click upgrade (or null if all purchased) */
  function getNextClickUpgrade() {
    if (clickLevel >= Config.clickUpgrades.length) return null;
    return Config.clickUpgrades[clickLevel];
  }

  /** Buy the next click upgrade — returns true if purchased */
  function buyClickUpgrade() {
    var upgrade = getNextClickUpgrade();
    if (!upgrade) return false;
    if (Economy.spend(upgrade.cost)) {
      clickLevel++;
      Economy.setClickMultiplier(upgrade.multiplier);
      Audio8.play('score');
      return true;
    }
    Audio8.play('error');
    return false;
  }

  /** Restore state from saved data */
  function restore(savedOwned, savedClickLevel) {
    if (savedOwned && savedOwned.length === Config.upgrades.length) {
      for (var i = 0; i < savedOwned.length; i++) {
        owned[i] = savedOwned[i];
      }
    }
    clickLevel = savedClickLevel || 0;
  }

  return {
    reset: reset,
    getCost: getCost,
    buyUpgrade: buyUpgrade,
    getNextClickUpgrade: getNextClickUpgrade,
    buyClickUpgrade: buyClickUpgrade,
    restore: restore,
    get owned() { return owned; },
    get clickLevel() { return clickLevel; },
  };
})();
