import {
  changeCols,
  changeRows,
  rows as actualRows,
  cols as actualCols,
  autoSize,
  setMode,
  randomizeGrid,
  resetGrid,
} from './canvas.js';

const cols = document.getElementById('columns');
const rows = document.getElementById('rows');
const autoSizeBtn = document.getElementById('auto-size-btn');
const setStartBtn = document.getElementById('set-start-btn');
const setEndBtn = document.getElementById('set-end-btn');
const setwallsBtn = document.getElementById('set-walls-btn');
const randomBtn = document.getElementById('random-btn');
const clearBtn = document.getElementById('clear-btn');

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

  setStartBtn.addEventListener('click', () => {
    setMode('start');
    removeActive();
    setStartBtn.classList.add('btn-active');
  });

  setEndBtn.addEventListener('click', () => {
    setMode('end');
    removeActive();
    setEndBtn.classList.add('btn-active');
  });

  setwallsBtn.addEventListener('click', () => {
    setMode('wall');
    removeActive();
    setwallsBtn.classList.add('btn-active');
  });

  randomBtn.addEventListener('click', () => {
    randomizeGrid();
  });

  clearBtn.addEventListener('click', () => {
    resetGrid();
  });
}

function removeActive() {
  const buttons = document.querySelectorAll('.btn-active');
  buttons.forEach((button) => {
    button.classList.remove('btn-active');
  });
}

export function setValues() {
  rows.value = actualRows;
  cols.value = actualCols;
}
