import React from 'react';
import { Palette, User, Heart, Smile, Zap, Settings } from 'lucide-react';

export interface AdvancedConfig {
  // 颜色主题
  colorTheme: 'any' | 'warm' | 'cool' | 'monochrome' | 'vibrant' | 'pastel' | 'dark' | 'light';
  
  // 年龄段
  ageGroup: 'any' | 'child' | 'teen' | 'young' | 'adult' | 'mature';
  
  // 体型
  bodyType: 'any' | 'slim' | 'average' | 'curvy' | 'muscular' | 'petite' | 'tall';
  
  // 表情情绪
  expression: 'any' | 'happy' | 'serious' | 'mysterious' | 'gentle' | 'confident' | 'shy' | 'cool';
  
  // 特殊效果
  effects: 'any' | 'glowing' | 'sparkles' | 'shadows' | 'ethereal' | 'magical' | 'realistic' | 'dreamy';
  
  // 场景氛围
  atmosphere: 'any' | 'bright' | 'dark' | 'romantic' | 'epic' | 'peaceful' | 'dynamic' | 'cozy';
}

interface AdvancedOptionsProps {
  config: AdvancedConfig;
  onChange: (config: AdvancedConfig) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ 
  config, 
  onChange, 
  isExpanded, 
  onToggle 
}) => {
  const updateConfig = (key: keyof AdvancedConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  const colorThemes = [
    { value: 'any', label: '随机', desc: '随机颜色' },
    { value: 'warm', label: '暖色调', desc: '红橙黄系' },
    { value: 'cool', label: '冷色调', desc: '蓝绿紫系' },
    { value: 'monochrome', label: '单色调', desc: '黑白灰系' },
    { value: 'vibrant', label: '鲜艳', desc: '高饱和度' },
    { value: 'pastel', label: '柔和', desc: '马卡龙色' },
    { value: 'dark', label: '深色系', desc: '暗色调' },
    { value: 'light', label: '浅色系', desc: '明亮色调' }
  ];

  const ageGroups = [
    { value: 'any', label: '随机', desc: '任意年龄' },
    { value: 'child', label: '儿童', desc: '8-12岁' },
    { value: 'teen', label: '少年', desc: '13-17岁' },
    { value: 'young', label: '青年', desc: '18-25岁' },
    { value: 'adult', label: '成年', desc: '26-40岁' },
    { value: 'mature', label: '成熟', desc: '40岁以上' }
  ];

  const bodyTypes = [
    { value: 'any', label: '随机', desc: '任意体型' },
    { value: 'slim', label: '纤细', desc: '苗条身材' },
    { value: 'average', label: '标准', desc: '普通身材' },
    { value: 'curvy', label: '丰满', desc: '曲线身材' },
    { value: 'muscular', label: '健壮', desc: '肌肉发达' },
    { value: 'petite', label: '娇小', desc: '小巧身材' },
    { value: 'tall', label: '高挑', desc: '高大身材' }
  ];

  const expressions = [
    { value: 'any', label: '随机', desc: '任意表情' },
    { value: 'happy', label: '开心', desc: '快乐笑容' },
    { value: 'serious', label: '严肃', desc: '认真表情' },
    { value: 'mysterious', label: '神秘', desc: '神秘微笑' },
    { value: 'gentle', label: '温柔', desc: '温和表情' },
    { value: 'confident', label: '自信', desc: '自信神态' },
    { value: 'shy', label: '害羞', desc: '羞涩表情' },
    { value: 'cool', label: '冷酷', desc: '冷漠表情' }
  ];

  const effects = [
    { value: 'any', label: '随机', desc: '任意效果' },
    { value: 'glowing', label: '发光', desc: '光芒效果' },
    { value: 'sparkles', label: '闪烁', desc: '星光闪烁' },
    { value: 'shadows', label: '阴影', desc: '戏剧阴影' },
    { value: 'ethereal', label: '空灵', desc: '虚幻效果' },
    { value: 'magical', label: '魔法', desc: '魔法光效' },
    { value: 'realistic', label: '写实', desc: '真实质感' },
    { value: 'dreamy', label: '梦幻', desc: '梦境效果' }
  ];

  const atmospheres = [
    { value: 'any', label: '随机', desc: '任意氛围' },
    { value: 'bright', label: '明亮', desc: '阳光明媚' },
    { value: 'dark', label: '黑暗', desc: '暗黑氛围' },
    { value: 'romantic', label: '浪漫', desc: '浪漫氛围' },
    { value: 'epic', label: '史诗', desc: '宏大场面' },
    { value: 'peaceful', label: '宁静', desc: '平和氛围' },
    { value: 'dynamic', label: '动感', desc: '充满活力' },
    { value: 'cozy', label: '温馨', desc: '舒适温暖' }
  ];

  const OptionGroup = ({ 
    title, 
    icon: Icon, 
    options, 
    value, 
    onChange 
  }: {
    title: string;
    icon: React.ComponentType<any>;
    options: Array<{ value: string; label: string; desc: string }>;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className="text-purple-600" />
        <h4 className="font-medium text-gray-800">{title}</h4>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`p-3 rounded-lg text-sm font-medium transition-all group ${
              value === option.value
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            <div className="font-semibold mb-1">{option.label}</div>
            <div className={`text-xs opacity-80 ${
              value === option.value ? 'text-purple-100' : 'text-gray-500'
            }`}>
              {option.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="text-purple-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">高级选项</h3>
          <span className="text-sm text-gray-500">（更精细的控制）</span>
        </div>
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isExpanded
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isExpanded ? '收起' : '展开'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          <OptionGroup
            title="颜色主题"
            icon={Palette}
            options={colorThemes}
            value={config.colorTheme}
            onChange={(value) => updateConfig('colorTheme', value)}
          />

          <OptionGroup
            title="年龄段"
            icon={User}
            options={ageGroups}
            value={config.ageGroup}
            onChange={(value) => updateConfig('ageGroup', value)}
          />

          <OptionGroup
            title="体型"
            icon={Heart}
            options={bodyTypes}
            value={config.bodyType}
            onChange={(value) => updateConfig('bodyType', value)}
          />

          <OptionGroup
            title="表情情绪"
            icon={Smile}
            options={expressions}
            value={config.expression}
            onChange={(value) => updateConfig('expression', value)}
          />

          <OptionGroup
            title="特殊效果"
            icon={Zap}
            options={effects}
            value={config.effects}
            onChange={(value) => updateConfig('effects', value)}
          />

          <OptionGroup
            title="场景氛围"
            icon={Settings}
            options={atmospheres}
            value={config.atmosphere}
            onChange={(value) => updateConfig('atmosphere', value)}
          />

          {/* 重置按钮 */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => onChange({
                colorTheme: 'any',
                ageGroup: 'any',
                bodyType: 'any',
                expression: 'any',
                effects: 'any',
                atmosphere: 'any'
              })}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              重置所有高级选项
            </button>
          </div>

          {/* 说明 */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-800">
              💡 <strong>使用提示：</strong>高级选项会影响提示词的生成，选择"随机"将使用默认的随机生成逻辑。
              这些选项会与基础选项（性别、风格）和一致性模式结合使用。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOptions;
