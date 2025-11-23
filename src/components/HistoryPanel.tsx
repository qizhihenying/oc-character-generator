import React, { useState } from 'react';
import { History, Trash2, Download, Copy, Check, Archive } from 'lucide-react';
import { GeneratedPrompt } from '../utils/promptGenerator';
import { reservedCharactersManager } from '../utils/reservedCharactersManager';

interface HistoryPanelProps {
  history: GeneratedPrompt[];
  onClearHistory: () => void;
  onExportHistory: () => void;
  onCopy?: (text: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  history, 
  onClearHistory, 
  onExportHistory,
  onCopy
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (prompt: GeneratedPrompt) => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopiedId(prompt.id);
    if (onCopy) {
      onCopy(prompt.prompt);
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="glass-card dark:bg-gray-800/80 dark:border-gray-700/20 rounded-2xl p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <History className="text-purple-600 dark:text-purple-400" size={20} />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            生成历史 ({history.length})
          </h3>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onExportHistory}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download size={14} />
            导出
          </button>
          <button
            onClick={onClearHistory}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 size={14} />
            清空
          </button>
        </div>
      </div>
      
      <div className="max-h-60 overflow-y-auto space-y-2">
        {history.slice().reverse().map((prompt, index) => {
          const isReserved = prompt.seed ? reservedCharactersManager.isSeedReserved(prompt.seed) : false;
          return (
            <div 
              key={prompt.id} 
              className="bg-white/50 dark:bg-gray-700/30 rounded-lg p-3 text-sm hover:bg-white/70 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                    #{history.length - index}
                  </span>
                  {prompt.characterIP?.name && (
                    <span className="ml-2 text-gray-700 dark:text-gray-300 font-semibold">
                      {prompt.characterIP.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(prompt.timestamp).toLocaleString('zh-CN')}
                  </span>
                  <button
                    onClick={() => {
                      if (!prompt.seed) {
                        alert('此角色没有种子编号，无法入库！');
                        return;
                      }
                      if (isReserved) {
                        alert('此角色已经入库！');
                        return;
                      }
                      if (reservedCharactersManager.addReservedCharacter(prompt)) {
                        alert(`角色"${prompt.characterIP?.name || '未命名'}"已成功入库！`);
                      }
                    }}
                    disabled={isReserved}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      isReserved
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                    title={isReserved ? '已入库' : '入库'}
                  >
                    <Archive size={12} />
                    <span>{isReserved ? '已入库' : '入库'}</span>
                  </button>
                  <button
                    onClick={() => handleCopy(prompt)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                    title="复制提示词"
                  >
                    {copiedId === prompt.id ? (
                      <>
                        <Check size={12} />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-2 text-xs">
                {prompt.prompt}
              </p>
              {prompt.seed && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  种子: {prompt.seed.slice(0, 10)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryPanel;
