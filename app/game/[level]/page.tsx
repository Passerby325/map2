"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import VolumeControl from "../../../components/VolumeControl"
import { useLanguage } from "../../../contexts/LanguageContext"

// 修改迷宫大小获取函数
const getMazeSize = (level: string): number => {
  const sizes = {
    "1": 11,  // 简单
    "2": 13,
    "3": 15,
    "4": 15,
    "5": 17,
    "6": 17,  // 中等
    "7": 19,
    "8": 19,
    "9": 21,
    "10": 21,
    "11": 23, // 困难
    "12": 23,
    "13": 25,
    "14": 25,
    "15": 27  // 最难
  }
  return sizes[level as keyof typeof sizes] || 11
}

// 改进的迷宫生成算法
const generateMaze = (size: number) => {
  // 初始化迷宫，全部设为墙
  const maze = Array(size).fill(null).map(() => Array(size).fill(1))
  
  // 确保起点和终点位置
  const start = { x: 1, y: 1 }
  const end = { x: size - 2, y: size - 2 }
  
  // 递归生成迷宫
  const carve = (x: number, y: number) => {
    const directions = [
      [0, -2], // 上
      [2, 0],  // 右
      [0, 2],  // 下
      [-2, 0]  // 左
    ]
    
    // 随机打乱方向
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]]
    }
    
    maze[y][x] = 0 // 设置当前位置为路径
    
    // 尝试所有方向
    for (const [dx, dy] of directions) {
      const newX = x + dx
      const newY = y + dy
      
      if (
        newX > 0 && newX < size - 1 &&
        newY > 0 && newY < size - 1 &&
        maze[newY][newX] === 1
      ) {
        // 打通墙壁
        maze[y + dy/2][x + dx/2] = 0
        maze[newY][newX] = 0
        carve(newX, newY)
      }
    }
  }
  
  // 从起点开始生成迷宫
  carve(start.x, start.y)
  
  // 确保终点可达
  const ensurePathToEnd = () => {
    // 从终点向起点方向创建路径
    let currentX = end.x
    let currentY = end.y
    
    while (currentX > 1 || currentY > 1) {
      maze[currentY][currentX] = 0
      
      // 随机选择是向左还是向上移动
      if (Math.random() < 0.5 && currentX > 1) {
        maze[currentY][currentX - 1] = 0
        currentX -= 2
      } else if (currentY > 1) {
        maze[currentY - 1][currentX] = 0
        currentY -= 2
      }
    }
  }
  
  ensurePathToEnd()
  
  // 设置起点和终点
  maze[start.y][start.x] = 0
  maze[end.y][end.x] = 2
  
  return maze
}

const PLAYER = 3
const VISIBLE_RADIUS = 4

export default function Game({ params }: { params: { level: string } }) {
  const { t, toggleLanguage, language } = useLanguage()
  const [isBlindMode, setIsBlindMode] = useState(false)
  const [showBlindModeDialog, setShowBlindModeDialog] = useState(false)
  const [tempVisibility, setTempVisibility] = useState<'normal' | 'flash' | 'godEye'>('normal')
  
  // 添加调试日志
  console.log('Current language:', language)
  
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
    const newGameState = maze.map(row => [...row])
    
    if (!gameStarted) {
      // 游戏未开始时显示全图
      newGameState[playerPos.y][playerPos.x] = PLAYER
    } else if (isBlindMode) {
      // 盲人模式
      for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
          const distance = Math.sqrt(
            Math.pow(y - playerPos.y, 2) + 
            Math.pow(x - playerPos.x, 2)
          )
          
          if (tempVisibility === 'godEye') {
            // 天眼模式显示全图
            newGameState[y][x] = maze[y][x]
          } else if (tempVisibility === 'flash') {
            // 灵光一现模式
            newGameState[y][x] = distance <= 5 ? maze[y][x] : -1
          } else {
            // 普通盲人模式只显示玩家
            newGameState[y][x] = distance <= 0 ? maze[y][x] : -1
          }
        }
      }
    } else {
      // 正常模式
      for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
          const distance = Math.sqrt(
            Math.pow(y - playerPos.y, 2) + 
            Math.pow(x - playerPos.x, 2)
          )
          newGameState[y][x] = distance <= VISIBLE_RADIUS ? maze[y][x] : -1
        }
      }
    }
    
    newGameState[playerPos.y][playerPos.x] = PLAYER
    setGameState(newGameState)
    
    // 检查胜利条件
    if(playerPos.x === mazeSize-2 && playerPos.y === mazeSize-2) {
      setGameWon(true);
    }
  }

  const move = (dx: number, dy: number) => {
    if (gameWon) return
    const newX = playerPos.x + dx
    const newY = playerPos.y + dy
    if (maze[newY]?.[newX] === 0 || maze[newY]?.[newX] === 2) {
      setPlayerPos({ x: newX, y: newY })
      setSteps(prev => prev + 1)
      setTempVisibility('normal') // 移动后重置临时可见性
    }
  }

  useEffect(() => {
    if(gameStarted) updateVisibility();
  }, [playerPos, gameStarted]);

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-white">
      <div className="h-screen flex flex-col">
        {/* 顶部标题和步数 */}
        <div className="flex-none relative">
          <motion.h1 className="text-3xl font-bold text-center mb-4">
            {t('level')} {params.level}
          </motion.h1>
          
          <div className="text-center mb-4">
            <span className="bg-blue-600 px-4 py-2 rounded-full">
              {t('steps')}: {steps}
            </span>
          </div>
        </div>

        {/* 主要游戏区域 */}
        <div className="flex-1 flex items-center justify-center gap-8 max-h-[calc(100vh-200px)]">
          {/* 左侧控制区 */}
          <div className="flex-none flex flex-col gap-4">
            {!gameStarted && (
              <button
                onClick={() => setShowBlindModeDialog(true)}
                className="w-48 py-4 bg-purple-600 rounded-lg hover:bg-purple-700 text-xl mb-4"
              >
                {t('blindMode')}
              </button>
            )}

            {gameStarted ? (
              <>
                <div className="grid grid-cols-3 gap-4 w-48">
                  <div className="col-start-2">
                    <button 
                      onClick={() => move(0, -1)}
                      className="w-full py-4 bg-blue-600 rounded-full hover:bg-blue-700 text-2xl"
                    >
                      {t('up')}
                    </button>
                  </div>
                  <div className="flex gap-4 col-span-3 justify-center">
                    <button
                      onClick={() => move(-1, 0)}
                      className="py-4 px-8 bg-blue-600 rounded-full hover:bg-blue-700 text-2xl"
                    >
                      {t('left')}
                    </button>
                    <button
                      onClick={() => move(1, 0)}
                      className="py-4 px-8 bg-blue-600 rounded-full hover:bg-blue-700 text-2xl"
                    >
                      {t('right')}
                    </button>
                  </div>
                  <div className="col-start-2">
                    <button
                      onClick={() => move(0, 1)}
                      className="w-full py-4 bg-blue-600 rounded-full hover:bg-blue-700 text-2xl"
                    >
                      {t('down')}
                    </button>
                  </div>
                </div>
                
                {isBlindMode && (
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      onClick={() => setTempVisibility('flash')}
                      className="w-48 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700"
                    >
                      {t('flash')}
                    </button>
                    <button
                      onClick={() => setTempVisibility('godEye')}
                      className="w-48 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                      {t('godEye')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <motion.button
                onClick={startGame}
                className="w-48 py-4 bg-green-600 rounded-lg hover:bg-green-700 text-xl"
              >
                {t('startGame')}
              </motion.button>
            )}
          </div>

          {/* 右侧迷宫区域 */}
          <div className="flex-none relative">
            <div className="grid place-items-center">
              {gameState.map((row, y) => (
                <div key={y} className="flex">
                  {row.map((cell, x) => (
                    <motion.div
                      key={`${x}-${y}`}
                      className={`
                        ${mazeSize <= 15 ? 'w-7 h-7' : 'w-5 h-5'}
                        ${cell === 1 ? 'bg-gray-800' : 'bg-gray-100'}
                        ${cell === PLAYER ? 'bg-red-500 rounded-full' : ''}
                        ${cell === -1 ? 'bg-gray-900' : ''}
                        ${cell === 2 ? 'bg-green-500' : ''}
                        ${cell !== 1 ? 'border-transparent' : 'border-gray-900 border'}
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
                  <h2 className="text-2xl font-bold mb-4">{t('congratulations')}</h2>
                  <p className="mb-4">{t('totalSteps')}: {steps}</p>
                  <Link href="/levels" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
                    {t('backToLevels')}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 盲人模式确认对话框 */}
      {showBlindModeDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('blindMode')}</h2>
            <p className="mb-6">{t('blindModeDesc')}</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowBlindModeDialog(false)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  setIsBlindMode(true)
                  setShowBlindModeDialog(false)
                }}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-4 right-4 space-y-2">
        <VolumeControl type="music" initialVolume={0.5} />
        <VolumeControl type="sound" initialVolume={0.5} />
      </div>
    </div>
  )
}

