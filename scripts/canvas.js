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

let mode = 'wall';

autoSize();

function autoSize() {
  const size = window.innerWidth;
  if (size < 400) {
    cols = 4;
    rows = 5;
  } else if (size < 600) {
    cols = 5;
    rows = 7;
  } else if (size < 800) {
    cols = 8;
    rows = 7;
  } else if (size < 1000) {
    cols = 12;
    rows = 8;
  } else if (size < 1200) {
    cols = 16;
    rows = 9;
  } else {
    cols = 20;
    rows = 10;
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

function handleCanvasClick(event) {
  function checkColRow(col, row) {
    if (start.row === row && start.col === col) {
      start.row = null;
      start.col = null;
    } else if (end.row === row && end.col === col) {
      end.row = null;
      end.col = null;
    }
  }
  resetPath();
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const col = Math.floor(x / gridSize);
  const row = Math.floor(y / gridSize);

  if (mode === 'start') {
    if (start.row != null && start.col != null) {
      grid[start.row][start.col] = 0;
    }
    checkColRow(col, row);
    grid[row][col] = 2;
    start.row = row;
    start.col = col;
  } else if (mode === 'end') {
    if (end.row != null && end.col != null) {
      grid[end.row][end.col] = 0;
    }
    checkColRow(col, row);
    grid[row][col] = 3;
    end.row = row;
    end.col = col;
  } else {
    checkColRow(col, row);
    grid[row][col] = grid[row][col] === 1 ? 0 : 1;
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

canvas.addEventListener('click', (event) => handleCanvasClick(event));

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
