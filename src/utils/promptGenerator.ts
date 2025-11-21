import { characterElements } from '../data/characterElements-chinese';

export interface ConsistencyConfig {
  enabled: boolean;
  mode: 'seed' | 'cref' | 'both';
  characterReference?: string;
  lockFeatures: {
    hair: boolean;
    eyes: boolean;
    outfit: boolean;
    accessories: boolean;
  };
}

export interface AdvancedConfig {
  colorTheme: 'any' | 'warm' | 'cool' | 'monochrome' | 'vibrant' | 'pastel' | 'dark' | 'light';
  ageGroup: 'any' | 'child' | 'teen' | 'young' | 'adult' | 'mature';
  bodyType: 'any' | 'slim' | 'average' | 'curvy' | 'muscular' | 'petite' | 'tall';
  expression: 'any' | 'happy' | 'serious' | 'mysterious' | 'gentle' | 'confident' | 'shy' | 'cool';
  effects: 'any' | 'glowing' | 'sparkles' | 'shadows' | 'ethereal' | 'magical' | 'realistic' | 'dreamy';
  atmosphere: 'any' | 'bright' | 'dark' | 'romantic' | 'epic' | 'peaceful' | 'dynamic' | 'cozy';
}

export interface GeneratorConfig {
  gender?: 'male' | 'female' | 'any';
  style?: 'anime' | 'fantasy' | 'chinese' | 'cyberpunk' | 'gothic' | 'modern' | 'any';
  customWish?: string;
  seed?: string;
  useSeed?: boolean;
  consistency?: ConsistencyConfig;
  advanced?: AdvancedConfig;
}

export interface GeneratedPrompt {
  id: string;
  prompt: string;
  elements: { [category: string]: string };
  timestamp: number;
  technicalParams: string;
  seed?: string;
}

class PromptGenerator {
  private recentPrompts: Set<string> = new Set();
  private maxRecentPrompts = 50; // 记录最近50个提示词以避免重复
  private lockedElements: { [category: string]: string } = {}; // 锁定的特征

  generatePrompt(config?: GeneratorConfig): GeneratedPrompt {
    let attempts = 0;
    let prompt = '';
    let elements: { [category: string]: string } = {};
    
    do {
      elements = this.generateElements(config);
      prompt = this.buildPrompt(elements, config);
      attempts++;
      
      // 如果尝试次数过多，清空最近记录重新开始
      if (attempts > 20) {
        this.recentPrompts.clear();
        break;
      }
    } while (this.recentPrompts.has(prompt));
    
    // 记录新生成的提示词
    this.recentPrompts.add(prompt);
    
    // 限制记录数量
    if (this.recentPrompts.size > this.maxRecentPrompts) {
      const firstPrompt = this.recentPrompts.values().next().value;
      this.recentPrompts.delete(firstPrompt);
    }
    
    // 生成技术参数
    const technicalParams = this.generateTechnicalParams(elements, config);
    
    // 生成或使用种子
    let seed = config?.useSeed && config?.seed ? config.seed : this.generateSeed();
    
    // 如果启用一致性模式的种子模式，自动启用种子
    if (config?.consistency?.enabled && (config.consistency.mode === 'seed' || config.consistency.mode === 'both')) {
      if (!config.useSeed || !config.seed) {
        // 如果没有设置种子，生成一个并保存
        if (!this.lockedElements['_seed']) {
          this.lockedElements['_seed'] = this.generateSeed();
        }
        seed = this.lockedElements['_seed'];
      }
    }
    
    return {
      id: this.generateId(),
      prompt: prompt + technicalParams,
      elements,
      timestamp: Date.now(),
      technicalParams,
      seed: config?.useSeed ? seed : undefined
    };
  }
  
  private generateTechnicalParams(elements: { [category: string]: string }, config?: GeneratorConfig): string {
    let params = '，适配 MidJourney 的 niji 6 模式，风格为表现力风格，画面比例 3:4';
    
    // 添加一致性参数
    if (config?.consistency?.enabled) {
      const consistency = config.consistency;
      
      // 添加参考图参数
      if ((consistency.mode === 'cref' || consistency.mode === 'both') && consistency.characterReference) {
        params += ` --cref ${consistency.characterReference}`;
        // 添加参考权重（100 = 完全一致）
        params += ' --cw 100';
      }
    }
    
    return params;
  }

  private generateElements(config?: GeneratorConfig): { [category: string]: string } {
    const elements: { [category: string]: string } = {};
    
    // 如果启用一致性模式，使用锁定的特征
    if (config?.consistency?.enabled) {
      const locks = config.consistency.lockFeatures;
      if (locks.hair && this.lockedElements['发型发色']) {
        elements['发型发色'] = this.lockedElements['发型发色'];
      }
      if (locks.eyes && this.lockedElements['眼睛特征']) {
        elements['眼睛特征'] = this.lockedElements['眼睛特征'];
      }
      if (locks.outfit && this.lockedElements['服装主体']) {
        elements['服装主体'] = this.lockedElements['服装主体'];
      }
      if (locks.accessories && this.lockedElements['配饰装备']) {
        elements['配饰装备'] = this.lockedElements['配饰装备'];
      }
    }
    
    // 必选核心元素
    const essentialCategories = [
      "角色类型", "发型发色", "眼睛特征", "服装主体", 
      "艺术风格", "背景设定", "构图视角", "技术质量"
    ];
    
    essentialCategories.forEach(category => {
      const categoryData = characterElements.find(el => el.category === category);
      if (categoryData) {
        let items = categoryData.items;
        
        // 根据性别过滤角色类型
        if (category === "角色类型" && config?.gender && config.gender !== 'any') {
          items = items.filter(item => {
            const lower = item.toLowerCase();
            if (config.gender === 'male') {
              return lower.includes('male') && !lower.includes('female');
            } else {
              return lower.includes('female');
            }
          });
          if (items.length === 0) items = categoryData.items; // 回退
        }
        
        // 根据风格过滤艺术风格
        if (category === "艺术风格" && config?.style && config.style !== 'any') {
          const styleMap: { [key: string]: string[] } = {
            'anime': ['anime', 'manga', 'cel shading'],
            'chinese': ['ink wash', 'traditional', 'hanfu'],
            'fantasy': ['fantasy', 'oil painting', 'concept art'],
            'cyberpunk': ['cyberpunk', 'neon', 'digital'],
            'gothic': ['gothic', 'dark'],
            'modern': ['modern', 'minimalist', 'digital painting']
          };
          
          const keywords = styleMap[config.style] || [];
          const filtered = items.filter(item => 
            keywords.some(keyword => item.toLowerCase().includes(keyword))
          );
          if (filtered.length > 0) items = filtered;
        }
        
        const randomIndex = Math.floor(Math.random() * items.length);
        elements[category] = items[randomIndex];
      }
    });
    
    // 可选增强元素（随机选择3-5个）
    const optionalCategories = [
      "配饰装备", "手持物品", "伴随生物", "光影效果", "色彩方案"
    ];
    
    const additionalCount = Math.floor(Math.random() * 3) + 3; // 3-5个额外元素
    const shuffled = [...optionalCategories].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(additionalCount, shuffled.length); i++) {
      const category = shuffled[i];
      const categoryData = characterElements.find(el => el.category === category);
      if (categoryData) {
        const randomIndex = Math.floor(Math.random() * categoryData.items.length);
        elements[category] = categoryData.items[randomIndex];
      }
    }
    
    // 保存锁定的特征
    if (config?.consistency?.enabled) {
      if (elements['发型发色']) this.lockedElements['发型发色'] = elements['发型发色'];
      if (elements['眼睛特征']) this.lockedElements['眼睛特征'] = elements['眼睛特征'];
      if (elements['服装主体']) this.lockedElements['服装主体'] = elements['服装主体'];
      if (elements['配饰装备']) this.lockedElements['配饰装备'] = elements['配饰装备'];
    }
    
    return elements;
  }

  private buildPrompt(elements: { [category: string]: string }, config?: GeneratorConfig): string {
    // 获取性别和风格
    const gender = this.getGenderText(config?.gender || 'any');
    const styleText = this.getStyleText(config?.style || 'any', elements);
    
    // 应用高级选项修饰
    const ageModifier = this.getAgeModifier(config?.advanced?.ageGroup || 'any');
    
    // 开头：（风格）（年龄）（性别）原创角色（OC）人设图
    let prompt = `${styleText}${ageModifier}${gender}原创角色（OC）人设图，`;
    
    // 外貌特征
    const appearance: string[] = [];
    
    // 应用高级选项到外貌
    if (elements["发型发色"]) {
      appearance.push(this.applyAdvancedModifiers(elements["发型发色"], config?.advanced));
    }
    if (elements["眼睛特征"]) {
      appearance.push(this.applyAdvancedModifiers(elements["眼睛特征"], config?.advanced));
    }
    
    // 体型描述
    const bodyTypeDesc = this.getBodyTypeDescription(config?.advanced?.bodyType || 'any');
    if (bodyTypeDesc) appearance.push(bodyTypeDesc);
    
    // 表情描述
    const expressionDesc = this.getExpressionDescription(config?.advanced?.expression || 'any');
    if (expressionDesc) appearance.push(expressionDesc);
    
    // 服装和配饰
    if (elements["服装主体"]) {
      appearance.push(this.applyAdvancedModifiers(elements["服装主体"], config?.advanced));
    }
    if (elements["配饰装备"]) appearance.push(elements["配饰装备"]);
    
    // 手持物品和伴随生物
    if (elements["手持物品"]) appearance.push(elements["手持物品"]);
    if (elements["伴随生物"]) appearance.push(elements["伴随生物"]);
    
    // 添加自定义许愿
    if (config?.customWish && config.customWish.trim()) {
      appearance.push(config.customWish.trim());
    }
    
    prompt += appearance.join('，') + '，';
    
    // 特殊效果
    const effectsDesc = this.getEffectsDescription(config?.advanced?.effects || 'any');
    if (effectsDesc) prompt += effectsDesc + '，';
    
    // 固定后缀
    prompt += '采用水墨晕染风格，具有戏剧化阴影，白色网格背景，多视角呈现（特写、全身、半身），高对比度，';
    
    // 色彩方案（优先使用高级选项）
    const colorTheme = this.getColorThemeDescription(config?.advanced?.colorTheme || 'any');
    if (colorTheme) {
      prompt += colorTheme + '，';
    } else if (elements["色彩方案"]) {
      prompt += elements["色彩方案"] + '，';
    } else {
      prompt += '冷色调配色，';
    }
    
    // 氛围描述
    const atmosphereDesc = this.getAtmosphereDescription(config?.advanced?.atmosphere || 'any');
    if (atmosphereDesc) prompt += atmosphereDesc + '，';
    
    prompt += '8K 画质';
    
    return prompt;
  }
  
  private getGenderText(gender: string): string {
    switch(gender) {
      case 'male': return '男性';
      case 'female': return '女性';
      default: return Math.random() > 0.5 ? '男性' : '女性';
    }
  }
  
  private getStyleText(style: string, elements: { [category: string]: string }): string {
    if (style !== 'any') {
      const styleMap: { [key: string]: string } = {
        'anime': '动漫',
        'chinese': '国风',
        'fantasy': '奇幻',
        'cyberpunk': '赛博朋克',
        'gothic': '哥特',
        'modern': '现代'
      };
      return styleMap[style] || '动漫';
    }
    
    // 从艺术风格元素推断
    const artStyle = elements["艺术风格"] || '';
    if (artStyle.includes('anime') || artStyle.includes('manga')) return '动漫';
    if (artStyle.includes('ink wash') || artStyle.includes('traditional')) return '国风';
    if (artStyle.includes('fantasy')) return '奇幻';
    if (artStyle.includes('cyberpunk')) return '赛博朋克';
    if (artStyle.includes('gothic')) return '哥特';
    return '动漫'; // 默认
  }
  
  private getAgeModifier(ageGroup: string): string {
    const ageMap: { [key: string]: string } = {
      'child': '儿童',
      'teen': '少年',
      'young': '青年',
      'adult': '成年',
      'mature': '成熟'
    };
    return ageGroup !== 'any' ? ageMap[ageGroup] || '' : '';
  }
  
  private getBodyTypeDescription(bodyType: string): string {
    const bodyMap: { [key: string]: string } = {
      'slim': '纤细身材',
      'average': '标准身材',
      'curvy': '曲线身材',
      'muscular': '健壮体格',
      'petite': '娇小身材',
      'tall': '高挑身材'
    };
    return bodyType !== 'any' ? bodyMap[bodyType] || '' : '';
  }
  
  private getExpressionDescription(expression: string): string {
    const expressionMap: { [key: string]: string } = {
      'happy': '开心的表情',
      'serious': '严肃的神情',
      'mysterious': '神秘的微笑',
      'gentle': '温柔的表情',
      'confident': '自信的神态',
      'shy': '害羞的表情',
      'cool': '冷酷的表情'
    };
    return expression !== 'any' ? expressionMap[expression] || '' : '';
  }
  
  private getEffectsDescription(effects: string): string {
    const effectsMap: { [key: string]: string } = {
      'glowing': '散发着柔和的光芒',
      'sparkles': '周围闪烁着星光',
      'shadows': '被戏剧性的阴影包围',
      'ethereal': '带有空灵的气质',
      'magical': '环绕着魔法光效',
      'realistic': '极其写实的质感',
      'dreamy': '梦幻般的效果'
    };
    return effects !== 'any' ? effectsMap[effects] || '' : '';
  }
  
  private getColorThemeDescription(colorTheme: string): string {
    const colorMap: { [key: string]: string } = {
      'warm': '暖色调配色',
      'cool': '冷色调配色',
      'monochrome': '黑白单色调',
      'vibrant': '鲜艳色彩',
      'pastel': '柔和马卡龙色调',
      'dark': '深色系配色',
      'light': '明亮浅色调'
    };
    return colorTheme !== 'any' ? colorMap[colorTheme] || '' : '';
  }
  
  private getAtmosphereDescription(atmosphere: string): string {
    const atmosphereMap: { [key: string]: string } = {
      'bright': '明亮阳光的氛围',
      'dark': '神秘黑暗的氛围',
      'romantic': '浪漫温馨的氛围',
      'epic': '史诗般宏大的氛围',
      'peaceful': '宁静平和的氛围',
      'dynamic': '充满活力的氛围',
      'cozy': '温馨舒适的氛围'
    };
    return atmosphere !== 'any' ? atmosphereMap[atmosphere] || '' : '';
  }
  
  private applyAdvancedModifiers(text: string, advanced?: AdvancedConfig): string {
    if (!advanced) return text;
    
    let modifiedText = text;
    
    // 根据颜色主题调整描述
    if (advanced.colorTheme !== 'any' && text.includes('色')) {
      // 如果原文本包含颜色描述，可以进行一些调整
      // 这里可以根据需要添加更复杂的逻辑
    }
    
    return modifiedText;
  }
  
  private generateSeed(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getRecentPromptsCount(): number {
    return this.recentPrompts.size;
  }

  clearHistory(): void {
    this.recentPrompts.clear();
  }
}

export const promptGenerator = new PromptGenerator();
