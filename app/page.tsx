"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useLanguage } from "../contexts/LanguageContext"

export default function Home() {
  const { t, toggleLanguage, language } = useLanguage()

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900">
      <Image
        src="/background.jpg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="opacity-30"
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-6xl font-bold text-white mb-12"
        >
          Maze Game
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4 w-64"
        >
          <Link href="/levels">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition duration-300"
            >
              {t('startGame')}
            </motion.button>
          </Link>

          <Link href="/credits">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 bg-gradient-to-r from-gray-500 to-gray-700 text-white text-xl font-bold rounded-lg shadow-lg hover:from-gray-600 hover:to-gray-800 transition duration-300"
            >
              {t('credits')}
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLanguage}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white text-xl font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-teal-600 transition duration-300"
          >
            {language === 'zh' ? 'English' : '中文'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

