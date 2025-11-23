import React, { useRef, useState } from 'react';
import { Download, Sparkles, Star, Upload, Shuffle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { GeneratedPrompt } from '../utils/promptGenerator';
import {
  CardTemplate,
  cardTemplates,
  getRecommendedTemplate,
  getRandomTemplate,
  StarField,
  DecorativePattern,
  getInfoCardStyle,
  getBorderGlowColors
} from './GameStyleCardTemplates';

interface GameStyleCardProps {
  prompt: GeneratedPrompt;
  characterImage?: string; // MJ生成的角色图片
}

const GameStyleCard: React.FC<GameStyleCardProps> = ({ prompt, characterImage: initialImage }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | undefined>(initialImage);
  
  // 模板选择
  const [currentTemplate, setCurrentTemplate] = useState<CardTemplate>(() => 
    getRecommendedTemplate(prompt.prompt)
  );
  
  // 尺寸选择
  type CardSize = 'small' | 'medium' | 'large';
  const [cardSize, setCardSize] = useState<CardSize>('medium');
  
  // 尺寸配置
  const sizeConfig = {
    small: { width: 720, height: 960, scale: 1.5, label: '小红书竖版 (3:4)' },
    medium: { width: 1080, height: 1440, scale: 2, label: '小红书高清 (3:4)' },
    large: { width: 800, height: 1200, scale: 2, label: '原始尺寸' }
  };
  
  const currentSize = sizeConfig[cardSize];
  
  const templateConfig = cardTemplates[currentTemplate];
  
  // 根据模板选择文字颜色（浅色背景使用深色文字）
  const textColor = (currentTemplate === 'modern' || currentTemplate === 'cute' || currentTemplate === 'chinese') 
    ? 'text-gray-800' 
    : 'text-white';

  // 提取角色信息
  const characterName = prompt.characterIP?.name || '未命名角色';
  const gender = prompt.characterIP?.gender || 
                 (prompt.elements['角色类别']?.includes('female') ? '女性' : 
                  prompt.elements['角色类别']?.includes('male') ? '男性' : '未知');
  const age = prompt.characterIP?.background?.age || '未知';
  const occupation = prompt.characterIP?.background?.occupation || '未知';
  const personality = typeof prompt.characterIP?.personality === 'object' 
    ? prompt.characterIP.personality.description 
    : (prompt.characterIP?.personality || '未知');
  const hairStyle = prompt.elements['发型发色'] || '未知';
  const eyeColor = prompt.elements['眼睛特征'] || '未知';
  const outfit = prompt.elements['服装主体'] || '未知';
  const background = typeof prompt.characterIP?.background === 'object'
    ? prompt.characterIP.background.story
    : (prompt.characterIP?.background || '神秘的过去');

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件！');
      return;
    }

    // 读取文件并转换为 base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
    };
    reader.readAsDataURL(file);
  };

  // 触发文件选择
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;

    try {
      setIsDownloading(true);

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: currentSize.scale,
        useCORS: true,
        logging: false,
        width: currentSize.width,
        height: currentSize.height,
      });

      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${characterName}_角色卡.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsDownloading(false);
        alert('✓ 角色卡已保存！');
      }, 'image/png');

    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative mb-8">
      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* 模板选择器 */}
      <div className="mb-4">
        <div className="text-center mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            当前风格：<span className="font-bold text-purple-600 dark:text-purple-400">{templateConfig.name}</span> - {templateConfig.description}
          </p>
        </div>
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center mr-2">
            选择模板:
          </div>
          {(Object.keys(cardTemplates) as CardTemplate[]).map((template) => (
            <button
              key={template}
              onClick={() => setCurrentTemplate(template)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 ${
                currentTemplate === template
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {cardTemplates[template].name}
            </button>
          ))}
          <button
            onClick={() => setCurrentTemplate(getRandomTemplate())}
            className="px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-1"
          >
            <Shuffle size={14} />
            随机
          </button>
        </div>
        
        {/* 尺寸选择器 */}
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center mr-2">
            卡片尺寸:
          </div>
          {(Object.keys(sizeConfig) as CardSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setCardSize(size)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 ${
                cardSize === size
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {sizeConfig[size].label}
            </button>
          ))}
        </div>
      </div>

      {/* 按钮组（在卡片外部） */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <Upload size={20} />
          上传角色图片
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 shadow-lg"
        >
          <Download size={20} />
          {isDownloading ? '生成中...' : '下载游戏风格角色卡'}
        </button>
      </div>

      {/* 游戏风格卡片 */}
      <div
        ref={cardRef}
        className="relative mx-auto overflow-hidden rounded-lg"
        style={{
          width: `${currentSize.width}px`,
          height: `${currentSize.height}px`,
          background: templateConfig.background,
        }}
      >
        {/* 背景装饰 - 水墨效果 */}
        {currentTemplate !== 'modern' && currentTemplate !== 'cute' && currentTemplate !== 'chinese' && (
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-64 h-64 bg-black rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-900 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-900 rounded-full blur-3xl"></div>
          </div>
        )}
        
        {/* 可爱萌系背景装饰 */}
        {currentTemplate === 'cute' && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-pink-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full blur-3xl"></div>
            <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-yellow-200 rounded-full blur-2xl"></div>
          </div>
        )}
        
        {/* 现代简约背景装饰 */}
        {currentTemplate === 'modern' && (
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-200 rounded-full blur-3xl"></div>
          </div>
        )}
        
        {/* 中国古风背景装饰 */}
        {currentTemplate === 'chinese' && (
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-300 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-200 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 right-1/3 w-56 h-56 bg-red-200 rounded-full blur-2xl"></div>
          </div>
        )}
        
        {/* 吉卜力风格背景装饰 */}
        {currentTemplate === 'ghibli' && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-300 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-200 rounded-full blur-3xl"></div>
            <div className="absolute top-1/4 right-1/4 w-56 h-56 bg-lime-200 rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-cyan-200 rounded-full blur-2xl"></div>
          </div>
        )}

        {/* 星光效果 */}
        <StarField template={currentTemplate} />

        {/* 装饰花纹 - 左上角 */}
        <DecorativePattern template={currentTemplate} position="top-left" />

        {/* 装饰花纹 - 右下角 */}
        <DecorativePattern template={currentTemplate} position="bottom-right" />

        {/* 主要内容区域 */}
        <div className="relative z-10 h-full flex">
          {/* 左侧 - 角色图片区域 */}
          <div className="w-[350px] h-full flex items-center justify-center p-8">
            <div className="relative">
              {/* 角色图片容器 */}
              <div className="relative w-[300px] h-[900px] flex items-center justify-center">
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt={characterName}
                    className="max-w-full max-h-full object-contain drop-shadow-2xl"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${
                    currentTemplate === 'modern' || currentTemplate === 'cute' || currentTemplate === 'chinese'
                      ? 'from-gray-200/50 to-gray-300/50 border-gray-400/30'
                      : 'from-purple-900/30 to-pink-900/30 border-white/20'
                  } rounded-lg flex items-center justify-center border-2`}>
                    <div className={`text-center ${
                      currentTemplate === 'modern' || currentTemplate === 'cute' || currentTemplate === 'chinese'
                        ? 'text-gray-500'
                        : 'text-white/60'
                    }`}>
                      <Sparkles className="w-24 h-24 mx-auto mb-4" />
                      <p className="text-lg">暂无角色图片</p>
                      <p className="text-sm mt-2">点击下方按钮<br/>上传角色图片</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 装饰光效 */}
              <div className="absolute -top-4 -left-4 w-8 h-8">
                <Star className="w-full h-full text-yellow-300 fill-yellow-300 animate-pulse" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-6 h-6">
                <Star className="w-full h-full text-pink-300 fill-pink-300 animate-pulse" />
              </div>
            </div>
          </div>

          {/* 右侧 - 信息区域 */}
          <div className="flex-1 p-8 flex flex-col justify-center">
            {/* 角色名称 - 艺术字效果 */}
            <div className="mb-8">
              <h1
                className="text-7xl font-bold text-center mb-2"
                style={{
                  ...templateConfig.titleStyle,
                  textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
                  fontFamily: '"Noto Serif SC", serif',
                  letterSpacing: '0.1em',
                }}
              >
                {characterName}
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto"></div>
            </div>

            {/* 信息卡片区域 */}
            <div className="space-y-4">
              {/* 基础信息 */}
              <div className={`${templateConfig.cardBg} backdrop-blur-sm rounded-lg p-4 border border-white/10`}>
                <div className={`${getInfoCardStyle(currentTemplate)} text-xl font-bold mb-2 flex items-center gap-2`}>
                  <Star className="w-5 h-5 fill-yellow-400" />
                  基础信息
                </div>
                <div className={`${textColor} text-lg space-y-1`}>
                  <p>{gender} / {age} / {occupation}</p>
                </div>
              </div>

              {/* 性格特征 */}
              <div className={`${templateConfig.cardBg} backdrop-blur-sm rounded-lg p-4 border border-white/10`}>
                <div className={`${getInfoCardStyle(currentTemplate)} text-xl font-bold mb-2 flex items-center gap-2`}>
                  <Sparkles className="w-5 h-5" />
                  性格特征
                </div>
                <div className={`${textColor} text-lg`}>
                  <p>{personality}</p>
                </div>
              </div>

              {/* 外貌描述 */}
              <div className={`${templateConfig.cardBg} backdrop-blur-sm rounded-lg p-4 border border-white/10`}>
                <div className={`${getInfoCardStyle(currentTemplate)} text-xl font-bold mb-2 flex items-center gap-2`}>
                  <Star className="w-5 h-5 fill-purple-400" />
                  外貌描述
                </div>
                <div className={`${textColor} text-base space-y-2`}>
                  <p>• {hairStyle}</p>
                  <p>• {eyeColor}</p>
                  <p>• {outfit}</p>
                </div>
              </div>

              {/* 背景设定 */}
              <div className={`${templateConfig.cardBg} backdrop-blur-sm rounded-lg p-4 border border-white/10`}>
                <div className={`${getInfoCardStyle(currentTemplate)} text-xl font-bold mb-2 flex items-center gap-2`}>
                  <Sparkles className="w-5 h-5" />
                  背景设定
                </div>
                <div className={`${textColor} text-base leading-relaxed`}>
                  <p>{background}</p>
                </div>
              </div>
            </div>

            {/* 底部留白 */}
            <div className="mt-8"></div>
          </div>
        </div>

        {/* 边框光效 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-white/10 rounded-lg"></div>
          <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-yellow-500/50"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-pink-500/50"></div>
        </div>
      </div>
    </div>
  );
};

export default GameStyleCard;
