"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface LevelButtonProps {
  level: number
}

export default function LevelButton({ level }: LevelButtonProps) {
  return (
    <Link href={`/game/${level}`} className="block">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full py-6 bg-gradient-to-r from-green-400 to-blue-500 text-white text-2xl font-bold rounded-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        关卡 {level}
      </motion.button>
    </Link>
  )
}

