// 版本更新检查器
export interface VersionInfo {
  version: string;
  releaseDate: string;
  downloadUrl: string;
  changelog: string[];
  forceUpdate: boolean;
}

export class UpdateChecker {
  private currentVersion = '1.3.0';
  private updateCheckUrl = 'https://raw.githubusercontent.com/qizhihenying/oc-character-generator/main/public/version.json';
  
  // 检查更新
  async checkForUpdates(): Promise<VersionInfo | null> {
    try {
      const response = await fetch(this.updateCheckUrl);
      if (!response.ok) return null;
      
      const latestVersion: VersionInfo = await response.json();
      
      // 比较版本号
      if (this.isNewerVersion(latestVersion.version, this.currentVersion)) {
        return latestVersion;
      }
      
      return null;
    } catch (error) {
      console.error('检查更新失败:', error);
      return null;
    }
  }
  
  // 比较版本号
  private isNewerVersion(latest: string, current: string): boolean {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (latestParts[i] > currentParts[i]) return true;
      if (latestParts[i] < currentParts[i]) return false;
    }
    
    return false;
  }
  
  // 获取当前版本
  getCurrentVersion(): string {
    return this.currentVersion;
  }
  
  // 下载更新
  downloadUpdate(url: string): void {
    window.open(url, '_blank');
  }
}

export const updateChecker = new UpdateChecker();
