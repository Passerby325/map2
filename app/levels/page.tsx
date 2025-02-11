"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import LevelButton from "../../components/LevelButton"
import VolumeControl from "../../components/VolumeControl"
import { useLanguage } from "../../contexts/LanguageContext"

export default function Levels() {
  const { t, toggleLanguage, language } = useLanguage()

  const levels = [
    { id: 1, difficulty: "简单" },
    { id: 2, difficulty: "简单" },
    { id: 3, difficulty: "简单" },
    { id: 4, difficulty: "简单" },
    { id: 5, difficulty: "简单" },
    { id: 6, difficulty: "中等" },
    { id: 7, difficulty: "中等" },
    { id: 8, difficulty: "中等" },
    { id: 9, difficulty: "中等" },
    { id: 10, difficulty: "中等" },
    { id: 11, difficulty: "困难" },
    { id: 12, difficulty: "困难" },
    { id: 13, difficulty: "困难" },
    { id: 14, difficulty: "困难" },
    { id: 15, difficulty: "困难" }
  ]

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
        <button
          onClick={toggleLanguage}
          className="absolute top-4 right-4 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          {language === 'zh' ? 'EN' : '中文'}
        </button>

        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold text-center mb-12 text-white"
        >
          {t('selectLevel')}
        </motion.h1>

        {[
          { key: 'easy', text: t('easy') },
          { key: 'medium', text: t('medium') },
          { key: 'hard', text: t('hard') }
        ].map(({ key, text }) => (
          <div key={key} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {text}{t('difficulty')}
            </h2>
            <motion.div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {levels
                .filter(level => level.difficulty === text)
                .map((level) => (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: level.id * 0.1 }}
                  >
                    <LevelButton level={level.id} difficulty={text} />
                  </motion.div>
                ))}
            </motion.div>
          </div>
        ))}

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

