const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let start = null;
let end = null;

let rows;
let cols;
autoSize();

function autoSize() {
  const size = window.innerWidth;
  if (size < 400) {
    cols = 5;
    rows = 7;
  } else if (size < 600) {
    cols = 5;
    rows = 7;
  } else if (size < 800) {
    cols = 8;
    rows = 7;
  } else if (size < 1200) {
    cols = 12;
    rows = 8;
  } else {
    cols = 12;
    rows = 6;
  }
  setGrid();
}

function setGrid() {
  // it is important to set the scale before setting the canvas width and height
  // to avoid blurry rendering

  const scale = window.devicePixelRatio;
  const canvasWidth = canvas.parentElement.clientWidth;
  const gridSize = canvasWidth / cols;

  canvas.width = gridSize * cols * scale;
  canvas.height = gridSize * rows * scale;
  canvas.style.width = `${gridSize * cols}px`;
  canvas.style.height = `${gridSize * rows}px`;

  ctx.scale(scale, scale);

  let grid = Array.from({ length: rows }, () => Array(cols).fill(0));

  drawGrid(grid, gridSize);
}

function drawGrid(grid, gridSize) {
  clearScreen();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      ctx.fillStyle = cell === 1 ? 'black' : 'white';
      if (start && start.row === row && start.col === col)
        ctx.fillStyle = 'green';
      if (end && end.row === row && end.col === col) ctx.fillStyle = 'red';
      ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
      ctx.strokeStyle = '#0c192c';
      ctx.strokeRect(col * gridSize, row * gridSize, gridSize, gridSize);
    }
  }
}

function clearScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function changeCols(value) {
  cols = value;
  setGrid();
}

function changeRows(value) {
  rows = value;
  setGrid();
}

function widthChange() {
  clearScreen();
  setGrid();
}

export { autoSize, widthChange, changeCols, changeRows, rows, cols };
