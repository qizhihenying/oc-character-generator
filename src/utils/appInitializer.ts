// 应用初始化器 - 统一初始化所有管理器

import { database } from './database';
import { elementManager } from './elementManager';
import { projectManager } from './projectManager';
import { templateManager } from './templateManager';
import { themeManager } from './themeManager';

class AppInitializer {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('App already initialized');
      return;
    }

    try {
      console.log('Initializing OC Character Generator...');

      // 1. 初始化数据库
      console.log('Initializing database...');
      await database.init();

      // 2. 初始化元素管理器
      console.log('Initializing element manager...');
      await elementManager.init();

      // 3. 初始化项目管理器
      console.log('Initializing project manager...');
      await projectManager.init();

      // 4. 初始化模板管理器
      console.log('Initializing template manager...');
      await templateManager.init();

      // 5. 应用主题
      console.log('Applying theme...');
      themeManager.setTheme(themeManager.getMode());

      this.initialized = true;
      console.log('App initialized successfully!');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async reset(): Promise<void> {
    // 清除所有数据（谨慎使用）
    const stores = [
      'prompts',
      'projects',
      'customElements',
      'themePacks',
      'templates',
      'statistics',
      'settings'
    ] as const;

    for (const store of stores) {
      try {
        await database.clear(store as any);
      } catch (error) {
        console.error(`Failed to clear ${store}:`, error);
      }
    }

    this.initialized = false;
    await this.initialize();
  }
}

export const appInitializer = new AppInitializer();
