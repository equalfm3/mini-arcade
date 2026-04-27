/* Whack-a-Mole — DOM Renderer (builds and updates the hole grid) */

var Renderer = (function () {

  var holeEls = [];
  var moleEls = [];
  var gridEl = null;

  /** Build the 3×3 grid of holes in the container */
  function build(container, onHoleClick) {
    container.innerHTML = '';
    holeEls = [];
    moleEls = [];

    gridEl = document.createElement('div');
    gridEl.className = 'mole-grid';

    for (var i = 0; i < Config.totalHoles; i++) {
      var hole = document.createElement('div');
      hole.className = 'hole';
      hole.dataset.index = i;

      // Mole container (clips the mole rising from hole)
      var moleWrap = document.createElement('div');
      moleWrap.className = 'mole-wrap';

      var mole = document.createElement('div');
      mole.className = 'mole';

      // Mole face
      var face = document.createElement('div');
      face.className = 'mole-face';

      var eyeL = document.createElement('div');
      eyeL.className = 'mole-eye mole-eye-l';
      var eyeR = document.createElement('div');
      eyeR.className = 'mole-eye mole-eye-r';
      var nose = document.createElement('div');
      nose.className = 'mole-nose';

      face.appendChild(eyeL);
      face.appendChild(eyeR);
      face.appendChild(nose);
      mole.appendChild(face);
      moleWrap.appendChild(mole);

      // Hole mound (front, covers bottom of mole)
      var mound = document.createElement('div');
      mound.className = 'hole-mound';

      hole.appendChild(moleWrap);
      hole.appendChild(mound);

      // Click/tap handler
      hole.addEventListener('click', (function (idx) {
        return function (e) {
          e.preventDefault();
          onHoleClick(idx);
        };
      })(i));

      hole.addEventListener('touchend', (function (idx) {
        return function (e) {
          e.preventDefault();
          onHoleClick(idx);
        };
      })(i));

      gridEl.appendChild(hole);
      holeEls.push(hole);
      moleEls.push(mole);
    }

    container.appendChild(gridEl);
  }

  /** Get the grid element (for appending overlays like combo display) */
  function getGridEl() {
    return gridEl;
  }

  /** Update mole visuals based on Moles state */
  function update() {
    var holes = Moles.getHoles();

    for (var i = 0; i < holes.length; i++) {
      var h = holes[i];
      var holeEl = holeEls[i];
      var moleEl = moleEls[i];

      if (h.active) {
        var progress = Moles.getProgress(i);

        // Set mole type class
        holeEl.classList.add('active');
        moleEl.className = 'mole';
        if (h.type) moleEl.classList.add('mole-' + h.type);
        if (h.whacked) moleEl.classList.add('mole-whacked');

        // Animate mole rising: translate from 100% (hidden) to 0% (visible)
        var translateY = (1 - progress) * 100;
        moleEl.style.transform = 'translateY(' + translateY + '%)';
      } else {
        holeEl.classList.remove('active');
        moleEl.style.transform = 'translateY(100%)';
        moleEl.className = 'mole';
      }
    }
  }

  /** Flash a score popup at a hole */
  function showScore(index, text, type) {
    var hole = holeEls[index];
    if (!hole) return;

    var popup = document.createElement('div');
    popup.className = 'score-popup';
    if (type === 'golden') popup.classList.add('score-golden');
    if (type === 'bomb') popup.classList.add('score-bomb');
    popup.textContent = text;
    hole.appendChild(popup);

    // Remove after animation
    setTimeout(function () {
      if (popup.parentNode) popup.parentNode.removeChild(popup);
    }, 800);
  }

  /** Reset all holes to empty state */
  function reset() {
    for (var i = 0; i < holeEls.length; i++) {
      holeEls[i].classList.remove('active');
      moleEls[i].style.transform = 'translateY(100%)';
      moleEls[i].className = 'mole';
    }
  }

  return {
    build: build,
    update: update,
    showScore: showScore,
    reset: reset,
    get gridEl() { return gridEl; },
  };
})();
