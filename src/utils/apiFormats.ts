/**
 * API 格式定义
 * 支持多种不同的 API 提供商格式
 */

export type APIFormat = 'midjourney' | 'gemini' | 'custom';

export interface APIFormatConfig {
  id: APIFormat;
  name: string;
  description: string;
  endpoints: {
    submit: string;
    query?: string;
    action?: string;
  };
  requestFormat: 'midjourney' | 'gemini' | 'custom';
  requiresAuth: 'bearer' | 'query' | 'header';
}

/**
 * 预设的 API 格式配置
 */
export const API_FORMATS: Record<APIFormat, APIFormatConfig> = {
  midjourney: {
    id: 'midjourney',
    name: 'Midjourney 格式',
    description: '标准 Midjourney API 格式（支持大多数中转服务）',
    endpoints: {
      submit: '/mj/submit/imagine',
      query: '/mj/task/{taskId}/fetch',
      action: '/mj/submit/action',
    },
    requestFormat: 'midjourney',
    requiresAuth: 'bearer',
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini 图片生成',
    description: 'Google Gemini 图片生成 API',
    endpoints: {
      submit: '/v1beta/models/{model}:generateContent',
      query: '/v1beta/models/{model}:generateContent',
    },
    requestFormat: 'gemini',
    requiresAuth: 'query',
  },
  custom: {
    id: 'custom',
    name: '自定义格式',
    description: '自定义 API 接口格式',
    endpoints: {
      submit: '/custom/submit',
      query: '/custom/query/{taskId}',
    },
    requestFormat: 'custom',
    requiresAuth: 'bearer',
  },
};

/**
 * API 请求适配器接口
 */
export interface APIAdapter {
  /**
   * 提交绘图任务
   */
  submitTask(config: any, prompt: string, images?: string[]): Promise<any>;
  
  /**
   * 查询任务状态
   */
  queryTask(config: any, taskId: string): Promise<any>;
  
  /**
   * 执行操作（如放大、变体等）
   */
  executeAction?(config: any, taskId: string, action: string, index?: number): Promise<any>;
}

/**
 * Midjourney 格式适配器
 */
export class MidjourneyAdapter implements APIAdapter {
  async submitTask(config: any, prompt: string, images: string[] = []): Promise<any> {
    const url = `${config.baseUrl}${API_FORMATS.midjourney.endpoints.submit}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        botType: config.botType || 'MID_JOURNEY',
        prompt: prompt,
        base64Array: images,
        notifyHook: config.notifyHook || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.code !== 1) {
      throw new Error(data.description || '提交任务失败');
    }

    return {
      taskId: data.result,
      status: 'pending',
      rawResponse: data,
    };
  }

  async queryTask(config: any, taskId: string): Promise<any> {
    const url = `${config.baseUrl}${API_FORMATS.midjourney.endpoints.query?.replace('{taskId}', taskId)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`查询任务失败: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code !== 1) {
      throw new Error(data.description || '查询失败');
    }

    return {
      status: data.result.status,
      progress: data.result.progress,
      imageUrl: data.result.imageUrl,
      failReason: data.result.failReason,
      rawResponse: data,
    };
  }

  async executeAction(config: any, taskId: string, action: string, index?: number): Promise<any> {
    const url = `${config.baseUrl}${API_FORMATS.midjourney.endpoints.action}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        taskId: taskId,
        action: action,
        index: index,
      }),
    });

    if (!response.ok) {
      throw new Error(`操作失败: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code !== 1) {
      throw new Error(data.description || '操作失败');
    }

    return {
      taskId: data.result,
      status: 'pending',
      rawResponse: data,
    };
  }
}

/**
 * Gemini 格式适配器
 */
export class GeminiAdapter implements APIAdapter {
  async submitTask(config: any, prompt: string, _images: string[] = []): Promise<any> {
    const model = config.modelName || 'gemini-2.5-flash-image-preview';
    const endpoint = API_FORMATS.gemini.endpoints.submit.replace('{model}', model);
    const url = `${config.baseUrl}${endpoint}?key=${config.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: prompt,
          }],
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 请求失败: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Gemini 返回格式不同，需要提取图片
    const imageData = this.extractImageFromResponse(data);
    
    return {
      taskId: `gemini-${Date.now()}`, // Gemini 没有任务ID，生成一个
      status: 'success',
      imageUrl: imageData,
      rawResponse: data,
    };
  }

  async queryTask(_config: any, _taskId: string): Promise<any> {
    // Gemini 是同步的，不需要查询
    return {
      status: 'success',
      progress: '100',
      imageUrl: null,
      rawResponse: {},
    };
  }

  private extractImageFromResponse(data: any): string | null {
    try {
      // 从 Gemini 响应中提取图片数据
      const candidates = data.candidates || [];
      if (candidates.length > 0) {
        const parts = candidates[0].content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.mimeType?.startsWith('image/')) {
            // 返回 base64 图片
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to extract image from Gemini response:', error);
      return null;
    }
  }
}

/**
 * 自定义格式适配器
 */
export class CustomAdapter implements APIAdapter {
  async submitTask(config: any, prompt: string, images: string[] = []): Promise<any> {
    const url = `${config.baseUrl}${config.customEndpoints?.submit || '/submit'}`;
    
    // 使用用户自定义的请求格式
    const requestBody = config.customRequestFormat 
      ? this.buildCustomRequest(config.customRequestFormat, { prompt, images })
      : { prompt, images };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.requiresAuth === 'bearer') {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    } else if (config.requiresAuth === 'header') {
      headers['X-API-Key'] = config.apiKey;
    }

    const finalUrl = config.requiresAuth === 'query' 
      ? `${url}?key=${config.apiKey}` 
      : url;

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      taskId: data.id || data.taskId || `custom-${Date.now()}`,
      status: data.status || 'pending',
      rawResponse: data,
    };
  }

  async queryTask(config: any, taskId: string): Promise<any> {
    const endpoint = config.customEndpoints?.query || '/query/{taskId}';
    const url = `${config.baseUrl}${endpoint.replace('{taskId}', taskId)}`;
    
    const headers: Record<string, string> = {};

    if (config.requiresAuth === 'bearer') {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    } else if (config.requiresAuth === 'header') {
      headers['X-API-Key'] = config.apiKey;
    }

    const finalUrl = config.requiresAuth === 'query' 
      ? `${url}?key=${config.apiKey}` 
      : url;

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`查询任务失败: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      status: data.status || 'unknown',
      progress: data.progress || '0',
      imageUrl: data.imageUrl || data.image_url || data.url,
      rawResponse: data,
    };
  }

  private buildCustomRequest(format: string, data: any): any {
    try {
      // 支持 JSON 模板替换
      const template = JSON.parse(format);
      return this.replaceVariables(template, data);
    } catch (error) {
      return data;
    }
  }

  private replaceVariables(obj: any, data: any): any {
    if (typeof obj === 'string') {
      return obj.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.replaceVariables(item, data));
    }
    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const key in obj) {
        result[key] = this.replaceVariables(obj[key], data);
      }
      return result;
    }
    return obj;
  }
}

/**
 * 获取适配器
 */
export function getAdapter(format: APIFormat): APIAdapter {
  switch (format) {
    case 'midjourney':
      return new MidjourneyAdapter();
    case 'gemini':
      return new GeminiAdapter();
    case 'custom':
      return new CustomAdapter();
    default:
      return new MidjourneyAdapter();
  }
}
