import { characterElements } from '../data/characterElements-chinese';
import { styleElements, commonElements } from '../data/characterElements-by-style';
import { generateCharacterIP, CharacterIP } from './characterIPGenerator';
import { ImageAnalysisResult } from './imageAnalyzer';

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
  style?: 'anime' | 'fantasy' | 'chinese' | 'cyberpunk' | 'gothic' | 'modern' | 'ghibli' | 'any';
  customWish?: string;
  seed?: string;
  useSeed?: boolean;
  consistency?: ConsistencyConfig;
  advanced?: AdvancedConfig;
  imageReference?: ImageAnalysisResult; // 图片参考分析结果
}

export interface GeneratedPrompt {
  id: string;
  prompt: string;
  elements: { [category: string]: string };
  timestamp: number;
  technicalParams: string;
  seed?: string;
  characterIP?: CharacterIP;
}

class PromptGenerator {
  private recentPrompts: Set<string> = new Set();
  private maxRecentPrompts = 50; // 记录最近50个提示词以避免重复
  private lockedElements: { [category: string]: string } = {}; // 锁定的特征

  /**
   * 确定角色风格
   */
  private determineStyle(config?: GeneratorConfig): string {
    // 如果用户指定了风格
    if (config?.style && config.style !== 'any') {
      return config.style;
    }
    
    // 如果没有指定，随机选择
    const styles = ['chinese', 'fantasy', 'cyberpunk', 'gothic', 'modern', 'anime', 'ghibli'];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  generatePrompt(config?: GeneratorConfig): GeneratedPrompt {
    let attempts = 0;
    let prompt = '';
    let elements: { [category: string]: string } = {};
    let actualGender: 'male' | 'female' = 'female'; // 记录实际使用的性别
    let characterIP: CharacterIP | undefined;
    
    // 1. 先确定风格和性别
    const style = this.determineStyle(config);
    
    do {
      // 2. 根据风格生成基础元素（服装、配饰、伴随、艺术风格、背景）
      elements = this.generateElementsByStyle(config, style);
      
      // 3. 构建初步提示词并确定性别（只确定一次）
      const result = this.buildPrompt(elements, config, style);
      actualGender = result.actualGender;
      
      // 4. 生成角色 IP 设定（包括职业）
      characterIP = generateCharacterIP(
        result.prompt,
        elements,
        style, // 直接传入英文风格
        actualGender
      );
      
      // 5. 根据职业生成匹配的装备和物品
      const occupationBasedElements = this.generateOccupationBasedElements(
        characterIP.background.occupation,
        style
      );
      
      // 6. 合并职业相关元素
      Object.assign(elements, occupationBasedElements);
      
      // 7. 重新构建完整提示词（使用相同的性别）
      const finalResult = this.buildPrompt(elements, config, style, actualGender);
      prompt = finalResult.prompt;
      
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
      if (firstPrompt) {
        this.recentPrompts.delete(firstPrompt);
      }
    }
    
    // 生成技术参数
    const technicalParams = this.generateTechnicalParams(config);
    
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
      seed: seed,
      characterIP
    };
  }
  
  /**
   * 根据风格生成元素
   */
  private generateElementsByStyle(config: GeneratorConfig | undefined, style: string): { [category: string]: string } {
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
    
    // 从通用元素中选择发型和眼睛
    if (!elements['发型发色']) {
      elements['发型发色'] = commonElements.hairStyles[Math.floor(Math.random() * commonElements.hairStyles.length)];
    }
    if (!elements['眼睛特征']) {
      elements['眼睛特征'] = commonElements.eyeColors[Math.floor(Math.random() * commonElements.eyeColors.length)];
    }
    
    // 从风格库中选择其他元素
    const styleData = styleElements[style] || styleElements.anime;
    
    if (!elements['服装主体']) {
      elements['服装主体'] = styleData.outfits[Math.floor(Math.random() * styleData.outfits.length)];
    }
    if (!elements['配饰装备']) {
      elements['配饰装备'] = styleData.accessories[Math.floor(Math.random() * styleData.accessories.length)];
    }
    
    // 艺术风格
    elements['艺术风格'] = styleData.artStyles[Math.floor(Math.random() * styleData.artStyles.length)];
    
    // 背景设定
    elements['背景设定'] = styleData.backgrounds[Math.floor(Math.random() * styleData.backgrounds.length)];
    
    // 伴随生物（50%概率）
    if (Math.random() > 0.5 && styleData.companions.length > 0) {
      elements['伴随生物'] = styleData.companions[Math.floor(Math.random() * styleData.companions.length)];
    }
    
    // 光影效果（随机选择）
    if (Math.random() > 0.3) {
      elements['光影效果'] = commonElements.lightingEffects[Math.floor(Math.random() * commonElements.lightingEffects.length)];
    }
    
    // 构图视角
    elements['构图视角'] = commonElements.compositions[Math.floor(Math.random() * commonElements.compositions.length)];
    
    // 色彩方案（50%概率）
    if (Math.random() > 0.5) {
      elements['色彩方案'] = commonElements.colorSchemes[Math.floor(Math.random() * commonElements.colorSchemes.length)];
    }
    
    // 技术质量
    elements['技术质量'] = commonElements.quality[Math.floor(Math.random() * commonElements.quality.length)];
    
    // 保存锁定的特征
    if (config?.consistency?.enabled) {
      if (elements['发型发色']) this.lockedElements['发型发色'] = elements['发型发色'];
      if (elements['眼睛特征']) this.lockedElements['眼睛特征'] = elements['眼睛特征'];
      if (elements['服装主体']) this.lockedElements['服装主体'] = elements['服装主体'];
      if (elements['配饰装备']) this.lockedElements['配饰装备'] = elements['配饰装备'];
    }
    
    return elements;
  }

  private generateTechnicalParams(config?: GeneratorConfig): string {
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
        
        // 根据风格过滤服装
        if (category === "服装主体") {
          const outfitMap: { [key: string]: string[] } = {
            'chinese': ['和服', '旗袍', '道袍', '唐装', '汉服', '长袍'],
            'fantasy': ['魔法师', '铠甲', '斗篷', '长袍', '猎人装'],
            'cyberpunk': ['皮革夹克', '紧身衣', '风衣', '西装'],
            'gothic': ['哥特', '洛丽塔', '黑色', '斗篷', '风衣'],
            'modern': ['连衣裙', '西装', '校服', '夹克'],
            'anime': [] // 动漫风格不限制
          };
          
          let styleToUse = config?.style;
          
          // 如果没有指定风格，根据艺术风格推断
          if (!styleToUse || styleToUse === 'any') {
            const artStyle = elements["艺术风格"] || '';
            if (artStyle.includes('ink wash') || artStyle.includes('traditional') || artStyle.includes('水墨')) {
              styleToUse = 'chinese';
            } else if (artStyle.includes('fantasy') || artStyle.includes('oil painting')) {
              styleToUse = 'fantasy';
            } else if (artStyle.includes('cyberpunk') || artStyle.includes('neon')) {
              styleToUse = 'cyberpunk';
            } else if (artStyle.includes('gothic') || artStyle.includes('dark')) {
              styleToUse = 'gothic';
            } else if (artStyle.includes('modern') || artStyle.includes('minimalist')) {
              styleToUse = 'modern';
            }
          }
          
          const keywords = outfitMap[styleToUse as keyof typeof outfitMap] || [];
          if (keywords.length > 0) {
            const filtered = items.filter(item => 
              keywords.some(keyword => item.includes(keyword))
            );
            if (filtered.length > 0) items = filtered;
          }
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

  private buildPrompt(elements: { [category: string]: string }, config?: GeneratorConfig, style?: string, fixedGender?: 'male' | 'female'): { prompt: string; actualGender: 'male' | 'female'; actualStyle: string } {
    // 获取性别和风格
    let actualGender: 'male' | 'female';
    let gender: string;
    
    if (fixedGender) {
      // 如果指定了固定性别，使用固定性别
      actualGender = fixedGender;
      gender = fixedGender === 'male' ? '男性' : '女性';
    } else {
      // 否则根据配置随机
      const genderResult = this.getGenderText(config?.gender || 'any');
      gender = genderResult.text;
      actualGender = genderResult.actualGender;
    }
    const styleText = this.getStyleText(style || config?.style || 'any', elements);
    const actualStyle = styleText; // 保存实际使用的风格文本
    
    // 应用高级选项修饰
    const ageModifier = this.getAgeModifier(config?.advanced?.ageGroup || 'any');
    
    // 开头：（风格）（年龄）（性别）原创角色（OC）人设图
    let prompt = `${styleText}${ageModifier}${gender}原创角色（OC）人设图，`;
    
    // 外貌特征
    const appearance: string[] = [];
    
    // 如果有图片参考分析结果，优先使用
    const imageRef = config?.imageReference;
    if (imageRef?.success && imageRef.features) {
      // 使用图片分析的发型发色
      if (imageRef.features.hairStyle || imageRef.features.hairColor) {
        const hairDesc = [imageRef.features.hairColor, imageRef.features.hairStyle]
          .filter(Boolean)
          .join('');
        if (hairDesc) appearance.push(hairDesc);
      } else if (elements["发型发色"]) {
        appearance.push(this.applyAdvancedModifiers(elements["发型发色"], config?.advanced));
      }
      
      // 使用图片分析的眼睛特征
      if (imageRef.features.eyeColor) {
        appearance.push(`${imageRef.features.eyeColor}眼睛`);
      } else if (elements["眼睛特征"]) {
        appearance.push(this.applyAdvancedModifiers(elements["眼睛特征"], config?.advanced));
      }
    } else {
      // 没有图片参考时使用随机元素
      if (elements["发型发色"]) {
        appearance.push(this.applyAdvancedModifiers(elements["发型发色"], config?.advanced));
      }
      if (elements["眼睛特征"]) {
        appearance.push(this.applyAdvancedModifiers(elements["眼睛特征"], config?.advanced));
      }
    }
    
    // 体型描述
    const bodyTypeDesc = this.getBodyTypeDescription(config?.advanced?.bodyType || 'any');
    if (bodyTypeDesc) appearance.push(bodyTypeDesc);
    
    // 表情描述
    const expressionDesc = this.getExpressionDescription(config?.advanced?.expression || 'any');
    if (expressionDesc) appearance.push(expressionDesc);
    
    // 服装和配饰
    if (imageRef?.success && imageRef.features.outfit) {
      // 使用图片分析的服装
      appearance.push(imageRef.features.outfit);
    } else if (elements["服装主体"]) {
      appearance.push(this.applyAdvancedModifiers(elements["服装主体"], config?.advanced));
    }
    
    // 配饰
    if (imageRef?.success && imageRef.features.accessories && imageRef.features.accessories.length > 0) {
      appearance.push(imageRef.features.accessories.join('、'));
    } else if (elements["配饰装备"]) {
      appearance.push(elements["配饰装备"]);
    }
    
    // 手持物品和伴随生物
    if (elements["手持物品"]) appearance.push(elements["手持物品"]);
    if (elements["伴随生物"]) appearance.push(elements["伴随生物"]);
    
    // 添加图片分析的姿势描述
    if (imageRef?.success && imageRef.features.pose) {
      appearance.push(imageRef.features.pose);
    }
    
    // 添加自定义许愿
    if (config?.customWish && config.customWish.trim()) {
      appearance.push(config.customWish.trim());
    }
    
    prompt += appearance.join('，') + '，';
    
    // 特殊效果
    const effectsDesc = this.getEffectsDescription(config?.advanced?.effects || 'any');
    if (effectsDesc) prompt += effectsDesc + '，';
    
    // 艺术风格（根据实际风格动态生成）
    if (elements["艺术风格"]) {
      const artStyleMap: { [key: string]: string } = {
        'watercolor ink wash': '采用水墨晕染风格',
        'traditional Chinese painting': '采用传统国画风格',
        'ink wash painting style': '采用水墨画风格',
        'Chinese brush painting': '采用中国画笔风格',
        'oriental art style': '采用东方艺术风格',
        'fantasy illustration': '采用奇幻插画风格',
        'epic fantasy art': '采用史诗奇幻艺术风格',
        'magical realism': '采用魔幻现实主义风格',
        'dark fantasy': '采用黑暗奇幻风格',
        'high fantasy': '采用高度奇幻风格',
        'cyberpunk aesthetic': '采用赛博朋克美学',
        'neon noir': '采用霓虹黑色电影风格',
        'tech noir': '采用科技黑色风格',
        'futuristic': '采用未来主义风格',
        'dystopian': '采用反乌托邦风格',
        'gothic art': '采用哥特艺术风格',
        'dark romantic': '采用黑暗浪漫风格',
        'victorian gothic': '采用维多利亚哥特风格',
        'baroque dark': '采用巴洛克黑暗风格',
        'neo-gothic': '采用新哥特风格',
        'modern minimalist': '采用现代简约风格',
        'contemporary art': '采用当代艺术风格',
        'urban style': '采用都市风格',
        'fashion illustration': '采用时尚插画风格',
        'pop art': '采用波普艺术风格',
        'anime style': '采用动漫风格',
        'manga art': '采用漫画艺术风格',
        'cel shading': '采用赛璐珞着色风格',
        'japanese animation': '采用日式动画风格',
        'kawaii aesthetic': '采用可爱美学风格',
        'Studio Ghibli style': '采用吉卜力工作室风格',
        'Hayao Miyazaki art style': '采用宫崎骏艺术风格',
        'hand-drawn animation': '采用手绘动画风格',
        'watercolor painting style': '采用水彩画风格',
        'soft pastel colors': '采用柔和粉彩色调',
        'whimsical illustration': '采用奇幻插画风格',
        'nostalgic anime aesthetic': '采用怀旧动画美学'
      };
      const artStyleChinese = artStyleMap[elements["艺术风格"]] || `采用${elements["艺术风格"]}`;
      prompt += artStyleChinese + '，';
    }
    
    // 通用后缀
    prompt += '具有戏剧化阴影，白色网格背景，多视角呈现（特写、全身、半身），高对比度，';
    
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
    
    return { prompt, actualGender, actualStyle };
  }
  
  private getGenderText(gender: string): { text: string; actualGender: 'male' | 'female' } {
    switch(gender) {
      case 'male': return { text: '男性', actualGender: 'male' };
      case 'female': return { text: '女性', actualGender: 'female' };
      default: {
        const actualGender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';
        return { text: actualGender === 'male' ? '男性' : '女性', actualGender };
      }
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
        'modern': '现代',
        'ghibli': '吉卜力'
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
    if (artStyle.includes('ghibli') || artStyle.includes('Ghibli') || artStyle.includes('Miyazaki')) return '吉卜力';
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
  
  /**
   * 根据职业生成匹配的装备和物品
   */
  private generateOccupationBasedElements(occupation: string, style: string): { [category: string]: string } {
    const elements: { [category: string]: string } = {};
    
    // 职业装备映射表
    const occupationEquipment: { [key: string]: { accessories: string[], items: string[], companions?: string[] } } = {
      // 电竞/游戏相关
      '电竞选手': {
        accessories: ['游戏耳机', '电竞手套', '战队徽章', '电竞护腕', '发光手环'],
        items: ['游戏手柄', '机械键盘', '电竞鼠标', '游戏主机', '奖杯'],
        companions: []
      },
      '游戏主播': {
        accessories: ['直播耳机', '麦克风', '补光灯饰品', '粉丝徽章'],
        items: ['手机支架', '补光灯', '游戏手柄', '平板电脑'],
        companions: []
      },
      
      // 科技/现代相关
      '黑客': {
        accessories: ['数据手套', '智能眼镜', '加密芯片', '黑客徽章'],
        items: ['笔记本电脑', '多屏显示器', '加密U盘', '数据线'],
        companions: []
      },
      '顶级黑客': {
        accessories: ['数据手套', '全息眼镜', '加密芯片', '黑客徽章'],
        items: ['笔记本电脑', '多屏显示器', '加密设备', '数据终端'],
        companions: []
      },
      '程序员': {
        accessories: ['智能手表', '蓝牙耳机', '工牌', '咖啡杯挂件'],
        items: ['笔记本电脑', '机械键盘', '多个显示器', '咖啡杯'],
        companions: []
      },
      '全栈工程师': {
        accessories: ['智能手表', '蓝牙耳机', '工牌', '极客徽章'],
        items: ['笔记本电脑', '机械键盘', '多个显示器', '代码书籍'],
        companions: []
      },
      
      // 武侠/古风相关
      '剑圣': {
        accessories: ['剑穗', '玉佩', '护腕', '腰带'],
        items: ['长剑', '宝剑', '古剑', '名剑'],
        companions: ['白鹤', '仙鹤']
      },
      '剑仙': {
        accessories: ['仙剑剑穗', '仙玉', '法宝', '灵符'],
        items: ['仙剑', '飞剑', '灵剑', '神剑'],
        companions: ['仙鹤', '灵兽']
      },
      '剑客': {
        accessories: ['剑穗', '玉佩', '护腕'],
        items: ['长剑', '佩剑', '宝剑'],
        companions: []
      },
      '刀客': {
        accessories: ['刀穗', '护腕', '腰带'],
        items: ['长刀', '弯刀', '宝刀'],
        companions: []
      },
      '神医': {
        accessories: ['药囊', '银针包', '玉佩'],
        items: ['医书', '药箱', '银针', '药瓶'],
        companions: ['药童', '白鹿']
      },
      '侠客': {
        accessories: ['侠客令', '玉佩', '腰带'],
        items: ['长剑', '酒壶', '行囊'],
        companions: ['骏马']
      },
      
      // 魔法/奇幻相关
      '大魔法师': {
        accessories: ['魔法戒指', '魔法项链', '符文护腕', '魔法徽章'],
        items: ['魔法杖', '法术书', '魔法水晶球', '卷轴'],
        companions: ['魔法猫头鹰', '魔宠', '使魔']
      },
      '魔导师': {
        accessories: ['魔导戒指', '魔法项链', '符文护腕'],
        items: ['魔导杖', '古老魔法书', '魔法水晶', '魔法卷轴'],
        companions: ['魔法生物', '使魔']
      },
      '火焰法师': {
        accessories: ['火焰宝石', '魔法护腕', '火焰徽章'],
        items: ['火焰法杖', '火焰魔法书', '火焰水晶'],
        companions: ['火凤凰', '火元素']
      },
      '冰霜法师': {
        accessories: ['冰晶宝石', '魔法护腕', '冰霜徽章'],
        items: ['冰霜法杖', '冰霜魔法书', '冰晶'],
        companions: ['冰凤凰', '冰元素']
      },
      '圣骑士': {
        accessories: ['圣光徽章', '十字架', '圣光护腕'],
        items: ['圣剑', '圣光盾牌', '圣经'],
        companions: ['圣光战马', '天使']
      },
      '黑暗骑士': {
        accessories: ['暗黑徽章', '黑暗宝石', '暗影护腕'],
        items: ['暗黑之剑', '黑暗盾牌', '暗影之书'],
        companions: ['暗影战马', '暗影生物']
      },
      
      // 赛博朋克相关
      '赛博警探': {
        accessories: ['警徽', '智能眼镜', '通讯耳机', '电子手铐'],
        items: ['电磁枪', '数据平板', '扫描仪', '全息投影仪'],
        companions: []
      },
      '街头武士': {
        accessories: ['义体护甲', '霓虹护腕', '战术腰带'],
        items: ['等离子剑', '电磁枪', '能量盾', '战术刀'],
        companions: []
      },
      '义体战士': {
        accessories: ['义体装甲', '能量核心', '战术护目镜'],
        items: ['能量武器', '等离子刀', '电磁炮'],
        companions: []
      },
      
      // 哥特/暗黑相关
      '吸血鬼伯爵': {
        accessories: ['血族徽章', '暗红宝石', '黑色蕾丝', '银链'],
        items: ['血色酒杯', '古老书籍', '血族权杖', '玫瑰'],
        companions: ['蝙蝠', '黑猫', '乌鸦']
      },
      '血族公爵': {
        accessories: ['血族纹章', '血红宝石', '暗影披风扣'],
        items: ['血族权杖', '古老圣杯', '血族之书'],
        companions: ['蝙蝠群', '黑猫', '血仆']
      },
      '死灵法师': {
        accessories: ['骷髅饰品', '死灵宝石', '暗黑符文'],
        items: ['死灵法杖', '亡灵之书', '灵魂宝石', '骷髅头'],
        companions: ['骷髅', '幽灵', '亡灵']
      },
      
      // 艺术/文化相关
      '画家': {
        accessories: ['画笔挂件', '调色板饰品', '艺术家围巾'],
        items: ['画笔', '调色板', '画布', '颜料'],
        companions: []
      },
      '音乐家': {
        accessories: ['音符饰品', '乐谱胸针', '音乐徽章'],
        items: ['乐器', '乐谱', '指挥棒', '音叉'],
        companions: []
      },
      '作家': {
        accessories: ['钢笔饰品', '书籍徽章', '文学勋章'],
        items: ['笔记本', '钢笔', '书籍', '打字机'],
        companions: ['猫']
      },
      
      // 医疗相关
      '医生': {
        accessories: ['听诊器', '医生徽章', '手表'],
        items: ['医疗箱', '病历本', '医疗器械', '药品'],
        companions: []
      },
      '外科医生': {
        accessories: ['手术手表', '医生徽章', '听诊器'],
        items: ['手术刀', '医疗器械', '病历本', '医疗箱'],
        companions: []
      }
    };
    
    // 查找匹配的职业装备
    let equipment = occupationEquipment[occupation];
    
    // 如果没有精确匹配，尝试模糊匹配
    if (!equipment) {
      for (const [key, value] of Object.entries(occupationEquipment)) {
        if (occupation.includes(key) || key.includes(occupation)) {
          equipment = value;
          break;
        }
      }
    }
    
    // 如果还是没有匹配，使用风格默认装备
    if (!equipment) {
      const styleData = styleElements[style] || styleElements.modern;
      equipment = {
        accessories: styleData.accessories,
        items: styleData.items,
        companions: styleData.companions
      };
    }
    
    // 随机选择装备
    if (equipment.accessories.length > 0) {
      const accessory = equipment.accessories[Math.floor(Math.random() * equipment.accessories.length)];
      elements['配饰装备'] = accessory;
    }
    
    if (equipment.items.length > 0) {
      const item = equipment.items[Math.floor(Math.random() * equipment.items.length)];
      elements['手持物品'] = item;
    }
    
    if (equipment.companions && equipment.companions.length > 0) {
      const companion = equipment.companions[Math.floor(Math.random() * equipment.companions.length)];
      elements['伴随生物'] = companion;
    }
    
    return elements;
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
