// 卡片数据提取工具
// 用于从生成的提示词中提取结构化信息

export interface CharacterCard {
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

/**
 * 从提示词中提取性别
 */
export function extractGender(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('female')) {
    return 'Female';
  }
  if (lowerPrompt.includes('male') && !lowerPrompt.includes('female')) {
    return 'Male';
  }
  return 'Unknown';
}

/**
 * 从提示词中提取发型描述
 */
export function extractHairStyle(prompt: string): string {
  // 匹配类似 "dark purple messy hair with purple streaks" 的模式
  const patterns = [
    /([a-z]+\s+[a-z]+\s+[a-z]+\s+hair[^,]*)/i,
    /([a-z]+\s+[a-z]+\s+hair[^,]*)/i,
    /([a-z]+\s+hair[^,]*)/i
  ];
  
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return 'Unknown hair style';
}

/**
 * 从提示词中提取眼睛描述
 */
export function extractEyeColor(prompt: string): string {
  // 匹配类似 "glowing purple eyes" 的模式
  const patterns = [
    /([a-z]+\s+[a-z]+\s+[a-z]+\s+eyes[^,]*)/i,
    /([a-z]+\s+[a-z]+\s+eyes[^,]*)/i,
    /([a-z]+\s+eyes[^,]*)/i
  ];
  
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return 'Unknown eye color';
}

/**
 * 从提示词中提取服装描述
 */
export function extractOutfit(prompt: string): string {
  // 匹配 "wearing" 后面的内容
  const wearingMatch = prompt.match(/wearing\s+([^,]+)/i);
  if (wearingMatch) {
    return wearingMatch[1].trim();
  }
  
  // 尝试匹配常见服装词汇
  const outfitKeywords = [
    'coat', 'dress', 'suit', 'uniform', 'kimono', 'armor', 
    'robe', 'jacket', 'outfit', 'cloak', 'vest'
  ];
  
  for (const keyword of outfitKeywords) {
    const regex = new RegExp(`([a-z\\s]+${keyword}[^,]*)`, 'i');
    const match = prompt.match(regex);
    if (match) {
      return match[1].trim();
    }
  }
  
  return 'Unknown outfit';
}

/**
 * 从提示词中提取配饰信息
 */
export function extractAccessories(prompt: string): string {
  const accessories: string[] = [];
  const lowerPrompt = prompt.toLowerCase();
  
  // 常见配饰关键词
  const accessoryKeywords = [
    'cross', 'chains', 'wings', 'crown', 'earrings', 'necklace',
    'staff', 'sword', 'katana', 'book', 'scroll', 'goggles',
    'glasses', 'hat', 'ribbon', 'flower', 'rose', 'feather'
  ];
  
  for (const keyword of accessoryKeywords) {
    if (lowerPrompt.includes(keyword)) {
      accessories.push(keyword);
    }
  }
  
  if (accessories.length === 0) {
    return 'None';
  }
  
  return accessories.slice(0, 3).join(', '); // 最多显示3个
}

/**
 * 从提示词中提取艺术风格
 */
export function extractArtStyle(prompt: string): string {
  const styles: string[] = [];
  const lowerPrompt = prompt.toLowerCase();
  
  // 艺术风格关键词
  const styleKeywords = {
    'anime': 'Anime',
    'watercolor': 'Watercolor',
    'oil painting': 'Oil Painting',
    'digital art': 'Digital Art',
    'sketch': 'Sketch',
    'manga': 'Manga',
    'realistic': 'Realistic',
    'fantasy': 'Fantasy',
    'cyberpunk': 'Cyberpunk',
    'gothic': 'Gothic',
    'steampunk': 'Steampunk'
  };
  
  for (const [key, value] of Object.entries(styleKeywords)) {
    if (lowerPrompt.includes(key)) {
      styles.push(value);
    }
  }
  
  if (styles.length === 0) {
    return 'Unknown style';
  }
  
  return styles.slice(0, 2).join(' · '); // 最多显示2个
}

/**
 * 生成随机角色名字
 */
export function generateCharacterName(): string {
  const prefixes = [
    '银月', '星辰', '暗夜', '晨曦', '幻影', '冰霜', '烈焰', '翡翠',
    '紫罗兰', '苍穹', '深渊', '极光', '暮光', '晓风', '寒霜', '炽焰'
  ];
  
  const suffixes = [
    '守护者', '行者', '使者', '骑士', '法师', '游侠', '刺客', '战士',
    '之影', '之光', '之心', '之翼', '之刃', '之歌', '之舞', '之梦'
  ];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix}${suffix}`;
}

/**
 * 计算角色稀有度
 */
export function calculateRarity(prompt: string): 'N' | 'R' | 'SR' | 'SSR' | 'UR' {
  let score = 0;
  const lowerPrompt = prompt.toLowerCase();
  
  // 特殊元素加分
  const specialElements = {
    'mechanical wings': 20,
    'heterochromia': 15,
    'holographic': 12,
    'cybernetic': 10,
    'glowing': 8,
    'magical': 8,
    'dragon': 15,
    'phoenix': 15,
    'galaxy': 12,
    'crystal': 8,
    'floating': 8,
    'ethereal': 10
  };
  
  for (const [element, points] of Object.entries(specialElements)) {
    if (lowerPrompt.includes(element)) {
      score += points;
    }
  }
  
  // 根据分数判定稀有度
  if (score >= 40) return 'UR';  // Ultra Rare
  if (score >= 25) return 'SSR'; // Super Super Rare
  if (score >= 15) return 'SR';  // Super Rare
  if (score >= 8) return 'R';    // Rare
  return 'N';                     // Normal
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 从提示词和配置创建完整的卡片数据
 */
export function createCharacterCard(
  prompt: string,
  config: {
    gender?: string;
    age?: string;
    bodyType?: string;
    colorTone?: string;
    atmosphere?: string;
  } = {},
  imageUrl?: string
): CharacterCard {
  return {
    id: generateId(),
    name: generateCharacterName(),
    rarity: calculateRarity(prompt),
    gender: config.gender || extractGender(prompt),
    age: config.age || 'Unknown',
    bodyType: config.bodyType || 'Unknown',
    hairStyle: extractHairStyle(prompt),
    eyeColor: extractEyeColor(prompt),
    outfit: extractOutfit(prompt),
    accessories: extractAccessories(prompt),
    artStyle: extractArtStyle(prompt),
    atmosphere: config.atmosphere || 'Unknown',
    colorTone: config.colorTone || 'Unknown',
    fullPrompt: prompt,
    imageUrl: imageUrl,
    createdAt: Date.now(),
    isFavorite: false
  };
}

/**
 * 从本地存储加载卡片收藏
 */
export function loadCardCollection(): CharacterCard[] {
  try {
    const stored = localStorage.getItem('character_card_collection');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('加载卡片收藏失败:', error);
  }
  return [];
}

/**
 * 保存卡片到收藏
 */
export function saveCardToCollection(card: CharacterCard): void {
  try {
    const collection = loadCardCollection();
    collection.unshift(card); // 添加到开头
    
    // 限制最多保存100张卡片
    if (collection.length > 100) {
      collection.pop();
    }
    
    localStorage.setItem('character_card_collection', JSON.stringify(collection));
  } catch (error) {
    console.error('保存卡片失败:', error);
  }
}

/**
 * 切换卡片收藏状态
 */
export function toggleCardFavorite(cardId: string): void {
  try {
    const collection = loadCardCollection();
    const card = collection.find(c => c.id === cardId);
    
    if (card) {
      card.isFavorite = !card.isFavorite;
      localStorage.setItem('character_card_collection', JSON.stringify(collection));
    }
  } catch (error) {
    console.error('切换收藏状态失败:', error);
  }
}

/**
 * 删除卡片
 */
export function deleteCard(cardId: string): void {
  try {
    const collection = loadCardCollection();
    const filtered = collection.filter(c => c.id !== cardId);
    localStorage.setItem('character_card_collection', JSON.stringify(filtered));
  } catch (error) {
    console.error('删除卡片失败:', error);
  }
}
