/* Tic-Tac-Toe — DOM Renderer (grid, marks, win line highlight) */

var Renderer = (function () {

  var cellEls = [];
  var gridEl = null;
  var statusEl = null;
  var winLineEl = null;

  /** Build the 3×3 grid in the container */
  function build(container, onCellClick) {
    container.innerHTML = '';
    cellEls = [];

    gridEl = document.createElement('div');
    gridEl.className = 'ttt-grid';

    for (var i = 0; i < Config.totalCells; i++) {
      var cell = document.createElement('div');
      cell.className = 'ttt-cell';
      cell.dataset.index = i;

      cell.addEventListener('click', (function (idx) {
        return function (e) {
          e.preventDefault();
          onCellClick(idx);
        };
      })(i));

      cell.addEventListener('touchend', (function (idx) {
        return function (e) {
          e.preventDefault();
          onCellClick(idx);
        };
      })(i));

      gridEl.appendChild(cell);
      cellEls.push(cell);
    }

    // Status message inside grid, absolute positioned at bottom
    statusEl = document.createElement('div');
    statusEl.className = 'ttt-status';
    statusEl.textContent = '';
    gridEl.appendChild(statusEl);

    container.appendChild(gridEl);
  }

  /** Update all cells to reflect board state */
  function update() {
    for (var i = 0; i < Config.totalCells; i++) {
      var mark = Board.getCell(i);
      var cell = cellEls[i];

      // Clear previous content
      cell.className = 'ttt-cell';
      cell.innerHTML = '';

      if (mark === 'X') {
        cell.classList.add('ttt-cell-x');
        cell.innerHTML = createXSVG();
      } else if (mark === 'O') {
        cell.classList.add('ttt-cell-o');
        cell.innerHTML = createOSVG();
      }
    }
  }

  /** Create SVG for X mark */
  function createXSVG() {
    var p = Config.markPadding;
    var s = Config.cellSize;
    var end = s - p;
    return '<svg class="ttt-mark" viewBox="0 0 ' + s + ' ' + s + '" width="100%" height="100%">' +
      '<line x1="' + p + '" y1="' + p + '" x2="' + end + '" y2="' + end + '" ' +
        'stroke="' + Config.xColor + '" stroke-width="' + Config.markStroke + '" stroke-linecap="round"/>' +
      '<line x1="' + end + '" y1="' + p + '" x2="' + p + '" y2="' + end + '" ' +
        'stroke="' + Config.xColor + '" stroke-width="' + Config.markStroke + '" stroke-linecap="round"/>' +
      '</svg>';
  }

  /** Create SVG for O mark */
  function createOSVG() {
    var s = Config.cellSize;
    var cx = s / 2;
    var cy = s / 2;
    var r = (s / 2) - Config.markPadding;
    return '<svg class="ttt-mark" viewBox="0 0 ' + s + ' ' + s + '" width="100%" height="100%">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" ' +
        'fill="none" stroke="' + Config.oColor + '" stroke-width="' + Config.markStroke + '"/>' +
      '</svg>';
  }

  /** Highlight winning cells */
  function showWinLine(pattern) {
    if (!pattern || pattern.length < 3) return;

    for (var i = 0; i < pattern.length; i++) {
      cellEls[pattern[i]].classList.add('ttt-cell-win');
    }

    // Draw a line across the winning cells
    var startIdx = pattern[0];
    var endIdx = pattern[2];

    var startCell = cellEls[startIdx];
    var endCell = cellEls[endIdx];
    var gridRect = gridEl.getBoundingClientRect();
    var startRect = startCell.getBoundingClientRect();
    var endRect = endCell.getBoundingClientRect();

    var x1 = startRect.left + startRect.width / 2 - gridRect.left;
    var y1 = startRect.top + startRect.height / 2 - gridRect.top;
    var x2 = endRect.left + endRect.width / 2 - gridRect.left;
    var y2 = endRect.top + endRect.height / 2 - gridRect.top;

    // Remove old win line
    if (winLineEl && winLineEl.parentNode) {
      winLineEl.parentNode.removeChild(winLineEl);
    }

    winLineEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    winLineEl.setAttribute('class', 'ttt-win-line');
    winLineEl.setAttribute('viewBox', '0 0 ' + gridEl.offsetWidth + ' ' + gridEl.offsetHeight);
    winLineEl.style.width = gridEl.offsetWidth + 'px';
    winLineEl.style.height = gridEl.offsetHeight + 'px';

    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', Config.winLineColor);
    line.setAttribute('stroke-width', '4');
    line.setAttribute('stroke-linecap', 'round');

    // Animate the line
    var length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    line.setAttribute('stroke-dasharray', length);
    line.setAttribute('stroke-dashoffset', length);
    line.style.animation = 'ttt-draw-line ' + Config.winLineDuration + 's ease forwards';

    winLineEl.appendChild(line);
    gridEl.appendChild(winLineEl);
  }

  /** Set status message */
  function setStatus(text, type) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'ttt-status';
    if (type) statusEl.classList.add('ttt-status-' + type);
  }

  /** Disable all cell interactions */
  function disableBoard() {
    if (gridEl) gridEl.classList.add('ttt-disabled');
  }

  /** Enable cell interactions */
  function enableBoard() {
    if (gridEl) gridEl.classList.remove('ttt-disabled');
  }

  /** Clear win line and highlights */
  function clearWinLine() {
    if (winLineEl && winLineEl.parentNode) {
      winLineEl.parentNode.removeChild(winLineEl);
      winLineEl = null;
    }
    for (var i = 0; i < cellEls.length; i++) {
      cellEls[i].classList.remove('ttt-cell-win');
    }
  }

  return {
    build: build,
    update: update,
    showWinLine: showWinLine,
    setStatus: setStatus,
    disableBoard: disableBoard,
    enableBoard: enableBoard,
    clearWinLine: clearWinLine,
    get gridEl() { return gridEl; },
  };
})();
