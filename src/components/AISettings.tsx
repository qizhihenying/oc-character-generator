import React, { useState } from 'react';
import { Settings, Sparkles, Languages, CheckCircle, XCircle, Loader } from 'lucide-react';
import { aiService, AIProvider } from '../utils/aiService';

interface AISettingsProps {
  onOptimize?: (prompt: string) => void;
  onTranslate?: (text: string) => void;
}

const AISettings: React.FC<AISettingsProps> = ({ onOptimize, onTranslate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'optimize' | 'translate'>('config');
  
  // 配置状态
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // 优化状态
  const [optimizePrompt, setOptimizePrompt] = useState('');
  const [optimizeLanguage, setOptimizeLanguage] = useState<'zh' | 'en'>('zh');
  const [optimizeEnhance, setOptimizeEnhance] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState('');

  // 翻译状态
  const [translateText, setTranslateText] = useState('');
  const [translateFrom, setTranslateFrom] = useState<'zh' | 'en'>('zh');
  const [translateTo, setTranslateTo] = useState<'zh' | 'en'>('en');
  const [translating, setTranslating] = useState(false);
  const [translatedResult, setTranslatedResult] = useState('');

  const providerOptions = [
    { value: 'openai', label: 'OpenAI GPT', defaultModel: 'gpt-3.5-turbo' },
    { value: 'deepseek', label: 'DeepSeek', defaultModel: 'deepseek-chat' },
    { value: 'gemini', label: 'Google Gemini', defaultModel: 'gemini-pro' },
    { value: 'claude', label: 'Anthropic Claude', defaultModel: 'claude-3-sonnet-20240229' }
  ];

  const handleSaveConfig = () => {
    aiService.setConfig(provider, {
      provider,
      apiKey,
      model: model || providerOptions.find(p => p.value === provider)?.defaultModel || '',
      baseUrl: baseUrl || undefined
    });
    alert('配置已保存！');
  };

  const handleTestConnection = async () => {
    if (!apiKey) {
      alert('请先输入 API Key');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      aiService.setConfig(provider, {
        provider,
        apiKey,
        model: model || providerOptions.find(p => p.value === provider)?.defaultModel || '',
        baseUrl: baseUrl || undefined
      });

      const success = await aiService.testConnection(provider);
      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleOptimize = async () => {
    if (!optimizePrompt.trim()) {
      alert('请输入要优化的提示词');
      return;
    }

    setOptimizing(true);
    setOptimizedResult('');

    try {
      const result = await aiService.optimizePrompt({
        prompt: optimizePrompt,
        language: optimizeLanguage,
        enhanceDetails: optimizeEnhance
      });
      setOptimizedResult(result);
      if (onOptimize) onOptimize(result);
    } catch (error: any) {
      alert(`优化失败：${error.message}`);
    } finally {
      setOptimizing(false);
    }
  };

  const handleTranslate = async () => {
    if (!translateText.trim()) {
      alert('请输入要翻译的文本');
      return;
    }

    setTranslating(true);
    setTranslatedResult('');

    try {
      const result = await aiService.translatePrompt({
        text: translateText,
        from: translateFrom,
        to: translateTo
      });
      setTranslatedResult(result);
      if (onTranslate) onTranslate(result);
    } catch (error: any) {
      alert(`翻译失败：${error.message}`);
    } finally {
      setTranslating(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
        title="AI 智能助手"
      >
        <Sparkles size={18} />
        <span className="font-medium">AI 助手</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">AI 智能助手</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">提示词优化、翻译和智能推荐</p>
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
            { id: 'config', label: '配置', icon: Settings },
            { id: 'optimize', label: '优化', icon: Sparkles },
            { id: 'translate', label: '翻译', icon: Languages }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
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
          {/* 配置标签页 */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI 提供商
                </label>
                <select
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value as AIProvider);
                    setModel('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {providerOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="请输入 API Key"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  模型（可选）
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={`默认：${providerOptions.find(p => p.value === provider)?.defaultModel}`}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base URL（可选）
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="自定义 API 地址"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {testing ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      测试中...
                    </>
                  ) : (
                    <>
                      {testResult === 'success' && <CheckCircle size={18} />}
                      {testResult === 'error' && <XCircle size={18} />}
                      测试连接
                    </>
                  )}
                </button>

                <button
                  onClick={handleSaveConfig}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  保存配置
                </button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg ${
                  testResult === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {testResult === 'success' ? '✓ 连接成功！' : '✗ 连接失败，请检查配置'}
                </div>
              )}
            </div>
          )}

          {/* 优化标签页 */}
          {activeTab === 'optimize' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  要优化的提示词
                </label>
                <textarea
                  value={optimizePrompt}
                  onChange={(e) => setOptimizePrompt(e.target.value)}
                  placeholder="输入要优化的提示词..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    输出语言
                  </label>
                  <select
                    value={optimizeLanguage}
                    onChange={(e) => setOptimizeLanguage(e.target.value as 'zh' | 'en')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="zh">中文</option>
                    <option value="en">英文</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={optimizeEnhance}
                      onChange={(e) => setOptimizeEnhance(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">增强细节</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleOptimize}
                disabled={optimizing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {optimizing ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    优化中...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    开始优化
                  </>
                )}
              </button>

              {optimizedResult && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    优化结果
                  </label>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{optimizedResult}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 翻译标签页 */}
          {activeTab === 'translate' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  要翻译的文本
                </label>
                <textarea
                  value={translateText}
                  onChange={(e) => setTranslateText(e.target.value)}
                  placeholder="输入要翻译的文本..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    源语言
                  </label>
                  <select
                    value={translateFrom}
                    onChange={(e) => setTranslateFrom(e.target.value as 'zh' | 'en')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="zh">中文</option>
                    <option value="en">英文</option>
                  </select>
                </div>

                <div className="pt-6">
                  <Languages size={24} className="text-gray-400" />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    目标语言
                  </label>
                  <select
                    value={translateTo}
                    onChange={(e) => setTranslateTo(e.target.value as 'zh' | 'en')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="zh">中文</option>
                    <option value="en">英文</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleTranslate}
                disabled={translating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {translating ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    翻译中...
                  </>
                ) : (
                  <>
                    <Languages size={18} />
                    开始翻译
                  </>
                )}
              </button>

              {translatedResult && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    翻译结果
                  </label>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{translatedResult}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISettings;
