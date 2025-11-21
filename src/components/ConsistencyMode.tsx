import React from 'react';
import { Users, Lock, Unlock, Info } from 'lucide-react';

export interface ConsistencyConfig {
  enabled: boolean;
  mode: 'seed' | 'cref' | 'both';
  characterReference?: string;
  lockFeatures: {
    hair: boolean;
    eyes: boolean;
    outfit: boolean;
    accessories: boolean;
  };
}

interface ConsistencyModeProps {
  config: ConsistencyConfig;
  onChange: (config: ConsistencyConfig) => void;
}

const ConsistencyMode: React.FC<ConsistencyModeProps> = ({ config, onChange }) => {
  return (
    <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">人物一致性模式</h3>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {config.enabled ? '已启用' : '已禁用'}
          </span>
        </label>
      </div>

      {config.enabled && (
        <div className="space-y-4">
          {/* 一致性模式选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              一致性方法
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                onClick={() => onChange({ ...config, mode: 'seed' })}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  config.mode === 'seed'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="font-semibold mb-1">种子模式</div>
                <div className="text-xs opacity-80">使用固定种子</div>
              </button>

              <button
                onClick={() => onChange({ ...config, mode: 'cref' })}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  config.mode === 'cref'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="font-semibold mb-1">参考图模式</div>
                <div className="text-xs opacity-80">--cref 参数</div>
              </button>

              <button
                onClick={() => onChange({ ...config, mode: 'both' })}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  config.mode === 'both'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="font-semibold mb-1">组合模式</div>
                <div className="text-xs opacity-80">种子 + 参考图</div>
              </button>
            </div>
          </div>

          {/* 参考图URL（cref模式） */}
          {(config.mode === 'cref' || config.mode === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                角色参考图 URL
              </label>
              <input
                type="text"
                value={config.characterReference || ''}
                onChange={(e) => onChange({ ...config, characterReference: e.target.value })}
                placeholder="https://example.com/character.jpg"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                输入角色参考图的URL，MidJourney会根据此图保持角色一致性
              </p>
            </div>
          )}

          {/* 锁定特征 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              锁定特征（保持不变）
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={config.lockFeatures.hair}
                  onChange={(e) => onChange({
                    ...config,
                    lockFeatures: { ...config.lockFeatures, hair: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm flex items-center gap-1">
                  {config.lockFeatures.hair ? <Lock size={14} /> : <Unlock size={14} />}
                  发型发色
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={config.lockFeatures.eyes}
                  onChange={(e) => onChange({
                    ...config,
                    lockFeatures: { ...config.lockFeatures, eyes: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm flex items-center gap-1">
                  {config.lockFeatures.eyes ? <Lock size={14} /> : <Unlock size={14} />}
                  眼睛特征
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={config.lockFeatures.outfit}
                  onChange={(e) => onChange({
                    ...config,
                    lockFeatures: { ...config.lockFeatures, outfit: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm flex items-center gap-1">
                  {config.lockFeatures.outfit ? <Lock size={14} /> : <Unlock size={14} />}
                  服装主体
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={config.lockFeatures.accessories}
                  onChange={(e) => onChange({
                    ...config,
                    lockFeatures: { ...config.lockFeatures, accessories: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm flex items-center gap-1">
                  {config.lockFeatures.accessories ? <Lock size={14} /> : <Unlock size={14} />}
                  配饰装备
                </span>
              </label>
            </div>
          </div>

          {/* 说明信息 */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex gap-2">
              <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 space-y-1">
                <p className="font-medium">使用方法：</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li><strong>种子模式：</strong>使用相同种子生成风格相似的角色</li>
                  <li><strong>参考图模式：</strong>使用 --cref 参数引用角色图片（MidJourney v6+）</li>
                  <li><strong>组合模式：</strong>同时使用种子和参考图，效果最佳</li>
                  <li><strong>锁定特征：</strong>选中的特征将在多次生成中保持不变</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsistencyMode;
