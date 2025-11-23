// 项目管理器 - 管理角色项目和图像库

import { database } from './database';
import { GeneratedPrompt } from './promptGenerator';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
  characterCount?: number;
}

export interface CharacterImage {
  id: string;
  promptId: string;
  projectId?: string;
  imageData: string; // base64 或 URL
  thumbnail?: string;
  tags: string[];
  rating: number; // 1-5
  notes?: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    format?: string;
  };
}

export interface ImageVersion {
  id: string;
  characterId: string;
  imageData: string;
  version: number;
  changes?: string;
  createdAt: number;
}

class ProjectManager {
  private projects: Map<string, Project> = new Map();
  private images: Map<string, CharacterImage> = new Map();
  private versions: Map<string, ImageVersion[]> = new Map();

  async init(): Promise<void> {
    await this.loadProjects();
    await this.loadImages();
  }

  // ========== 项目管理 ==========

  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'characterCount'>): Promise<string> {
    const id = this.generateId();
    const project: Project = {
      ...data,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      characterCount: 0
    };

    this.projects.set(id, project);
    await database.add('projects', project);

    return id;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const project = this.projects.get(id);
    if (!project) throw new Error('Project not found');

    const updated = {
      ...project,
      ...updates,
      updatedAt: Date.now()
    };

    this.projects.set(id, updated);
    await database.update('projects', updated);
  }

  async deleteProject(id: string): Promise<void> {
    // 删除项目关联的所有角色
    const prompts = await database.getByIndex('prompts', 'by-project', id);
    for (const prompt of prompts) {
      await database.delete('prompts', prompt.id);
    }

    this.projects.delete(id);
    await database.delete('projects', id);
  }

  getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getProjectCharacters(projectId: string): Promise<GeneratedPrompt[]> {
    return await database.getByIndex('prompts', 'by-project', projectId) as any;
  }

  async updateProjectCharacterCount(projectId: string): Promise<void> {
    const characters = await this.getProjectCharacters(projectId);
    const project = this.projects.get(projectId);
    
    if (project) {
      project.characterCount = characters.length;
      project.updatedAt = Date.now();
      await database.update('projects', project);
    }
  }

  // ========== 图像管理 ==========

  async saveImage(data: Omit<CharacterImage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const image: CharacterImage = {
      ...data,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.images.set(id, image);

    // 保存到数据库（注意：大图像可能需要特殊处理）
    // 这里简化处理，实际应用中可能需要使用 Blob 存储
    
    // 如果图像太大，考虑只存储 URL 或使用文件系统
    if (image.imageData.length < 1024 * 1024 * 5) { // 5MB 限制
      await this.saveImageToFileSystem(id, image.imageData);
    }

    return id;
  }

  async updateImage(id: string, updates: Partial<CharacterImage>): Promise<void> {
    const image = this.images.get(id);
    if (!image) throw new Error('Image not found');

    const updated = {
      ...image,
      ...updates,
      updatedAt: Date.now()
    };

    this.images.set(id, updated);
  }

  async deleteImage(id: string): Promise<void> {
    this.images.delete(id);
    this.versions.delete(id);
    await this.deleteImageFromFileSystem(id);
  }

  getImage(id: string): CharacterImage | undefined {
    return this.images.get(id);
  }

  async getProjectImages(projectId: string): Promise<CharacterImage[]> {
    return Array.from(this.images.values())
      .filter(img => img.projectId === projectId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getFavoriteImages(): Promise<CharacterImage[]> {
    return Array.from(this.images.values())
      .filter(img => img.favorite)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async searchImages(query: {
    projectId?: string;
    tags?: string[];
    rating?: number;
    favorite?: boolean;
  }): Promise<CharacterImage[]> {
    let results = Array.from(this.images.values());

    if (query.projectId) {
      results = results.filter(img => img.projectId === query.projectId);
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(img =>
        query.tags!.some(tag => img.tags.includes(tag))
      );
    }

    if (query.rating !== undefined) {
      results = results.filter(img => img.rating >= query.rating!);
    }

    if (query.favorite !== undefined) {
      results = results.filter(img => img.favorite === query.favorite);
    }

    return results.sort((a, b) => b.createdAt - a.createdAt);
  }

  // ========== 版本管理 ==========

  async saveVersion(characterId: string, imageData: string, changes?: string): Promise<void> {
    const versions = this.versions.get(characterId) || [];
    const version: ImageVersion = {
      id: this.generateId(),
      characterId,
      imageData,
      version: versions.length + 1,
      changes,
      createdAt: Date.now()
    };

    versions.push(version);
    this.versions.set(characterId, versions);
  }

  getVersions(characterId: string): ImageVersion[] {
    return this.versions.get(characterId) || [];
  }

  async compareVersions(characterId: string, version1: number, version2: number): Promise<{
    v1: ImageVersion | undefined;
    v2: ImageVersion | undefined;
  }> {
    const versions = this.getVersions(characterId);
    return {
      v1: versions.find(v => v.version === version1),
      v2: versions.find(v => v.version === version2)
    };
  }

  // ========== 标签管理 ==========

  async addTag(imageId: string, tag: string): Promise<void> {
    const image = this.images.get(imageId);
    if (!image) throw new Error('Image not found');

    if (!image.tags.includes(tag)) {
      image.tags.push(tag);
      image.updatedAt = Date.now();
      await this.updateImage(imageId, { tags: image.tags });
    }
  }

  async removeTag(imageId: string, tag: string): Promise<void> {
    const image = this.images.get(imageId);
    if (!image) throw new Error('Image not found');

    image.tags = image.tags.filter(t => t !== tag);
    image.updatedAt = Date.now();
    await this.updateImage(imageId, { tags: image.tags });
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    this.images.forEach(image => {
      image.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  async getImagesByTag(tag: string): Promise<CharacterImage[]> {
    return Array.from(this.images.values())
      .filter(img => img.tags.includes(tag))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // ========== 评分管理 ==========

  async rateImage(imageId: string, rating: number): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const image = this.images.get(imageId);
    if (!image) throw new Error('Image not found');

    await this.updateImage(imageId, { rating });
  }

  async getTopRatedImages(limit: number = 10): Promise<CharacterImage[]> {
    return Array.from(this.images.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // ========== 导出/导入 ==========

  async exportProject(projectId: string): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const characters = await this.getProjectCharacters(projectId);
    const images = await this.getProjectImages(projectId);

    return JSON.stringify({
      project,
      characters,
      images
    }, null, 2);
  }

  async importProject(jsonData: string): Promise<string> {
    const data = JSON.parse(jsonData);
    
    // 创建新项目
    const projectId = await this.createProject({
      name: data.project.name + ' (导入)',
      description: data.project.description,
      color: data.project.color,
      icon: data.project.icon
    });

    // 导入角色
    for (const character of data.characters) {
      character.projectId = projectId;
      character.id = this.generateId();
      await database.add('prompts', character);
    }

    // 导入图像
    for (const image of data.images) {
      image.projectId = projectId;
      await this.saveImage(image);
    }

    await this.updateProjectCharacterCount(projectId);

    return projectId;
  }

  // ========== 统计 ==========

  async getProjectStats(projectId: string): Promise<{
    characterCount: number;
    imageCount: number;
    averageRating: number;
    totalSize: number;
    tags: string[];
  }> {
    const characters = await this.getProjectCharacters(projectId);
    const images = await this.getProjectImages(projectId);

    const totalRating = images.reduce((sum, img) => sum + img.rating, 0);
    const averageRating = images.length > 0 ? totalRating / images.length : 0;

    const totalSize = images.reduce((sum, img) => {
      return sum + (img.metadata?.size || 0);
    }, 0);

    const tags = new Set<string>();
    images.forEach(img => img.tags.forEach(tag => tags.add(tag)));

    return {
      characterCount: characters.length,
      imageCount: images.length,
      averageRating,
      totalSize,
      tags: Array.from(tags)
    };
  }

  // ========== 数据持久化 ==========

  private async loadProjects(): Promise<void> {
    try {
      const projects = await database.getAll('projects');
      projects.forEach(project => {
        this.projects.set(project.id, project);
      });
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  private async loadImages(): Promise<void> {
    // 实际应用中，图像可能存储在文件系统中
    // 这里简化处理
  }

  // 文件系统操作（Electron 环境）
  private async saveImageToFileSystem(imageId: string, imageData: string): Promise<void> {
    // 在 Electron 中使用 fs 模块保存图像
    // 这里是占位实现
    if (typeof window !== 'undefined' && (window as any).electron) {
      // 调用 Electron IPC 保存文件
      console.log('Saving image to filesystem:', imageId, imageData.substring(0, 50));
    }
  }

  private async deleteImageFromFileSystem(imageId: string): Promise<void> {
    // 在 Electron 中删除文件
    if (typeof window !== 'undefined' && (window as any).electron) {
      // 调用 Electron IPC 删除文件
      console.log('Deleting image from filesystem:', imageId);
    }
  }

  // ========== 工具方法 ==========

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 生成缩略图
  async generateThumbnail(imageData: string, maxWidth: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * ratio;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = imageData;
    });
  }
}

export const projectManager = new ProjectManager();
