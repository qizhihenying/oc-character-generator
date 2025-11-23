// 元素库管理器 - 支持动态元素、稀有度、主题包

import { database } from './database';

export type ElementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ElementCategory {
  id: string;
  category: string;
  items: ElementItem[];
  isCustom: boolean;
  createdAt: number;
}

export interface ElementItem {
  id: string;
  value: string;
  rarity: ElementRarity;
  weight: number; // 权重 0-100
  tags?: string[];
  usageCount?: number;
}

export interface ThemePack {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  author?: string;
  elements: { [category: string]: string[] };
  isBuiltIn: boolean;
  createdAt: number;
}

export interface ElementBlacklist {
  category: string;
  items: string[];
}

class ElementManager {
  private customElements: Map<string, ElementCategory> = new Map();
  private themePacks: Map<string, ThemePack> = new Map();
  private blacklist: Map<string, Set<string>> = new Map();
  private elementWeights: Map<string, number> = new Map();

  async init(): Promise<void> {
    await this.loadCustomElements();
    await this.loadThemePacks();
    await this.loadBlacklist();
    await this.loadWeights();
    await this.initBuiltInThemePacks();
  }

  // ========== 自定义元素管理 ==========

  async addCustomElement(category: string, item: string, rarity: ElementRarity = 'common'): Promise<void> {
    let categoryData = this.customElements.get(category);
    
    if (!categoryData) {
      categoryData = {
        id: this.generateId(),
        category,
        items: [],
        isCustom: true,
        createdAt: Date.now()
      };
      this.customElements.set(category, categoryData);
    }

    const elementItem: ElementItem = {
      id: this.generateId(),
      value: item,
      rarity,
      weight: 100,
      usageCount: 0
    };

    categoryData.items.push(elementItem);

    // 保存到数据库
    await database.add('customElements', {
      id: categoryData.id,
      category: categoryData.category,
      items: categoryData.items.map(i => i.value),
      rarity,
      createdAt: categoryData.createdAt,
      isCustom: true
    });
  }

  async removeCustomElement(category: string, itemId: string): Promise<void> {
    const categoryData = this.customElements.get(category);
    if (!categoryData) return;

    categoryData.items = categoryData.items.filter(item => item.id !== itemId);

    if (categoryData.items.length === 0) {
      this.customElements.delete(category);
      await database.delete('customElements', categoryData.id);
    } else {
      await database.update('customElements', {
        id: categoryData.id,
        category: categoryData.category,
        items: categoryData.items.map(i => i.value),
        createdAt: categoryData.createdAt,
        isCustom: true
      });
    }
  }

  getCustomElements(category?: string): ElementCategory[] {
    if (category) {
      const data = this.customElements.get(category);
      return data ? [data] : [];
    }
    return Array.from(this.customElements.values());
  }

  // ========== 稀有度系统 ==========

  getRarityColor(rarity: ElementRarity): string {
    const colors = {
      common: '#9ca3af',
      rare: '#3b82f6',
      epic: '#a855f7',
      legendary: '#f59e0b'
    };
    return colors[rarity];
  }

  getRarityWeight(rarity: ElementRarity): number {
    const weights = {
      common: 100,
      rare: 50,
      epic: 20,
      legendary: 5
    };
    return weights[rarity];
  }

  // 根据稀有度随机选择元素
  selectByRarity(items: ElementItem[]): ElementItem | null {
    if (items.length === 0) return null;

    const totalWeight = items.reduce((sum, item) => {
      return sum + this.getRarityWeight(item.rarity) * (item.weight / 100);
    }, 0);

    let random = Math.random() * totalWeight;

    for (const item of items) {
      const weight = this.getRarityWeight(item.rarity) * (item.weight / 100);
      random -= weight;
      if (random <= 0) {
        return item;
      }
    }

    return items[items.length - 1];
  }

  // ========== 主题包系统 ==========

  async createThemePack(pack: Omit<ThemePack, 'id' | 'createdAt'>): Promise<string> {
    const id = this.generateId();
    const themePack: ThemePack = {
      ...pack,
      id,
      createdAt: Date.now()
    };

    this.themePacks.set(id, themePack);

    await database.add('themePacks', themePack);

    return id;
  }

  async updateThemePack(id: string, updates: Partial<ThemePack>): Promise<void> {
    const pack = this.themePacks.get(id);
    if (!pack) throw new Error('Theme pack not found');

    const updated = { ...pack, ...updates };
    this.themePacks.set(id, updated);

    await database.update('themePacks', updated);
  }

  async deleteThemePack(id: string): Promise<void> {
    const pack = this.themePacks.get(id);
    if (pack?.isBuiltIn) {
      throw new Error('Cannot delete built-in theme pack');
    }

    this.themePacks.delete(id);
    await database.delete('themePacks', id);
  }

  getThemePack(id: string): ThemePack | undefined {
    return this.themePacks.get(id);
  }

  getAllThemePacks(): ThemePack[] {
    return Array.from(this.themePacks.values());
  }

  // 导出主题包
  async exportThemePack(id: string): Promise<string> {
    const pack = this.themePacks.get(id);
    if (!pack) throw new Error('Theme pack not found');

    return JSON.stringify(pack, null, 2);
  }

  // 导入主题包
  async importThemePack(jsonData: string): Promise<string> {
    const pack = JSON.parse(jsonData);
    
    // 生成新 ID 避免冲突
    const newId = this.generateId();
    pack.id = newId;
    pack.isBuiltIn = false;
    pack.createdAt = Date.now();

    this.themePacks.set(newId, pack);
    await database.add('themePacks', pack);

    return newId;
  }

  // ========== 黑名单系统 ==========

  addToBlacklist(category: string, item: string): void {
    if (!this.blacklist.has(category)) {
      this.blacklist.set(category, new Set());
    }
    this.blacklist.get(category)!.add(item);
    this.saveBlacklist();
  }

  removeFromBlacklist(category: string, item: string): void {
    this.blacklist.get(category)?.delete(item);
    this.saveBlacklist();
  }

  isBlacklisted(category: string, item: string): boolean {
    return this.blacklist.get(category)?.has(item) || false;
  }

  getBlacklist(category?: string): ElementBlacklist[] {
    if (category) {
      const items = this.blacklist.get(category);
      return items ? [{ category, items: Array.from(items) }] : [];
    }

    return Array.from(this.blacklist.entries()).map(([category, items]) => ({
      category,
      items: Array.from(items)
    }));
  }

  clearBlacklist(category?: string): void {
    if (category) {
      this.blacklist.delete(category);
    } else {
      this.blacklist.clear();
    }
    this.saveBlacklist();
  }

  // ========== 权重控制 ==========

  setElementWeight(elementId: string, weight: number): void {
    this.elementWeights.set(elementId, Math.max(0, Math.min(100, weight)));
    this.saveWeights();
  }

  getElementWeight(elementId: string): number {
    return this.elementWeights.get(elementId) || 100;
  }

  resetWeights(): void {
    this.elementWeights.clear();
    this.saveWeights();
  }

  // ========== 数据持久化 ==========

  private async loadCustomElements(): Promise<void> {
    try {
      const elements = await database.getAll('customElements');
      elements.forEach(el => {
        const items: ElementItem[] = el.items.map((item, index) => ({
          id: `${el.id}-${index}`,
          value: item,
          rarity: el.rarity || 'common',
          weight: 100,
          usageCount: 0
        }));

        this.customElements.set(el.category, {
          id: el.id,
          category: el.category,
          items,
          isCustom: el.isCustom,
          createdAt: el.createdAt
        });
      });
    } catch (error) {
      console.error('Failed to load custom elements:', error);
    }
  }

  private async loadThemePacks(): Promise<void> {
    try {
      const packs = await database.getAll('themePacks');
      packs.forEach(pack => {
        this.themePacks.set(pack.id, pack);
      });
    } catch (error) {
      console.error('Failed to load theme packs:', error);
    }
  }

  private async loadBlacklist(): Promise<void> {
    try {
      const data = await database.get('settings', 'element-blacklist');
      if (data?.value) {
        Object.entries(data.value).forEach(([category, items]) => {
          this.blacklist.set(category, new Set(items as string[]));
        });
      }
    } catch (error) {
      console.error('Failed to load blacklist:', error);
    }
  }

  private async saveBlacklist(): Promise<void> {
    const data: { [key: string]: string[] } = {};
    this.blacklist.forEach((items, category) => {
      data[category] = Array.from(items);
    });

    await database.update('settings', {
      key: 'element-blacklist',
      value: data,
      updatedAt: Date.now()
    });
  }

  private async loadWeights(): Promise<void> {
    try {
      const data = await database.get('settings', 'element-weights');
      if (data?.value) {
        Object.entries(data.value).forEach(([id, weight]) => {
          this.elementWeights.set(id, weight as number);
        });
      }
    } catch (error) {
      console.error('Failed to load weights:', error);
    }
  }

  private async saveWeights(): Promise<void> {
    const data: { [key: string]: number } = {};
    this.elementWeights.forEach((weight, id) => {
      data[id] = weight;
    });

    await database.update('settings', {
      key: 'element-weights',
      value: data,
      updatedAt: Date.now()
    });
  }

  // ========== 内置主题包 ==========

  private async initBuiltInThemePacks(): Promise<void> {
    const builtInPacks: Omit<ThemePack, 'id' | 'createdAt'>[] = [
      {
        name: '赛博朋克',
        description: '未来科技与霓虹灯的完美结合',
        isBuiltIn: true,
        elements: {
          '服装主体': [
            'wearing black tactical suit with cyan lights',
            'wearing cyberpunk streetwear with neon strips',
            'wearing futuristic armor with holographic panels'
          ],
          '配饰装备': [
            'cybernetic arm enhancements',
            'holographic interface',
            'neon accessories'
          ],
          '背景设定': [
            'neon-lit city street',
            'futuristic cityscape',
            'cyberpunk alley'
          ]
        }
      },
      {
        name: '古风',
        description: '传统东方美学与古典韵味',
        isBuiltIn: true,
        elements: {
          '服装主体': [
            'wearing elegant blue kimono with floral patterns',
            'wearing traditional hanfu with phoenix embroidery',
            'wearing ancient Chinese robe with gold trim'
          ],
          '配饰装备': [
            'jade hairpin',
            'silk fan',
            'traditional jewelry'
          ],
          '背景设定': [
            'ancient Chinese garden',
            'traditional temple',
            'bamboo forest'
          ]
        }
      },
      {
        name: '魔法',
        description: '神秘魔法与奇幻元素',
        isBuiltIn: true,
        elements: {
          '配饰装备': [
            'magical staff with crystal orb',
            'floating books and scrolls',
            'glowing runes and tattoos'
          ],
          '特殊元素': [
            'magical aura',
            'floating crystals',
            'spell effects'
          ],
          '背景设定': [
            'magical library',
            'enchanted forest',
            'wizard tower'
          ]
        }
      }
    ];

    for (const pack of builtInPacks) {
      const existing = Array.from(this.themePacks.values()).find(
        p => p.name === pack.name && p.isBuiltIn
      );

      if (!existing) {
        await this.createThemePack(pack);
      }
    }
  }

  // ========== 工具方法 ==========

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 记录元素使用
  async recordUsage(category: string, item: string): Promise<void> {
    const categoryData = this.customElements.get(category);
    if (categoryData) {
      const element = categoryData.items.find(i => i.value === item);
      if (element) {
        element.usageCount = (element.usageCount || 0) + 1;
      }
    }

    // 记录到统计
    await database.add('statistics', {
      id: this.generateId(),
      type: 'element-usage',
      data: { category, item },
      timestamp: Date.now()
    });
  }

  // 获取热门元素
  async getPopularElements(category?: string, limit: number = 10): Promise<Array<{ category: string; item: string; count: number }>> {
    const stats = await database.getByIndex('statistics', 'by-type', 'element-usage');
    
    const usageMap = new Map<string, number>();
    stats.forEach(stat => {
      if (!category || stat.data.category === category) {
        const key = `${stat.data.category}:${stat.data.item}`;
        usageMap.set(key, (usageMap.get(key) || 0) + 1);
      }
    });

    return Array.from(usageMap.entries())
      .map(([key, count]) => {
        const [cat, item] = key.split(':');
        return { category: cat, item, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

export const elementManager = new ElementManager();
