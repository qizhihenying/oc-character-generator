import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Star, Download, Upload, Ban } from 'lucide-react';
import { elementManager, ElementRarity, ThemePack } from '../utils/elementManager';

const ElementLibrary: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'custom' | 'themes' | 'blacklist'>('custom');
  
  // 自定义元素
  const [category, setCategory] = useState('');
  const [newElement, setNewElement] = useState('');
  const [rarity, setRarity] = useState<ElementRarity>('common');
  const [customElements, setCustomElements] = useState<any[]>([]);

  // 主题包
  const [themePacks, setThemePacks] = useState<ThemePack[]>([]);
  const [selectedPack, setSelectedPack] = useState<ThemePack | null>(null);

  // 黑名单
  const [blacklistCategory, setBlacklistCategory] = useState('');
  const [blacklistItem, setBlacklistItem] = useState('');
  const [blacklist, setBlacklist] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeTab]);

  const loadData = () => {
    if (activeTab === 'custom') {
      setCustomElements(elementManager.getCustomElements());
    } else if (activeTab === 'themes') {
      setThemePacks(elementManager.getAllThemePacks());
    } else if (activeTab === 'blacklist') {
      setBlacklist(elementManager.getBlacklist());
    }
  };

  const handleAddElement = async () => {
    if (!category.trim() || !newElement.trim()) {
      alert('请填写类别和元素内容');
      return;
    }

    try {
      await elementManager.addCustomElement(category, newElement, rarity);
      setNewElement('');
      loadData();
      alert('添加成功！');
    } catch (error: any) {
      alert(`添加失败：${error.message}`);
    }
  };

  const handleRemoveElement = async (cat: string, itemId: string) => {
    if (!confirm('确定要删除这个元素吗？')) return;

    try {
      await elementManager.removeCustomElement(cat, itemId);
      loadData();
    } catch (error: any) {
      alert(`删除失败：${error.message}`);
    }
  };

  const handleExportPack = async (packId: string) => {
    try {
      const json = await elementManager.exportThemePack(packId);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-pack-${packId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`导出失败：${error.message}`);
    }
  };

  const handleImportPack = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        await elementManager.importThemePack(text);
        loadData();
        alert('导入成功！');
      } catch (error: any) {
        alert(`导入失败：${error.message}`);
      }
    };
    input.click();
  };

  const handleAddToBlacklist = () => {
    if (!blacklistCategory.trim() || !blacklistItem.trim()) {
      alert('请填写类别和元素内容');
      return;
    }

    elementManager.addToBlacklist(blacklistCategory, blacklistItem);
    setBlacklistItem('');
    loadData();
  };

  const handleRemoveFromBlacklist = (cat: string, item: string) => {
    elementManager.removeFromBlacklist(cat, item);
    loadData();
  };

  const getRarityColor = (r: ElementRarity) => {
    const colors = {
      common: 'text-gray-500 bg-gray-100 dark:bg-gray-700',
      rare: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      epic: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      legendary: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30'
    };
    return colors[r];
  };

  const getRarityLabel = (r: ElementRarity) => {
    const labels = {
      common: '普通',
      rare: '稀有',
      epic: '史诗',
      legendary: '传说'
    };
    return labels[r];
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="元素库管理"
      >
        <Package size={18} />
        <span className="font-medium text-gray-700 dark:text-gray-300">元素库</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">元素库管理</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">自定义元素、主题包和黑名单</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'custom', label: '自定义元素', icon: Plus },
            { id: 'themes', label: '主题包', icon: Star },
            { id: 'blacklist', label: '黑名单', icon: Ban }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* 自定义元素 */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              {/* 添加表单 */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      类别
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="例如：发型发色"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      稀有度
                    </label>
                    <select
                      value={rarity}
                      onChange={(e) => setRarity(e.target.value as ElementRarity)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="common">普通</option>
                      <option value="rare">稀有</option>
                      <option value="epic">史诗</option>
                      <option value="legendary">传说</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    元素内容
                  </label>
                  <input
                    type="text"
                    value={newElement}
                    onChange={(e) => setNewElement(e.target.value)}
                    placeholder="输入元素描述..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleAddElement}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus size={18} />
                  添加元素
                </button>
              </div>

              {/* 元素列表 */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 dark:text-white">已添加的元素</h3>
                {customElements.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    还没有自定义元素
                  </p>
                ) : (
                  customElements.map((catData) => (
                    <div key={catData.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">{catData.category}</h4>
                      <div className="space-y-2">
                        {catData.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRarityColor(item.rarity)}`}>
                                {getRarityLabel(item.rarity)}
                              </span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{item.value}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveElement(catData.category, item.id)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 主题包 */}
          {activeTab === 'themes' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={handleImportPack}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Upload size={18} />
                  导入主题包
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themePacks.map((pack) => (
                  <div
                    key={pack.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white">{pack.name}</h4>
                        {pack.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{pack.description}</p>
                        )}
                      </div>
                      {pack.isBuiltIn && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
                          内置
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      包含 {Object.keys(pack.elements).length} 个类别
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPack(pack)}
                        className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        查看详情
                      </button>
                      <button
                        onClick={() => handleExportPack(pack.id)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        title="导出"
                      >
                        <Download size={16} />
                      </button>
                      {!pack.isBuiltIn && (
                        <button
                          onClick={async () => {
                            if (confirm('确定要删除这个主题包吗？')) {
                              await elementManager.deleteThemePack(pack.id);
                              loadData();
                            }
                          }}
                          className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 主题包详情弹窗 */}
              {selectedPack && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedPack(null)}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{selectedPack.name}</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedPack.elements).map(([category, items]) => (
                        <div key={category}>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {(items as string[]).map((item, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 黑名单 */}
          {activeTab === 'blacklist' && (
            <div className="space-y-6">
              {/* 添加表单 */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      类别
                    </label>
                    <input
                      type="text"
                      value={blacklistCategory}
                      onChange={(e) => setBlacklistCategory(e.target.value)}
                      placeholder="例如：服装主体"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      元素内容
                    </label>
                    <input
                      type="text"
                      value={blacklistItem}
                      onChange={(e) => setBlacklistItem(e.target.value)}
                      placeholder="不想出现的元素..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddToBlacklist}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Ban size={18} />
                  添加到黑名单
                </button>
              </div>

              {/* 黑名单列表 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-white">黑名单</h3>
                  {blacklist.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('确定要清空所有黑名单吗？')) {
                          elementManager.clearBlacklist();
                          loadData();
                        }
                      }}
                      className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    >
                      清空全部
                    </button>
                  )}
                </div>

                {blacklist.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    黑名单为空
                  </p>
                ) : (
                  blacklist.map((item) => (
                    <div key={item.category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">{item.category}</h4>
                      <div className="space-y-2">
                        {item.items.map((element: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded"
                          >
                            <span className="text-sm text-gray-700 dark:text-gray-300">{element}</span>
                            <button
                              onClick={() => handleRemoveFromBlacklist(item.category, element)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElementLibrary;
