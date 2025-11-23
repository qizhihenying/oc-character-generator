import React, { useState } from 'react';
import { Palette, Github, Heart, Archive } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import AISettings from './AISettings';
import ElementLibrary from './ElementLibrary';
import StatsPanel from './StatsPanel';
import ReservedPanel from './ReservedPanel';
import { reservedCharactersManager } from '../utils/reservedCharactersManager';

const Header: React.FC = () => {
  const [showReserved, setShowReserved] = useState(false);
  const [reservedCount, setReservedCount] = useState(
    reservedCharactersManager.getReservedCount()
  );

  const handleReservedClick = () => {
    setShowReserved(true);
    setReservedCount(reservedCharactersManager.getReservedCount());
  };

  return (
    <header className="mb-12">
      {/* 顶部工具栏 */}
      <div className="flex justify-end items-center gap-3 mb-6">
        <button
          onClick={handleReservedClick}
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="查看已入库角色"
        >
          <Archive size={20} className="text-gray-700 dark:text-gray-300" />
          {reservedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {reservedCount}
            </span>
          )}
        </button>
        <ThemeToggle />
        <AISettings />
        <ElementLibrary />
        <StatsPanel />
      </div>

      {showReserved && <ReservedPanel onClose={() => setShowReserved(false)} />}

      {/* 标题区域 */}
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
            <Palette className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            OC人设盲盒
          </h1>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
          随机生成独特的原创角色设定，为你的 AI 图像创作提供无限灵感
        </p>
        
        <div className="flex justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-red-400" />
            <span>适用于 Midjourney、Stable Diffusion 等</span>
          </div>
          <div className="flex items-center gap-2">
            <Github size={16} />
            <span>开源项目</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
