/**
 * 游戏风格卡片模板
 * 提供多种不同风格的卡片设计
 */

import React from 'react';
import { Sparkles, Star, Heart, Flame, Zap, Crown, Moon, Sun, Cloud } from 'lucide-react';

export type CardTemplate = 'fantasy' | 'cyberpunk' | 'gothic' | 'cute' | 'chinese' | 'modern' | 'ghibli';

interface TemplateConfig {
  name: string;
  description: string;
  background: string;
  titleStyle: React.CSSProperties;
  cardBg: string;
  accentColor: string;
  icon: React.ReactNode;
}

export const cardTemplates: Record<CardTemplate, TemplateConfig> = {
  // 1. 奇幻风格（默认）
  fantasy: {
    name: '奇幻风格',
    description: '深蓝渐变，星光闪烁',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    titleStyle: {
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    cardBg: 'bg-black/60',
    accentColor: 'yellow',
    icon: <Star className="w-5 h-5" />
  },

  // 2. 赛博朋克风格
  cyberpunk: {
    name: '赛博朋克',
    description: '霓虹紫粉，科技感',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #2a0a4e 100%)',
    titleStyle: {
      background: 'linear-gradient(135deg, #FF00FF 0%, #00FFFF 50%, #FF00FF 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    cardBg: 'bg-purple-900/40',
    accentColor: 'cyan',
    icon: <Zap className="w-5 h-5" />
  },

  // 3. 哥特风格
  gothic: {
    name: '哥特暗黑',
    description: '深红黑色，神秘诡异',
    background: 'linear-gradient(135deg, #1a0000 0%, #2d0a0a 50%, #4a0e0e 100%)',
    titleStyle: {
      background: 'linear-gradient(135deg, #FF0000 0%, #8B0000 50%, #4B0000 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    cardBg: 'bg-red-950/50',
    accentColor: 'red',
    icon: <Moon className="w-5 h-5" />
  },

  // 4. 可爱萌系
  cute: {
    name: '可爱萌系',
    description: '粉色梦幻，温馨甜美',
    background: 'linear-gradient(135deg, #ffe5f0 0%, #ffc0e0 50%, #ff9fd0 100%)',
    titleStyle: {
      background: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 50%, #C71585 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    cardBg: 'bg-pink-200/60',
    accentColor: 'pink',
    icon: <Heart className="w-5 h-5" />
  },

  // 5. 中国古风
  chinese: {
    name: '中国古风',
    description: '水墨丹青，古典雅致',
    background: 'linear-gradient(135deg, #f5f5dc 0%, #e8e8d0 50%, #d8d8c0 100%)',
    titleStyle: {
      background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    cardBg: 'bg-amber-100/70',
    accentColor: 'amber',
    icon: <Crown className="w-5 h-5" />
  },

  // 6. 现代简约
  modern: {
    name: '现代简约',
    description: '清新明亮，简洁大方',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)',
    titleStyle: {
      background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 50%, #2E5C8A 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    cardBg: 'bg-gray-100/90',
    accentColor: 'blue',
    icon: <Sun className="w-5 h-5" />
  },

  // 7. 吉卜力风格
  ghibli: {
    name: '吉卜力',
    description: '温馨治愈，手绘水彩',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)',
    titleStyle: {
      background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 50%, #388E3C 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    cardBg: 'bg-green-100/70',
    accentColor: 'green',
    icon: <Cloud className="w-5 h-5" />
  }
};

/**
 * 根据角色风格自动推荐卡片模板
 */
export function getRecommendedTemplate(prompt: string): CardTemplate {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('cyberpunk') || lowerPrompt.includes('futuristic') || lowerPrompt.includes('neon')) {
    return 'cyberpunk';
  }
  
  if (lowerPrompt.includes('gothic') || lowerPrompt.includes('dark') || lowerPrompt.includes('vampire')) {
    return 'gothic';
  }
  
  if (lowerPrompt.includes('cute') || lowerPrompt.includes('kawaii') || lowerPrompt.includes('chibi')) {
    return 'cute';
  }
  
  if (lowerPrompt.includes('chinese') || lowerPrompt.includes('hanfu') || lowerPrompt.includes('traditional')) {
    return 'chinese';
  }
  
  if (lowerPrompt.includes('modern') || lowerPrompt.includes('contemporary') || lowerPrompt.includes('minimalist')) {
    return 'modern';
  }
  
  if (lowerPrompt.includes('ghibli') || lowerPrompt.includes('miyazaki') || lowerPrompt.includes('totoro') || lowerPrompt.includes('studio ghibli')) {
    return 'ghibli';
  }
  
  // 默认返回奇幻风格
  return 'fantasy';
}

/**
 * 获取随机模板
 */
export function getRandomTemplate(): CardTemplate {
  const templates: CardTemplate[] = ['fantasy', 'cyberpunk', 'gothic', 'cute', 'chinese', 'modern', 'ghibli'];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * 星光效果组件
 */
export const StarField: React.FC<{ template: CardTemplate }> = ({ template }) => {
  // 可爱风格、现代风格和吉卜力风格不显示星光
  if (template === 'cute' || template === 'modern' || template === 'ghibli') {
    return null;
  }

  const starCount = template === 'cyberpunk' ? 30 : 20;
  
  return (
    <>
      {[...Array(starCount)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: Math.random() * 0.8 + 0.2,
          }}
        />
      ))}
    </>
  );
};

/**
 * 装饰花纹组件
 */
export const DecorativePattern: React.FC<{ template: CardTemplate; position: 'top-left' | 'bottom-right' }> = ({ template, position }) => {
  const isTopLeft = position === 'top-left';
  const positionClass = isTopLeft ? 'top-0 left-0' : 'bottom-0 right-0';
  const rotateClass = isTopLeft ? '' : 'rotate-180';

  // 中国古风使用特殊图案
  if (template === 'chinese') {
    return (
      <div className={`absolute ${positionClass} w-48 h-48 opacity-30 ${rotateClass}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#8B4513" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#8B4513" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#8B4513" strokeWidth="0.5" />
          <path d="M 50,10 L 50,90 M 10,50 L 90,50" stroke="#8B4513" strokeWidth="0.5" />
        </svg>
      </div>
    );
  }

  // 现代简约不显示花纹
  if (template === 'modern') {
    return null;
  }

  // 其他风格使用默认花纹
  return (
    <div className={`absolute ${positionClass} w-48 h-48 opacity-40 ${rotateClass}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d="M 10,50 Q 25,25 50,10 Q 75,25 90,50 Q 75,75 50,90 Q 25,75 10,50"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
        />
        <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

/**
 * 信息卡片样式
 */
export const getInfoCardStyle = (template: CardTemplate) => {
  const styles: Record<CardTemplate, string> = {
    fantasy: 'text-yellow-400',
    cyberpunk: 'text-cyan-400',
    gothic: 'text-red-400',
    cute: 'text-pink-600',
    chinese: 'text-amber-700',
    modern: 'text-blue-600',
    ghibli: 'text-green-600'
  };
  return styles[template];
};

/**
 * 获取边框光效颜色
 */
export const getBorderGlowColors = (template: CardTemplate) => {
  const colors: Record<CardTemplate, { top: string; bottom: string }> = {
    fantasy: { top: 'border-yellow-500/50', bottom: 'border-pink-500/50' },
    cyberpunk: { top: 'border-cyan-500/50', bottom: 'border-purple-500/50' },
    gothic: { top: 'border-red-500/50', bottom: 'border-black/50' },
    cute: { top: 'border-pink-400/50', bottom: 'border-rose-400/50' },
    chinese: { top: 'border-amber-600/50', bottom: 'border-amber-800/50' },
    modern: { top: 'border-blue-400/50', bottom: 'border-gray-400/50' },
    ghibli: { top: 'border-green-400/50', bottom: 'border-teal-400/50' }
  };
  return colors[template];
};
