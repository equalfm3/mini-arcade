/* Color Flood — DOM Renderer (grid, color picker, progress bar, flood animation) */

var Renderer = (function () {

  var cellEls = [];     // 2D array: cellEls[y][x] = DOM element
  var gridEl = null;
  var pickerEl = null;
  var progressEl = null;
  var progressFill = null;
  var statusEl = null;
  var pickerBtns = [];
  var _onColorPick = null;
  var _animating = false;

  /** Build the entire game UI in the container */
  function build(container, onColorPick) {
    container.innerHTML = '';
    _onColorPick = onColorPick;
    _animating = false;

    // Wrapper
    var wrapper = document.createElement('div');
    wrapper.className = 'cf-wrapper';

    // Progress bar
    progressEl = document.createElement('div');
    progressEl.className = 'cf-progress';
    progressFill = document.createElement('div');
    progressFill.className = 'cf-progress-fill';
    progressFill.style.width = '0%';
    progressEl.appendChild(progressFill);
    wrapper.appendChild(progressEl);

    // Grid
    gridEl = document.createElement('div');
    gridEl.className = 'cf-grid';
    gridEl.style.gridTemplateColumns = 'repeat(' + Config.cols + ', 1fr)';

    cellEls = [];
    for (var y = 0; y < Config.rows; y++) {
      cellEls[y] = [];
      for (var x = 0; x < Config.cols; x++) {
        var cell = document.createElement('div');
        cell.className = 'cf-cell';
        gridEl.appendChild(cell);
        cellEls[y][x] = cell;
      }
    }
    wrapper.appendChild(gridEl);

    // Status text (positioned absolutely inside wrapper)
    statusEl = document.createElement('div');
    statusEl.className = 'cf-status';
    wrapper.appendChild(statusEl);

    // Color picker
    pickerEl = document.createElement('div');
    pickerEl.className = 'cf-picker';
    pickerBtns = [];

    for (var i = 0; i < Config.colors.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'cf-picker-btn';
      btn.style.backgroundColor = Config.colors[i];
      btn.dataset.color = i;
      btn.setAttribute('aria-label', 'Pick ' + Config.colorNames[i]);

      btn.addEventListener('click', (function (idx) {
        return function (e) {
          e.preventDefault();
          if (_onColorPick && !_animating) _onColorPick(idx);
        };
      })(i));

      btn.addEventListener('touchend', (function (idx) {
        return function (e) {
          e.preventDefault();
          if (_onColorPick && !_animating) _onColorPick(idx);
        };
      })(i));

      pickerEl.appendChild(btn);
      pickerBtns.push(btn);
    }
    wrapper.appendChild(pickerEl);

    container.appendChild(wrapper);
  }

  /** Update all cells to reflect current board state */
  function updateAll() {
    var grid = Board.getGrid();
    for (var y = 0; y < Config.rows; y++) {
      for (var x = 0; x < Config.cols; x++) {
        var colorIdx = grid[y][x];
        cellEls[y][x].style.backgroundColor = Config.colors[colorIdx];
        cellEls[y][x].className = 'cf-cell';
      }
    }
    updateProgress();
    updatePicker();
  }

  /** Update progress bar */
  function updateProgress() {
    var pct = (Board.territorySize / Config.totalCells) * 100;
    progressFill.style.width = pct + '%';

    // Color the progress bar based on percentage
    if (pct >= 80) {
      progressFill.style.backgroundColor = '#44ff66';
    } else if (pct >= 50) {
      progressFill.style.backgroundColor = '#ffd700';
    } else {
      progressFill.style.backgroundColor = '#44aaff';
    }
  }

  /** Update picker — dim the current territory color */
  function updatePicker() {
    var currentColor = Board.getTerritoryColor();
    for (var i = 0; i < pickerBtns.length; i++) {
      if (i === currentColor) {
        pickerBtns[i].classList.add('cf-picker-btn-disabled');
        pickerBtns[i].disabled = true;
      } else {
        pickerBtns[i].classList.remove('cf-picker-btn-disabled');
        pickerBtns[i].disabled = false;
      }
    }
  }

  /**
   * Animate the flood fill — cells ripple outward in waves.
   * waves: array of arrays of {x, y} cells per wave ring.
   * newColor: the color index to transition to.
   * callback: called when animation completes.
   */
  function animateFlood(waves, newColor, callback) {
    if (waves.length === 0) {
      if (callback) callback();
      return;
    }

    _animating = true;
    var color = Config.colors[newColor];
    var totalDelay = 0;

    for (var w = 0; w < waves.length; w++) {
      var wave = waves[w];
      var delay = w * Config.floodWaveDelay;

      for (var c = 0; c < wave.length; c++) {
        scheduleCell(wave[c], color, delay);
      }

      totalDelay = delay;
    }

    // After all waves complete
    var finishDelay = totalDelay + Config.floodCellDuration + Config.absorbPause;
    setTimeout(function () {
      _animating = false;
      if (callback) callback();
    }, finishDelay);
  }

  function scheduleCell(cell, color, delay) {
    setTimeout(function () {
      var el = cellEls[cell.y][cell.x];
      el.classList.add('cf-cell-absorb');
      el.style.backgroundColor = color;
    }, delay);
  }

  /** Set status text */
  function setStatus(text, type) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'cf-status';
    if (type) statusEl.classList.add('cf-status-' + type);
  }

  /** Disable the picker */
  function disablePicker() {
    for (var i = 0; i < pickerBtns.length; i++) {
      pickerBtns[i].disabled = true;
      pickerBtns[i].classList.add('cf-picker-btn-disabled');
    }
  }

  /** Check if currently animating */
  function isAnimating() {
    return _animating;
  }

  return {
    build: build,
    updateAll: updateAll,
    updateProgress: updateProgress,
    updatePicker: updatePicker,
    animateFlood: animateFlood,
    setStatus: setStatus,
    disablePicker: disablePicker,
    isAnimating: isAnimating,
  };
})();
