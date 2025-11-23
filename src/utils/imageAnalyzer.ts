/**
 * 图片分析工具
 * 使用 AI 视觉模型分析参考图片，提取角色特征
 */

export interface ImageAnalysisResult {
  success: boolean;
  features: {
    gender?: string;
    hairStyle?: string;
    hairColor?: string;
    eyeColor?: string;
    outfit?: string;
    accessories?: string[];
    style?: string;
    colorTheme?: string;
    atmosphere?: string;
    pose?: string;
  };
  rawDescription?: string;
  error?: string;
}

export interface AIVisionConfig {
  provider: 'openai' | 'gemini' | 'deepseek' | 'custom';
  apiKey: string;
  baseURL?: string;
  model?: string;
}

class ImageAnalyzer {
  private config: AIVisionConfig | null = null;

  /**
   * 设置 AI 视觉配置
   */
  setConfig(config: AIVisionConfig) {
    this.config = config;
    // 保存到 localStorage
    localStorage.setItem('aiVisionConfig', JSON.stringify(config));
  }

  /**
   * 获取配置
   */
  getConfig(): AIVisionConfig | null {
    if (this.config) return this.config;
    
    const saved = localStorage.getItem('aiVisionConfig');
    if (saved) {
      try {
        this.config = JSON.parse(saved);
        return this.config;
      } catch (e) {
        console.error('Failed to parse AI vision config:', e);
      }
    }
    return null;
  }

  /**
   * 将图片文件转换为 base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(provider: string) {
    const defaults: Record<string, { baseURL: string; model: string }> = {
      openai: {
        baseURL: 'https://api.openai.com/v1',
        model: 'gpt-4o'
      },
      gemini: {
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        model: 'gemini-1.5-flash'
      },
      deepseek: {
        baseURL: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat'
      }
    };
    return defaults[provider] || { baseURL: '', model: '' };
  }

  /**
   * 分析图片
   */
  async analyzeImage(imageFile: File): Promise<ImageAnalysisResult> {
    const config = this.getConfig();
    
    if (!config || !config.apiKey) {
      return {
        success: false,
        features: {},
        error: '请先配置 AI 视觉 API'
      };
    }

    try {
      // 转换图片为 base64
      const base64Image = await this.fileToBase64(imageFile);
      
      // 构建分析提示词
      const analysisPrompt = `请仔细分析这张图片中的角色，提取以下特征信息（如果图片中没有角色，请说明）：

1. 性别（male/female）
2. 发型描述（如：长发、短发、马尾等）
3. 发色（如：黑色、金色、银色等）
4. 眼睛颜色
5. 服装风格和描述
6. 配饰（如：帽子、眼镜、首饰等）
7. 整体艺术风格（如：动漫、写实、水彩等）
8. 色调主题（如：暖色调、冷色调、黑白等）
9. 氛围感（如：神秘、活泼、优雅等）
10. 姿势或动作

请用JSON格式返回，格式如下：
{
  "gender": "male/female",
  "hairStyle": "发型描述",
  "hairColor": "发色",
  "eyeColor": "眼睛颜色",
  "outfit": "服装描述",
  "accessories": ["配饰1", "配饰2"],
  "style": "艺术风格",
  "colorTheme": "色调",
  "atmosphere": "氛围",
  "pose": "姿势",
  "description": "整体描述"
}`;

      // 根据不同的 provider 调用不同的 API
      let content: string;
      
      if (config.provider === 'gemini') {
        content = await this.analyzeWithGemini(base64Image, analysisPrompt, config);
      } else if (config.provider === 'deepseek') {
        content = await this.analyzeWithDeepSeek(base64Image, analysisPrompt, config);
      } else {
        // OpenAI 或自定义（使用 OpenAI 格式）
        content = await this.analyzeWithOpenAI(base64Image, analysisPrompt, config);
      }

      if (!content) {
        throw new Error('AI 返回内容为空');
      }

      // 尝试解析 JSON
      let parsedResult;
      try {
        // 提取 JSON 部分（可能包含在代码块中）
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('无法从响应中提取 JSON');
        }
      } catch (e) {
        // 如果解析失败，返回原始描述
        return {
          success: true,
          features: {},
          rawDescription: content,
          error: '无法解析 AI 返回的 JSON，但获得了文本描述'
        };
      }

      // 提取特征
      const features: ImageAnalysisResult['features'] = {
        gender: parsedResult.gender,
        hairStyle: parsedResult.hairStyle,
        hairColor: parsedResult.hairColor,
        eyeColor: parsedResult.eyeColor,
        outfit: parsedResult.outfit,
        accessories: Array.isArray(parsedResult.accessories) ? parsedResult.accessories : [],
        style: parsedResult.style,
        colorTheme: parsedResult.colorTheme,
        atmosphere: parsedResult.atmosphere,
        pose: parsedResult.pose
      };

      return {
        success: true,
        features,
        rawDescription: parsedResult.description || content
      };

    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        success: false,
        features: {},
        error: error instanceof Error ? error.message : '图片分析失败'
      };
    }
  }

  /**
   * 使用 OpenAI API 分析图片
   */
  private async analyzeWithOpenAI(base64Image: string, prompt: string, config: AIVisionConfig): Promise<string> {
    const defaults = this.getDefaultConfig('openai');
    const baseURL = config.baseURL || defaults.baseURL;
    const model = config.model || defaults.model;
    
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * 使用 Gemini API 分析图片
   */
  private async analyzeWithGemini(base64Image: string, prompt: string, config: AIVisionConfig): Promise<string> {
    const defaults = this.getDefaultConfig('gemini');
    const baseURL = config.baseURL || defaults.baseURL;
    const model = config.model || defaults.model;
    
    // 提取 base64 数据（去掉 data:image/xxx;base64, 前缀）
    const base64Data = base64Image.split(',')[1];
    const mimeType = base64Image.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
    
    // 构建正确的 Gemini API URL
    // 格式: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
    const apiUrl = `${baseURL}/models/${model}:generateContent?key=${config.apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Gemini API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  /**
   * 使用 DeepSeek API 分析图片
   * 注意：DeepSeek 目前不支持视觉功能，这里抛出友好的错误提示
   */
  private async analyzeWithDeepSeek(_base64Image: string, _prompt: string, _config: AIVisionConfig): Promise<string> {
    // DeepSeek 目前不支持图片分析功能
    throw new Error('DeepSeek 暂不支持图片分析功能，请选择 OpenAI 或 Gemini 服务商。\n\n推荐使用：\n• Google Gemini (免费额度大)\n• OpenAI GPT-4o (效果最好)');
  }

  /**
   * 检查配置是否有效
   */
  isConfigured(): boolean {
    const config = this.getConfig();
    return !!(config && config.apiKey);
  }
}

export const imageAnalyzer = new ImageAnalyzer();
