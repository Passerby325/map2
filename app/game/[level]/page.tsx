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

// 改进的迷宫生成算法
const generateMaze = (size: number) => {
  const maze = Array(size).fill(null).map(() => Array(size).fill(1))
  
  const carve = (x: number, y: number) => {
    const directions = [
      [0, -2], [2, 0], [0, 2], [-2, 0]
    ].sort(() => Math.random() - 0.5)
    
    maze[y][x] = 0
    
    for (const [dx, dy] of directions) {
      const newX = x + dx
      const newY = y + dy
      
      if (
        newX > 0 && newX < size - 2 &&
        newY > 0 && newY < size - 2 &&
        maze[newY][newX] === 1
      ) {
        maze[y + dy/2][x + dx/2] = 0
        maze[newY][newX] = 0
        carve(newX, newY)
      }
    }
  }
  
  carve(1, 1)
  
  // 确保从终点到起点有路径
  const endX = size - 2
  const endY = size - 2
  
  // 创建到终点的通道
  for (let i = endX; i >= endX - 2; i--) {
    maze[endY][i] = 0
  }
  for (let i = endY; i >= endY - 2; i--) {
    maze[i][endX] = 0
  }
  
  maze[endY][endX] = 2   // 终点
  maze[1][1] = 0         // 起点
  
  return maze
}

const PLAYER = 3
const VISIBLE_RADIUS = 4

export default function Game({ params }: { params: { level: string } }) {
  const [customSize, setCustomSize] = useState<number>(30)
  const [isSelectingSize, setIsSelectingSize] = useState(params.level === "random")
  const mazeSize = params.level === "random" ? customSize : getMazeSize(params.level)
  const [maze, setMaze] = useState<number[][]>([])
  const [gameState, setGameState] = useState<number[][]>([])
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [steps, setSteps] = useState(0)

  // 初始化迷宫
  const initializeMaze = (size: number) => {
    const newMaze = generateMaze(size)
    setMaze(newMaze)
    setGameState(newMaze)
    setIsSelectingSize(false)
  }

  // 在游戏开始前渲染大小选择界面
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

  const updateVisibility = () => {
    const newGameState = maze.map(row => [...row]);
    for (let y = 0; y < mazeSize; y++) {
      for (let x = 0; x < mazeSize; x++) {
        const distance = Math.sqrt(
          Math.pow(y - playerPos.y, 2) + 
          Math.pow(x - playerPos.x, 2)
        );
        newGameState[y][x] = distance <= VISIBLE_RADIUS ? maze[y][x] : -1;
      }
    }
    newGameState[playerPos.y][playerPos.x] = PLAYER;
    setGameState(newGameState);
    
    // 检查胜利条件
    if(playerPos.x === mazeSize-2 && playerPos.y === mazeSize-2) {
      setGameWon(true);
    }
  }

  const move = (dx: number, dy: number) => {
    if(gameWon) return;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    if(maze[newY]?.[newX] === 0 || maze[newY]?.[newX] === 2) {
      setPlayerPos({ x: newX, y: newY });
      setSteps(prev => prev + 1);  // 增加步数
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

