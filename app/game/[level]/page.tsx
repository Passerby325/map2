"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import VolumeControl from "../../../components/VolumeControl"

// 获取迷宫大小
const getMazeSize = (level: string): number => {
  const sizes = {
    "1": 11,
    "2": 15,
    "3": 19,
    "4": 23,
    "5": 27,
    "random": Math.floor(Math.random() * 10) * 2 + 11 // 11-29的奇数
  }
  return sizes[level as keyof typeof sizes] || 11
}

// 简化的迷宫生成算法
const generateMaze = (size: number) => {
  // 初始化迷宫，全部设为墙
  const maze = Array(size).fill(0).map(() => Array(size).fill(1))
  
  // 定义墙的位置列表
  type Wall = { x: number; y: number }
  const walls: Wall[] = []
  
  // 将起点周围的墙加入列表
  const addWalls = (x: number, y: number) => {
    const directions = [
      { dx: 0, dy: -2 }, // 上
      { dx: 2, dy: 0 },  // 右
      { dx: 0, dy: 2 },  // 下
      { dx: -2, dy: 0 }  // 左
    ]
    
    for (const { dx, dy } of directions) {
      const newX = x + dx
      const newY = y + dy
      if (
        newX > 0 && newX < size - 1 &&
        newY > 0 && newY < size - 1 &&
        maze[newY][newX] === 1
      ) {
        walls.push({ x: newX, y: newY })
      }
    }
  }
  
  // 从起点开始
  const startX = 1
  const startY = 1
  maze[startY][startX] = 0
  addWalls(startX, startY)
  
  // 处理所有墙
  while (walls.length > 0) {
    // 随机选择一面墙
    const wallIndex = Math.floor(Math.random() * walls.length)
    const wall = walls[wallIndex]
    walls.splice(wallIndex, 1)
    
    const { x, y } = wall
    
    // 计算这面墙两边的单元格
    const neighbors = [
      { x: x, y: y - 2 },     // 上
      { x: x + 2, y: y },     // 右
      { x: x, y: y + 2 },     // 下
      { x: x - 2, y: y }      // 左
    ].filter(pos => 
      pos.x > 0 && pos.x < size - 1 &&
      pos.y > 0 && pos.y < size - 1
    )
    
    // 统计已经是路径的邻居数量
    const pathCount = neighbors.filter(pos => maze[pos.y][pos.x] === 0).length
    
    // 如果只有一个邻居是路径，打通这面墙
    if (pathCount === 1) {
      maze[y][x] = 0
      // 打通墙和路径之间的格子
      for (const pos of neighbors) {
        if (maze[pos.y][pos.x] === 0) {
          const midX = (x + pos.x) / 2
          const midY = (y + pos.y) / 2
          maze[midY][midX] = 0
        }
      }
      addWalls(x, y)
    }
  }
  
  // 设置终点
  const endX = size - 2
  const endY = size - 2
  maze[endY][endX] = 2
  
  // 确保终点可达
  if (maze[endY][endX - 1] === 1 && maze[endY - 1][endX] === 1) {
    maze[endY][endX - 1] = 0
  }
  
  return maze
}

const PLAYER = 3
const VISIBLE_RADIUS = 4

export default function Game({ params }: { params: { level: string } }) {
  const mazeSize = getMazeSize(params.level)
  const [maze] = useState(() => generateMaze(mazeSize))
  const [gameState, setGameState] = useState(maze)
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [steps, setSteps] = useState(0)  // 添加步数统计

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
                      ${mazeSize <= 15 ? 'w-8 h-8' : 'w-6 h-6'}
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

