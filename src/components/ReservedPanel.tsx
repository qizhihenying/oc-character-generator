import React, { useState, useEffect } from 'react';
import { Archive, Trash2, Download, Upload, X } from 'lucide-react';
import { reservedCharactersManager, ReservedCharacter } from '../utils/reservedCharactersManager';

interface ReservedPanelProps {
  onClose: () => void;
}

const ReservedPanel: React.FC<ReservedPanelProps> = ({ onClose }) => {
  const [reserved, setReserved] = useState<ReservedCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<ReservedCharacter | null>(null);

  useEffect(() => {
    loadReserved();
  }, []);

  const loadReserved = () => {
    setReserved(reservedCharactersManager.getAllReservedCharacters());
  };

  const handleRemove = (seed: string) => {
    if (confirm('确定要从入库中移除这个角色吗？')) {
      reservedCharactersManager.removeReservedCharacter(seed);
      loadReserved();
      if (selectedCharacter?.seed === seed) {
        setSelectedCharacter(null);
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有已入库角色吗？此操作不可恢复！')) {
      reservedCharactersManager.clearAll();
      loadReserved();
      setSelectedCharacter(null);
    }
  };

  const handleExport = () => {
    const json = reservedCharactersManager.exportReserved();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reserved-characters-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (reservedCharactersManager.importReserved(content)) {
            loadReserved();
            alert('导入成功！');
          } else {
            alert('导入失败，请检查文件格式！');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Archive className="text-purple-600 dark:text-purple-400" size={24} />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              已入库角色 ({reserved.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* 工具栏 */}
        <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            disabled={reserved.length === 0}
          >
            <Download size={16} />
            导出
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Upload size={16} />
            导入
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors ml-auto"
            disabled={reserved.length === 0}
          >
            <Trash2 size={16} />
            清空全部
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden flex">
          {/* 左侧列表 */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            {reserved.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <Archive size={48} className="mx-auto mb-4 opacity-50" />
                <p>还没有入库的角色</p>
                <p className="text-sm mt-2">生成角色后点击"入库"按钮添加</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reserved.map((char) => (
                  <button
                    key={char.seed}
                    onClick={() => setSelectedCharacter(char)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedCharacter?.seed === char.seed
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-semibold mb-1">{char.name}</div>
                    <div className="text-xs opacity-75">
                      种子: {char.seed.slice(0, 12)}...
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(char.timestamp).toLocaleString('zh-CN')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右侧详情 */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedCharacter ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {selectedCharacter.name}
                  </h3>
                  <button
                    onClick={() => handleRemove(selectedCharacter.seed)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                    移除
                  </button>
                </div>

                {/* 基本信息 */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
                    基本信息
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">姓名：</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedCharacter.prompt.characterIP?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">性别：</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedCharacter.prompt.characterIP?.gender}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">风格：</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedCharacter.prompt.characterIP?.style}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">职业：</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedCharacter.prompt.characterIP?.background.occupation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 种子编号 */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    种子编号
                  </h4>
                  <div className="font-mono text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900/30 rounded p-2">
                    {selectedCharacter.seed}
                  </div>
                </div>

                {/* AI 提示词 */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                    AI 提示词
                  </h4>
                  <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/30 rounded p-3 max-h-40 overflow-y-auto">
                    {selectedCharacter.prompt.prompt}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Archive size={64} className="mx-auto mb-4 opacity-30" />
                  <p>选择一个角色查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservedPanel;
