"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface LevelButtonProps {
  level: number
  difficulty: string
}

export default function LevelButton({ level, difficulty }: LevelButtonProps) {
  // 根据难度设置不同的颜色
  const getGradient = () => {
    switch (difficulty) {
      case "简单":
        return "from-green-400 to-green-600"
      case "中等":
        return "from-yellow-400 to-yellow-600"
      case "困难":
        return "from-red-400 to-red-600"
      default:
        return "from-blue-400 to-blue-600"
    }
  }

  return (
    <Link href={`/game/${level}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-full py-6 bg-gradient-to-r ${getGradient()} 
          text-white text-2xl font-bold rounded-lg shadow-lg 
          hover:shadow-xl transition duration-300`}
      >
        关卡 {level}
      </motion.button>
    </Link>
  )
}

