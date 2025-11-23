/**
 * 已预定角色管理器
 * 管理已经预定（入库）的角色，防止重复抽取
 */

import { GeneratedPrompt } from './promptGenerator';

export interface ReservedCharacter {
  id: string;
  seed: string;
  name: string;
  timestamp: number;
  prompt: GeneratedPrompt;
}

class ReservedCharactersManager {
  private storageKey = 'oc-reserved-characters';
  private reservedSeeds: Set<string> = new Set();
  private reservedCharacters: ReservedCharacter[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * 从本地存储加载已预定角色
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.reservedCharacters = JSON.parse(stored);
        this.reservedSeeds = new Set(this.reservedCharacters.map(c => c.seed));
      }
    } catch (error) {
      console.error('Failed to load reserved characters:', error);
    }
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.reservedCharacters));
    } catch (error) {
      console.error('Failed to save reserved characters:', error);
    }
  }

  /**
   * 检查种子是否已被预定
   */
  isSeedReserved(seed: string): boolean {
    return this.reservedSeeds.has(seed);
  }

  /**
   * 添加角色到预定列表
   */
  addReservedCharacter(prompt: GeneratedPrompt): boolean {
    if (!prompt.seed) {
      console.warn('Cannot reserve character without seed');
      return false;
    }

    if (this.isSeedReserved(prompt.seed)) {
      console.warn('Character with this seed is already reserved');
      return false;
    }

    const reserved: ReservedCharacter = {
      id: prompt.id,
      seed: prompt.seed,
      name: prompt.characterIP?.name || '未命名角色',
      timestamp: Date.now(),
      prompt
    };

    this.reservedCharacters.push(reserved);
    this.reservedSeeds.add(prompt.seed);
    this.saveToStorage();

    return true;
  }

  /**
   * 从预定列表移除角色
   */
  removeReservedCharacter(seed: string): boolean {
    const index = this.reservedCharacters.findIndex(c => c.seed === seed);
    if (index === -1) {
      return false;
    }

    this.reservedCharacters.splice(index, 1);
    this.reservedSeeds.delete(seed);
    this.saveToStorage();

    return true;
  }

  /**
   * 获取所有已预定角色
   */
  getAllReservedCharacters(): ReservedCharacter[] {
    return [...this.reservedCharacters];
  }

  /**
   * 获取已预定角色数量
   */
  getReservedCount(): number {
    return this.reservedCharacters.length;
  }

  /**
   * 清空所有预定
   */
  clearAll(): void {
    this.reservedCharacters = [];
    this.reservedSeeds.clear();
    this.saveToStorage();
  }

  /**
   * 导出预定列表
   */
  exportReserved(): string {
    return JSON.stringify(this.reservedCharacters, null, 2);
  }

  /**
   * 导入预定列表
   */
  importReserved(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);
      if (Array.isArray(imported)) {
        this.reservedCharacters = imported;
        this.reservedSeeds = new Set(imported.map((c: ReservedCharacter) => c.seed));
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import reserved characters:', error);
      return false;
    }
  }
}

// 单例模式
export const reservedCharactersManager = new ReservedCharactersManager();
