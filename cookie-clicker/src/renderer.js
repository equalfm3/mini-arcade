/* Cookie Clicker — Renderer Module
   Builds and updates the DOM: cookie button, counter, shop, floating text. */

var Renderer = (function () {

  var container = null;
  var cookieBtn = null;
  var counterEl = null;
  var cpsEl = null;
  var shopList = null;
  var clickShopList = null;
  var floaters = [];

  function build(area) {
    container = area;
    container.innerHTML = '';

    // --- Main layout ---
    var wrapper = document.createElement('div');
    wrapper.className = 'cc-wrapper';

    // --- Cookie section ---
    var cookieSection = document.createElement('div');
    cookieSection.className = 'cc-cookie-section';

    counterEl = document.createElement('div');
    counterEl.className = 'cc-counter';
    counterEl.textContent = '0 cookies';
    cookieSection.appendChild(counterEl);

    cpsEl = document.createElement('div');
    cpsEl.className = 'cc-cps';
    cpsEl.textContent = 'per second: 0';
    cookieSection.appendChild(cpsEl);

    var cookieWrap = document.createElement('div');
    cookieWrap.className = 'cc-cookie-wrap';

    cookieBtn = document.createElement('button');
    cookieBtn.className = 'cc-cookie-btn';
    cookieBtn.setAttribute('aria-label', 'Click the cookie');
    cookieBtn.innerHTML = '<span class="cc-cookie-art">🍪</span>';
    cookieWrap.appendChild(cookieBtn);
    cookieSection.appendChild(cookieWrap);

    var clickInfo = document.createElement('div');
    clickInfo.className = 'cc-click-info';
    clickInfo.id = 'cc-click-info';
    clickInfo.textContent = '+1 per click';
    cookieSection.appendChild(clickInfo);

    wrapper.appendChild(cookieSection);

    // --- Shop section ---
    var shopSection = document.createElement('div');
    shopSection.className = 'cc-shop-section';

    var shopTitle = document.createElement('h2');
    shopTitle.className = 'cc-shop-title';
    shopTitle.textContent = 'Upgrades';
    shopSection.appendChild(shopTitle);

    shopList = document.createElement('div');
    shopList.className = 'cc-shop-list';
    shopSection.appendChild(shopList);

    // Click upgrades header
    var clickTitle = document.createElement('h3');
    clickTitle.className = 'cc-shop-subtitle';
    clickTitle.textContent = 'Click Power';
    shopSection.appendChild(clickTitle);

    clickShopList = document.createElement('div');
    clickShopList.className = 'cc-shop-list';
    shopSection.appendChild(clickShopList);

    wrapper.appendChild(shopSection);
    container.appendChild(wrapper);

    // Build shop items
    buildShopItems();
    buildClickShopItems();
  }

  function buildShopItems() {
    shopList.innerHTML = '';
    for (var i = 0; i < Config.upgrades.length; i++) {
      var tier = Config.upgrades[i];
      var item = document.createElement('button');
      item.className = 'cc-shop-item';
      item.setAttribute('data-tier', i);
      item.innerHTML =
        '<span class="cc-shop-icon">' + tier.icon + '</span>' +
        '<span class="cc-shop-info">' +
          '<span class="cc-shop-name">' + tier.name + '</span>' +
          '<span class="cc-shop-cost" id="cc-cost-' + i + '"></span>' +
          '<span class="cc-shop-cps">+' + tier.cps + ' CPS</span>' +
        '</span>' +
        '<span class="cc-shop-owned" id="cc-owned-' + i + '">0</span>';
      shopList.appendChild(item);
    }
  }

  function buildClickShopItems() {
    clickShopList.innerHTML = '';
    for (var i = 0; i < Config.clickUpgrades.length; i++) {
      var cu = Config.clickUpgrades[i];
      var item = document.createElement('button');
      item.className = 'cc-shop-item cc-click-upgrade';
      item.setAttribute('data-click-tier', i);
      item.innerHTML =
        '<span class="cc-shop-icon">' + cu.icon + '</span>' +
        '<span class="cc-shop-info">' +
          '<span class="cc-shop-name">' + cu.name + '</span>' +
          '<span class="cc-shop-cost">' + Economy.formatNumber(cu.cost) + '</span>' +
          '<span class="cc-shop-cps">' + cu.multiplier + '× per click</span>' +
        '</span>' +
        '<span class="cc-shop-owned cc-click-status" id="cc-click-' + i + '">—</span>';
      clickShopList.appendChild(item);
    }
  }

  /** Update all displays */
  function update() {
    // Counter
    counterEl.textContent = Economy.formatNumber(Economy.cookies) + ' cookies';

    // CPS
    cpsEl.textContent = 'per second: ' + Economy.formatNumber(Economy.cps);

    // Click info
    var clickInfoEl = document.getElementById('cc-click-info');
    if (clickInfoEl) {
      clickInfoEl.textContent = '+' + Economy.formatNumber(Economy.clickValue) + ' per click';
    }

    // HUD stats
    Shell.setStat('cookies', Economy.formatNumber(Economy.cookies));
    Shell.setStat('cps', Economy.formatNumber(Economy.cps));

    // Auto-clicker shop items
    for (var i = 0; i < Config.upgrades.length; i++) {
      var cost = Upgrades.getCost(i);
      var costEl = document.getElementById('cc-cost-' + i);
      var ownedEl = document.getElementById('cc-owned-' + i);
      if (costEl) costEl.textContent = Economy.formatNumber(cost);
      if (ownedEl) ownedEl.textContent = Upgrades.owned[i];

      // Affordable styling
      var item = shopList.children[i];
      if (item) {
        if (Economy.cookies >= cost) {
          item.classList.add('affordable');
          item.classList.remove('dimmed');
        } else {
          item.classList.remove('affordable');
          item.classList.add('dimmed');
        }
      }
    }

    // Click upgrade items
    var nextClick = Upgrades.getNextClickUpgrade();
    for (var j = 0; j < Config.clickUpgrades.length; j++) {
      var statusEl = document.getElementById('cc-click-' + j);
      var clickItem = clickShopList.children[j];
      if (!clickItem) continue;

      if (j < Upgrades.clickLevel) {
        // Already purchased
        if (statusEl) statusEl.textContent = '✓';
        clickItem.classList.add('purchased');
        clickItem.classList.remove('affordable', 'dimmed');
      } else if (j === Upgrades.clickLevel) {
        // Next available
        if (statusEl) statusEl.textContent = '—';
        clickItem.classList.remove('purchased');
        if (Economy.cookies >= Config.clickUpgrades[j].cost) {
          clickItem.classList.add('affordable');
          clickItem.classList.remove('dimmed');
        } else {
          clickItem.classList.remove('affordable');
          clickItem.classList.add('dimmed');
        }
      } else {
        // Locked
        if (statusEl) statusEl.textContent = '🔒';
        clickItem.classList.add('dimmed');
        clickItem.classList.remove('affordable', 'purchased');
      }
    }
  }

  /** Spawn floating "+N" text at click position */
  function spawnFloater(x, y, amount) {
    var el = document.createElement('div');
    el.className = 'cc-floater';
    el.textContent = '+' + Economy.formatNumber(amount);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    container.appendChild(el);

    floaters.push({ el: el, life: Config.floatDuration });
  }

  /** Update floating text animations */
  function updateFloaters(dt) {
    for (var i = floaters.length - 1; i >= 0; i--) {
      var f = floaters[i];
      f.life -= dt;
      var progress = 1 - (f.life / Config.floatDuration);
      f.el.style.transform = 'translateY(' + (-progress * Config.floatRise) + 'px)';
      f.el.style.opacity = 1 - progress;
      if (f.life <= 0) {
        f.el.remove();
        floaters.splice(i, 1);
      }
    }
  }

  /** Clear all floaters */
  function clearFloaters() {
    for (var i = 0; i < floaters.length; i++) {
      floaters[i].el.remove();
    }
    floaters = [];
  }

  return {
    build: build,
    update: update,
    spawnFloater: spawnFloater,
    updateFloaters: updateFloaters,
    clearFloaters: clearFloaters,
    get cookieBtn() { return cookieBtn; },
    get shopList() { return shopList; },
    get clickShopList() { return clickShopList; },
  };
})();
