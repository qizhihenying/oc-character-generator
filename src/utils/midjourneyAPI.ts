/**
 * 绘图 API 服务
 * 处理与第三方绘图 API 的交互（支持 Midjourney 和其他中转服务）
 */

import { APIFormat, getAdapter } from './apiFormats';

export interface MJConfig {
  apiKey: string;
  baseUrl: string;
  modelName?: string; // 模型名称，支持各种中转API提供商
  notifyHook?: string;
  apiFormat?: APIFormat; // API 格式类型
  botType?: 'MID_JOURNEY' | 'NIJI_JOURNEY'; // 机器人类型
  customEndpoints?: {
    submit?: string;
    query?: string;
    action?: string;
  }; // 自定义接口路径
  requiresAuth?: 'bearer' | 'query' | 'header'; // 认证方式
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

    try {
      // 获取 API 格式适配器
      const apiFormat = this.config!.apiFormat || 'midjourney';
      const adapter = getAdapter(apiFormat);
      
      console.log(`使用 ${apiFormat} 格式提交任务`);

      // 使用适配器提交任务
      const result = await adapter.submitTask(
        this.config,
        request.prompt,
        request.base64Array || []
      );

      // 创建任务记录
      const task: MJTask = {
        id: result.taskId,
        prompt: request.prompt,
        status: result.status === 'success' ? 'success' : 'pending',
        timestamp: Date.now(),
        imageUrl: result.imageUrl,
      };

      this.tasks.set(task.id, task);
      console.log('API: Task created and stored', task);
      console.log('API: Total tasks:', this.tasks.size);
      
      // 立即触发 UI 更新
      console.log('API: Dispatching task update event');
      window.dispatchEvent(new CustomEvent('mj-task-update', { detail: task }));
      
      // 如果不是立即完成的任务，开始轮询任务状态
      if (result.status !== 'success') {
        this.pollTaskStatus(task.id);
      }

      return task;
    } catch (error) {
      console.error('Submit task failed:', error);
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

    try {
      // 获取 API 格式适配器
      const apiFormat = this.config!.apiFormat || 'midjourney';
      const adapter = getAdapter(apiFormat);
      
      console.log(`使用 ${apiFormat} 格式查询任务: ${taskId}`);

      // 使用适配器查询任务
      const result = await adapter.queryTask(this.config, taskId);

      // 转换为统一的响应格式
      return {
        code: 1,
        description: 'success',
        result: {
          id: taskId,
          status: result.status,
          progress: result.progress || '0',
          imageUrl: result.imageUrl,
          failReason: result.failReason,
        },
      };
    } catch (error) {
      console.error('API: Query task exception:', error);
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

    try {
      // 获取 API 格式适配器
      const apiFormat = this.config!.apiFormat || 'midjourney';
      const adapter = getAdapter(apiFormat);
      
      // 检查适配器是否支持操作
      if (!adapter.executeAction) {
        throw new Error(`${apiFormat} 格式不支持此操作`);
      }

      console.log(`使用 ${apiFormat} 格式执行操作: ${action.action}`);

      // 使用适配器执行操作
      const result = await adapter.executeAction(
        this.config,
        action.taskId,
        action.action,
        action.index
      );

      // 创建新任务
      const originalTask = this.tasks.get(action.taskId);
      const task: MJTask = {
        id: result.taskId,
        prompt: originalTask?.prompt || '',
        status: result.status || 'pending',
        timestamp: Date.now(),
      };

      this.tasks.set(task.id, task);
      
      // 如果不是立即完成，开始轮询
      if (result.status !== 'success') {
        this.pollTaskStatus(task.id);
      }

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
