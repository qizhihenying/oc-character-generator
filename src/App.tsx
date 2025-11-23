import { useState, useCallback, useEffect } from 'react';
import { Archive } from 'lucide-react';
import Header from './components/Header';
import GeneratorOptions, { GeneratorConfig } from './components/GeneratorOptions';
import AdvancedOptions, { AdvancedConfig } from './components/AdvancedOptions';
import ConsistencyMode, { ConsistencyConfig } from './components/ConsistencyMode';
import MultiDrawButton from './components/MultiDrawButton';
import CharacterCard from './components/CharacterCard';
import CharacterIPCard from './components/CharacterIPCard';
import HistoryPanel from './components/HistoryPanel';
import ImagePreview from './components/ImagePreview';
import ImageReference from './components/ImageReference';
import UpdateNotification from './components/UpdateNotification';
import MJConfig from './components/MJConfig';
import MJDrawButton from './components/MJDrawButton';
import MJGallery from './components/MJGallery';
import GameStyleCard from './components/GameStyleCard';
import { promptGenerator, GeneratedPrompt } from './utils/promptGenerator';
import { reservedCharactersManager } from './utils/reservedCharactersManager';
import { ImageAnalysisResult } from './utils/imageAnalyzer';
import { mjAPI } from './utils/midjourneyAPI';

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
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [showMJConfig, setShowMJConfig] = useState(false);

  // 初始化 MJ API
  useEffect(() => {
    mjAPI.initialize();
  }, []);

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
        advanced: advancedConfig,
        imageReference: imageAnalysis || undefined
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
          advanced: advancedConfig,
          imageReference: imageAnalysis || undefined
        });
        results.push(newPrompt);
      }
      setMultiDrawResults(results);
      setHistory(prev => [...prev, ...results]);
      setCurrentPrompt(results[0]); // 默认显示第一个
    }
    
    setIsGenerating(false);
  }, [config, consistencyConfig, advancedConfig, imageAnalysis]);

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
        
        <ImageReference
          onAnalysisComplete={(result) => {
            setImageAnalysis(result);
            // 如果分析成功，可以自动应用到高级配置
            if (result.success && result.features) {
              // 自动设置性别
              if (result.features.gender) {
                setConfig(prev => ({
                  ...prev,
                  gender: result.features.gender as 'male' | 'female'
                }));
              }
              // 自动设置色调
              if (result.features.colorTheme) {
                const colorMap: { [key: string]: AdvancedConfig['colorTheme'] } = {
                  '暖色调': 'warm',
                  '冷色调': 'cool',
                  '黑白': 'monochrome',
                  '鲜艳': 'vibrant',
                  '柔和': 'pastel',
                  '深色': 'dark',
                  '明亮': 'light'
                };
                const mappedColor = colorMap[result.features.colorTheme];
                if (mappedColor) {
                  setAdvancedConfig(prev => ({
                    ...prev,
                    colorTheme: mappedColor
                  }));
                }
              }
              // 自动设置氛围
              if (result.features.atmosphere) {
                const atmosphereMap: { [key: string]: AdvancedConfig['atmosphere'] } = {
                  '明亮': 'bright',
                  '黑暗': 'dark',
                  '神秘': 'dark',
                  '浪漫': 'romantic',
                  '史诗': 'epic',
                  '平和': 'peaceful',
                  '动态': 'dynamic',
                  '温馨': 'cozy'
                };
                const mappedAtmosphere = atmosphereMap[result.features.atmosphere];
                if (mappedAtmosphere) {
                  setAdvancedConfig(prev => ({
                    ...prev,
                    atmosphere: mappedAtmosphere
                  }));
                }
              }
            }
          }}
        />
        
        <MultiDrawButton 
          onDraw={handleGenerate}
          isGenerating={isGenerating}
        />
        
        {multiDrawResults.length > 0 && (
          <div className="glass-card dark:bg-gray-800/80 dark:border-gray-700/20 rounded-2xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              连抽结果（{multiDrawResults.length}个）- 点击选择
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {multiDrawResults.map((prompt, index) => {
                const isReserved = prompt.seed ? reservedCharactersManager.isSeedReserved(prompt.seed) : false;
                return (
                  <div
                    key={prompt.id}
                    className={`relative group p-3 rounded-lg transition-all cursor-pointer ${
                      currentPrompt?.id === prompt.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                    }`}
                    onClick={() => setCurrentPrompt(prompt)}
                  >
                    <div className="text-sm font-medium mb-1">
                      #{index + 1}
                    </div>
                    <div className="text-xs line-clamp-2 font-semibold">
                      {prompt.characterIP?.name || prompt.elements['角色类别'] || '角色'}
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      种子: {prompt.seed?.slice(0, 10) || 'N/A'}
                    </div>
                    {/* 入库按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
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
                          // 强制重新渲染
                          setMultiDrawResults([...multiDrawResults]);
                        }
                      }}
                      disabled={isReserved}
                      className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                        isReserved
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600'
                      } text-white text-xs`}
                      title={isReserved ? '已入库' : '入库'}
                    >
                      <Archive size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {currentPrompt && (
          <>
            {/* Midjourney 绘图按钮 */}
            <MJDrawButton
              prompt={currentPrompt.prompt}
              onConfigClick={() => setShowMJConfig(true)}
            />

            <ImagePreview 
              prompt={currentPrompt.prompt}
              seed={currentPrompt.seed}
            />
            
            <CharacterCard
              prompt={currentPrompt}
              onCopy={handleCopy}
              isCopied={copiedId === currentPrompt.id}
            />
            
            {/* 游戏风格角色卡片 */}
            {currentPrompt.characterIP && (
              <div className="mt-8">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold gradient-text inline-block">
                    🎮 游戏风格角色卡
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    点击下方按钮下载精美卡片
                  </p>
                </div>
                <GameStyleCard
                  prompt={currentPrompt}
                  characterImage={undefined}
                />
              </div>
            )}
            
            {/* 角色 IP 设定 */}
            {currentPrompt.characterIP && (
              <CharacterIPCard
                characterIP={currentPrompt.characterIP}
                onCopy={handleCopy}
                onAIEnhanced={(enhancedIP) => {
                  // 更新当前角色的 IP 信息
                  const updatedPrompt = {
                    ...currentPrompt,
                    characterIP: enhancedIP
                  };
                  setCurrentPrompt(updatedPrompt);
                  
                  // 同时更新历史记录中的对应项
                  setHistory(history.map(h => 
                    h.id === currentPrompt.id ? updatedPrompt : h
                  ));
                  
                  // 如果在连抽结果中，也更新
                  setMultiDrawResults(multiDrawResults.map(m =>
                    m.id === currentPrompt.id ? updatedPrompt : m
                  ));
                }}
              />
            )}
          </>
        )}
        
        {/* Midjourney 画板 */}
        <div className="mt-8">
          <MJGallery />
        </div>

        <HistoryPanel
          history={history}
          onClearHistory={handleClearHistory}
          onExportHistory={handleExportHistory}
        />
        
        {/* MJ Config Modal */}
        {showMJConfig && (
          <MJConfig onClose={() => setShowMJConfig(false)} />
        )}

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
            v1.4.0 - 高级选项 | 自动更新 | 人物一致性 | 中文提示词 | 连抽功能 | 垫图参考
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

