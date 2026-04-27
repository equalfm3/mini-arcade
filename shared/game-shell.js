/* ============================================
   game-shell.js — Auto-builds the game page chrome.
   
   Usage in each game's index.html:
   
   <script>
     var GAME = { title: '🐍 Snake', stats: [{ id: 'score', label: 'Score', value: '0' }] };
   </script>
   <script src="../shared/game-shell.js"></script>
   
   This creates: back link, HUD bar, game area wrapper, overlay system.
   The game's own game.js then fills the game area.
   ============================================ */

(function () {
  var g = window.GAME || {};
  var title = g.title || 'Game';
  var stats = g.stats || [{ id: 'score', label: 'Score', value: '0' }];

  // --- Back link ---
  var back = document.createElement('a');
  back.href = '../index.html';
  back.className = 'back-link';
  back.textContent = '← Arcade';
  document.body.appendChild(back);

  // --- Shell container ---
  var shell = document.createElement('div');
  shell.className = 'game-shell';
  document.body.appendChild(shell);

  // --- HUD bar ---
  var hud = document.createElement('div');
  hud.className = 'game-hud';

  var titleWrap = document.createElement('div');
  titleWrap.className = 'game-hud-title';

  // Inject pixel icon if GameIcons is loaded and game id is set
  if (window.GameIcons && g.id) {
    var iconSpan = document.createElement('span');
    iconSpan.className = 'game-hud-icon';
    iconSpan.innerHTML = GameIcons.svg(g.id, 24);
    titleWrap.appendChild(iconSpan);
  }

  var h1 = document.createElement('h1');
  h1.className = 'game-hud-name';
  h1.textContent = title;
  titleWrap.appendChild(h1);
  hud.appendChild(titleWrap);

  var statsDiv = document.createElement('div');
  statsDiv.className = 'game-hud-stats';

  for (var i = 0; i < stats.length; i++) {
    var s = stats[i];
    var stat = document.createElement('div');
    stat.className = 'game-hud-stat';
    stat.innerHTML = s.label + ' <span class="val" id="' + s.id + '">' + s.value + '</span>';
    statsDiv.appendChild(stat);
  }

  hud.appendChild(statsDiv);
  shell.appendChild(hud);

  // --- Game area ---
  var area = document.createElement('div');
  area.className = 'game-area';
  area.id = 'game-area';
  shell.appendChild(area);

  // --- Controls slot ---
  var controls = document.createElement('div');
  controls.className = 'game-controls';
  controls.id = 'game-controls';
  shell.appendChild(controls);

  // --- Overlay system ---
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'overlay';
  overlay.innerHTML =
    '<h2 class="overlay-title" id="overlay-title"></h2>' +
    '<p class="overlay-subtitle" id="overlay-subtitle"></p>' +
    '<p class="overlay-score" id="overlay-score"></p>' +
    '<button class="btn btn-primary" id="overlay-btn"></button>';
  document.body.appendChild(overlay);

  // --- Toast ---
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.id = 'toast';
  document.body.appendChild(toast);

  // --- Public API ---
  window.Shell = {
    /** Get the game area container */
    area: area,

    /** Get the controls container */
    controls: controls,

    /** Update a HUD stat value */
    setStat: function (id, value) {
      var el = document.getElementById(id);
      if (el) el.textContent = value;
    },

    /** Show overlay */
    showOverlay: function (opts) {
      var o = opts || {};
      document.getElementById('overlay-title').textContent = o.title || '';
      document.getElementById('overlay-subtitle').textContent = o.subtitle || '';
      document.getElementById('overlay-score').textContent = o.score || '';
      var btn = document.getElementById('overlay-btn');
      btn.textContent = o.btn || 'Play';
      // Remove old handler and set new one
      var newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      if (o.onAction) {
        newBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          o.onAction();
        });
        newBtn.addEventListener('touchend', function (e) {
          e.preventDefault();
          e.stopPropagation();
          o.onAction();
        });
      }
      overlay.removeAttribute('hidden');
      overlay.style.display = '';
    },

    /** Hide overlay */
    hideOverlay: function () {
      overlay.setAttribute('hidden', '');
      overlay.style.display = 'none';
    },

    /** Flash a toast message */
    toast: function (msg, duration) {
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toast._t);
      toast._t = setTimeout(function () {
        toast.classList.remove('show');
      }, duration || 1500);
    }
  };
})();
