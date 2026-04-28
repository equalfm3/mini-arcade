/* Cookie Clicker — Main game orchestrator

   Modules loaded before this file:
   - Config    (src/config.js)   — constants, upgrade data
   - Economy   (src/economy.js)  — cookie count, CPS, save/load
   - Upgrades  (src/upgrades.js) — auto-clicker tiers, click multipliers
   - Renderer  (src/renderer.js) — DOM rendering, shop, floating text

   Shared globals available:
   - Shell, Audio8, Input, Engine

   This is a DOM game — Engine.create WITHOUT canvas.
   Uses Engine for game loop (update/draw) and state machine (pause via Esc/P).
*/

(function () {

  var saveTimer = 0;
  var paused = false;

  var game = Engine.create({
    startHint: 'Click the cookie!',

    init: function () {
      Input.init();
    },

    reset: function () {
      Economy.reset();
      Upgrades.reset();
      Renderer.build(Shell.area);
      Renderer.clearFloaters();
      saveTimer = 0;
      paused = false;
      attachListeners();
      Renderer.update();
    },

    update: function (dt) {
      if (paused) { Input.endFrame(); return; }

      // Auto-generate cookies
      Economy.update(dt);

      // Auto-save
      saveTimer += dt;
      if (saveTimer >= Config.autoSaveInterval) {
        saveTimer = 0;
        Economy.save(Upgrades.owned, Upgrades.clickLevel);
      }

      // Update floating text
      Renderer.updateFloaters(dt);

      // Update display
      Renderer.update();

      // Pause check
      if (Input.pressed('Escape') || Input.pressed('p') || Input.pressed('P')) {
        game.togglePause();
      }

      Input.endFrame();
    },

    draw: function () {
      // DOM game — no canvas drawing needed
    },

    onStateChange: function (from, to) {
      if (to === 'paused') {
        paused = true;
      } else if (to === 'playing') {
        paused = false;
      }
    },
  });

  /** Attach click listeners to cookie and shop */
  function attachListeners() {
    // Cookie click
    var btn = Renderer.cookieBtn;
    if (btn) {
      btn.addEventListener('click', onCookieClick);
      btn.addEventListener('touchend', function (e) {
        e.preventDefault();
        onCookieClick(e);
      });
    }

    // Shop: auto-clicker upgrades
    var shopList = Renderer.shopList;
    if (shopList) {
      shopList.addEventListener('click', function (e) {
        var item = e.target.closest('.cc-shop-item');
        if (!item) return;
        var tier = parseInt(item.getAttribute('data-tier'), 10);
        if (!isNaN(tier)) {
          Upgrades.buyUpgrade(tier);
          Renderer.update();
        }
      });
    }

    // Shop: click upgrades
    var clickShopList = Renderer.clickShopList;
    if (clickShopList) {
      clickShopList.addEventListener('click', function (e) {
        var item = e.target.closest('.cc-click-upgrade');
        if (!item) return;
        var tier = parseInt(item.getAttribute('data-click-tier'), 10);
        if (!isNaN(tier) && tier === Upgrades.clickLevel) {
          Upgrades.buyClickUpgrade();
          Renderer.update();
        }
      });
    }
  }

  /** Handle cookie click */
  function onCookieClick(e) {
    if (paused) return;
    var earned = Economy.click();
    Audio8.play('click');

    // Bounce animation
    var btn = Renderer.cookieBtn;
    if (btn) {
      btn.classList.remove('cc-bounce');
      void btn.offsetWidth; // force reflow
      btn.classList.add('cc-bounce');
    }

    // Floating text at click position
    var rect = btn.getBoundingClientRect();
    var areaRect = Shell.area.getBoundingClientRect();
    var x, y;
    if (e && e.clientX) {
      x = e.clientX - areaRect.left;
      y = e.clientY - areaRect.top;
    } else if (e && e.changedTouches && e.changedTouches[0]) {
      x = e.changedTouches[0].clientX - areaRect.left;
      y = e.changedTouches[0].clientY - areaRect.top;
    } else {
      x = rect.left - areaRect.left + rect.width / 2;
      y = rect.top - areaRect.top;
    }
    Renderer.spawnFloater(x, y, earned);
    Renderer.update();
  }

  /** Try to load saved game */
  function tryLoadSave() {
    Economy.reset();
    Upgrades.reset();
    var data = Economy.load();
    if (data) {
      Upgrades.restore(data.upgradeOwned, data.clickUpgradeLevel);
      return true;
    }
    return false;
  }

  // --- Start ---
  // Override start to handle save/load
  var origStart = game.start;
  game.start = function () {
    if (game.init) game.init = game.init;
    origStart.call(game);
  };

  // Override play to load save on first play
  var firstPlay = true;
  var origPlay = game.play;
  game.play = function () {
    if (firstPlay) {
      firstPlay = false;
      Shell.hideOverlay();
      Economy.reset();
      Upgrades.reset();
      Renderer.build(Shell.area);
      attachListeners();

      // Load saved game
      var hadSave = tryLoadSave();
      if (hadSave) {
        // Rebuild renderer with loaded state
        Renderer.build(Shell.area);
        attachListeners();
        Shell.toast('Welcome back!');
      }
      Renderer.update();

      // Start the game loop
      game.state = 'playing';
      origPlay.call(game);
      return;
    }
    origPlay.call(game);
  };

  // Save on page unload
  window.addEventListener('beforeunload', function () {
    Economy.save(Upgrades.owned, Upgrades.clickLevel);
  });

  game.start();

})();
