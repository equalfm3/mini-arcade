/* Sudoku — DOM Renderer

   Builds a 9×9 CSS Grid with thick borders for 3×3 box boundaries.
   Handles cell selection, number display, pencil marks, error highlighting,
   same-number highlighting, and the on-screen number pad.
*/

var Renderer = (function () {

  var cells = [];       // 2D: cells[row][col] = DOM element
  var gridEl = null;
  var padEl = null;
  var _onCellClick = null;
  var _onNumClick = null;

  /**
   * Build the Sudoku grid DOM.
   * @param {Element} container
   * @param {Function} onCellClick - (row, col)
   * @param {Function} onNumClick - (num) where num is 1-9 or 0 for erase
   */
  function build(container, onCellClick, onNumClick) {
    container.innerHTML = '';
    cells = [];
    _onCellClick = onCellClick;
    _onNumClick = onNumClick;

    // Grid wrapper
    gridEl = document.createElement('div');
    gridEl.className = 'sudoku-grid';

    for (var r = 0; r < 9; r++) {
      cells[r] = [];
      for (var c = 0; c < 9; c++) {
        var cell = document.createElement('div');
        cell.className = 'sudoku-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        // Thick border classes for 3×3 box boundaries
        if (r % 3 === 0) cell.classList.add('bt');
        if (c % 3 === 0) cell.classList.add('bl');
        if (r === 8) cell.classList.add('bb');
        if (c === 8) cell.classList.add('br');

        // Pencil marks container (3×3 mini-grid)
        var pencil = document.createElement('div');
        pencil.className = 'pencil-marks';
        for (var n = 1; n <= 9; n++) {
          var pm = document.createElement('span');
          pm.className = 'pm pm-' + n;
          pm.textContent = '';
          pencil.appendChild(pm);
        }
        cell.appendChild(pencil);

        // Value display
        var val = document.createElement('span');
        val.className = 'cell-value';
        cell.appendChild(val);

        cell.addEventListener('click', (function (cr, cc) {
          return function () { if (_onCellClick) _onCellClick(cr, cc); };
        })(r, c));

        gridEl.appendChild(cell);
        cells[r][c] = cell;
      }
    }

    container.appendChild(gridEl);
  }

  /**
   * Build the number pad below the grid.
   * @param {Element} container - Shell.controls
   * @param {Function} onNumClick - (num)
   * @param {Function} onPencilToggle
   * @param {Function} onUndo
   * @param {Function} onErase
   */
  function buildPad(container, onNumClick, onPencilToggle, onUndo, onErase) {
    container.innerHTML = '';

    // Number pad row
    padEl = document.createElement('div');
    padEl.className = 'sudoku-pad';

    for (var n = 1; n <= 9; n++) {
      var btn = document.createElement('button');
      btn.className = 'btn pad-btn';
      btn.textContent = n;
      btn.dataset.num = n;
      btn.addEventListener('click', (function (num) {
        return function () { if (onNumClick) onNumClick(num); };
      })(n));
      padEl.appendChild(btn);
    }
    container.appendChild(padEl);

    // Action buttons row
    var actions = document.createElement('div');
    actions.className = 'sudoku-actions';

    // Erase button
    var eraseBtn = document.createElement('button');
    eraseBtn.className = 'btn action-btn';
    eraseBtn.textContent = '⌫ Erase';
    eraseBtn.addEventListener('click', function () { if (onErase) onErase(); });
    actions.appendChild(eraseBtn);

    // Pencil toggle
    var pencilBtn = document.createElement('button');
    pencilBtn.className = 'btn action-btn';
    pencilBtn.id = 'pencil-btn';
    pencilBtn.textContent = '✏ Notes';
    pencilBtn.addEventListener('click', function () { if (onPencilToggle) onPencilToggle(); });
    actions.appendChild(pencilBtn);

    // Undo button
    var undoBtn = document.createElement('button');
    undoBtn.className = 'btn action-btn';
    undoBtn.textContent = '↩ Undo';
    undoBtn.addEventListener('click', function () { if (onUndo) onUndo(); });
    actions.appendChild(undoBtn);

    container.appendChild(actions);
  }

  /**
   * Update a single cell's display.
   * @param {number} row
   * @param {number} col
   * @param {object} data - { value, given, pencil[], selected, sameNum, error }
   */
  function updateCell(row, col, data) {
    var el = cells[row] && cells[row][col];
    if (!el) return;

    var valEl = el.querySelector('.cell-value');
    var pencilEl = el.querySelector('.pencil-marks');

    // Reset classes
    el.className = 'sudoku-cell';
    if (row % 3 === 0) el.classList.add('bt');
    if (col % 3 === 0) el.classList.add('bl');
    if (row === 8) el.classList.add('bb');
    if (col === 8) el.classList.add('br');

    if (data.given) el.classList.add('given');
    if (data.selected) el.classList.add('selected');
    if (data.sameNum) el.classList.add('same-num');
    if (data.error) el.classList.add('error');
    if (data.sameRow || data.sameCol || data.sameBox) el.classList.add('same-group');

    if (data.value > 0) {
      valEl.textContent = data.value;
      valEl.style.display = '';
      pencilEl.style.display = 'none';
    } else {
      valEl.textContent = '';
      valEl.style.display = 'none';

      // Show pencil marks
      var hasPencil = false;
      for (var n = 1; n <= 9; n++) {
        var pm = pencilEl.querySelector('.pm-' + n);
        if (data.pencil && data.pencil.indexOf(n) !== -1) {
          pm.textContent = n;
          hasPencil = true;
        } else {
          pm.textContent = '';
        }
      }
      pencilEl.style.display = hasPencil ? 'grid' : 'none';
    }
  }

  /** Update pencil mode button state */
  function setPencilActive(active) {
    var btn = document.getElementById('pencil-btn');
    if (btn) {
      btn.classList.toggle('active', active);
    }
  }

  return {
    build: build,
    buildPad: buildPad,
    updateCell: updateCell,
    setPencilActive: setPencilActive,
  };
})();
