/**
 * Checks if a number can be placed in a given position
 */
function isValid(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) {
      return false;
    }
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Finds an empty cell in the board
 * @returns [row, col] if found, null if no empty cell exists
 */
function findEmptyCell(board: number[][]): [number, number] | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        return [row, col];
      }
    }
  }
  return null;
}

/**
 * Validates the input grid
 */
function isValidGrid(grid: number[][]): boolean {
  if (!Array.isArray(grid) || grid.length !== 9) return false;
  
  for (let i = 0; i < 9; i++) {
    if (!Array.isArray(grid[i]) || grid[i].length !== 9) return false;
    for (let j = 0; j < 9; j++) {
      const cell = grid[i][j];
      if (!Number.isInteger(cell) || cell < 0 || cell > 9) return false;
      
      // Skip checking empty cells
      if (cell === 0) continue;
      
      // Temporarily set cell to 0 to check if the number is valid in its position
      const temp = grid[i][j];
      grid[i][j] = 0;
      const isValidPosition = isValid(grid, i, j, temp);
      grid[i][j] = temp;
      
      if (!isValidPosition) return false;
    }
  }
  return true;
}

/**
 * Solves the Sudoku puzzle using backtracking
 */
function solveSudokuRecursive(board: number[][]): boolean {
  const emptyCell = findEmptyCell(board);
  
  // If no empty cell is found, puzzle is solved
  if (!emptyCell) return true;
  
  const [row, col] = emptyCell;

  // Try digits 1-9
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      
      if (solveSudokuRecursive(board)) {
        return true;
      }
      
      // If placing the number didn't lead to a solution, backtrack
      board[row][col] = 0;
    }
  }
  
  return false;
}

/**
 * Main function to solve a Sudoku puzzle
 * @param grid 9x9 array where 0 represents empty cells
 * @returns solved grid or null if no solution exists
 */
export async function solveSudoku(grid: number[][]): Promise<number[][] | null> {
  // Create a copy of the input grid
  const board = grid.map(row => [...row]);
  // Validate input
  if (!isValidGrid(board)) {
    throw new Error('Invalid Sudoku grid');
  }

  // Add minimal delay to show loading state
  await new Promise(resolve => setTimeout(resolve, 500));

  // Attempt to solve
  const hasSolution = solveSudokuRecursive(board);
  
  if (hasSolution) {
    return board;
  }
  
  return null;
}