import React, { useState, useRef } from 'react';
import { Wand2, Settings, Loader, Image as ImageIcon, X } from 'lucide-react';
import { mjAPI, BotType } from '../utils/midjourneyAPI';

interface MJDrawButtonProps {
  prompt: string;
  onConfigClick: () => void;
  disabled?: boolean;
}

// 将图片文件转换为 base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除 data:image/xxx;base64, 前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const MJDrawButton: React.FC<MJDrawButtonProps> = ({ prompt, onConfigClick, disabled }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [botType, setBotType] = useState<BotType>('MID_JOURNEY');
  const [showOptions, setShowOptions] = useState(false);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isConfigured = mjAPI.isConfigured();

  const handleDraw = async () => {
    if (!isConfigured) {
      onConfigClick();
      return;
    }

    if (!prompt.trim()) {
      alert('请先生成提示词');
      return;
    }

    setIsDrawing(true);
    try {
      // 转换图片为 base64
      const base64Array: string[] = [];
      for (const file of referenceImages) {
        const base64 = await fileToBase64(file);
        base64Array.push(base64);
      }

      console.log('Submitting imagine task...', { botType, prompt, imageCount: base64Array.length });
      
      const task = await mjAPI.submitImagine({
        botType,
        prompt,
        base64Array: base64Array.length > 0 ? base64Array : undefined,
      });
      
      console.log('Task submitted successfully:', task);
      
      // 任务提交成功，显示提示
      alert(`✅ 绘图任务已提交！\n任务ID: ${task.id}\n请在下方画板查看进度`);
      
      // 清空垫图
      setReferenceImages([]);
    } catch (error) {
      console.error('Submit draw failed:', error);
      alert('提交绘图任务失败：' + (error as Error).message);
    } finally {
      setIsDrawing(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('请选择图片文件');
      return;
    }

    // MJ 最多支持 5 张垫图
    if (referenceImages.length + imageFiles.length > 5) {
      alert('最多只能上传 5 张垫图');
      return;
    }

    setReferenceImages([...referenceImages, ...imageFiles]);
  };

  const handleRemoveImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Main Button */}
      <div className="flex gap-2">
        <button
          onClick={handleDraw}
          disabled={disabled || isDrawing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                   bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium
                   hover:shadow-lg hover:scale-105 transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isDrawing ? (
            <>
              <Loader className="animate-spin" size={20} />
              提交中...
            </>
          ) : (
            <>
              <Wand2 size={20} />
              {isConfigured ? 'AI 绘图' : '配置 API'}
            </>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={onConfigClick}
          className="px-4 py-3 rounded-xl border-2 border-purple-500 text-purple-600 dark:text-purple-400
                   hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          title="配置 API"
        >
          <Settings size={20} />
        </button>

        {/* Options Toggle */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600
                   text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700
                   transition-colors"
          title="选项"
        >
          ⚙️
        </button>
      </div>

      {/* Options Panel */}
      {showOptions && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bot 类型
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setBotType('MID_JOURNEY')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  botType === 'MID_JOURNEY'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Midjourney
              </button>
              <button
                onClick={() => setBotType('NIJI_JOURNEY')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  botType === 'NIJI_JOURNEY'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Niji Journey
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {botType === 'MID_JOURNEY'
                ? 'Midjourney 标准模式，适合各种风格'
                : 'Niji Journey 模式，专注于动漫风格'}
            </p>
          </div>

          {/* 垫图上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              垫图参考（可选，最多 5 张）
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600
                       text-gray-600 dark:text-gray-400 hover:border-purple-400 dark:hover:border-purple-500
                       hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <ImageIcon size={18} />
              上传垫图
            </button>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              上传参考图片，MJ 会根据图片风格生成角色
            </p>
          </div>

          {/* 垫图预览 */}
          {referenceImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                已选择 {referenceImages.length} 张图片
              </p>
              <div className="grid grid-cols-3 gap-2">
                {referenceImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`参考图 ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full
                               opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isConfigured && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ 尚未配置 API，点击"配置 API"按钮进行设置
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MJDrawButton;
