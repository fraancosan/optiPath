export class AHeuristic {
  constructor(grid, start, end, allowDiagonal = true) {
    this.grid = grid;
    this.cols = grid[0].length;
    this.rows = grid.length;
    this.start = start;
    this.end = end;
    this.allowDiagonal = allowDiagonal;
    this.openSet = [];
    this.closedSet = [];
    this.cameFrom = new Map();
    this.moveCost = new Map();
    this.finalCost = new Map();
  }

  heuristic(node) {
    return this.allowDiagonal
      ? this.euclideanDistance(node)
      : this.manhattanDistance(node);
  }

  getNeighbors({ row, col }) {
    const isValidMove = (row, col) => {
      return (
        row >= 0 &&
        row < this.rows &&
        col >= 0 &&
        col < this.cols &&
        this.grid[row][col] !== 1
      );
    };

    const neighbors = [
      { row: -1, col: 0, cost: 1 }, // up
      { row: 1, col: 0, cost: 1 }, // down
      { row: 0, col: -1, cost: 1 }, // left
      { row: 0, col: 1, cost: 1 }, // right
    ];

    if (this.allowDiagonal) {
      neighbors.push(
        { row: -1, col: -1, cost: 1.41 }, // up-left
        { row: -1, col: 1, cost: 1.41 }, // up-right
        { row: 1, col: -1, cost: 1.41 }, // down-left
        { row: 1, col: 1, cost: 1.41 } // down-right)
      );
    }

    const moves = [];
    neighbors.forEach((neighbor) => {
      const newRow = row + neighbor.row;
      const newCol = col + neighbor.col;
      if (isValidMove(newRow, newCol)) {
        moves.push({ row: newRow, col: newCol, cost: neighbor.cost });
      }
    });
    return moves;
  }

  manhattanDistance({ row, col }) {
    return Math.abs(row - this.end.row) + Math.abs(col - this.end.col);
  }

  euclideanDistance({ row, col }) {
    return Math.sqrt(
      Math.pow(row - this.end.row, 2) + Math.pow(col - this.end.col, 2)
    );
  }

  reconstructPath(current) {
    const totalPath = [current];
    while (this.cameFrom.has(current)) {
      current = this.cameFrom.get(current);
      totalPath.push(current);
    }
    return totalPath.reverse();
  }

  findPath() {
    this.openSet.push(this.start);
    this.moveCost.set(this.start, 0);
    this.finalCost.set(this.start, this.heuristic(this.start));

    while (this.openSet.length > 0) {
      let current = this.openSet.reduce((a, b) =>
        this.finalCost.get(a) < this.finalCost.get(b) ? a : b
      );

      if (current.row === this.end.row && current.col === this.end.col) {
        return this.reconstructPath(current);
      }

      this.openSet = this.openSet.filter((node) => node !== current);
      this.closedSet.push(current);

      for (const neighbor of this.getNeighbors(current)) {
        // not checking twice the same node
        if (
          this.closedSet.some(
            (node) => node.row === neighbor.row && node.col === neighbor.col
          )
        ) {
          continue;
        }

        const tentativemoveCost = this.moveCost.get(current) + neighbor.cost;

        if (
          !this.openSet.some(
            (node) => node.row === neighbor.row && node.col === neighbor.col
          )
        ) {
          this.openSet.push(neighbor);
        } else if (tentativemoveCost >= this.moveCost.get(neighbor)) {
          continue;
        }

        this.cameFrom.set(neighbor, current);
        this.moveCost.set(neighbor, tentativemoveCost);
        this.finalCost.set(
          neighbor,
          this.moveCost.get(neighbor) + this.heuristic(neighbor)
        );
      }
    }

    return []; // no path found
  }
}
