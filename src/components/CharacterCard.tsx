import React, { useState } from 'react';
import { Copy, Check, Archive, Sparkles, Languages } from 'lucide-react';
import { GeneratedPrompt } from '../utils/promptGenerator';
import { reservedCharactersManager } from '../utils/reservedCharactersManager';
import { aiService } from '../utils/aiService';

interface CharacterCardProps {
  prompt: GeneratedPrompt;
  onCopy: (text: string) => void;
  isCopied: boolean;
  onReserved?: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ prompt, onCopy, isCopied, onReserved }) => {
  const [isReserved, setIsReserved] = useState(
    prompt.seed ? reservedCharactersManager.isSeedReserved(prompt.seed) : false
  );
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslatingOptimized, setIsTranslatingOptimized] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [translatedPrompt, setTranslatedPrompt] = useState('');
  const [translatedOptimizedPrompt, setTranslatedOptimizedPrompt] = useState('');

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleReserve = () => {
    if (!prompt.seed) {
      alert('此角色没有种子编号，无法入库！');
      return;
    }

    if (isReserved) {
      alert('此角色已经入库！');
      return;
    }

    if (reservedCharactersManager.addReservedCharacter(prompt)) {
      setIsReserved(true);
      alert(`角色"${prompt.characterIP?.name || '未命名'}"已成功入库！`);
      if (onReserved) {
        onReserved();
      }
    } else {
      alert('入库失败！');
    }
  };

  // 提取纯提示词内容（去除优化要点）
  const extractPurePrompt = (text: string): string => {
    // 调试：打印原始文本
    console.log('原始文本:', text);
    
    // 尝试多种格式匹配，按优先级顺序
    
    // 格式1: 【优化后提示词】：...【优化要点】
    let match = text.match(/【优化后提示词】[：:]\s*([\s\S]*?)\s*【优化要点】/);
    if (match && match[1]) {
      console.log('匹配格式1');
      return match[1].trim();
    }
    
    // 格式2: 【优化后提示词】：...（优化要点
    match = text.match(/【优化后提示词】[：:]\s*([\s\S]*?)\s*[（(]\s*优化要点/);
    if (match && match[1]) {
      console.log('匹配格式2');
      return match[1].trim();
    }
    
    // 格式3: 【优化后提示词】：...换行换行（表示段落结束）
    match = text.match(/【优化后提示词】[：:]\s*([\s\S]*?)(?=\n\n[（【(])/);
    if (match && match[1]) {
      console.log('匹配格式3');
      return match[1].trim();
    }
    
    // 格式4: 如果有【优化后提示词】，提取到遇到优化相关关键词为止
    match = text.match(/【优化后提示词】[：:]\s*([\s\S]*?)(?=\s*(?:【优化要点】|（优化要点|优化要点：|\n\n\d+\.|Optimization))/);
    if (match && match[1]) {
      console.log('匹配格式4');
      return match[1].trim();
    }
    
    // 格式5: 尝试匹配到第一个换行后的数字列表（如 "1. "）
    match = text.match(/【优化后提示词】[：:]\s*([\s\S]*?)(?=\n+\s*\d+[.、])/);
    if (match && match[1]) {
      console.log('匹配格式5');
      return match[1].trim();
    }
    
    // 如果没有找到任何标记，返回原文
    console.log('未匹配任何格式，返回原文');
    return text;
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setOptimizedPrompt('');
    setTranslatedOptimizedPrompt(''); // 清空之前的翻译
    try {
      const result = await aiService.optimizePrompt({
        prompt: prompt.prompt,
        language: 'zh',
        enhanceDetails: true
      });
      setOptimizedPrompt(result);
    } catch (error: any) {
      alert(`优化失败：${error.message}\n请先在 AI 助手中配置 API`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    setTranslatedPrompt('');
    try {
      const result = await aiService.translatePrompt({
        text: prompt.prompt,
        from: 'zh',
        to: 'en'
      });
      setTranslatedPrompt(result);
    } catch (error: any) {
      alert(`翻译失败：${error.message}\n请先在 AI 助手中配置 API`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateOptimized = async () => {
    setIsTranslatingOptimized(true);
    setTranslatedOptimizedPrompt('');
    try {
      // 提取纯提示词内容进行翻译
      const purePrompt = extractPurePrompt(optimizedPrompt);
      const result = await aiService.translatePrompt({
        text: purePrompt,
        from: 'zh',
        to: 'en'
      });
      setTranslatedOptimizedPrompt(result);
    } catch (error: any) {
      alert(`翻译失败：${error.message}\n请先在 AI 助手中配置 API`);
    } finally {
      setIsTranslatingOptimized(false);
    }
  };

  return (
    <div className="glass-card dark:bg-gray-800/80 dark:border-gray-700/20 rounded-2xl p-6 mb-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold gradient-text dark:text-purple-400">
          生成时间: {formatTimestamp(prompt.timestamp)}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleReserve}
            disabled={isReserved}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              isReserved
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
            } text-white`}
            title={isReserved ? '已入库' : '加入入库'}
          >
            <Archive size={16} />
            {isReserved ? '已入库' : '入库'}
          </button>
          <button
            onClick={() => onCopy(prompt.prompt)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? '已复制' : '复制提示词'}
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-700 dark:text-gray-300">完整提示词:</h4>
          <div className="flex gap-2">
            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="AI 优化提示词"
            >
              <Sparkles size={14} />
              {isOptimizing ? '优化中...' : '优化'}
            </button>
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="翻译为英文"
            >
              <Languages size={14} />
              {isTranslating ? '翻译中...' : '翻译'}
            </button>
          </div>
        </div>
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed break-words font-mono text-sm">
          {prompt.prompt}
        </p>
      </div>
      
      {optimizedPrompt && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Sparkles size={16} />
              优化后的提示词:
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => onCopy(extractPurePrompt(optimizedPrompt))}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                title="复制纯提示词（不含优化要点）"
              >
                <Copy size={14} />
                复制
              </button>
              <button
                onClick={handleTranslateOptimized}
                disabled={isTranslatingOptimized}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="翻译优化后的提示词"
              >
                <Languages size={14} />
                {isTranslatingOptimized ? '翻译中...' : '翻译'}
              </button>
            </div>
          </div>
          <p className="text-purple-900 dark:text-purple-200 leading-relaxed break-words font-mono text-sm whitespace-pre-wrap">
            {optimizedPrompt}
          </p>
        </div>
      )}
      
      {translatedPrompt && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Languages size={16} />
              翻译后的提示词:
            </h4>
            <button
              onClick={() => onCopy(translatedPrompt)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              <Copy size={14} />
              复制
            </button>
          </div>
          <p className="text-blue-900 dark:text-blue-200 leading-relaxed break-words font-mono text-sm">
            {translatedPrompt}
          </p>
        </div>
      )}
      
      {translatedOptimizedPrompt && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <Languages size={16} />
              优化后提示词的翻译:
            </h4>
            <button
              onClick={() => onCopy(translatedOptimizedPrompt)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
            >
              <Copy size={14} />
              复制
            </button>
          </div>
          <p className="text-green-900 dark:text-green-200 leading-relaxed break-words font-mono text-sm">
            {translatedOptimizedPrompt}
          </p>
        </div>
      )}
      
      {prompt.technicalParams && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mb-4 border border-purple-200 dark:border-purple-700">
          <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-1 text-sm">技术参数:</h4>
          <p className="text-purple-900 dark:text-purple-200 font-mono text-sm">
            {prompt.technicalParams.trim()}
          </p>
        </div>
      )}
      
      {prompt.seed && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1 text-sm">角色种子:</h4>
          <p className="text-blue-900 dark:text-blue-200 font-mono text-sm">
            {prompt.seed}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            使用相同种子可生成风格相似的角色
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(prompt.elements).map(([category, element]) => (
          <div key={category} className="bg-white/50 dark:bg-gray-700/30 rounded-lg p-3">
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
              {category}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm">
              {element}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterCard;
