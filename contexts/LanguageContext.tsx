"use client"

import React, { createContext, useContext, useState } from 'react'

type Language = 'zh' | 'en'

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (key: string) => string
}

const translations = {
  zh: {
    'selectLevel': '选择关卡',
    'level': '关卡',
    'easy': '简单',
    'medium': '中等',
    'hard': '困难',
    'difficulty': '难度',
    'steps': '步数',
    'startGame': '开始游戏',
    'congratulations': '🎉 通关成功！',
    'totalSteps': '总步数',
    'backToLevels': '返回关卡选择',
    'backToHome': '返回主页',
    'randomLevel': '随机关卡',
    'up': '↑',
    'down': '↓',
    'left': '←',
    'right': '→',
  },
  en: {
    'selectLevel': 'Select Level',
    'level': 'Level',
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard',
    'difficulty': 'Difficulty',
    'steps': 'Steps',
    'startGame': 'Start Game',
    'congratulations': '🎉 Level Complete!',
    'totalSteps': 'Total Steps',
    'backToLevels': 'Back to Levels',
    'backToHome': 'Back to Home',
    'randomLevel': 'Random Level',
    'up': '↑',
    'down': '↓',
    'left': '←',
    'right': '→',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh')
  }

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 