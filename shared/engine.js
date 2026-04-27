/* ============================================
   engine.js — Shared game engine core
   
   Provides: game loop, state machine, canvas
   setup, pause/resume, restart, and lifecycle hooks.
   
   Usage:
     var game = Engine.create({
       canvas: { width: 400, height: 400 },
       init: function (ctx) { ... },
       update: function (dt, ctx) { ... },
       draw: function (ctx) { ... },
       onStateChange: function (from, to) { ... },
       onRestart: function () { ... },  // optional: custom restart logic
     });
     game.start();
   ============================================ */

var Engine = (function () {

  /** Remove any restart button from the overlay */
  function cleanupRestartBtn() {
    var overlay = document.getElementById('overlay');
    if (!overlay) return;
    var rb = overlay.querySelector('.restart-btn');
    if (rb) rb.remove();
  }

  /** Add a restart button below the main overlay button */
  function addRestartBtn(onRestart) {
    var overlay = document.getElementById('overlay');
    if (!overlay) return;
    cleanupRestartBtn();
    var rb = document.createElement('button');
    rb.className = 'btn restart-btn';
    rb.textContent = 'Restart';
    rb.style.cssText = 'margin-top:8px;';
    rb.addEventListener('click', function (e) {
      e.stopPropagation();
      onRestart();
    });
    rb.addEventListener('touchend', function (e) {
      e.preventDefault();
      e.stopPropagation();
      onRestart();
    });
    overlay.appendChild(rb);
  }

  function create(opts) {
    var o = opts || {};
    var state = 'idle';
    var canvas, ctx, width, height;
    var rafId = null;
    var lastTime = 0;

    // --- Canvas setup ---
    function setupCanvas() {
      if (!o.canvas) return;
      canvas = document.createElement('canvas');
      var area = Shell ? Shell.area : document.body;
      var maxW = o.canvas.width || 400;
      var maxH = o.canvas.height || 400;

      function resize() {
        var parentW = area.clientWidth || maxW;
        var scale = Math.min(parentW / maxW, 1);
        width = Math.floor(maxW * scale);
        height = Math.floor(maxH * scale);
        var dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;
        game.ctx = ctx;
        game.w = width;
        game.h = height;
        game.scale = scale;
      }

      area.appendChild(canvas);
      resize();
      window.addEventListener('resize', resize);
      game.canvas = canvas;
      game.ctx = ctx;
    }

    // --- State machine ---
    function setState(s) {
      var prev = state;
      state = s;
      game.state = s;
      if (o.onStateChange) o.onStateChange(prev, s);
    }

    // --- Loop ---
    function loop(time) {
      if (state !== 'playing') return;
      var dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      if (o.update) o.update(dt, ctx);
      if (o.draw) o.draw(ctx);
      rafId = requestAnimationFrame(loop);
    }

    // --- Restart handler ---
    function doRestart() {
      cancelAnimationFrame(rafId);
      cleanupRestartBtn();
      if (Shell) Shell.hideOverlay();
      setState('idle');
      if (o.onRestart) {
        o.onRestart();
      } else {
        // Default: show start screen again
        if (Shell) {
          Shell.showOverlay({
            title: GAME.title || 'Ready?',
            subtitle: o.startHint || 'Tap or press any key',
            btn: 'Start',
            onAction: function () { game.play(); }
          });
        }
      }
    }

    // --- Public API ---
    var game = {
      canvas: null,
      ctx: null,
      w: 0,
      h: 0,
      scale: 1,
      state: 'idle',

      /** Initialize and show start screen */
      start: function () {
        setupCanvas();
        if (o.init) o.init(ctx);
        setState('idle');
        if (Shell) {
          Shell.showOverlay({
            title: GAME.title || 'Ready?',
            subtitle: o.startHint || 'Tap or press any key',
            btn: 'Start',
            onAction: function () { game.play(); }
          });
        }
      },

      /** Begin or resume gameplay */
      play: function () {
        cleanupRestartBtn();
        if (Shell) Shell.hideOverlay();
        if (state === 'idle' || state === 'over') {
          if (o.reset) o.reset(ctx);
        }
        setState('playing');
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      },

      /** Pause — shows Resume + Restart buttons */
      pause: function () {
        if (state !== 'playing') return;
        cancelAnimationFrame(rafId);
        setState('paused');
        if (Shell) {
          Shell.showOverlay({
            title: 'Paused',
            btn: 'Resume',
            onAction: function () {
              cleanupRestartBtn();
              game.play();
            }
          });
          addRestartBtn(doRestart);
        }
      },

      /** Toggle pause */
      togglePause: function () {
        if (state === 'playing') game.pause();
        else if (state === 'paused') game.play();
      },

      /** Game over — shows Play Again + Restart */
      gameOver: function (scoreText) {
        cancelAnimationFrame(rafId);
        setState('over');
        if (Shell) {
          Shell.showOverlay({
            title: 'Game Over',
            score: scoreText || '',
            btn: 'Play Again',
            onAction: function () { game.play(); }
          });
        }
      },

      /** Win — shows Play Again */
      win: function (scoreText) {
        cancelAnimationFrame(rafId);
        setState('over');
        if (Shell) {
          Shell.showOverlay({
            title: 'You Win!',
            score: scoreText || '',
            btn: 'Play Again',
            onAction: function () { game.play(); }
          });
        }
      },

      /** Restart — go back to start screen */
      restart: doRestart,

      /** Check current state */
      is: function (s) { return state === s; },
    };

    return game;
  }

  return { create: create };
})();
