'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Undo2, RotateCcw, Check } from 'lucide-react'

// Mock functions for image parsing and Sudoku solving
const parseImageToSudoku = (file: File): number[][] => {
  // This would be replaced with actual image processing logic
  return Array(9).fill(null).map(() => Array(9).fill(null))
}

const solveSudoku = (grid: number[][]): number[][] => {
  // This would be replaced with actual Sudoku solving algorithm
  return grid.map(row => row.map(cell => cell === null ? Math.floor(Math.random() * 9) + 1 : cell))
}

export function SudokuSolverComponent() {
  const [image, setImage] = useState<string | null>(null)
  const [grid, setGrid] = useState<(number | null)[][]>(Array(9).fill(null).map(() => Array(9).fill(null)))
  const [solvedGrid, setSolvedGrid] = useState<number[][]>([])
  const [history, setHistory] = useState<(number | null)[][][]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setImage(imageUrl)
      const parsedGrid = parseImageToSudoku(file)
      setGrid(parsedGrid)
      setHistory([parsedGrid])
    }
  }

  const handleCellChange = (row: number, col: number, value: string) => {
    const newGrid = grid.map(r => [...r]);
    const numValue = value === '' ? null : parseInt(value);
    newGrid[row][col] = (numValue !== null && numValue >= 1 && numValue <= 9) ? numValue : null;
    setGrid(newGrid);
    setHistory([...history, newGrid]);
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = [...history]
      newHistory.pop()
      setHistory(newHistory)
      setGrid(newHistory[newHistory.length - 1])
    }
  }

  const handleReset = () => {
    setGrid(Array(9).fill(null).map(() => Array(9).fill(null)))
    setHistory([])
    setSolvedGrid([])
    setImage(null)
  }

  const handleSolve = () => {
    const solved = solveSudoku(grid)
    setSolvedGrid(solved)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Sudoku Solver</h1>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2">
              <div className="mb-6">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload Sudoku Image
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              {image && (
                <div className="mb-6">
                  <Image
                    src={image}
                    alt="Uploaded Sudoku"
                    width={300}
                    height={300}
                    className="w-full object-contain"
                  />
                </div>
              )}
            </div>

            <div className="lg:w-1/2">
              <div className="grid grid-cols-9 gap-px bg-gray-200 border-2 border-gray-300 mb-6">
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div className="w-full h-full flex items-center justify-center">
                      <input
                        key={`${rowIndex}-${colIndex}`}
                        type="number"
                        min="1"
                        max="9"
                        value={cell === null ? '' : cell}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className={`w-full h-full aspect-square text-center text-sm sm:text-base border-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          solvedGrid.length > 0 && solvedGrid[rowIndex][colIndex] !== grid[rowIndex][colIndex]
                            ? 'bg-green-200'
                            : cell !== null && (cell < 1 || cell > 9)
                            ? 'bg-red-200'
                            : 'bg-white'
                        } ${
                          (rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-2 border-gray-300' : ''
                        } ${
                          (colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-2 border-gray-300' : ''
                        } flex items-center justify-center p-0 leading-none`}
                        style={{
                          appearance: 'textfield',
                          MozAppearance: 'textfield',
                          WebkitAppearance: 'none',
                          margin: 0,
                          textAlign: 'center',
                          verticalAlign: 'middle'
                        }}
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <Button onClick={handleUndo} disabled={history.length <= 1} className="flex-1 sm:flex-initial">
                  <Undo2 className="mr-2 h-4 w-4" /> Undo
                </Button>
                <Button onClick={handleReset} variant="outline" className="flex-1 sm:flex-initial">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
                <Button onClick={handleSolve} className="flex-1 sm:flex-initial">
                  <Check className="mr-2 h-4 w-4" /> Solve
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}