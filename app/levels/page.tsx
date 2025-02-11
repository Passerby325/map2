"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import LevelButton from "../../components/LevelButton"
import VolumeControl from "../../components/VolumeControl"

export default function Levels() {
  const levels = [1, 2, 3, 4, 5]

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

        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {/* 常规关卡 */}
            {levels.map((level) => (
              <motion.div
                key={level}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: level * 0.1 }}
              >
                <LevelButton level={level} />
              </motion.div>
            ))}
          </motion.div>

          {/* 随机关卡按钮 - 单独放在下方并占据更宽的空间 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="sm:col-span-2 lg:col-span-3"
          >
            <Link href="/game/random" className="block">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl font-bold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition duration-300"
              >
                随机关卡
              </motion.button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link 
            href="/" 
            className="text-blue-400 hover:text-blue-300 transition duration-300 text-lg"
          >
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

