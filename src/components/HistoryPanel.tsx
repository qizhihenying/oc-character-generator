import React from 'react';
import { History, Trash2, Download } from 'lucide-react';
import { GeneratedPrompt } from '../utils/promptGenerator';

interface HistoryPanelProps {
  history: GeneratedPrompt[];
  onClearHistory: () => void;
  onExportHistory: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  history, 
  onClearHistory, 
  onExportHistory 
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <History className="text-purple-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">
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
        {history.slice().reverse().map((prompt, index) => (
          <div 
            key={prompt.id} 
            className="bg-white/50 rounded-lg p-3 text-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-purple-600 font-medium">
                #{history.length - index}
              </span>
              <span className="text-gray-500 text-xs">
                {new Date(prompt.timestamp).toLocaleString('zh-CN')}
              </span>
            </div>
            <p className="text-gray-700 line-clamp-2">
              {prompt.prompt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
