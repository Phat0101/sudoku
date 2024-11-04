'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Undo2, RotateCcw, Check } from 'lucide-react'
import { parseImageToSudoku } from "./actions"
import { solveSudoku } from "@/lib/solve"
import { CameraView } from '@/components/Camera'
import { Camera as CameraIcon } from 'lucide-react'

export default function SudokuSolverComponent(): React.ReactElement {
  const [image, setImage] = useState<string | null>(null)
  const [grid, setGrid] = useState<(number | null)[][]>(Array(9).fill(null).map(() => Array(9).fill(null)))
  const [solvedGrid, setSolvedGrid] = useState<number[][]>([])
  const [history, setHistory] = useState<(number | null)[][][]>([])
  const [isSolving, setIsSolving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parseStatus, setParseStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle')
  const [showCamera, setShowCamera] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const cameraRef = React.useRef<any>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowCamera(false)  // Just hide the camera
    const file = event.target.files?.[0]
    if (file) {
      setShowUpload(true)  // Enable upload mode
      const imageUrl = URL.createObjectURL(file)
      setImage(imageUrl)
      setIsParsing(true)
      setParseStatus('parsing')
      
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64data = reader.result as string
        try {
          const parsedGrid = await parseImageToSudoku(base64data)
          setGrid(parsedGrid.map(row => row.map(cell => cell === 0 ? null : cell)))
          setHistory([parsedGrid])
          setParseStatus('success')
        } catch (error) {
          setError('Failed to process Sudoku image')
          setParseStatus('error')
        } finally {
          setIsParsing(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = async (photoData: string) => {
    setImage(photoData)
    setShowCamera(false)
    setIsParsing(true)
    setParseStatus('parsing')

    try {
      const parsedGrid = await parseImageToSudoku(photoData)
      setGrid(parsedGrid.map(row => row.map(cell => cell === 0 ? null : cell)))
      setHistory([parsedGrid])
      setParseStatus('success')
    } catch (error) {
      setError('Failed to process Sudoku image')
      setParseStatus('error')
    } finally {
      setIsParsing(false)
    }
  }

  const handleCameraClick = () => {
    // Reset upload related states
    setShowUpload(false)
    setImage(null)
    setShowCamera(true)
    
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleCellChange = (row: number, col: number, value: string) => {
    const newGrid = grid.map(r => [...r]);
    // Only allow single digits
    if (value === '' || /^[1-9]$/.test(value)) {
      const numValue = value === '' ? null : parseInt(value);
      newGrid[row][col] = numValue;
      setGrid(newGrid);
      setHistory([...history, newGrid]);
    }
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
    setError(null)            // Reset error state
    setIsParsing(false)       // Reset parsing state
    setParseStatus('idle')    // Reset parse status
    
    // Clean up the file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''    // Clear the file input
    }
  }

  const handleSolve = async () => {
    setIsSolving(true)
    setError(null)
    
    try {
      const solved = await solveSudoku(grid.map(row => row.map(cell => cell === null ? 0 : cell)))
      if (solved) {
        setSolvedGrid(solved)
      } else {
        setError('No solution exists for this puzzle')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred while solving')
    } finally {
      setIsSolving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Sudoku Solver</h1>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Image Input */}
            <div className="lg:w-1/2 flex flex-col">
              {/* Upload/Camera Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload Image
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
                
                <div
                  onClick={() => setShowCamera(true)}
                  className="cursor-pointer flex items-center justify-center w-full h-24 
                    border-2 border-dashed border-gray-300 rounded-lg 
                    hover:border-gray-400 transition-colors"
                >
                  <div className="text-center">
                    <CameraIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Take Photo
                    </span>
                  </div>
                </div>
              </div>

              {/* Camera/Image Preview Area */}
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                {showCamera ? (
                  <CameraView
                    ref={cameraRef}
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                  />
                ) : image && (
                  <>
                    <div className="relative aspect-square w-full">
                      <Image
                        src={image}
                        alt="Uploaded Sudoku"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className={`text-sm font-medium text-center mt-2 ${
                      parseStatus === 'parsing' ? 'text-blue-600' :
                      parseStatus === 'success' ? 'text-green-600' :
                      parseStatus === 'error' ? 'text-red-600' : ''
                    }`}>
                      {parseStatus === 'parsing' && (
                        <div className="flex items-center justify-center gap-2">
                          <span className="animate-spin">⏳</span> Parsing image...
                        </div>
                      )}
                      {parseStatus === 'success' && (
                        <div className="flex items-center justify-center gap-2">
                          <Check className="h-4 w-4" /> Parsing complete
                        </div>
                      )}
                      {parseStatus === 'error' && (
                        <div className="flex items-center justify-center gap-2 text-red-600">
                          ❌ Failed to parse image
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Grid */}
            <div className="lg:w-1/2 flex flex-col">
              <div className="grid grid-cols-9 gap-[1px] bg-gray-400 border-2 border-gray-900 mb-6 aspect-square">
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div key={`${rowIndex}-${colIndex}`} className="relative w-full pb-[100%]">
                      <input
                        key={`${rowIndex}-${colIndex}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[1-9]"
                        maxLength={1}
                        value={solvedGrid.length > 0 && cell === null ? solvedGrid[rowIndex][colIndex] : cell ?? ''}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className={`absolute inset-0 w-full h-full text-center text-base sm:text-lg font-medium 
                          border-[0.5px] border-gray-300
                          focus:outline-none focus:ring-2 focus:ring-blue-500 
                          ${
                            solvedGrid.length > 0 
                              ? cell === null 
                                ? 'bg-green-100 text-blue-600'
                                : 'bg-white text-gray-900'
                              : cell !== null && !/^[1-9]$/.test(cell.toString())
                              ? 'bg-red-200'
                              : 'bg-white'
                          }
                          ${(rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-[2px] border-b-gray-900' : ''}
                          ${(colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-[2px] border-r-gray-900' : ''}
                          `}
                        readOnly={isSolving || solvedGrid.length > 0}
                        style={{
                          margin: 0,
                          padding: 0,
                          lineHeight: '100%'
                        }}
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Button onClick={handleUndo} disabled={history.length <= 1 || isSolving} className="flex-1 sm:flex-initial">
                  <Undo2 className="mr-2 h-4 w-4" /> Undo
                </Button>
                <Button onClick={handleReset} variant="outline" disabled={isSolving} className="flex-1 sm:flex-initial">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
                <Button onClick={handleSolve} disabled={isSolving} className="flex-1 sm:flex-initial">
                  {isSolving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span> Solving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Solve
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <div className="text-red-500 text-center mt-2">{error}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}