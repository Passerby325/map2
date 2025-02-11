"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import VolumeControl from "../../../components/VolumeControl"

// 获取迷宫大小
const getMazeSize = (level: string): number => {
  const sizes = {
    "1": 10,
    "2": 15,
    "3": 20,
    "4": 25,
    "5": 30,
    "random": Math.floor(Math.random() * 41) + 10 // 随机 10-50 大小
  }
  return sizes[level as keyof typeof sizes] || 10
}

// 添加一个简单的种子随机数生成器
const seededRandom = (seed: number) => {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

// 添加安全的数组访问函数
const safeGet = (arr: number[][] | undefined, y: number, x: number, defaultValue = 1): number => {
  if (!arr || !arr[y]) return defaultValue
  return arr[y][x] ?? defaultValue
}

const safeSet = (arr: number[][] | undefined, y: number, x: number, value: number): void => {
  if (!arr || !arr[y]) return
  arr[y][x] = value
}

// 修改迷宫生成算法
const generateMaze = (size: number, seed: number) => {
  try {
    // 确保size是有效的数字
    const validSize = Math.max(10, Math.min(50, Math.floor(size)))
    if (!validSize || isNaN(validSize)) return Array(10).fill(0).map(() => Array(10).fill(1))
    
    // 创建初始迷宫
    let maze: number[][] | null = null
    try {
      maze = Array.from({ length: validSize }, () => 
        Array.from({ length: validSize }, () => 1)
      )
    } catch (e) {
      console.error('Failed to create maze:', e)
      return Array(10).fill(0).map(() => Array(10).fill(1))
    }
    
    if (!maze || !maze[0]) {
      console.error('Invalid maze creation')
      return Array(10).fill(0).map(() => Array(10).fill(1))
    }

    const random = seededRandom(seed || 1)
    
    const carve = (x: number, y: number) => {
      if (!maze || x < 1 || x >= validSize - 1 || y < 1 || y >= validSize - 1) return
      
      try {
        safeSet(maze, y, x, 0)
        
        const directions = [
          [0, -2], [2, 0], [0, 2], [-2, 0]
        ].sort(() => random() - 0.5)
        
        for (const [dx, dy] of directions) {
          const newX = x + dx
          const newY = y + dy
          const wallX = x + dx/2
          const wallY = y + dy/2
          
          if (
            newX >= 1 && newX < validSize - 1 &&
            newY >= 1 && newY < validSize - 1 &&
            safeGet(maze, newY, newX) === 1
          ) {
            if (wallX >= 1 && wallX < validSize - 1 && 
                wallY >= 1 && wallY < validSize - 1) {
              safeSet(maze, wallY, wallX, 0)
              safeSet(maze, newY, newX, 0)
              carve(newX, newY)
            }
          }
        }
      } catch (e) {
        console.error('Error in carve:', e)
      }
    }
    
    try {
      carve(1, 1)
      
      // 安全地设置路径
      const endX = validSize - 2
      const endY = validSize - 2
      
      // 创建到终点的通道
      for (let i = 0; i < 3; i++) {
        if (endX - i >= 0) safeSet(maze, endY, endX - i, 0)
        if (endY - i >= 0) safeSet(maze, endY - i, endX, 0)
      }
      
      safeSet(maze, 1, 1, 0)
      safeSet(maze, endY, endX, 2)
      
      return maze
    } catch (e) {
      console.error('Error in maze generation:', e)
      return Array(10).fill(0).map(() => Array(10).fill(1))
    }
  } catch (e) {
    console.error('Critical error in generateMaze:', e)
    return Array(10).fill(0).map(() => Array(10).fill(1))
  }
}

const PLAYER = 3
const VISIBLE_RADIUS = 4

export default function Game({ params }: { params: { level: string } }) {
  const [customSize, setCustomSize] = useState<number>(30)
  const [seed, setSeed] = useState<string>(Math.floor(Math.random() * 1000000).toString())
  const [isSelectingSize, setIsSelectingSize] = useState(params.level === "random")
  const mazeSize = params.level === "random" ? customSize : getMazeSize(params.level)
  const [maze, setMaze] = useState<number[][]>([])
  const [gameState, setGameState] = useState<number[][]>([])
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [steps, setSteps] = useState(0)

  // 修改初始化迷宫函数
  const initializeMaze = (size: number) => {
    const newMaze = generateMaze(size, parseInt(seed))
    setMaze(newMaze)
    setGameState(newMaze)
    setIsSelectingSize(false)
  }

  // 修改选择界面，添加种子码输入
  if (isSelectingSize) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 text-white">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">随机迷宫设置</h1>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="mb-6">
              <label className="block text-lg mb-2">迷宫大小: {customSize}x{customSize}</label>
              <input
                type="range"
                min="10"
                max="50"
                value={customSize}
                onChange={(e) => setCustomSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm mt-1">
                <span>10x10</span>
                <span>50x50</span>
              </div>
            </div>
            
            {/* 添加种子码输入 */}
            <div className="mb-6">
              <label className="block text-lg mb-2">种子码</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                  placeholder="输入种子码"
                />
                <button
                  onClick={() => setSeed(Math.floor(Math.random() * 1000000).toString())}
                  className="px-3 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  随机
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                使用相同的种子码和大小可以生成相同的迷宫
              </p>
            </div>

            <button
              onClick={() => initializeMaze(customSize)}
              className="w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              开始游戏
            </button>
          </div>
          <Link 
            href="/levels" 
            className="inline-block mt-4 text-blue-400 hover:text-blue-300"
          >
            返回关卡选择
          </Link>
        </div>
      </div>
    )
  }

  // 确保在非选择大小状态下有迷宫数据
  useEffect(() => {
    if (!isSelectingSize && maze.length === 0) {
      initializeMaze(mazeSize)
    }
  }, [isSelectingSize, mazeSize])

  useEffect(() => {
    const newGameState = maze.map(row => [...row]);
    newGameState[playerPos.y][playerPos.x] = PLAYER;
    setGameState(newGameState);
  }, [playerPos, maze]);

  const startGame = () => {
    setGameStarted(true);
    updateVisibility();
  }

  // 安全的更新可见性函数
  const updateVisibility = () => {
    if (!maze || !maze[0]) return
    
    try {
      const newGameState = maze.map(row => [...(row || [])])
      
      for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < (maze[0]?.length || 0); x++) {
          const distance = Math.sqrt(
            Math.pow(y - playerPos.y, 2) + 
            Math.pow(x - playerPos.x, 2)
          )
          safeSet(newGameState, y, x, 
            distance <= VISIBLE_RADIUS ? safeGet(maze, y, x) : -1
          )
        }
      }
      
      safeSet(newGameState, playerPos.y, playerPos.x, PLAYER)
      setGameState(newGameState)
      
      if (playerPos.x === maze[0].length - 2 && playerPos.y === maze.length - 2) {
        setGameWon(true)
      }
    } catch (e) {
      console.error('Error in updateVisibility:', e)
    }
  }

  // 安全的移动函数
  const move = (dx: number, dy: number) => {
    if (gameWon || !maze) return
    
    const newX = playerPos.x + dx
    const newY = playerPos.y + dy
    
    const cellValue = safeGet(maze, newY, newX, 1)
    if (cellValue === 0 || cellValue === 2) {
      setPlayerPos({ x: newX, y: newY })
      setSteps(prev => prev + 1)
    }
  }

  useEffect(() => {
    if(gameStarted) updateVisibility();
  }, [playerPos, gameStarted]);

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-white">
      <div className="max-w-4xl mx-auto">
        <motion.h1 className="text-3xl font-bold text-center mb-6">
          {params.level === "random" ? "随机关卡" : `关卡 ${params.level}`}
        </motion.h1>
        
        <div className="text-center mb-4">
          <span className="bg-blue-600 px-4 py-2 rounded-full">
            步数: {steps}
          </span>
        </div>

        <div className="relative mb-8">
          <div className="grid place-items-center">
            {gameState.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <motion.div
                    key={`${x}-${y}`}
                    className={`
                      ${mazeSize <= 15 ? 'w-8 h-8' : 
                        mazeSize <= 30 ? 'w-6 h-6' : 
                        'w-4 h-4'  // 更大的迷宫使用更小的格子
                      }
                      ${cell === 1 ? 'bg-gray-800' : 'bg-gray-100'}
                      ${cell === PLAYER ? 'bg-red-500 rounded-full' : ''}
                      ${cell === -1 ? 'bg-gray-900' : ''}
                      ${cell === 2 ? 'bg-green-500' : ''}
                      ${
                        cell !== 1 ? 
                        'border-transparent' : 
                        'border-gray-900 border'
                      }
                      transition-colors
                    `}
                  />
                ))}
              </div>
            ))}
          </div>
          
          {gameWon && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center p-6 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">🎉 通关成功！</h2>
                <p className="mb-4">总步数: {steps}</p>
                <Link href="/levels" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
                  返回关卡选择
                </Link>
              </div>
            </div>
          )}
        </div>

        {!gameStarted ? (
          <motion.button
            onClick={startGame}
            className="w-full py-3 bg-green-600 rounded-lg hover:bg-green-700"
          >
            开始游戏
          </motion.button>
        ) : (
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            <div className="col-start-2">
              <button 
                onClick={() => move(0, -1)}
                className="w-full py-3 bg-blue-600 rounded-full hover:bg-blue-700"
              >
                ↑
              </button>
            </div>
            <div className="flex gap-4 col-span-3 justify-center">
              <button
                onClick={() => move(-1, 0)}
                className="py-3 px-6 bg-blue-600 rounded-full hover:bg-blue-700"
              >
                ←
              </button>
              <button
                onClick={() => move(1, 0)}
                className="py-3 px-6 bg-blue-600 rounded-full hover:bg-blue-700"
              >
                →
              </button>
            </div>
            <div className="col-start-2">
              <button
                onClick={() => move(0, 1)}
                className="w-full py-3 bg-blue-600 rounded-full hover:bg-blue-700"
              >
                ↓
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="fixed top-4 right-4 space-y-2">
        <VolumeControl type="music" initialVolume={0.5} />
        <VolumeControl type="sound" initialVolume={0.5} />
      </div>
    </div>
  )
}

