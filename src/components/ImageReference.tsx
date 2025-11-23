import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Sparkles, Settings, Eye, EyeOff } from 'lucide-react';
import { imageAnalyzer, ImageAnalysisResult, AIVisionConfig } from '../utils/imageAnalyzer';

interface ImageReferenceProps {
  onAnalysisComplete?: (result: ImageAnalysisResult) => void;
}

const ImageReference: React.FC<ImageReferenceProps> = ({ onAnalysisComplete }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [config, setConfig] = useState<AIVisionConfig>(() => {
    const saved = imageAnalyzer.getConfig();
    return saved || {
      provider: 'openai',
      apiKey: '',
      baseURL: 'https://api.openai.com/v1',
      model: 'gpt-4-vision-preview'
    };
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件！');
      return;
    }

    setImageFile(file);
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // 清除之前的分析结果
    setAnalysisResult(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    if (!imageAnalyzer.isConfigured()) {
      alert('请先配置 AI 视觉 API！');
      setShowConfig(true);
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await imageAnalyzer.analyzeImage(imageFile);
      setAnalysisResult(result);
      
      if (result.success && onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      
      if (result.error) {
        alert(`分析失败: ${result.error}`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('分析过程出错，请检查配置和网络连接');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveConfig = () => {
    if (!config.apiKey) {
      alert('请输入 API Key！');
      return;
    }
    imageAnalyzer.setConfig(config);
    setShowConfig(false);
    alert('配置已保存！');
  };

  return (
    <div className="glass-card dark:bg-gray-800/80 dark:border-gray-700/20 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="text-purple-500" size={24} />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            垫图参考
          </h2>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="配置 AI API"
        >
          <Settings size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* API 配置面板 */}
      {showConfig && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            AI 视觉 API 配置
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              服务商
            </label>
            <select
              value={config.provider}
              onChange={(e) => {
                const provider = e.target.value as AIVisionConfig['provider'];
                const defaults: Record<string, { baseURL: string; model: string }> = {
                  openai: { baseURL: 'https://api.openai.com/v1', model: 'gpt-4o' },
                  gemini: { baseURL: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-1.5-flash' },
                  custom: { baseURL: '', model: '' }
                };
                setConfig({
                  ...config,
                  provider,
                  baseURL: defaults[provider]?.baseURL || '',
                  model: defaults[provider]?.model || ''
                });
              }}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-gray-200"
            >
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="gemini">Google Gemini ⭐ 推荐</option>
              <option value="custom">自定义</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-gray-200"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Base URL
            </label>
            <input
              type="text"
              value={config.baseURL}
              onChange={(e) => setConfig({ ...config, baseURL: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              模型
            </label>
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              placeholder="gpt-4-vision-preview"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:text-gray-200"
            />
          </div>

          {/* 提示信息 */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            {config.provider === 'openai' && (
              <>
                <p>💡 OpenAI API Key 获取：<a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">platform.openai.com</a></p>
                <p>推荐模型：gpt-4o, gpt-4-turbo, gpt-4-vision-preview</p>
                <p>💰 效果最好，但价格较高</p>
              </>
            )}
            {config.provider === 'gemini' && (
              <>
                <p>💡 Gemini API Key 获取：<a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">Google AI Studio</a></p>
                <p>推荐模型：gemini-1.5-flash, gemini-1.5-pro, gemini-pro-vision</p>
                <p>⚠️ 需要使用 v1beta API 版本</p>
                <p>✨ 免费额度大，速度快，性价比高！</p>
              </>
            )}
            {config.provider === 'custom' && (
              <p>💡 自定义服务需要兼容 OpenAI Vision API 格式</p>
            )}
          </div>

          <button
            onClick={handleSaveConfig}
            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            保存配置
          </button>
        </div>
      )}

      {/* 上传区域 */}
      {!imagePreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
          }`}
        >
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            点击上传或拖拽图片到此处
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            支持 JPG、PNG、GIF 等格式
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* 图片预览 */}
          <div className="relative">
            <img
              src={imagePreview}
              alt="参考图片"
              className="w-full max-h-96 object-contain rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <button
              onClick={handleClearImage}
              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
              title="删除图片"
            >
              <X size={20} />
            </button>
          </div>

          {/* 分析按钮 */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            {isAnalyzing ? '分析中...' : 'AI 分析图片'}
          </button>

          {/* 分析结果 */}
          {analysisResult && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" />
                分析结果
              </h3>
              
              {analysisResult.success ? (
                <div className="space-y-2 text-sm">
                  {analysisResult.features.gender && (
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-600 dark:text-gray-400">性别:</span>
                      <span className="text-gray-800 dark:text-gray-200">{analysisResult.features.gender}</span>
                    </div>
                  )}
                  {analysisResult.features.hairStyle && (
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-600 dark:text-gray-400">发型:</span>
                      <span className="text-gray-800 dark:text-gray-200">{analysisResult.features.hairStyle}</span>
                    </div>
                  )}
                  {analysisResult.features.hairColor && (
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-600 dark:text-gray-400">发色:</span>
                      <span className="text-gray-800 dark:text-gray-200">{analysisResult.features.hairColor}</span>
                    </div>
                  )}
                  {analysisResult.features.eyeColor && (
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-600 dark:text-gray-400">眼睛:</span>
                      <span className="text-gray-800 dark:text-gray-200">{analysisResult.features.eyeColor}</span>
                    </div>
                  )}
                  {analysisResult.features.outfit && (
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-600 dark:text-gray-400">服装:</span>
                      <span className="text-gray-800 dark:text-gray-200">{analysisResult.features.outfit}</span>
                    </div>
                  )}
                  {analysisResult.features.style && (
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-600 dark:text-gray-400">风格:</span>
                      <span className="text-gray-800 dark:text-gray-200">{analysisResult.features.style}</span>
                    </div>
                  )}
                  {analysisResult.rawDescription && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <span className="font-medium text-gray-600 dark:text-gray-400 block mb-1">整体描述:</span>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {analysisResult.rawDescription}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-500 text-sm">
                  {analysisResult.error || '分析失败'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        💡 提示：上传参考图片后，AI 会分析图片中的角色特征，并自动应用到生成的提示词中
      </div>
    </div>
  );
};

export default ImageReference;
