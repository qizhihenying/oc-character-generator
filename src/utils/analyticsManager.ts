// 统计分析和智能推荐系统

import { database } from './database';
import { GeneratedPrompt } from './promptGenerator';

export interface UsageStats {
  totalGenerations: number;
  totalTime: number;
  averagePerDay: number;
  mostActiveHour: number;
  favoriteElements: Array<{ category: string; item: string; count: number }>;
  stylePreferences: { [style: string]: number };
  genderPreferences: { [gender: string]: number };
}

export interface ElementTrend {
  category: string;
  item: string;
  trend: 'rising' | 'falling' | 'stable';
  changePercent: number;
  currentCount: number;
  previousCount: number;
}

export interface Recommendation {
  type: 'element' | 'combination' | 'style';
  title: string;
  description: string;
  confidence: number; // 0-1
  data: any;
}

class AnalyticsManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 分钟缓存

  // ========== 使用统计 ==========

  async recordGeneration(prompt: GeneratedPrompt, config: any): Promise<void> {
    await database.add('statistics', {
      id: this.generateId(),
      type: 'generation-count',
      data: {
        promptId: prompt.id,
        timestamp: prompt.timestamp,
        config,
        elements: prompt.elements
      },
      timestamp: prompt.timestamp
    });

    // 清除缓存
    this.clearCache();
  }

  async getUsageStats(days: number = 30): Promise<UsageStats> {
    const cached = this.getFromCache('usage-stats');
    if (cached) return cached;

    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const stats = await database.getByIndex('statistics', 'by-type', 'generation-count');
    
    const recentStats = stats.filter(s => s.timestamp >= startTime);

    // 总生成次数
    const totalGenerations = recentStats.length;

    // 总使用时间（天数）
    const totalTime = days;

    // 平均每天生成次数
    const averagePerDay = totalGenerations / days;

    // 最活跃时段
    const hourCounts = new Array(24).fill(0);
    recentStats.forEach(stat => {
      const hour = new Date(stat.timestamp).getHours();
      hourCounts[hour]++;
    });
    const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

    // 最喜欢的元素
    const elementCounts = new Map<string, number>();
    recentStats.forEach(stat => {
      if (stat.data.elements) {
        Object.entries(stat.data.elements).forEach(([category, item]) => {
          const key = `${category}:${item}`;
          elementCounts.set(key, (elementCounts.get(key) || 0) + 1);
        });
      }
    });

    const favoriteElements = Array.from(elementCounts.entries())
      .map(([key, count]) => {
        const [category, item] = key.split(':');
        return { category, item, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 风格偏好
    const stylePreferences: { [style: string]: number } = {};
    recentStats.forEach(stat => {
      const style = stat.data.config?.style || 'any';
      stylePreferences[style] = (stylePreferences[style] || 0) + 1;
    });

    // 性别偏好
    const genderPreferences: { [gender: string]: number } = {};
    recentStats.forEach(stat => {
      const gender = stat.data.config?.gender || 'any';
      genderPreferences[gender] = (genderPreferences[gender] || 0) + 1;
    });

    const result: UsageStats = {
      totalGenerations,
      totalTime,
      averagePerDay,
      mostActiveHour,
      favoriteElements,
      stylePreferences,
      genderPreferences
    };

    this.setCache('usage-stats', result);
    return result;
  }

  // ========== 热门元素 ==========

  async getPopularElements(category?: string, limit: number = 20): Promise<Array<{ category: string; item: string; count: number; percentage: number }>> {
    const stats = await database.getByIndex('statistics', 'by-type', 'generation-count');
    
    const elementCounts = new Map<string, number>();
    let totalCount = 0;

    stats.forEach(stat => {
      if (stat.data.elements) {
        Object.entries(stat.data.elements).forEach(([cat, item]) => {
          if (!category || cat === category) {
            const key = `${cat}:${item}`;
            elementCounts.set(key, (elementCounts.get(key) || 0) + 1);
            totalCount++;
          }
        });
      }
    });

    return Array.from(elementCounts.entries())
      .map(([key, count]) => {
        const [cat, item] = key.split(':');
        return {
          category: cat,
          item,
          count,
          percentage: (count / totalCount) * 100
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // ========== 趋势分析 ==========

  async analyzeTrends(days: number = 30): Promise<ElementTrend[]> {
    const now = Date.now();
    const midPoint = now - (days / 2) * 24 * 60 * 60 * 1000;
    const startPoint = now - days * 24 * 60 * 60 * 1000;

    const stats = await database.getByIndex('statistics', 'by-type', 'generation-count');

    const recentStats = stats.filter(s => s.timestamp >= midPoint);
    const previousStats = stats.filter(s => s.timestamp >= startPoint && s.timestamp < midPoint);

    const recentCounts = this.countElements(recentStats);
    const previousCounts = this.countElements(previousStats);

    const trends: ElementTrend[] = [];

    recentCounts.forEach((currentCount, key) => {
      const [category, item] = key.split(':');
      const previousCount = previousCounts.get(key) || 0;

      let trend: 'rising' | 'falling' | 'stable' = 'stable';
      let changePercent = 0;

      if (previousCount > 0) {
        changePercent = ((currentCount - previousCount) / previousCount) * 100;
        if (changePercent > 20) trend = 'rising';
        else if (changePercent < -20) trend = 'falling';
      } else if (currentCount > 0) {
        trend = 'rising';
        changePercent = 100;
      }

      trends.push({
        category,
        item,
        trend,
        changePercent,
        currentCount,
        previousCount
      });
    });

    return trends.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  }

  private countElements(stats: any[]): Map<string, number> {
    const counts = new Map<string, number>();
    stats.forEach(stat => {
      if (stat.data.elements) {
        Object.entries(stat.data.elements).forEach(([category, item]) => {
          const key = `${category}:${item}`;
          counts.set(key, (counts.get(key) || 0) + 1);
        });
      }
    });
    return counts;
  }

  // ========== 智能推荐 ==========

  async generateRecommendations(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // 基于历史偏好推荐
    const stats = await this.getUsageStats(30);
    
    // 推荐相似元素
    if (stats.favoriteElements.length > 0) {
      const topElement = stats.favoriteElements[0];
      recommendations.push({
        type: 'element',
        title: `尝试与"${topElement.item}"相似的元素`,
        description: `您经常使用这个元素，可能会喜欢相似的选项`,
        confidence: 0.8,
        data: { category: topElement.category, item: topElement.item }
      });
    }

    // 推荐热门组合
    const popularCombinations = await this.findPopularCombinations();
    if (popularCombinations.length > 0) {
      recommendations.push({
        type: 'combination',
        title: '热门元素组合',
        description: '这些元素组合最受欢迎',
        confidence: 0.9,
        data: popularCombinations[0]
      });
    }

    // 推荐新风格
    const leastUsedStyle = this.findLeastUsedStyle(stats.stylePreferences);
    if (leastUsedStyle) {
      recommendations.push({
        type: 'style',
        title: `尝试${leastUsedStyle}风格`,
        description: '探索新的艺术风格，获得不同的创作灵感',
        confidence: 0.6,
        data: { style: leastUsedStyle }
      });
    }

    // 基于趋势推荐
    const trends = await this.analyzeTrends(30);
    const risingTrends = trends.filter(t => t.trend === 'rising').slice(0, 3);
    if (risingTrends.length > 0) {
      recommendations.push({
        type: 'element',
        title: '热门趋势元素',
        description: '这些元素最近很受欢迎',
        confidence: 0.7,
        data: risingTrends
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // 查找热门组合
  private async findPopularCombinations(): Promise<any[]> {
    const stats = await database.getByIndex('statistics', 'by-type', 'generation-count');
    
    const combinations = new Map<string, number>();
    
    stats.forEach(stat => {
      if (stat.data.elements) {
        const elements = Object.values(stat.data.elements).sort();
        const key = elements.join('|');
        combinations.set(key, (combinations.get(key) || 0) + 1);
      }
    });

    return Array.from(combinations.entries())
      .map(([key, count]) => ({
        elements: key.split('|'),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // 查找最少使用的风格
  private findLeastUsedStyle(stylePreferences: { [style: string]: number }): string | null {
    const allStyles = ['anime', 'fantasy', 'chinese', 'cyberpunk', 'gothic', 'modern'];
    const usedStyles = Object.keys(stylePreferences);
    
    const unusedStyles = allStyles.filter(s => !usedStyles.includes(s));
    if (unusedStyles.length > 0) {
      return unusedStyles[Math.floor(Math.random() * unusedStyles.length)];
    }

    const leastUsed = Object.entries(stylePreferences)
      .sort((a, b) => a[1] - b[1])[0];
    
    return leastUsed ? leastUsed[0] : null;
  }

  // ========== 个性化推荐 ==========

  async getPersonalizedRecommendations(count: number = 5): Promise<Recommendation[]> {
    const stats = await this.getUsageStats(30);
    const recommendations: Recommendation[] = [];

    // 分析用户偏好模式
    const preferences = this.analyzePreferences(stats);

    // 基于偏好生成推荐
    if (preferences.favoriteCategory) {
      const popular = await this.getPopularElements(preferences.favoriteCategory, 5);
      const unused = popular.filter(p => 
        !stats.favoriteElements.some(f => f.item === p.item)
      );

      if (unused.length > 0) {
        recommendations.push({
          type: 'element',
          title: `${preferences.favoriteCategory}新选择`,
          description: `基于您对${preferences.favoriteCategory}的偏好`,
          confidence: 0.85,
          data: unused[0]
        });
      }
    }

    // 时间段推荐
    if (stats.mostActiveHour !== undefined) {
      const timeOfDay = this.getTimeOfDay(stats.mostActiveHour);
      recommendations.push({
        type: 'element',
        title: `${timeOfDay}创作灵感`,
        description: `适合您在${timeOfDay}创作的元素`,
        confidence: 0.7,
        data: { timeOfDay, hour: stats.mostActiveHour }
      });
    }

    return recommendations.slice(0, count);
  }

  private analyzePreferences(stats: UsageStats): any {
    const favoriteCategory = stats.favoriteElements.length > 0
      ? stats.favoriteElements[0].category
      : null;

    const favoriteStyle = Object.entries(stats.stylePreferences)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    const favoriteGender = Object.entries(stats.genderPreferences)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      favoriteCategory,
      favoriteStyle,
      favoriteGender
    };
  }

  private getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) return '早晨';
    if (hour >= 12 && hour < 18) return '下午';
    if (hour >= 18 && hour < 22) return '傍晚';
    return '深夜';
  }

  // ========== 相似角色查找 ==========

  async findSimilarCharacters(promptId: string, limit: number = 5): Promise<GeneratedPrompt[]> {
    const target = await database.get('prompts', promptId);
    if (!target) return [];

    const allPrompts = await database.getAll('prompts');
    
    // 计算相似度
    const similarities = allPrompts
      .filter(p => p.id !== promptId)
      .map(p => ({
        prompt: p,
        similarity: this.calculateSimilarity(target.elements, p.elements)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similarities.map(s => s.prompt as any);
  }

  private calculateSimilarity(elements1: any, elements2: any): number {
    const keys1 = Object.keys(elements1);
    const keys2 = Object.keys(elements2);
    
    let matches = 0;
    let total = new Set([...keys1, ...keys2]).size;

    keys1.forEach(key => {
      if (elements2[key] === elements1[key]) {
        matches++;
      }
    });

    return matches / total;
  }

  // ========== 生成报告 ==========

  async generateReport(days: number = 30): Promise<string> {
    const stats = await this.getUsageStats(days);
    const trends = await this.analyzeTrends(days);
    const popular = await this.getPopularElements(undefined, 10);

    let report = `# 创作报告 (最近 ${days} 天)\n\n`;
    
    report += `## 📊 总体统计\n`;
    report += `- 总生成次数: ${stats.totalGenerations}\n`;
    report += `- 日均生成: ${stats.averagePerDay.toFixed(1)} 次\n`;
    report += `- 最活跃时段: ${stats.mostActiveHour}:00\n\n`;

    report += `## 🎨 风格偏好\n`;
    Object.entries(stats.stylePreferences)
      .sort((a, b) => b[1] - a[1])
      .forEach(([style, count]) => {
        report += `- ${style}: ${count} 次\n`;
      });
    report += `\n`;

    report += `## ⭐ 最喜欢的元素\n`;
    stats.favoriteElements.slice(0, 5).forEach((el, i) => {
      report += `${i + 1}. ${el.category} - ${el.item} (${el.count} 次)\n`;
    });
    report += `\n`;

    report += `## 📈 热门趋势\n`;
    trends.filter(t => t.trend === 'rising').slice(0, 5).forEach(t => {
      report += `- ${t.item} ↑ ${t.changePercent.toFixed(1)}%\n`;
    });
    report += `\n`;

    report += `## 🔥 热门元素 TOP 10\n`;
    popular.forEach((el, i) => {
      report += `${i + 1}. ${el.item} (${el.count} 次, ${el.percentage.toFixed(1)}%)\n`;
    });

    return report;
  }

  // ========== 缓存管理 ==========

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // ========== 工具方法 ==========

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 导出统计数据
  async exportStats(): Promise<string> {
    const stats = await this.getUsageStats(30);
    const trends = await this.analyzeTrends(30);
    const popular = await this.getPopularElements();

    return JSON.stringify({
      stats,
      trends,
      popular,
      exportTime: new Date().toISOString()
    }, null, 2);
  }
}

export const analyticsManager = new AnalyticsManager();
