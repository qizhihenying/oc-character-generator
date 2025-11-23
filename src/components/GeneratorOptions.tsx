import React from 'react';
import { Settings, Wand2 } from 'lucide-react';

export interface GeneratorConfig {
  gender: 'male' | 'female' | 'any';
  style: 'anime' | 'fantasy' | 'chinese' | 'cyberpunk' | 'gothic' | 'modern' | 'ghibli' | 'any';
  customWish: string;
  seed: string;
  useSeed: boolean;
}

interface GeneratorOptionsProps {
  config: GeneratorConfig;
  onChange: (config: GeneratorConfig) => void;
}

const GeneratorOptions: React.FC<GeneratorOptionsProps> = ({ config, onChange }) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const genderOptions = [
    { value: 'any', label: '随机性别' },
    { value: 'male', label: '男性' },
    { value: 'female', label: '女性' }
  ];

  const styleOptions = [
    { value: 'any', label: '随机风格' },
    { value: 'anime', label: '动漫风格' },
    { value: 'chinese', label: '国风/古风' },
    { value: 'fantasy', label: '奇幻风格' },
    { value: 'cyberpunk', label: '赛博朋克' },
    { value: 'gothic', label: '哥特风格' },
    { value: 'modern', label: '现代风格' },
    { value: 'ghibli', label: '吉卜力风格' }
  ];

  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="text-purple-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">生成选项</h3>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
        >
          {showAdvanced ? '收起高级选项' : '展开高级选项'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 性别选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            角色性别
          </label>
          <div className="flex gap-2">
            {genderOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onChange({ ...config, gender: option.value as any })}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  config.gender === option.value
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 风格选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            艺术风格
          </label>
          <select
            value={config.style}
            onChange={(e) => onChange({ ...config, style: e.target.value as any })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            {styleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 自定义许愿 */}
      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Wand2 size={16} className="text-purple-600" />
          自定义许愿（可选）
        </label>
        <input
          type="text"
          value={config.customWish}
          onChange={(e) => onChange({ ...config, customWish: e.target.value })}
          placeholder="例如：希望有猫耳、拿着剑、在樱花树下..."
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          输入你的特殊要求，系统会尽量在生成时考虑
        </p>
      </div>

      {/* 高级选项 */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="useSeed"
                checked={config.useSeed}
                onChange={(e) => onChange({ ...config, useSeed: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="useSeed" className="text-sm font-medium text-gray-700">
                使用固定种子（保持角色一致性）
              </label>
            </div>

            {config.useSeed && (
              <div>
                <input
                  type="text"
                  value={config.seed}
                  onChange={(e) => onChange({ ...config, seed: e.target.value })}
                  placeholder="输入种子值（留空自动生成）"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  使用相同的种子可以生成风格相似的角色
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratorOptions;
