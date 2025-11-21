import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface GeneratorButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

const GeneratorButton: React.FC<GeneratorButtonProps> = ({ onGenerate, isGenerating }) => {
  return (
    <div className="text-center mb-8">
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transform transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
      >
        <div className="flex items-center gap-3">
          {isGenerating ? (
            <RefreshCw className="animate-spin" size={28} />
          ) : (
            <Sparkles className="group-hover:animate-pulse" size={28} />
          )}
          <span>
            {isGenerating ? '正在生成中...' : '抽取人设盲盒'}
          </span>
        </div>
        
        {/* 发光效果 */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
      </button>
      
      <p className="mt-4 text-gray-600 text-sm">
        点击按钮随机生成一个独特的 OC 人设提示词
      </p>
    </div>
  );
};

export default GeneratorButton;
