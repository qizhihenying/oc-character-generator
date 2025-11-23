import React, { useState } from 'react';
import { User, Heart, Eye, BookOpen, Lightbulb, Copy, Check, Sparkles, Loader } from 'lucide-react';
import { CharacterIP } from '../utils/characterIPGenerator';
import { aiService } from '../utils/aiService';

interface CharacterIPCardProps {
  characterIP: CharacterIP;
  onCopy?: (text: string) => void;
  onAIEnhanced?: (enhanced: CharacterIP) => void;
}

const CharacterIPCard: React.FC<CharacterIPCardProps> = ({ characterIP, onCopy, onAIEnhanced }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    if (onCopy) {
      onCopy(text);
    }
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const CopyButton: React.FC<{ text: string; section: string }> = ({ text, section }) => (
    <button
      onClick={() => handleCopy(text, section)}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded"
      title="复制"
    >
      {copiedSection === section ? (
        <Check size={14} className="text-green-500" />
      ) : (
        <Copy size={14} className="text-purple-500" />
      )}
    </button>
  );

  const handleAIEnhance = async () => {
    if (!aiService.hasAIConfigured()) {
      alert('请先在右上角"AI 助手"中配置 AI API！');
      return;
    }

    setIsEnhancing(true);
    try {
      const enhanced = await aiService.generateDetailedCharacter({
        name: characterIP.name,
        gender: characterIP.gender,
        style: characterIP.style,
        occupation: characterIP.background.occupation,
        appearance: characterIP.appearance.description,
        personality: characterIP.personality.keywords
      });

      // 更新角色 IP
      const updatedIP: CharacterIP = {
        ...characterIP,
        aiEnhanced: enhanced
      };

      if (onAIEnhanced) {
        onAIEnhanced(updatedIP);
      }

      alert('AI 增强完成！');
    } catch (error: any) {
      alert('AI 增强失败：' + (error.message || '未知错误'));
      console.error('AI 增强失败:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="glass-card dark:bg-gray-800/80 dark:border-gray-700/20 rounded-2xl p-6 mb-6">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <User size={24} />
          人设详情
        </h2>
        {/* AI 增强按钮 */}
        {!characterIP.aiEnhanced && (
          <button
            onClick={handleAIEnhance}
            disabled={isEnhancing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isEnhancing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
            } text-white shadow-lg`}
          >
            {isEnhancing ? (
              <>
                <Loader size={16} className="animate-spin" />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>AI 增强</span>
              </>
            )}
          </button>
        )}
        {characterIP.aiEnhanced && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg">
            <Check size={16} />
            <span>已增强</span>
          </div>
        )}
      </div>

      {/* 基本信息 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 mb-4">
        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
          <User size={18} />
          基本信息
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="group">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center justify-between">
              <span>姓名</span>
              <CopyButton text={characterIP.name} section="name" />
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {characterIP.name}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">风格</div>
            <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
              {characterIP.style}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">性别</div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {characterIP.gender}
            </div>
          </div>
        </div>
      </div>

      {/* 性格特征 */}
      <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 mb-4 group">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-pink-700 dark:text-pink-300 flex items-center gap-2">
            <Heart size={18} />
            性格特征
          </h3>
          <CopyButton 
            text={`性格关键词：${characterIP.personality.keywords.join('、')}\n${characterIP.personality.description}`}
            section="personality"
          />
        </div>
        <div className="mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">关键词</div>
          <div className="flex flex-wrap gap-2">
            {characterIP.personality.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {characterIP.personality.description}
        </div>
      </div>

      {/* 外貌描述 */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-4 group">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <Eye size={18} />
            外貌描述
          </h3>
          <CopyButton 
            text={`外貌关键词：${characterIP.appearance.keywords.join('、')}\n${characterIP.appearance.description}`}
            section="appearance"
          />
        </div>
        <div className="mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">关键词</div>
          <div className="flex flex-wrap gap-2">
            {characterIP.appearance.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {characterIP.appearance.description}
        </div>
      </div>

      {/* 背景设定 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4 group">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <BookOpen size={18} />
            背景设定
          </h3>
          <CopyButton 
            text={`职业：${characterIP.background.occupation}\n年龄：${characterIP.background.age}\n${characterIP.background.story}`}
            section="background"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">职业身份</div>
            <div className="text-base font-semibold text-blue-600 dark:text-blue-400">
              {characterIP.background.occupation}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">年龄</div>
            <div className="text-base font-semibold text-blue-600 dark:text-blue-400">
              {characterIP.background.age}
            </div>
          </div>
        </div>
        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {characterIP.background.story}
        </div>
      </div>

      {/* AI 提示词 */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-4 group">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
            AI 提示词
          </h3>
          <CopyButton text={characterIP.prompt} section="prompt" />
        </div>
        <div className="text-gray-700 dark:text-gray-300 text-sm font-mono leading-relaxed bg-white/50 dark:bg-gray-900/30 rounded p-3 max-h-32 overflow-y-auto">
          {characterIP.prompt}
        </div>
      </div>

      {/* 创作建议 */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4 group">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
            <Lightbulb size={18} />
            创作建议
          </h3>
          <CopyButton 
            text={`适合场景：${characterIP.creativeAdvice.suitableScenes.join('、')}\n创作方向：${characterIP.creativeAdvice.creativeDirection}`}
            section="creative"
          />
        </div>
        <div className="mb-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">适合场景</div>
          <div className="flex flex-wrap gap-2">
            {characterIP.creativeAdvice.suitableScenes.map((scene, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
              >
                {scene}
              </span>
            ))}
          </div>
        </div>
        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <span className="font-medium text-green-700 dark:text-green-300">创作方向：</span>
          {characterIP.creativeAdvice.creativeDirection}
        </div>
      </div>

      {/* AI 增强内容 */}
      {characterIP.aiEnhanced && (
        <div className="border-t-2 border-purple-200 dark:border-purple-700 pt-6 mt-6">
          <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2">
            <Sparkles size={24} />
            AI 增强内容
          </h2>

          {/* 详细性格 */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-4 group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-pink-700 dark:text-pink-300 flex items-center gap-2">
                <Heart size={18} />
                详细性格描述
              </h3>
              <CopyButton text={characterIP.aiEnhanced.detailedPersonality} section="ai-personality" />
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {characterIP.aiEnhanced.detailedPersonality}
            </div>
          </div>

          {/* 详细背景 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-4 group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <BookOpen size={18} />
                详细背景故事
              </h3>
              <CopyButton text={characterIP.aiEnhanced.detailedBackground} section="ai-background" />
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {characterIP.aiEnhanced.detailedBackground}
            </div>
          </div>

          {/* 人际关系 */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-4 mb-4 group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                <User size={18} />
                人际关系网络
              </h3>
              <CopyButton text={characterIP.aiEnhanced.relationships} section="ai-relationships" />
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {characterIP.aiEnhanced.relationships}
            </div>
          </div>

          {/* 能力特长 */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 mb-4 group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                <Sparkles size={18} />
                能力与特长
              </h3>
              <CopyButton text={characterIP.aiEnhanced.abilities} section="ai-abilities" />
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {characterIP.aiEnhanced.abilities}
            </div>
          </div>

          {/* 目标动机 */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4 mb-4 group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                <Lightbulb size={18} />
                目标与动机
              </h3>
              <CopyButton text={characterIP.aiEnhanced.goals} section="ai-goals" />
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {characterIP.aiEnhanced.goals}
            </div>
          </div>

          {/* 恐惧弱点 */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-4 mb-4 group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Eye size={18} />
                恐惧与弱点
              </h3>
              <CopyButton text={characterIP.aiEnhanced.fears} section="ai-fears" />
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {characterIP.aiEnhanced.fears}
            </div>
          </div>

          {/* 个人癖好 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Heart size={18} />
                个人癖好与习惯
              </h3>
              <CopyButton text={characterIP.aiEnhanced.quirks} section="ai-quirks" />
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {characterIP.aiEnhanced.quirks}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterIPCard;
