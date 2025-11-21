import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface MultiDrawButtonProps {
  onDraw: (count: number) => void;
  isGenerating: boolean;
}

const MultiDrawButton: React.FC<MultiDrawButtonProps> = ({ onDraw, isGenerating }) => {
  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      {/* 单抽按钮 */}
      <button
        onClick={() => onDraw(1)}
        disabled={isGenerating}
        className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transform transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="group-hover:animate-pulse" size={28} />
          <span>{isGenerating ? '正在生成中...' : '抽取人设盲盒'}</span>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
      </button>

      {/* 连抽按钮组 */}
      <div className="flex gap-3">
        <button
          onClick={() => onDraw(5)}
          disabled={isGenerating}
          className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transform transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <Zap size={20} />
            <span>5连抽</span>
          </div>
        </button>

        <button
          onClick={() => onDraw(10)}
          disabled={isGenerating}
          className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/25 transform transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <Zap size={20} />
            <span>10连抽</span>
          </div>
        </button>
      </div>

      <p className="text-gray-600 text-sm text-center">
        单抽：生成一个角色 | 连抽：一次生成多个角色供选择
      </p>
    </div>
  );
};

export default MultiDrawButton;
