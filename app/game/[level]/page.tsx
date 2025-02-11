"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import VolumeControl from "../../../components/VolumeControl"

// 20x20迷宫生成算法
const generateMaze = (size: number) => {
  const maze = Array(size).fill(null).map(() => Array(size).fill(1));
  
  // 使用递归分割算法生成迷宫
  const divide = (x: number, y: number, width: number, height: number) => {
    if (width < 3 || height < 3) return;

    const horizontal = height > width;
    const wallX = x + (horizontal ? 0 : Math.floor(Math.random()*(width-2))+1);
    const wallY = y + (horizontal ? Math.floor(Math.random()*(height-2))+1 : 0);
    const passageX = wallX + (horizontal ? Math.floor(Math.random()*width) : 0);
    const passageY = wallY + (horizontal ? 0 : Math.floor(Math.random()*height));

    for(let i=0; i<(horizontal ? width : height); i++) {
      const currX = wallX + (horizontal ? i : 0);
      const currY = wallY + (horizontal ? 0 : i);
      if(currX !== passageX || currY !== passageY) {
        maze[currY][currX] = 0;
      }
    }

    horizontal ? 
      (divide(x, y, width, wallY-y+1), divide(x, wallY, width, y+height-wallY)) :
      (divide(x, y, wallX-x+1, height), divide(wallX, y, x+width-wallX, height))
  }

  divide(0, 0, size, size);
  maze[1][1] = 0; // 起点
  maze[size-2][size-2] = 2; // 终点
  return maze;
}

const PLAYER = 3;
const VISIBLE_RADIUS = 3;
const MAZE_SIZE = 20;

export default function Game({ params }: { params: { level: string } }) {
  const [maze] = useState(() => generateMaze(MAZE_SIZE));
  const [gameState, setGameState] = useState(maze);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

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
    for (let y = 0; y < MAZE_SIZE; y++) {
      for (let x = 0; x < MAZE_SIZE; x++) {
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
    if(playerPos.x === MAZE_SIZE-2 && playerPos.y === MAZE_SIZE-2) {
      setGameWon(true);
    }
  }

  const move = (dx: number, dy: number) => {
    if(gameWon) return;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    if(maze[newY]?.[newX] === 0 || maze[newY]?.[newX] === 2) {
      setPlayerPos({ x: newX, y: newY });
    }
  }

  useEffect(() => {
    if(gameStarted) updateVisibility();
  }, [playerPos, gameStarted]);

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-white">
      <div className="max-w-4xl mx-auto">
        <motion.h1 className="text-3xl font-bold text-center mb-6">
          关卡 {params.level}
        </motion.h1>
        
        <div className="relative mb-8">
          <div className="grid place-items-center">
            {gameState.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <motion.div
                    key={`${x}-${y}`}
                    className={`w-6 h-6 border border-gray-800 ${
                      cell === 1 ? "bg-gray-800" :
                      cell === PLAYER ? "bg-red-500 rounded-full" :
                      cell === -1 ? "bg-gray-900" :
                      cell === 2 ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
          
          {gameWon && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center p-6 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">🎉 通关成功！</h2>
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

