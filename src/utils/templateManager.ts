// 模板管理器 - 保存和管理生成配置模板

import { database } from './database';
import { GeneratorConfig } from './promptGenerator';

export interface Template {
  id: string;
  name: string;
  description?: string;
  config: GeneratorConfig;
  thumbnail?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  usageCount: number;
  isFavorite: boolean;
}

class TemplateManager {
  private templates: Map<string, Template> = new Map();

  async init(): Promise<void> {
    await this.loadTemplates();
    await this.initBuiltInTemplates();
  }

  // ========== 模板管理 ==========

  async createTemplate(data: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<string> {
    const id = this.generateId();
    const template: Template = {
      ...data,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageCount: 0
    };

    this.templates.set(id, template);
    await database.add('templates', template);

    return id;
  }

  async updateTemplate(id: string, updates: Partial<Template>): Promise<void> {
    const template = this.templates.get(id);
    if (!template) throw new Error('Template not found');

    const updated = {
      ...template,
      ...updates,
      updatedAt: Date.now()
    };

    this.templates.set(id, updated);
    await database.update('templates', updated);
  }

  async deleteTemplate(id: string): Promise<void> {
    this.templates.delete(id);
    await database.delete('templates', id);
  }

  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): Template[] {
    return Array.from(this.templates.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getFavoriteTemplates(): Template[] {
    return Array.from(this.templates.values())
      .filter(t => t.isFavorite)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getPopularTemplates(limit: number = 10): Template[] {
    return Array.from(this.templates.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // ========== 使用统计 ==========

  async useTemplate(id: string): Promise<void> {
    const template = this.templates.get(id);
    if (!template) throw new Error('Template not found');

    template.usageCount++;
    template.updatedAt = Date.now();

    await database.update('templates', template);
  }

  // ========== 搜索和过滤 ==========

  searchTemplates(query: {
    keyword?: string;
    tags?: string[];
    favorite?: boolean;
  }): Template[] {
    let results = Array.from(this.templates.values());

    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      results = results.filter(t =>
        t.name.toLowerCase().includes(keyword) ||
        t.description?.toLowerCase().includes(keyword)
      );
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(t =>
        query.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (query.favorite !== undefined) {
      results = results.filter(t => t.isFavorite === query.favorite);
    }

    return results.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // ========== 标签管理 ==========

  getAllTags(): string[] {
    const tags = new Set<string>();
    this.templates.forEach(template => {
      template.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  getTemplatesByTag(tag: string): Template[] {
    return Array.from(this.templates.values())
      .filter(t => t.tags.includes(tag))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // ========== 导出/导入 ==========

  async exportTemplate(id: string): Promise<string> {
    const template = this.templates.get(id);
    if (!template) throw new Error('Template not found');

    return JSON.stringify(template, null, 2);
  }

  async importTemplate(jsonData: string): Promise<string> {
    const template = JSON.parse(jsonData);
    
    // 生成新 ID 避免冲突
    const newId = this.generateId();
    template.id = newId;
    template.createdAt = Date.now();
    template.updatedAt = Date.now();
    template.usageCount = 0;

    this.templates.set(newId, template);
    await database.add('templates', template);

    return newId;
  }

  async exportAllTemplates(): Promise<string> {
    const templates = this.getAllTemplates();
    return JSON.stringify(templates, null, 2);
  }

  async importMultipleTemplates(jsonData: string): Promise<string[]> {
    const templates = JSON.parse(jsonData);
    const ids: string[] = [];

    for (const template of templates) {
      const id = await this.importTemplate(JSON.stringify(template));
      ids.push(id);
    }

    return ids;
  }

  // ========== 内置模板 ==========

  private async initBuiltInTemplates(): Promise<void> {
    const builtInTemplates: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
      {
        name: '动漫少女',
        description: '可爱的动漫风格少女角色',
        config: {
          gender: 'female',
          style: 'anime',
          customWish: '',
          seed: '',
          useSeed: false,
          advanced: {
            colorTheme: 'pastel',
            ageGroup: 'teen',
            bodyType: 'petite',
            expression: 'happy',
            effects: 'sparkles',
            atmosphere: 'bright'
          }
        },
        tags: ['动漫', '少女', '可爱'],
        isFavorite: false
      },
      {
        name: '赛博朋克战士',
        description: '未来科技感的战士角色',
        config: {
          gender: 'any',
          style: 'cyberpunk',
          customWish: '',
          seed: '',
          useSeed: false,
          advanced: {
            colorTheme: 'vibrant',
            ageGroup: 'young',
            bodyType: 'muscular',
            expression: 'cool',
            effects: 'glowing',
            atmosphere: 'dark'
          }
        },
        tags: ['赛博朋克', '战士', '科技'],
        isFavorite: false
      },
      {
        name: '古风仙侠',
        description: '传统东方仙侠风格',
        config: {
          gender: 'any',
          style: 'chinese',
          customWish: '',
          seed: '',
          useSeed: false,
          advanced: {
            colorTheme: 'cool',
            ageGroup: 'young',
            bodyType: 'slim',
            expression: 'gentle',
            effects: 'ethereal',
            atmosphere: 'peaceful'
          }
        },
        tags: ['古风', '仙侠', '东方'],
        isFavorite: false
      },
      {
        name: '哥特风格',
        description: '神秘的哥特式角色',
        config: {
          gender: 'any',
          style: 'gothic',
          customWish: '',
          seed: '',
          useSeed: false,
          advanced: {
            colorTheme: 'dark',
            ageGroup: 'young',
            bodyType: 'slim',
            expression: 'mysterious',
            effects: 'shadows',
            atmosphere: 'dark'
          }
        },
        tags: ['哥特', '神秘', '黑暗'],
        isFavorite: false
      },
      {
        name: '奇幻法师',
        description: '魔法奇幻世界的法师',
        config: {
          gender: 'any',
          style: 'fantasy',
          customWish: '',
          seed: '',
          useSeed: false,
          advanced: {
            colorTheme: 'vibrant',
            ageGroup: 'adult',
            bodyType: 'average',
            expression: 'confident',
            effects: 'magical',
            atmosphere: 'epic'
          }
        },
        tags: ['奇幻', '法师', '魔法'],
        isFavorite: false
      }
    ];

    for (const template of builtInTemplates) {
      const existing = Array.from(this.templates.values()).find(
        t => t.name === template.name
      );

      if (!existing) {
        await this.createTemplate(template);
      }
    }
  }

  // ========== 数据持久化 ==========

  private async loadTemplates(): Promise<void> {
    try {
      const templates = await database.getAll('templates');
      templates.forEach(template => {
        // 确保模板数据完整
        const fullTemplate: Template = {
          id: template.id,
          name: template.name,
          description: undefined,
          config: template.config,
          thumbnail: undefined,
          tags: [],
          createdAt: template.createdAt,
          updatedAt: template.createdAt,
          usageCount: template.usageCount,
          isFavorite: false
        };
        this.templates.set(template.id, fullTemplate);
      });
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }

  // ========== 工具方法 ==========

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 从当前配置创建模板
  async createFromConfig(name: string, config: GeneratorConfig, description?: string): Promise<string> {
    return await this.createTemplate({
      name,
      description,
      config,
      tags: [],
      isFavorite: false
    });
  }

  // 复制模板
  async duplicateTemplate(id: string, newName?: string): Promise<string> {
    const template = this.templates.get(id);
    if (!template) throw new Error('Template not found');

    return await this.createTemplate({
      name: newName || `${template.name} (副本)`,
      description: template.description,
      config: { ...template.config },
      tags: [...template.tags],
      isFavorite: false
    });
  }
}

export const templateManager = new TemplateManager();
