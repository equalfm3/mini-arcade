/* Sound Memory — DOM Renderer
   6 identical-looking circular buttons, glow on press,
   waveform display, phase text */

var Renderer = (function () {

  var buttonEls = [];
  var gridEl = null;
  var statusEl = null;
  var waveformCanvas = null;
  var waveformCtx = null;
  var waveformAnimId = null;

  /** Build the 2×3 button grid + waveform display in the container */
  function build(container, onButtonClick) {
    container.innerHTML = '';
    buttonEls = [];

    // Wrapper
    var wrapper = document.createElement('div');
    wrapper.className = 'sm-wrapper';

    // Status message (above grid, absolutely positioned to prevent layout shifts)
    statusEl = document.createElement('div');
    statusEl.className = 'sm-status';
    statusEl.textContent = '';
    wrapper.appendChild(statusEl);

    // Button grid
    gridEl = document.createElement('div');
    gridEl.className = 'sm-grid';

    for (var i = 0; i < Config.totalButtons; i++) {
      var el = document.createElement('button');
      el.className = 'sm-btn';
      el.dataset.index = i;
      el.setAttribute('aria-label', Config.buttons[i].note);

      // Note label inside the button
      var label = document.createElement('span');
      label.className = 'sm-btn-note';
      label.textContent = Config.buttons[i].note;
      el.appendChild(label);

      el.addEventListener('click', (function (idx) {
        return function (e) {
          e.preventDefault();
          onButtonClick(idx);
        };
      })(i));

      el.addEventListener('touchend', (function (idx) {
        return function (e) {
          e.preventDefault();
          onButtonClick(idx);
        };
      })(i));

      gridEl.appendChild(el);
      buttonEls.push(el);
    }

    wrapper.appendChild(gridEl);

    // Waveform display
    waveformCanvas = document.createElement('canvas');
    waveformCanvas.className = 'sm-waveform';
    waveformCanvas.width = Config.waveformWidth * 2;
    waveformCanvas.height = Config.waveformHeight * 2;
    waveformCanvas.style.width = Config.waveformWidth + 'px';
    waveformCanvas.style.height = Config.waveformHeight + 'px';
    waveformCtx = waveformCanvas.getContext('2d');
    waveformCtx.scale(2, 2);
    wrapper.appendChild(waveformCanvas);

    container.appendChild(wrapper);

    // Start waveform animation
    startWaveformAnimation();
  }

  /** Update button visuals based on active button */
  function update() {
    var active = Sequence.getActiveButton();

    for (var i = 0; i < buttonEls.length; i++) {
      if (i === active) {
        buttonEls[i].classList.add('sm-btn-active');
      } else {
        buttonEls[i].classList.remove('sm-btn-active');
      }
    }
  }

  /** Flash a button briefly (for learn phase) */
  function flashButton(index, duration) {
    if (!buttonEls[index]) return;
    buttonEls[index].classList.add('sm-btn-active');
    setTimeout(function () {
      if (buttonEls[index]) buttonEls[index].classList.remove('sm-btn-active');
    }, duration || 400);
  }

  /** Flash a button as wrong (red pulse) */
  function flashWrong(index) {
    if (!buttonEls[index]) return;
    buttonEls[index].classList.add('sm-btn-wrong');
    setTimeout(function () {
      if (buttonEls[index]) buttonEls[index].classList.remove('sm-btn-wrong');
    }, 600);
  }

  /** Set status message */
  function setStatus(text, type) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'sm-status';
    if (type) statusEl.classList.add('sm-status-' + type);
  }

  /** Disable all button interactions */
  function disableButtons() {
    if (gridEl) gridEl.classList.add('sm-disabled');
  }

  /** Enable button interactions */
  function enableButtons() {
    if (gridEl) gridEl.classList.remove('sm-disabled');
  }

  /** Reset all buttons to default state */
  function resetButtons() {
    for (var i = 0; i < buttonEls.length; i++) {
      buttonEls[i].classList.remove('sm-btn-active', 'sm-btn-wrong');
    }
  }

  /** Draw waveform visualization */
  function drawWaveform() {
    if (!waveformCtx) return;
    var w = Config.waveformWidth;
    var h = Config.waveformHeight;
    var bars = Config.waveformBars;
    var barW = w / bars;

    waveformCtx.clearRect(0, 0, w, h);

    var data = Tones.getWaveformData();
    if (!data) return;

    for (var i = 0; i < bars && i < data.length; i++) {
      var val = data[i] / 255;
      var barH = Math.max(val * h * 0.8, 1);
      var x = i * barW;
      var y = (h - barH) / 2;

      waveformCtx.fillStyle = val > 0.05
        ? Config.waveformColor
        : Config.buttonBorder;
      waveformCtx.globalAlpha = Math.max(val, 0.15);
      waveformCtx.fillRect(x + 1, y, barW - 2, barH);
    }
    waveformCtx.globalAlpha = 1;
  }

  /** Start waveform animation loop */
  function startWaveformAnimation() {
    stopWaveformAnimation();
    function animate() {
      drawWaveform();
      waveformAnimId = requestAnimationFrame(animate);
    }
    waveformAnimId = requestAnimationFrame(animate);
  }

  /** Stop waveform animation */
  function stopWaveformAnimation() {
    if (waveformAnimId) {
      cancelAnimationFrame(waveformAnimId);
      waveformAnimId = null;
    }
  }

  return {
    build: build,
    update: update,
    flashButton: flashButton,
    flashWrong: flashWrong,
    setStatus: setStatus,
    disableButtons: disableButtons,
    enableButtons: enableButtons,
    resetButtons: resetButtons,
    startWaveformAnimation: startWaveformAnimation,
    stopWaveformAnimation: stopWaveformAnimation,
  };
})();
