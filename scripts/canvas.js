import { AHeuristic } from './AHeuristic.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let start = { row: 0, col: 0 };
let end = { row: null, col: null };

let rows;
let cols;
let gridSize;
let grid;
let path = [];

// wall, start, end, wall put, wall remove
let mode = 'wall';
let holdingMouse = false;
let isTouchEvent = false;
autoSize();

function autoSize() {
  const size = window.innerWidth;
  const config = {
    400: { cols: 4, rows: 5 },
    600: { cols: 5, rows: 7 },
    800: { cols: 8, rows: 7 },
    1000: { cols: 12, rows: 8 },
    1200: { cols: 16, rows: 9 },
    999999: { cols: 20, rows: 10 },
  };
  for (const [key, value] of Object.entries(config)) {
    if (size < key) {
      cols = value.cols;
      rows = value.rows;
      break;
    }
  }
  start = { row: 0, col: 0 };
  end = { row: rows - 1, col: cols - 1 };
  clearGrid();
  setGrid();
}

function setGrid() {
  // it is important to set the scale before setting the canvas width and height
  // to avoid blurry rendering

  const scale = window.devicePixelRatio;
  const canvasWidth = canvas.parentElement.clientWidth;
  gridSize = canvasWidth / cols > 60 ? canvasWidth / cols : 60;

  canvas.width = gridSize * cols * scale;
  canvas.height = gridSize * rows * scale;
  canvas.style.width = `${gridSize * cols}px`;
  canvas.style.height = `${gridSize * rows}px`;

  ctx.scale(scale, scale);
  drawGrid();
}

function drawGrid() {
  clearScreen();
  ctx.lineWidth = 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      // 0 = empty, 1 = wall, 2 = start, 3 = end, 4 = path
      if (cell === 0) {
        ctx.fillStyle = 'white';
      } else if (cell === 1) {
        ctx.fillStyle = '#B36206';
      } else if (cell === 2) {
        ctx.fillStyle = 'green';
      } else if (cell === 3) {
        ctx.fillStyle = '#009ee3';
      } else {
        ctx.fillStyle = 'yellow';
      }

      ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
      ctx.strokeStyle = '#0c192c';
      ctx.strokeRect(col * gridSize, row * gridSize, gridSize, gridSize);
    }
  }
  drawPath();
}

function clearScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function changeCols(value) {
  cols = value;
  resetGrid();
  setGrid();
}

function changeRows(value) {
  rows = value;
  resetGrid();
  setGrid();
}

function widthChange() {
  clearScreen();
  setGrid();
}

function getCellClicked(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const col = Math.floor(x / gridSize);
  const row = Math.floor(y / gridSize);
  return { row, col };
}

function handleCanvasClick({ row, col }) {
  function changeValues(oldCell, newCell, value) {
    const actualValue = grid[newCell.row][newCell.col];
    if (actualValue !== 2 && actualValue !== 3) {
      grid[oldCell.row][oldCell.col] = 0;
      grid[newCell.row][newCell.col] = value;
      return true;
    }
    return false;
  }
  resetPath();
  if (mode === 'start') {
    const changed = changeValues(start, { row, col }, 2);
    if (changed) start = { row, col };
  } else if (mode === 'end') {
    const changed = changeValues(end, { row, col }, 3);
    if (changed) end = { row, col };
  } else if (mode === 'wall put') {
    if (grid[row][col] === 0) {
      grid[row][col] = 1;
    }
  } else if (mode === 'wall remove') {
    if (grid[row][col] === 1) {
      grid[row][col] = 0;
    }
  }
  // toggle mode
  else if (mode === 'wall') {
    if (grid[row][col] === 0) {
      grid[row][col] = 1;
    } else if (grid[row][col] === 1) {
      grid[row][col] = 0;
    }
  }
  drawGrid();
}

function setMode(newMode) {
  mode = newMode;
}

function clearGrid() {
  // 0 = empty, 1 = wall, 2 = start, 3 = end, 4 = path
  grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  grid[start.row][start.col] = 2;
  grid[end.row][end.col] = 3;
  path = []; // no need to call resetPath() here
}

function resetGrid() {
  start = { row: 0, col: 0 };
  end = { row: rows - 1, col: cols - 1 };
  clearGrid();
  drawGrid();
}

function resetPath() {
  const skipCells = path.slice(1, -1);
  skipCells.forEach((cell) => {
    grid[cell.row][cell.col] = 0;
  });
  path = [];
}

function randomizeGrid() {
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  start.row = getRandomInt(rows);
  start.col = getRandomInt(cols);
  let endRow;
  let endCol;
  do {
    endRow = getRandomInt(rows);
    endCol = getRandomInt(cols);
  } while (endRow == start.row && endCol == start.col);
  end = { row: endRow, col: endCol };

  clearGrid();
  // 15% chance of a cell being a wall
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (Math.random() < 0.15 && grid[i][j] === 0) {
        grid[i][j] = 1;
      }
    }
  }
  drawGrid();
}

function startPathFinding(diagonals = false) {
  if (
    start.row == null ||
    start.col == null ||
    end.row == null ||
    end.col == null
  ) {
    return;
  }
  const pathFinder = new AHeuristic(grid, start, end, diagonals);
  path = pathFinder.findPath();

  // clean old path
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === 4) {
        grid[rowIndex][colIndex] = 0;
      }
    });
  });

  if (path.length > 0) {
    const skipCells = path.slice(1, -1);
    skipCells.forEach((cell) => {
      grid[cell.row][cell.col] = 4;
    });
  }
  drawGrid();
}

function drawPath() {
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'red';

  path.forEach((cell, index) => {
    const x = cell.col * gridSize + gridSize / 2;
    const y = cell.row * gridSize + gridSize / 2;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
}

canvas.addEventListener('touchstart', (event) => {
  isTouchEvent = true;
});

canvas.addEventListener('click', (event) => {
  if (isTouchEvent) {
    isTouchEvent = false;
    handleCanvasClick(getCellClicked(event));
  }
});

canvas.addEventListener('mousedown', (event) => {
  if (!isTouchEvent) {
    let cell = getCellClicked(event);
    if (mode === 'wall') {
      if (event.button === 0) {
        mode = 'wall put';
        holdingMouse = true;
        handleCanvasClick(cell);
      } else if (event.button === 2) {
        mode = 'wall remove';
        holdingMouse = true;
        handleCanvasClick(cell);
      }
    } else if (event.button === 0) {
      holdingMouse = true;
      handleCanvasClick(cell);
    }
  }
});

canvas.addEventListener('mousemove', (event) => {
  if (!isTouchEvent) {
    event.preventDefault();
    if (holdingMouse) {
      handleCanvasClick(getCellClicked(event));
    }
  }
});

canvas.addEventListener('mouseup', (event) => {
  if (!isTouchEvent) {
    event.preventDefault();
    holdingMouse = false;
    if (mode === 'wall put' || mode === 'wall remove') {
      mode = 'wall';
    }
  }
});
canvas.addEventListener('mouseleave', (event) => {
  if (!isTouchEvent) {
    event.preventDefault();
    holdingMouse = false;
    if (mode === 'wall put' || mode === 'wall remove') {
      mode = 'wall';
    }
  }
});
canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

export {
  autoSize,
  widthChange,
  changeCols,
  changeRows,
  setMode,
  resetGrid,
  randomizeGrid,
  startPathFinding,
  rows,
  cols,
};
