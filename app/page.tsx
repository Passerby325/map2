"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import VolumeControl from "../components/VolumeControl"
import { useAudio } from "../contexts/AudioContext"
import { useLanguage } from "../contexts/LanguageContext"

export default function Home() {
  const { isPlaying, togglePlay } = useAudio()
  const { t, toggleLanguage, language } = useLanguage()

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col justify-between">
      <Image
        src="/enhanced-background.jpg"
        alt="Enhanced Background"
        layout="fill"
        objectFit="cover"
        priority
        className="filter brightness-75"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center pt-20 sm:pt-32 md:pt-40"
      >
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-white shadow-lg mb-4">Map</h1>
        <p className="text-xl sm:text-2xl text-gray-200">探索迷宫的奥秘</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 flex flex-col items-center space-y-4 pb-20 sm:pb-32"
      >
        <button
          onClick={togglePlay}
          className="px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-green-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
        >
          {isPlaying ? "暂停背景音乐" : "开始背景音乐"}
        </button>
        <Link
          href="/levels"
          className="px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        >
          进入关卡
        </Link>
        <Link
          href="/credits"
          className="px-8 py-4 bg-purple-600 text-white text-xl font-semibold rounded-full shadow-lg hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
        >
          制作详情
        </Link>
      </motion.div>

      <div className="absolute top-4 right-4 space-y-2 z-20">
        <VolumeControl type="music" initialVolume={0.5} />
        <VolumeControl type="sound" initialVolume={0.5} />
      </div>

      {/* 语言切换按钮 */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        {language === 'en' ? '中文' : 'English'}
      </button>
    </div>
  )
}

