import React from 'react';
import { Palette, Github, Heart } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-12">
      <div className="flex justify-center items-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
          <Palette className="text-white" size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold gradient-text">
          OC人设盲盒
        </h1>
      </div>
      
      <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
        随机生成独特的原创角色设定，为你的 AI 图像创作提供无限灵感
      </p>
      
      <div className="flex justify-center items-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-red-400" />
          <span>适用于 Midjourney、Stable Diffusion 等</span>
        </div>
        <div className="flex items-center gap-2">
          <Github size={16} />
          <span>开源项目</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
