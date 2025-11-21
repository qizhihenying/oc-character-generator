import React from 'react';
import { Copy, Check } from 'lucide-react';
import { GeneratedPrompt } from '../utils/promptGenerator';

interface CharacterCardProps {
  prompt: GeneratedPrompt;
  onCopy: (text: string) => void;
  isCopied: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ prompt, onCopy, isCopied }) => {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="glass-card rounded-2xl p-6 mb-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold gradient-text">
          生成时间: {formatTimestamp(prompt.timestamp)}
        </h3>
        <button
          onClick={() => onCopy(prompt.prompt)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
        >
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
          {isCopied ? '已复制' : '复制提示词'}
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-700 mb-2">完整提示词:</h4>
        <p className="text-gray-800 leading-relaxed break-words font-mono text-sm">
          {prompt.prompt}
        </p>
      </div>
      
      {prompt.technicalParams && (
        <div className="bg-purple-50 rounded-lg p-3 mb-4 border border-purple-200">
          <h4 className="font-medium text-purple-700 mb-1 text-sm">技术参数:</h4>
          <p className="text-purple-900 font-mono text-sm">
            {prompt.technicalParams.trim()}
          </p>
        </div>
      )}
      
      {prompt.seed && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
          <h4 className="font-medium text-blue-700 mb-1 text-sm">角色种子:</h4>
          <p className="text-blue-900 font-mono text-sm">
            {prompt.seed}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            使用相同种子可生成风格相似的角色
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(prompt.elements).map(([category, element]) => (
          <div key={category} className="bg-white/50 rounded-lg p-3">
            <div className="text-sm font-medium text-purple-600 mb-1">
              {category}
            </div>
            <div className="text-gray-700 text-sm">
              {element}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterCard;
