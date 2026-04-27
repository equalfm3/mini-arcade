/* ============================================
   timer.js — Countdown and stopwatch timers
   
   Usage:
     var t = Timer.countdown(30, function(s) {
       Shell.setStat('time', s);
     }, function() {
       // time's up
     });
     t.start();
     t.pause();
     t.reset(30);
   
     var sw = Timer.stopwatch(function(s) {
       Shell.setStat('time', Timer.format(s));
     });
   ============================================ */

var Timer = (function () {

  /** Format seconds as M:SS */
  function format(secs) {
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /** Countdown timer */
  function countdown(seconds, onTick, onDone) {
    var remaining = seconds;
    var interval = null;
    var running = false;

    function tick() {
      remaining--;
      if (onTick) onTick(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(interval);
        running = false;
        if (onDone) onDone();
      }
    }

    return {
      start: function () {
        if (running) return;
        running = true;
        if (onTick) onTick(remaining);
        interval = setInterval(tick, 1000);
      },
      pause: function () {
        clearInterval(interval);
        running = false;
      },
      reset: function (s) {
        clearInterval(interval);
        running = false;
        remaining = s !== undefined ? s : seconds;
        if (onTick) onTick(remaining);
      },
      get remaining() { return remaining; },
      get running() { return running; },
    };
  }

  /** Stopwatch (counts up) */
  function stopwatch(onTick) {
    var elapsed = 0;
    var interval = null;
    var running = false;

    function tick() {
      elapsed++;
      if (onTick) onTick(elapsed);
    }

    return {
      start: function () {
        if (running) return;
        running = true;
        interval = setInterval(tick, 1000);
      },
      pause: function () {
        clearInterval(interval);
        running = false;
      },
      reset: function () {
        clearInterval(interval);
        running = false;
        elapsed = 0;
        if (onTick) onTick(0);
      },
      get elapsed() { return elapsed; },
      get running() { return running; },
    };
  }

  return {
    format: format,
    countdown: countdown,
    stopwatch: stopwatch,
  };
})();
