/* ============================================
   input.js — Unified keyboard + touch input
   
   Tracks key states (held, just pressed, just released)
   and provides a mobile d-pad / action buttons.
   
   Usage:
     Input.init();
     // In update loop:
     if (Input.pressed('ArrowLeft') || Input.dir === 'left') { ... }
     if (Input.held('Space')) { ... }
     // Call at end of each frame:
     Input.endFrame();
   
   Mobile controls:
     Input.dpad();       // adds d-pad to Shell.controls
     Input.actionBtn();  // adds a single tap button
   ============================================ */

var Input = (function () {

  var keys = {};       // currently held
  var justDown = {};   // pressed this frame
  var justUp = {};     // released this frame
  var dir = null;      // last swipe/dpad direction
  var tapped = false;  // tap this frame
  var _inited = false;

  function init(element) {
    if (_inited) return;
    _inited = true;

    document.addEventListener('keydown', function (e) {
      if (!keys[e.key]) justDown[e.key] = true;
      keys[e.key] = true;
      // Prevent scrolling with arrow keys / space
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space',' '].indexOf(e.key) !== -1) {
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', function (e) {
      keys[e.key] = false;
      justUp[e.key] = true;
    });

    // Swipe on game area
    var el = element || (Shell ? Shell.area : document.body);
    onSwipe(el, function (d) {
      if (d === 'tap') {
        tapped = true;
      } else {
        dir = d;
      }
    });
  }

  function endFrame() {
    justDown = {};
    justUp = {};
    dir = null;
    tapped = false;
  }

  // --- Mobile d-pad ---
  function dpad(container) {
    var c = container || (Shell ? Shell.controls : null);
    if (!c) return;

    var pad = document.createElement('div');
    pad.className = 'dpad';
    var dirs = [
      { cls: 'dpad-up',    label: '▲', d: 'up' },
      { cls: 'dpad-left',  label: '◄', d: 'left' },
      { cls: 'dpad-right', label: '►', d: 'right' },
      { cls: 'dpad-down',  label: '▼', d: 'down' },
    ];

    for (var i = 0; i < dirs.length; i++) {
      var b = document.createElement('button');
      b.className = 'btn ' + dirs[i].cls;
      b.textContent = dirs[i].label;
      b.setAttribute('data-dir', dirs[i].d);
      b.addEventListener('touchstart', (function (d) {
        return function (e) {
          e.preventDefault();
          dir = d;
          justDown['Arrow' + d.charAt(0).toUpperCase() + d.slice(1)] = true;
          keys['Arrow' + d.charAt(0).toUpperCase() + d.slice(1)] = true;
        };
      })(dirs[i].d), { passive: false });
      b.addEventListener('touchend', (function (d) {
        return function () {
          keys['Arrow' + d.charAt(0).toUpperCase() + d.slice(1)] = false;
        };
      })(dirs[i].d));
      pad.appendChild(b);
    }

    c.appendChild(pad);
  }

  // --- Single action button ---
  function actionBtn(label, container) {
    var c = container || (Shell ? Shell.controls : null);
    if (!c) return;

    var b = document.createElement('button');
    b.className = 'btn btn-primary btn-action';
    b.textContent = label || 'TAP';
    b.addEventListener('touchstart', function (e) {
      e.preventDefault();
      tapped = true;
      justDown[' '] = true;
      keys[' '] = true;
    }, { passive: false });
    b.addEventListener('touchend', function () {
      keys[' '] = false;
    });
    c.appendChild(b);
  }

  return {
    init: init,
    endFrame: endFrame,

    /** Is key currently held down? */
    held: function (k) { return !!keys[k]; },

    /** Was key just pressed this frame? */
    pressed: function (k) { return !!justDown[k]; },

    /** Was key just released this frame? */
    released: function (k) { return !!justUp[k]; },

    /** Last swipe/dpad direction ('up','down','left','right') or null */
    get dir() { return dir; },

    /** Was screen tapped / space pressed this frame? */
    get tapped() { return tapped || !!justDown[' ']; },

    /** Add mobile d-pad */
    dpad: dpad,

    /** Add mobile action button */
    actionBtn: actionBtn,
  };
})();
