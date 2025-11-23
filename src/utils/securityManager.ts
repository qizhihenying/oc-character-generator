// 安全和隐私管理

export interface PrivacySettings {
  recordHistory: boolean;
  recordStatistics: boolean;
  allowAnalytics: boolean;
  encryptData: boolean;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  fontSize: number;
  color: string;
}

class SecurityManager {
  private privacyMode: boolean = false;
  private privacySettings: PrivacySettings = {
    recordHistory: true,
    recordStatistics: true,
    allowAnalytics: true,
    encryptData: false
  };
  private watermarkConfig: WatermarkConfig = {
    enabled: false,
    text: 'OC Character Generator',
    position: 'bottom-right',
    opacity: 0.5,
    fontSize: 14,
    color: '#ffffff'
  };
  private encryptionKey: string | null = null;

  constructor() {
    this.loadSettings();
  }

  // ========== 隐私模式 ==========

  enablePrivacyMode(): void {
    this.privacyMode = true;
    this.saveSettings();
  }

  disablePrivacyMode(): void {
    this.privacyMode = false;
    this.saveSettings();
  }

  isPrivacyMode(): boolean {
    return this.privacyMode;
  }

  // ========== 隐私设置 ==========

  setPrivacySettings(settings: Partial<PrivacySettings>): void {
    this.privacySettings = { ...this.privacySettings, ...settings };
    this.saveSettings();
  }

  getPrivacySettings(): PrivacySettings {
    return { ...this.privacySettings };
  }

  shouldRecordHistory(): boolean {
    return !this.privacyMode && this.privacySettings.recordHistory;
  }

  shouldRecordStatistics(): boolean {
    return !this.privacyMode && this.privacySettings.recordStatistics;
  }

  shouldAllowAnalytics(): boolean {
    return !this.privacyMode && this.privacySettings.allowAnalytics;
  }

  // ========== 数据加密 ==========

  async setEncryptionKey(key: string): Promise<void> {
    this.encryptionKey = key;
    this.privacySettings.encryptData = true;
    this.saveSettings();
  }

  async clearEncryptionKey(): Promise<void> {
    this.encryptionKey = null;
    this.privacySettings.encryptData = false;
    this.saveSettings();
  }

  async encryptData(data: string): Promise<string> {
    if (!this.privacySettings.encryptData || !this.encryptionKey) {
      return data;
    }

    try {
      // 使用 Web Crypto API 进行加密
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const keyBuffer = encoder.encode(this.encryptionKey);

      // 生成密钥
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        await crypto.subtle.digest('SHA-256', keyBuffer),
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );

      // 生成 IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // 加密
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        dataBuffer
      );

      // 组合 IV 和加密数据
      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv, 0);
      result.set(new Uint8Array(encrypted), iv.length);

      // 转换为 base64
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Encryption failed:', error);
      return data;
    }
  }

  async decryptData(encryptedData: string): Promise<string> {
    if (!this.privacySettings.encryptData || !this.encryptionKey) {
      return encryptedData;
    }

    try {
      // 从 base64 解码
      const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

      // 提取 IV 和加密数据
      const iv = data.slice(0, 12);
      const encrypted = data.slice(12);

      // 生成密钥
      const encoder = new TextEncoder();
      const keyBuffer = encoder.encode(this.encryptionKey);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        await crypto.subtle.digest('SHA-256', keyBuffer),
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      // 解密
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encrypted
      );

      // 转换为字符串
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data. Wrong key?');
    }
  }

  // ========== 水印功能 ==========

  setWatermarkConfig(config: Partial<WatermarkConfig>): void {
    this.watermarkConfig = { ...this.watermarkConfig, ...config };
    this.saveSettings();
  }

  getWatermarkConfig(): WatermarkConfig {
    return { ...this.watermarkConfig };
  }

  async addWatermark(imageData: string): Promise<string> {
    if (!this.watermarkConfig.enabled) {
      return imageData;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // 绘制原图
        ctx.drawImage(img, 0, 0);

        // 设置水印样式
        ctx.font = `${this.watermarkConfig.fontSize}px Arial`;
        ctx.fillStyle = this.watermarkConfig.color;
        ctx.globalAlpha = this.watermarkConfig.opacity;

        // 计算水印位置
        const metrics = ctx.measureText(this.watermarkConfig.text);
        const textWidth = metrics.width;
        const textHeight = this.watermarkConfig.fontSize;
        const padding = 10;

        let x = 0, y = 0;
        switch (this.watermarkConfig.position) {
          case 'top-left':
            x = padding;
            y = textHeight + padding;
            break;
          case 'top-right':
            x = canvas.width - textWidth - padding;
            y = textHeight + padding;
            break;
          case 'bottom-left':
            x = padding;
            y = canvas.height - padding;
            break;
          case 'bottom-right':
            x = canvas.width - textWidth - padding;
            y = canvas.height - padding;
            break;
          case 'center':
            x = (canvas.width - textWidth) / 2;
            y = canvas.height / 2;
            break;
        }

        // 绘制水印
        ctx.fillText(this.watermarkConfig.text, x, y);

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = imageData;
    });
  }

  // ========== 版权保护 ==========

  getCopyrightNotice(): string {
    return `版权声明：
本作品由 OC Character Generator 生成。
生成时间：${new Date().toLocaleString('zh-CN')}

使用条款：
1. 个人使用：允许用于个人创作和非商业用途
2. 商业使用：需要获得适当的授权
3. 二次创作：允许基于生成结果进行二次创作
4. 分享传播：分享时请注明来源

免责声明：
本工具生成的内容仅供参考和灵感启发。
用户需自行承担使用生成内容的责任。`;
  }

  generateLicenseText(type: 'personal' | 'commercial'): string {
    const timestamp = new Date().toISOString();
    const id = this.generateId();

    if (type === 'personal') {
      return `个人使用许可
许可 ID: ${id}
授予时间: ${timestamp}

本许可允许您：
- 用于个人创作和学习
- 在社交媒体分享
- 用于非商业项目

限制：
- 不得用于商业目的
- 不得转让此许可`;
    } else {
      return `商业使用许可
许可 ID: ${id}
授予时间: ${timestamp}

本许可允许您：
- 用于商业项目
- 用于产品开发
- 用于营销材料

限制：
- 需遵守相关法律法规
- 不得用于非法用途`;
    }
  }

  // ========== 数据清理 ==========

  async clearPrivateData(): Promise<void> {
    // 清除所有私密数据
    if (typeof window !== 'undefined') {
      localStorage.removeItem('privacy-settings');
      sessionStorage.clear();
    }
  }

  async exportPrivacyReport(): Promise<string> {
    const report = {
      privacyMode: this.privacyMode,
      settings: this.privacySettings,
      dataCollected: {
        history: this.shouldRecordHistory(),
        statistics: this.shouldRecordStatistics(),
        analytics: this.shouldAllowAnalytics()
      },
      encryption: {
        enabled: this.privacySettings.encryptData,
        hasKey: !!this.encryptionKey
      },
      exportTime: new Date().toISOString()
    };

    return JSON.stringify(report, null, 2);
  }

  // ========== 数据持久化 ==========

  private loadSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('privacy-settings');
      if (saved) {
        const data = JSON.parse(saved);
        this.privacyMode = data.privacyMode || false;
        this.privacySettings = data.privacySettings || this.privacySettings;
        this.watermarkConfig = data.watermarkConfig || this.watermarkConfig;
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        privacyMode: this.privacyMode,
        privacySettings: this.privacySettings,
        watermarkConfig: this.watermarkConfig
      };
      localStorage.setItem('privacy-settings', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
  }

  // ========== 工具方法 ==========

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 数据脱敏
  anonymizeData(data: any): any {
    const anonymized = JSON.parse(JSON.stringify(data));
    
    // 移除敏感信息
    const sensitiveFields = ['apiKey', 'password', 'email', 'phone'];
    
    const anonymize = (obj: any) => {
      for (const key in obj) {
        if (sensitiveFields.includes(key)) {
          obj[key] = '***';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          anonymize(obj[key]);
        }
      }
    };

    anonymize(anonymized);
    return anonymized;
  }
}

export const securityManager = new SecurityManager();
