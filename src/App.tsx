import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import GeneratorOptions, { GeneratorConfig } from './components/GeneratorOptions';
import AdvancedOptions, { AdvancedConfig } from './components/AdvancedOptions';
import ConsistencyMode, { ConsistencyConfig } from './components/ConsistencyMode';
import MultiDrawButton from './components/MultiDrawButton';
import CharacterCard from './components/CharacterCard';
import HistoryPanel from './components/HistoryPanel';
import ImagePreview from './components/ImagePreview';
import UpdateNotification from './components/UpdateNotification';
import { promptGenerator, GeneratedPrompt } from './utils/promptGenerator';

function App() {
  const [currentPrompt, setCurrentPrompt] = useState<GeneratedPrompt | null>(null);
  const [multiDrawResults, setMultiDrawResults] = useState<GeneratedPrompt[]>([]);
  const [history, setHistory] = useState<GeneratedPrompt[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [config, setConfig] = useState<GeneratorConfig>({
    gender: 'any',
    style: 'any',
    customWish: '',
    seed: '',
    useSeed: false
  });
  
  const [consistencyConfig, setConsistencyConfig] = useState<ConsistencyConfig>({
    enabled: false,
    mode: 'seed',
    characterReference: '',
    lockFeatures: {
      hair: false,
      eyes: false,
      outfit: false,
      accessories: false
    }
  });
  
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedConfig>({
    colorTheme: 'any',
    ageGroup: 'any',
    bodyType: 'any',
    expression: 'any',
    effects: 'any',
    atmosphere: 'any'
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = useCallback(async (count: number = 1) => {
    setIsGenerating(true);
    setMultiDrawResults([]);
    
    // 添加一些延迟来增加仪式感
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (count === 1) {
      // 单抽
      const newPrompt = promptGenerator.generatePrompt({
        ...config,
        consistency: consistencyConfig,
        advanced: advancedConfig
      });
      setCurrentPrompt(newPrompt);
      setHistory(prev => [...prev, newPrompt]);
    } else {
      // 连抽
      const results: GeneratedPrompt[] = [];
      for (let i = 0; i < count; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const newPrompt = promptGenerator.generatePrompt({
          ...config,
          consistency: consistencyConfig,
          advanced: advancedConfig
        });
        results.push(newPrompt);
      }
      setMultiDrawResults(results);
      setHistory(prev => [...prev, ...results]);
      setCurrentPrompt(results[0]); // 默认显示第一个
    }
    
    setIsGenerating(false);
  }, [config, consistencyConfig, advancedConfig]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(currentPrompt?.id || null);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(currentPrompt?.id || null);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, [currentPrompt]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    promptGenerator.clearHistory();
  }, []);

  const handleExportHistory = useCallback(() => {
    if (history.length === 0) return;
    
    const exportData = {
      exportTime: new Date().toISOString(),
      totalCount: history.length,
      prompts: history.map(prompt => ({
        id: prompt.id,
        prompt: prompt.prompt,
        elements: prompt.elements,
        timestamp: prompt.timestamp,
        readableTime: new Date(prompt.timestamp).toLocaleString('zh-CN')
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oc-character-prompts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [history]);

  return (
    <div className="min-h-screen py-8 px-4">
      <UpdateNotification />
      
      <div className="max-w-4xl mx-auto">
        <Header />
        
        <GeneratorOptions 
          config={config}
          onChange={setConfig}
        />
        
        <AdvancedOptions
          config={advancedConfig}
          onChange={setAdvancedConfig}
          isExpanded={showAdvanced}
          onToggle={() => setShowAdvanced(!showAdvanced)}
        />
        
        <ConsistencyMode
          config={consistencyConfig}
          onChange={setConsistencyConfig}
        />
        
        <MultiDrawButton 
          onDraw={handleGenerate}
          isGenerating={isGenerating}
        />
        
        {multiDrawResults.length > 0 && (
          <div className="glass-card rounded-2xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              连抽结果（{multiDrawResults.length}个）- 点击选择
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {multiDrawResults.map((prompt, index) => (
                <button
                  key={prompt.id}
                  onClick={() => setCurrentPrompt(prompt)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    currentPrompt?.id === prompt.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    #{index + 1}
                  </div>
                  <div className="text-xs line-clamp-2">
                    {prompt.elements['角色类型'] || '角色'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {currentPrompt && (
          <>
            <ImagePreview 
              prompt={currentPrompt.prompt}
              seed={currentPrompt.seed}
            />
            
            <CharacterCard
              prompt={currentPrompt}
              onCopy={handleCopy}
              isCopied={copiedId === currentPrompt.id}
            />
          </>
        )}
        
        <HistoryPanel
          history={history}
          onClearHistory={handleClearHistory}
          onExportHistory={handleExportHistory}
        />
        
        {/* 底部信息 */}
        <footer className="text-center mt-12 text-gray-500 text-sm space-y-2">
          <p>
            💡 提示：生成的提示词可以直接用于 Midjourney、Stable Diffusion 等 AI 图像生成工具
          </p>
          <p>
            🎨 每次生成都会避免重复，为你带来全新的创作灵感
          </p>
          <p>
            🔍 在线预览由 Pollinations AI 免费提供，仅供参考
          </p>
          <p className="text-xs text-gray-400 mt-4">
            v1.3.0 - 高级选项 | 自动更新 | 人物一致性 | 中文提示词 | 连抽功能
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

