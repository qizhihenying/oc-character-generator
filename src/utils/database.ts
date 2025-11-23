// IndexedDB 数据库管理
// 用于本地存储用户数据、历史记录、图像等

export interface DBSchema {
  prompts: {
    key: string;
    value: {
      id: string;
      prompt: string;
      elements: { [category: string]: string };
      timestamp: number;
      technicalParams: string;
      seed?: string;
      tags?: string[];
      rating?: number;
      notes?: string;
      projectId?: string;
      imageUrl?: string;
      favorite?: boolean;
    };
    indexes: {
      'by-timestamp': number;
      'by-project': string;
      'by-favorite': boolean;
    };
  };
  projects: {
    key: string;
    value: {
      id: string;
      name: string;
      description?: string;
      createdAt: number;
      updatedAt: number;
      color?: string;
      icon?: string;
    };
    indexes: {
      'by-name': string;
    };
  };
  customElements: {
    key: string;
    value: {
      id: string;
      category: string;
      items: string[];
      rarity?: 'common' | 'rare' | 'epic' | 'legendary';
      createdAt: number;
      isCustom: boolean;
    };
    indexes: {
      'by-category': string;
    };
  };
  themePacks: {
    key: string;
    value: {
      id: string;
      name: string;
      description?: string;
      elements: { [category: string]: string[] };
      thumbnail?: string;
      author?: string;
      createdAt: number;
      isBuiltIn: boolean;
    };
    indexes: {
      'by-name': string;
    };
  };
  templates: {
    key: string;
    value: {
      id: string;
      name: string;
      config: any;
      createdAt: number;
      usageCount: number;
    };
    indexes: {
      'by-usage': number;
    };
  };
  statistics: {
    key: string;
    value: {
      id: string;
      type: 'element-usage' | 'generation-count' | 'preference';
      data: any;
      timestamp: number;
    };
    indexes: {
      'by-type': string;
      'by-timestamp': number;
    };
  };
  settings: {
    key: string;
    value: {
      key: string;
      value: any;
      updatedAt: number;
    };
  };
}

class Database {
  private db: IDBDatabase | null = null;
  private dbName = 'oc-character-generator';
  private version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建 prompts 存储
        if (!db.objectStoreNames.contains('prompts')) {
          const promptStore = db.createObjectStore('prompts', { keyPath: 'id' });
          promptStore.createIndex('by-timestamp', 'timestamp', { unique: false });
          promptStore.createIndex('by-project', 'projectId', { unique: false });
          promptStore.createIndex('by-favorite', 'favorite', { unique: false });
        }

        // 创建 projects 存储
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('by-name', 'name', { unique: false });
        }

        // 创建 customElements 存储
        if (!db.objectStoreNames.contains('customElements')) {
          const elementStore = db.createObjectStore('customElements', { keyPath: 'id' });
          elementStore.createIndex('by-category', 'category', { unique: false });
        }

        // 创建 themePacks 存储
        if (!db.objectStoreNames.contains('themePacks')) {
          const themeStore = db.createObjectStore('themePacks', { keyPath: 'id' });
          themeStore.createIndex('by-name', 'name', { unique: false });
        }

        // 创建 templates 存储
        if (!db.objectStoreNames.contains('templates')) {
          const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
          templateStore.createIndex('by-usage', 'usageCount', { unique: false });
        }

        // 创建 statistics 存储
        if (!db.objectStoreNames.contains('statistics')) {
          const statsStore = db.createObjectStore('statistics', { keyPath: 'id' });
          statsStore.createIndex('by-type', 'type', { unique: false });
          statsStore.createIndex('by-timestamp', 'timestamp', { unique: false });
        }

        // 创建 settings 存储
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // 通用 CRUD 操作
  async add<T extends keyof DBSchema>(
    storeName: T,
    data: DBSchema[T]['value']
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T extends keyof DBSchema>(
    storeName: T,
    key: string
  ): Promise<DBSchema[T]['value'] | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T extends keyof DBSchema>(
    storeName: T
  ): Promise<DBSchema[T]['value'][]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T extends keyof DBSchema>(
    storeName: T,
    data: DBSchema[T]['value']
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete<T extends keyof DBSchema>(
    storeName: T,
    key: string
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear<T extends keyof DBSchema>(storeName: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 索引查询
  async getByIndex<T extends keyof DBSchema>(
    storeName: T,
    indexName: string,
    value: any
  ): Promise<DBSchema[T]['value'][]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 导出数据
  async exportData(): Promise<string> {
    const data: any = {};
    const storeNames: (keyof DBSchema)[] = [
      'prompts',
      'projects',
      'customElements',
      'themePacks',
      'templates',
      'statistics',
      'settings'
    ];

    for (const storeName of storeNames) {
      data[storeName] = await this.getAll(storeName);
    }

    return JSON.stringify(data, null, 2);
  }

  // 导入数据
  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    const storeNames: (keyof DBSchema)[] = [
      'prompts',
      'projects',
      'customElements',
      'themePacks',
      'templates',
      'statistics',
      'settings'
    ];

    for (const storeName of storeNames) {
      if (data[storeName] && Array.isArray(data[storeName])) {
        for (const item of data[storeName]) {
          await this.add(storeName, item);
        }
      }
    }
  }

  // 备份数据
  async backup(): Promise<Blob> {
    const data = await this.exportData();
    return new Blob([data], { type: 'application/json' });
  }

  // 恢复数据
  async restore(file: File): Promise<void> {
    const text = await file.text();
    await this.importData(text);
  }
}

export const database = new Database();
