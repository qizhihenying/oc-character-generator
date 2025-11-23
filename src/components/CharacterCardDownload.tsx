import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Star, Heart, Sparkles } from 'lucide-react';

interface CharacterCard {
  id: string;
  name: string;
  rarity: 'N' | 'R' | 'SR' | 'SSR' | 'UR';
  gender: string;
  age: string;
  bodyType: string;
  hairStyle: string;
  eyeColor: string;
  outfit: string;
  accessories: string;
  artStyle: string;
  atmosphere: string;
  colorTone: string;
  fullPrompt: string;
  imageUrl?: string;
  createdAt: number;
  isFavorite: boolean;
}

interface Props {
  character: CharacterCard;
  onCopy?: () => void;
  onFavorite?: () => void;
  onDraw?: () => void;
}

const CharacterCardDownload: React.FC<Props> = ({
  character,
  onCopy,
  onFavorite,
  onDraw
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // 稀有度颜色映射
  const rarityColors = {
    'N': 'from-gray-400 to-gray-600',
    'R': 'from-blue-400 to-blue-600',
    'SR': 'from-purple-400 to-purple-600',
    'SSR': 'from-yellow-400 to-yellow-600',
    'UR': 'from-pink-400 via-purple-500 to-cyan-500'
  };

  const rarityStars = {
    'N': 1, 'R': 2, 'SR': 3, 'SSR': 4, 'UR': 5
  };

  // 下载卡片为图片
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;

    try {
      // 显示加载状态
      const loadingToast = document.createElement('div');
      loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      loadingToast.textContent = '正在生成卡片图片...';
      document.body.appendChild(loadingToast);

      // 使用 html2canvas 将卡片转换为 canvas
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // 提高清晰度
        useCORS: true, // 允许跨域图片
        logging: false,
        imageTimeout: 0,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      });

      // 将 canvas 转换为 blob
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;

        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = `${character.name || 'character'}_${character.rarity}_${Date.now()}.png`;
        
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 移除加载提示
        document.body.removeChild(loadingToast);

        // 显示成功提示
        const successToast = document.createElement('div');
        successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        successToast.textContent = '✓ 卡片已保存';
        document.body.appendChild(successToast);
        setTimeout(() => {
          document.body.removeChild(successToast);
        }, 2000);
      }, 'image/png');

    } catch (error) {
      console.error('下载卡片失败:', error);
      alert('下载卡片失败，请重试');
    }
  };

  return (
    <div className="relative">
      {/* 可下载的卡片区域 */}
      <div
        ref={cardRef}
        className="w-80 h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800"
      >
        {/* 背景渐变 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[character.rarity]} opacity-20`} />
        
        {/* 稀有度标识 */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/50 px-3 py-1 rounded-full z-10">
          {[...Array(rarityStars[character.rarity])].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-white text-sm font-bold ml-1">{character.rarity}</span>
        </div>

        {/* 主内容区 */}
        <div className="relative h-full p-6 flex flex-col">
          
          {/* 图片区域 */}
          <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
            {character.imageUrl ? (
              <img 
                src={character.imageUrl} 
                alt={character.name} 
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="text-center">
                <Sparkles className="w-16 h-16 mx-auto text-purple-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">等待AI绘图</p>
              </div>
            )}
          </div>

          {/* 角色名称 */}
          <h3 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {character.name}
          </h3>

          {/* 基础属性 */}
          <div className="flex justify-center gap-2 mb-4 text-sm">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
              {character.gender}
            </span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
              {character.age}
            </span>
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
              {character.colorTone}
            </span>
          </div>

          {/* 特征列表 */}
          <div className="flex-1 space-y-2 text-sm overflow-y-auto">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-purple-600 dark:text-purple-400 min-w-[60px]">发型:</span>
              <span className="text-gray-700 dark:text-gray-300 flex-1">{character.hairStyle}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[60px]">眼睛:</span>
              <span className="text-gray-700 dark:text-gray-300 flex-1">{character.eyeColor}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-pink-600 dark:text-pink-400 min-w-[60px]">服装:</span>
              <span className="text-gray-700 dark:text-gray-300 flex-1">{character.outfit}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-yellow-600 dark:text-yellow-400 min-w-[60px]">配饰:</span>
              <span className="text-gray-700 dark:text-gray-300 flex-1">{character.accessories}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 min-w-[60px]">风格:</span>
              <span className="text-gray-700 dark:text-gray-300 flex-1">{character.artStyle}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-rose-600 dark:text-rose-400 min-w-[60px]">氛围:</span>
              <span className="text-gray-700 dark:text-gray-300 flex-1">{character.atmosphere}</span>
            </div>
          </div>

          {/* 水印/签名 */}
          <div className="mt-4 text-center text-xs text-gray-400">
            OC人设盲盒 · {new Date(character.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* 操作按钮（在卡片外部，不会被下载） */}
      <div className="flex gap-2 mt-4">
        {onCopy && (
          <button
            onClick={onCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            <span className="text-sm">复制提示词</span>
          </button>
        )}
        
        {onFavorite && (
          <button
            onClick={onFavorite}
            className={`px-4 py-2 rounded-lg transition ${
              character.isFavorite 
                ? 'bg-pink-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="收藏"
          >
            <Heart className={`w-4 h-4 ${character.isFavorite ? 'fill-white' : ''}`} />
          </button>
        )}

        <button
          onClick={handleDownloadCard}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
          title="下载卡片"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">下载卡片</span>
        </button>

        {onDraw && (
          <button
            onClick={onDraw}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">AI绘图</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CharacterCardDownload;
