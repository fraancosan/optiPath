import {
  changeCols,
  changeRows,
  rows as actualRows,
  cols as actualCols,
  autoSize,
} from './canvas.js';

const cols = document.getElementById('columns');
const rows = document.getElementById('rows');
const autoSizeBtn = document.getElementById('auto-size-btn');

export function initializeEventListeners() {
  cols.addEventListener('input', () => {
    const value = parseInt(cols.value, 10);
    if (!isNaN(value)) {
      changeCols(value);
    }
  });

  rows.addEventListener('input', () => {
    const value = parseInt(rows.value, 10);
    if (!isNaN(value)) {
      changeRows(value);
    }
  });

  autoSizeBtn.addEventListener('click', () => {
    autoSize();
    setValues();
  });
}

export function setValues() {
  rows.value = actualRows;
  cols.value = actualCols;
}
