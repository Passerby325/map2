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
    'up': '上',
    'down': '下',
    'left': '左',
    'right': '右',
    'credits': '制作详情',
    'language': '语言',
    'blindMode': '盲人模式',
    'blindModeDesc': '盲人模式中，开始游戏后，玩家只能看见玩家自己。能使用"灵光一现！"按钮显示玩家周围5个的距离，直到玩家下一步移动。能使用"天眼，开！！！"按钮显示整个地图，直到玩家下一步移动。',
    'confirm': '确认',
    'cancel': '返回',
    'flash': '灵光一现！',
    'godEye': '天眼，开！！！',
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
    'up': 'Up',
    'down': 'Down',
    'left': 'Left',
    'right': 'Right',
    'credits': 'Credits',
    'language': 'Language',
    'blindMode': 'Blind Mode',
    'blindModeDesc': 'In blind mode, players can only see themselves after starting the game. Use "Flash!" to see within 5 blocks until next move. Use "God\'s Eye!" to see the entire map until next move.',
    'confirm': 'Confirm',
    'cancel': 'Back',
    'flash': 'Flash!',
    'godEye': 'God\'s Eye!',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')

  const toggleLanguage = () => {
    console.log('Toggling language from:', language)
    setLanguage(prev => {
      const newLang = prev === 'zh' ? 'en' : 'zh'
      console.log('To:', newLang)
      return newLang
    })
  }

  const t = (key: string) => {
    const translation = translations[language][key as keyof typeof translations.en] || key
    console.log(`Translating ${key} to:`, translation)
    return translation
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