"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import LevelButton from "../../components/LevelButton"
import VolumeControl from "../../components/VolumeControl"

export default function Levels() {
  const levels = [1, 2, 3, 4, 5] // 假设有5个关卡

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900">
      <Image
        src="/levels-background.jpg"
        alt="Levels Background"
        layout="fill"
        objectFit="cover"
        className="opacity-30"
      />

      <div className="relative z-10 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold text-center mb-12 text-white"
        >
          选择关卡
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {levels.map((level, index) => (
            <motion.div
              key={level}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <LevelButton level={level} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition duration-300 text-lg">
            返回主页
          </Link>
        </motion.div>
      </div>

      <div className="absolute top-4 right-4 space-y-2">
        <VolumeControl type="music" initialVolume={0.5} />
        <VolumeControl type="sound" initialVolume={0.5} />
      </div>
    </div>
  )
}

