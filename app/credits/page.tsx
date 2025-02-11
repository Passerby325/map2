"use client"

import Link from "next/link"
import Image from "next/image"
import VolumeControl from "../../components/VolumeControl"

export default function Credits() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900 text-white">
      {/* 背景图片 */}
      <Image
        src="/credits-background.jpg"
        alt="Credits Background"
        layout="fill"
        objectFit="cover"
        className="opacity-30"
      />

      <div className="relative z-10 max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-center mb-12">制作详情</h1>

        <div className="bg-black bg-opacity-50 rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-semibold mb-6">游戏制作团队</h2>
          <ul className="space-y-4 text-lg">
            <li>
              <span className="font-bold">游戏设计：</span>张三
            </li>
            <li>
              <span className="font-bold">程序开发：</span>李四
            </li>
            <li>
              <span className="font-bold">美术设计：</span>王五
            </li>
            <li>
              <span className="font-bold">音乐制作：</span>赵六
            </li>
          </ul>
        </div>

        <div className="bg-black bg-opacity-50 rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-semibold mb-6">使用技术</h2>
          <ul className="space-y-4 text-lg">
            <li>Next.js</li>
            <li>React</li>
            <li>TypeScript</li>
            <li>Tailwind CSS</li>
          </ul>
        </div>

        <div className="bg-black bg-opacity-50 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-semibold mb-6">特别鸣谢</h2>
          <p className="text-lg">感谢所有在游戏开发过程中提供帮助和支持的人们。你们的贡献使这个项目成为可能。</p>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
          >
            返回主页
          </Link>
        </div>
      </div>

      {/* 音量控制 */}
      <div className="absolute top-4 right-4 space-y-2">
        <VolumeControl type="music" initialVolume={0.5} />
        <VolumeControl type="sound" initialVolume={0.5} />
      </div>
    </div>
  )
}

