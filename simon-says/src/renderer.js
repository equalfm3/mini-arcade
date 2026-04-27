/* Simon Says — DOM Renderer (4 colored buttons with light-up animation) */

var Renderer = (function () {

  var buttonEls = [];
  var gridEl = null;
  var statusEl = null;

  /** Build the 2×2 button grid in the container */
  function build(container, onButtonClick) {
    container.innerHTML = '';
    buttonEls = [];

    gridEl = document.createElement('div');
    gridEl.className = 'simon-grid';

    for (var i = 0; i < Config.totalButtons; i++) {
      var btn = Config.buttons[i];

      var el = document.createElement('button');
      el.className = 'simon-btn simon-btn-' + btn.id;
      el.dataset.index = i;
      el.setAttribute('aria-label', btn.label);
      el.style.setProperty('--btn-color', btn.color);
      el.style.setProperty('--btn-active', btn.activeColor);
      el.style.setProperty('--btn-dark', btn.darkColor);

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

    // Status message inside grid, absolute positioned at bottom
    statusEl = document.createElement('div');
    statusEl.className = 'simon-status';
    statusEl.textContent = '';
    gridEl.appendChild(statusEl);

    container.appendChild(gridEl);
  }

  /** Update button visuals based on Sequence active button */
  function update() {
    var active = Sequence.getActiveButton();

    for (var i = 0; i < buttonEls.length; i++) {
      if (i === active) {
        buttonEls[i].classList.add('simon-btn-active');
      } else {
        buttonEls[i].classList.remove('simon-btn-active');
      }
    }
  }

  /** Flash a button briefly (for player input feedback) */
  function flashButton(index) {
    if (!buttonEls[index]) return;
    buttonEls[index].classList.add('simon-btn-active');
    setTimeout(function () {
      buttonEls[index].classList.remove('simon-btn-active');
    }, 200);
  }

  /** Flash a button as wrong (red pulse) */
  function flashWrong(index) {
    if (!buttonEls[index]) return;
    buttonEls[index].classList.add('simon-btn-wrong');
    setTimeout(function () {
      buttonEls[index].classList.remove('simon-btn-wrong');
    }, 600);
  }

  /** Set status message */
  function setStatus(text, type) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'simon-status';
    if (type) statusEl.classList.add('simon-status-' + type);
  }

  /** Disable all button interactions */
  function disableButtons() {
    if (gridEl) gridEl.classList.add('simon-disabled');
  }

  /** Enable button interactions */
  function enableButtons() {
    if (gridEl) gridEl.classList.remove('simon-disabled');
  }

  /** Reset all buttons to default state */
  function resetButtons() {
    for (var i = 0; i < buttonEls.length; i++) {
      buttonEls[i].classList.remove('simon-btn-active', 'simon-btn-wrong');
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
    get gridEl() { return gridEl; },
  };
})();
