/**
 * 绘图 API 服务
 * 处理与第三方绘图 API 的交互（支持 Midjourney 和其他中转服务）
 */

export interface MJConfig {
  apiKey: string;
  baseUrl: string;
  modelName?: string; // 模型名称，支持各种中转API提供商
  notifyHook?: string;
}

export interface MJTask {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  imageUrl?: string;
  progress?: number;
  error?: string;
  timestamp: number;
  discordChannelId?: string;
  discordInstanceId?: string;
}

export type BotType = 'MID_JOURNEY' | 'NIJI_JOURNEY';

export interface SubmitImagineRequest {
  botType: BotType;
  prompt: string;
  base64Array?: string[];
  notifyHook?: string;
  state?: string;
}

export interface SubmitImagineResponse {
  code: number;
  description: string;
  result: string; // 任务ID
  properties?: {
    discordChannelId: string;
    discordInstanceId: string;
  };
}

export interface TaskQueryResponse {
  code: number;
  description: string;
  result: {
    id: string;
    status: string;
    progress: string;
    imageUrl?: string;
    failReason?: string;
  };
}

export interface MJAction {
  taskId: string;
  action: 'UPSCALE' | 'VARIATION' | 'REROLL';
  index?: number; // 1-4, for UPSCALE and VARIATION
}

class MidjourneyAPI {
  private config: MJConfig | null = null;
  private readonly CONFIG_KEY = 'mj_api_config';
  private tasks: Map<string, MJTask> = new Map();

  /**
   * 初始化配置
   */
  initialize() {
    const saved = localStorage.getItem(this.CONFIG_KEY);
    if (saved) {
      try {
        this.config = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse MJ config:', e);
      }
    }
  }

  /**
   * 保存配置
   */
  saveConfig(config: MJConfig) {
    this.config = config;
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
  }

  /**
   * 获取配置
   */
  getConfig(): MJConfig | null {
    return this.config;
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    return !!(this.config?.apiKey && this.config?.baseUrl);
  }

  /**
   * 提交 Imagine 任务
   */
  async submitImagine(request: SubmitImagineRequest): Promise<MJTask> {
    if (!this.isConfigured()) {
      throw new Error('API 未配置，请先配置 API Key');
    }

    const url = `${this.config!.baseUrl}/mj/submit/imagine`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config!.apiKey}`,
        },
        body: JSON.stringify({
          ...request,
          notifyHook: request.notifyHook || this.config!.notifyHook || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data: SubmitImagineResponse = await response.json();

      if (data.code !== 1) {
        throw new Error(data.description || '提交任务失败');
      }

      // 创建任务记录
      const task: MJTask = {
        id: data.result,
        prompt: request.prompt,
        status: 'pending',
        timestamp: Date.now(),
        discordChannelId: data.properties?.discordChannelId,
        discordInstanceId: data.properties?.discordInstanceId,
      };

      this.tasks.set(task.id, task);
      console.log('MJ API: Task created and stored', task);
      console.log('MJ API: Total tasks:', this.tasks.size);
      
      // 立即触发 UI 更新
      console.log('MJ API: Dispatching task update event');
      window.dispatchEvent(new CustomEvent('mj-task-update', { detail: task }));
      
      // 开始轮询任务状态
      this.pollTaskStatus(task.id);

      return task;
    } catch (error) {
      console.error('Submit imagine failed:', error);
      throw error;
    }
  }

  /**
   * 查询任务状态
   */
  async queryTask(taskId: string): Promise<TaskQueryResponse> {
    if (!this.isConfigured()) {
      throw new Error('API 未配置');
    }

    const url = `${this.config!.baseUrl}/mj/task/${taskId}/fetch`;
    console.log(`MJ API: Querying task at URL: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
        },
      });

      console.log(`MJ API: Query response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MJ API: Query failed with status ${response.status}:`, errorText);
        throw new Error(`查询任务失败: ${response.status} ${errorText}`);
      }

      const data: TaskQueryResponse = await response.json();
      console.log(`MJ API: Query response data:`, data);
      return data;
    } catch (error) {
      console.error('MJ API: Query task exception:', error);
      throw error;
    }
  }

  /**
   * 轮询任务状态
   */
  private async pollTaskStatus(taskId: string) {
    const maxAttempts = 60; // 最多轮询 60 次（5 分钟）
    let attempts = 0;

    console.log(`MJ API: Starting to poll task ${taskId}`);

    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.log(`MJ API: Task ${taskId} timeout after ${attempts} attempts`);
        this.updateTaskStatus(taskId, 'failed', '任务超时');
        return;
      }

      try {
        console.log(`MJ API: Polling task ${taskId}, attempt ${attempts + 1}/${maxAttempts}`);
        const result = await this.queryTask(taskId);
        console.log(`MJ API: Query result for ${taskId}:`, result);
        
        if (result.code === 1 && result.result) {
          const { status, progress, imageUrl, failReason } = result.result;
          console.log(`MJ API: Task ${taskId} status: ${status}, progress: ${progress}`);

          if (status === 'SUCCESS') {
            console.log(`MJ API: Task ${taskId} completed successfully, imageUrl: ${imageUrl}`);
            this.updateTaskStatus(taskId, 'success', undefined, imageUrl, 100);
          } else if (status === 'FAILURE') {
            console.log(`MJ API: Task ${taskId} failed: ${failReason}`);
            this.updateTaskStatus(taskId, 'failed', failReason || '生成失败');
          } else {
            // 仍在处理中
            const progressNum = parseInt(progress) || 0;
            console.log(`MJ API: Task ${taskId} processing, progress: ${progressNum}%`);
            this.updateTaskStatus(taskId, 'processing', undefined, undefined, progressNum);
            
            // 继续轮询
            attempts++;
            setTimeout(poll, 5000); // 5 秒后再次查询
          }
        } else {
          console.log(`MJ API: Invalid response for task ${taskId}, retrying...`);
          attempts++;
          setTimeout(poll, 5000);
        }
      } catch (error) {
        console.error(`MJ API: Poll task ${taskId} failed:`, error);
        attempts++;
        setTimeout(poll, 5000);
      }
    };

    // 延迟 3 秒后开始第一次查询（给 API 一些处理时间）
    setTimeout(poll, 3000);
  }

  /**
   * 更新任务状态
   */
  private updateTaskStatus(
    taskId: string,
    status: MJTask['status'],
    error?: string,
    imageUrl?: string,
    progress?: number
  ) {
    const task = this.tasks.get(taskId);
    if (task) {
      console.log(`MJ API: Updating task ${taskId} status to ${status}`, { error, imageUrl, progress });
      task.status = status;
      task.error = error;
      task.imageUrl = imageUrl;
      task.progress = progress;
      this.tasks.set(taskId, task);
      
      // 触发自定义事件，通知 UI 更新
      console.log(`MJ API: Dispatching update event for task ${taskId}`);
      window.dispatchEvent(new CustomEvent('mj-task-update', { detail: task }));
    } else {
      console.warn(`MJ API: Task ${taskId} not found in tasks map`);
    }
  }

  /**
   * 获取任务
   */
  getTask(taskId: string): MJTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): MJTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 执行操作（放大、变体、重绘）
   */
  async submitAction(action: MJAction): Promise<MJTask> {
    if (!this.isConfigured()) {
      throw new Error('API 未配置');
    }

    const url = `${this.config!.baseUrl}/mj/submit/action`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config!.apiKey}`,
        },
        body: JSON.stringify({
          taskId: action.taskId,
          action: action.action,
          index: action.index,
        }),
      });

      if (!response.ok) {
        throw new Error(`操作失败: ${response.status}`);
      }

      const data: SubmitImagineResponse = await response.json();

      if (data.code !== 1) {
        throw new Error(data.description || '操作失败');
      }

      // 创建新任务
      const originalTask = this.tasks.get(action.taskId);
      const task: MJTask = {
        id: data.result,
        prompt: originalTask?.prompt || '',
        status: 'pending',
        timestamp: Date.now(),
      };

      this.tasks.set(task.id, task);
      this.pollTaskStatus(task.id);

      return task;
    } catch (error) {
      console.error('Submit action failed:', error);
      throw error;
    }
  }

  /**
   * 清除所有任务
   */
  clearTasks() {
    this.tasks.clear();
  }
}

// 导出单例
export const mjAPI = new MidjourneyAPI();
