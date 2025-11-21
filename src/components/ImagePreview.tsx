import React, { useState } from 'react';
import { Eye, EyeOff, RefreshCw, Download, ExternalLink } from 'lucide-react';

interface ImagePreviewProps {
  prompt: string;
  seed?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ prompt, seed }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  // 使用 Pollinations AI 生成图片
  // 这是一个免费的 AI 图像生成服务
  const getImageUrl = () => {
    // 简化提示词，移除技术参数
    const cleanPrompt = prompt.split('--')[0].trim();
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const seedParam = seed ? `&seed=${seed}` : '';
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true${seedParam}&enhance=true`;
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setImageKey(prev => prev + 1);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(getImageUrl());
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oc-character-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const handleOpenInNew = () => {
    window.open(getImageUrl(), '_blank');
  };

  return (
    <div className="glass-card rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          <Eye size={18} className="text-purple-600" />
          AI 图像预览（实验性功能）
        </h4>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          {showPreview ? (
            <>
              <EyeOff size={16} />
              隐藏预览
            </>
          ) : (
            <>
              <Eye size={16} />
              显示预览
            </>
          )}
        </button>
      </div>

      {showPreview && (
        <div className="space-y-3">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <RefreshCw className="animate-spin text-purple-600" size={32} />
              </div>
            )}
            <img
              key={imageKey}
              src={getImageUrl()}
              alt="AI Generated Preview"
              className="w-full h-full object-cover"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              重新生成
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download size={16} />
              下载
            </button>
            <button
              onClick={handleOpenInNew}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ExternalLink size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            预览图由 Pollinations AI 免费生成，可能与实际效果有差异
          </p>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
