"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import VolumeControl from "../../../components/VolumeControl"
import { useLanguage } from "../../../contexts/LanguageContext"

// 定义常量和类型
const PLAYER = 3
const VISIBLE_RADIUS = 4

type Direction = [number, number]
type Cell = -1 | 0 | 1 | 2 | typeof PLAYER
type Position = { x: number; y: number }
type GameState = Cell[][]
type VisibilityMode = 'normal' | 'flash' | 'godEye'

// 迷宫大小配置
const getMazeSize = (level: string): number => {
  const sizes: Record<string, number> = {
    "1": 11,  // 简单
    "2": 13,
    "3": 15,
    "4": 15,
    "5": 17,
    "6": 17,  // 中等
    "7": 19,
    "8": 19,
    "9": 19,
    "10": 19,
    "11": 21, // 困难
    "12": 21,
    "13": 21,
    "14": 21,
    "15": 21  // 最难
  }
  return sizes[level] || 11
}

// 迷宫生成器
const generateMaze = (size: number): GameState => {
  const maze: GameState = Array(size).fill(null).map(() => Array(size).fill(1))
  
  const start: Position = { x: 1, y: 1 }
  const end: Position = { x: size - 2, y: size - 2 }
  
  // 获取所有可能的格子点
  const cells: Position[] = []
  for (let y = 1; y < size - 1; y += 2) {
    for (let x = 1; x < size - 1; x += 2) {
      cells.push({ x, y })
    }
  }
  
  // Fisher-Yates 洗牌算法
  const shuffle = <T,>(array: T[]): T[] => {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
  
  // 记录已访问的点
  const visited = new Set<string>()
  const visit = (pos: Position) => visited.add(`${pos.x},${pos.y}`)
  const isVisited = (pos: Position) => visited.has(`${pos.x},${pos.y}`)
  
  // Wilson 算法的随机游走
  const randomWalk = (start: Position): Position[] => {
    const path: Position[] = [start]
    let current = { ...start }
    
    const baseDirections: Direction[] = [
      [0, -2], // 上
      [2, 0],  // 右
      [0, 2],  // 下
      [-2, 0]  // 左
    ]
    
    while (!isVisited(current)) {
      const directions = shuffle(baseDirections)
      let moved = false
      
      for (const [dx, dy] of directions) {
        const next: Position = {
          x: current.x + dx,
          y: current.y + dy
        }
        
        if (next.x > 0 && next.x < size - 1 && next.y > 0 && next.y < size - 1) {
          const pathIndex = path.findIndex(p => p.x === next.x && p.y === next.y)
          if (pathIndex !== -1) {
            path.splice(pathIndex + 1)
          }
          
          path.push(next)
          current = next
          moved = true
          break
        }
      }
      
      if (!moved && path.length > 1) {
        path.pop()
        current = { ...path[path.length - 1] }
      }
    }
    
    return path
  }
  
  // 将路径添加到迷宫中
  const addPathToMaze = (path: Position[]) => {
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i]
      const next = path[i + 1]
      maze[current.y][current.x] = 0
      maze[next.y][next.x] = 0
      maze[current.y + (next.y - current.y)/2][current.x + (next.x - current.x)/2] = 0
    }
  }
  
  // 从终点开始生成迷宫
  visit(end)
  maze[end.y][end.x] = 0
  
  // 对每个未访问的格子执行 Wilson 算法
  shuffle(cells).forEach(cell => {
    if (!isVisited(cell)) {
      const path = randomWalk(cell)
      addPathToMaze(path)
      path.forEach(visit)
    }
  })
  
  // 设置起点和终点
  maze[start.y][start.x] = 0
  maze[end.y][end.x] = 2
  
  return maze
}

export default function Game({ params }: { params: { level: string } }) {
  const { t, toggleLanguage, language } = useLanguage()
  const [isBlindMode, setIsBlindMode] = useState(false)
  const [showBlindModeDialog, setShowBlindModeDialog] = useState(false)
  const [tempVisibility, setTempVisibility] = useState<'normal' | 'flash' | 'godEye'>('normal')
  const mazeSize = getMazeSize(params.level)
  const [maze] = useState(() => generateMaze(mazeSize))
  const [gameState, setGameState] = useState(maze)
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [steps, setSteps] = useState(0)
  const [flashCount, setFlashCount] = useState(0)
  const [godEyeCount, setGodEyeCount] = useState(0)

  // 更新可见性的函数
  const updateVisibility = useCallback(() => {
    const newGameState = maze.map(row => [...row])
    
    if (isBlindMode && gameStarted) {
      for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
          const distance = Math.sqrt(
            Math.pow(y - playerPos.y, 2) + 
            Math.pow(x - playerPos.x, 2)
          )
          
          if (tempVisibility === 'godEye') {
            newGameState[y][x] = maze[y][x]
          } else if (tempVisibility === 'flash') {
            newGameState[y][x] = distance <= 5 ? maze[y][x] : -1
          } else {
            newGameState[y][x] = distance <= 0 ? maze[y][x] : -1
          }
        }
      }
    } else {
      for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
          if (!gameStarted) {
            newGameState[y][x] = maze[y][x]
          } else {
            const distance = Math.sqrt(
              Math.pow(y - playerPos.y, 2) + 
              Math.pow(x - playerPos.x, 2)
            )
            newGameState[y][x] = distance <= VISIBLE_RADIUS ? maze[y][x] : -1
          }
        }
      }
    }
    
    newGameState[playerPos.y][playerPos.x] = PLAYER
    setGameState(newGameState)
  }, [maze, isBlindMode, gameStarted, playerPos, tempVisibility, mazeSize])

  // 初始化游戏状态
  useEffect(() => {
    updateVisibility()
  }, [])

  // 监听玩家位置变化
  useEffect(() => {
    if (gameStarted) {
      updateVisibility()
      if (playerPos.x === mazeSize - 2 && playerPos.y === mazeSize - 2) {
        setGameWon(true)
      }
    }
  }, [playerPos, gameStarted, updateVisibility, mazeSize])

  // 监听临时可见性变化
  useEffect(() => {
    if (gameStarted && tempVisibility !== 'normal') {
      updateVisibility()
    }
  }, [tempVisibility, gameStarted, updateVisibility])

  const move = useCallback((dx: number, dy: number) => {
    if (gameWon) return
    const newX = playerPos.x + dx
    const newY = playerPos.y + dy
    if (maze[newY]?.[newX] === 0 || maze[newY]?.[newX] === 2) {
      setPlayerPos({ x: newX, y: newY })
      setSteps(prev => prev + 1)
      setTempVisibility('normal')
    }
  }, [maze, playerPos, gameWon])

  const startGame = useCallback(() => {
    setGameStarted(true)
    updateVisibility()
  }, [updateVisibility])

  return (
    <div className="min-h-[100dvh] bg-gray-900 p-2 text-white flex flex-col">
      {/* 顶部标题和步数 */}
      <div className="flex-none">
        <motion.h1 className="text-2xl font-bold text-center mb-2">
          {t('level')} {params.level}
        </motion.h1>
        
        <div className="text-center mb-2">
          <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
            {t('steps')}: {steps}
          </span>
        </div>
      </div>

      {/* 主要游戏区域 */}
      <div className="flex-1 flex flex-col items-center justify-between gap-4 min-h-0">
        {/* 迷宫区域 */}
        <div className="flex-1 flex items-center justify-center min-h-0 w-full overflow-auto">
          <div className="grid place-items-center">
            {gameState.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <motion.div
                    key={`${x}-${y}`}
                    className={`
                      ${mazeSize <= 15 ? 'w-6 h-6' : 
                        mazeSize <= 19 ? 'w-5 h-5' : 'w-4 h-4'}
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
        </div>

        {/* 控制区 */}
        <div className="flex-none w-full max-w-sm mx-auto pb-4">
          {!gameStarted ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowBlindModeDialog(true)}
                className="w-full py-3 bg-purple-600 rounded-lg hover:bg-purple-700 text-lg"
              >
                {t('blindMode')}
              </button>
              <motion.button
                onClick={startGame}
                className="w-full py-3 bg-green-600 rounded-lg hover:bg-green-700 text-lg"
              >
                {t('startGame')}
              </motion.button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-start-2">
                  <button 
                    onClick={() => move(0, -1)}
                    className="w-full py-3 bg-blue-600 rounded-full hover:bg-blue-700 text-xl"
                  >
                    {t('up')}
                  </button>
                </div>
                <div className="flex gap-3 col-span-3 justify-center">
                  <button
                    onClick={() => move(-1, 0)}
                    className="py-3 px-6 bg-blue-600 rounded-full hover:bg-blue-700 text-xl"
                  >
                    {t('left')}
                  </button>
                  <button
                    onClick={() => move(1, 0)}
                    className="py-3 px-6 bg-blue-600 rounded-full hover:bg-blue-700 text-xl"
                  >
                    {t('right')}
                  </button>
                </div>
                <div className="col-start-2">
                  <button
                    onClick={() => move(0, 1)}
                    className="w-full py-3 bg-blue-600 rounded-full hover:bg-blue-700 text-xl"
                  >
                    {t('down')}
                  </button>
                </div>
              </div>
              
              {isBlindMode && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTempVisibility('flash')
                      setFlashCount(prev => prev + 1)
                    }}
                    className="flex-1 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700 text-sm"
                  >
                    {t('flash')} ({flashCount})
                  </button>
                  <button
                    onClick={() => {
                      setTempVisibility('godEye')
                      setGodEyeCount(prev => prev + 1)
                    }}
                    className="flex-1 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 text-sm"
                  >
                    {t('godEye')} ({godEyeCount})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 音量控制 */}
      <div className="fixed top-2 right-2 space-y-1">
        <VolumeControl type="music" initialVolume={0.5} />
        <VolumeControl type="sound" initialVolume={0.5} />
      </div>

      {/* 对话框和胜利提示 */}
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
      
      {gameWon && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="text-center p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{t('congratulations')}</h2>
            <p className="mb-2">{t('totalSteps')}: {steps}</p>
            {isBlindMode && (
              <>
                <p className="mb-2">{t('flash')}: {flashCount}</p>
                <p className="mb-4">{t('godEye')}: {godEyeCount}</p>
              </>
            )}
            <Link href="/levels" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
              {t('backToLevels')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
