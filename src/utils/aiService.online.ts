// AI 服务集成 - 在线版本（通过后端代理调用）
// 用于生产环境，保护 API Key

export type AIProvider = 'openai' | 'deepseek' | 'gemini' | 'claude';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string; // 在线版本不需要前端配置 API Key
  model?: string;
  baseUrl?: string;
}

export interface OptimizePromptOptions {
  prompt: string;
  language?: 'zh' | 'en';
  style?: string;
  enhanceDetails?: boolean;
}

export interface TranslateOptions {
  text: string;
  from: 'zh' | 'en';
  to: 'zh' | 'en';
}

class AIService {
  private configs: Map<AIProvider, AIConfig> = new Map();
  private apiEndpoint = '/api/chat'; // Vercel Serverless Function 端点

  // 设置 AI 配置
  setConfig(provider: AIProvider, config: AIConfig): void {
    this.configs.set(provider, config);
  }

  // 获取配置
  getConfig(provider: AIProvider): AIConfig | undefined {
    return this.configs.get(provider);
  }

  // 优化提示词
  async optimizePrompt(options: OptimizePromptOptions): Promise<string> {
    const provider = this.getAvailableProvider();
    if (!provider) {
      throw new Error('No AI provider configured');
    }

    const config = this.configs.get(provider)!;

    const systemPrompt = `你是一个专业的 AI 图像提示词优化专家。你的任务是优化用户提供的提示词，使其更加详细、准确、适合 AI 图像生成工具（如 Midjourney、Stable Diffusion）使用。

优化规则：
1. 保持原有的核心元素和风格
2. 添加更多视觉细节描述
3. 优化词语顺序，重要元素放在前面
4. 添加适当的艺术风格和技术参数
5. 确保语言流畅自然
6. ${options.language === 'en' ? '输出英文提示词' : '输出中文提示词'}
7. ${options.enhanceDetails ? '大幅增强细节描述' : '适度优化'}

请按照以下格式输出：
【优化后提示词】：优化后的完整提示词
【优化要点】：简要说明优化的关键点`;

    const userPrompt = `请优化以下提示词：\n\n${options.prompt}\n\n${options.style ? `风格倾向：${options.style}` : ''}`;

    try {
      const result = await this.callBackendAPI(provider, config, systemPrompt, userPrompt);
      return result;
    } catch (error) {
      console.error('AI optimization failed:', error);
      throw error;
    }
  }

  // 翻译提示词
  async translatePrompt(options: TranslateOptions): Promise<string> {
    const provider = this.getAvailableProvider();
    if (!provider) {
      throw new Error('No AI provider configured');
    }

    const config = this.configs.get(provider)!;

    const systemPrompt = `你是一个专业的 AI 图像提示词翻译专家。你的任务是将提示词从${options.from === 'zh' ? '中文' : '英文'}翻译为${options.to === 'zh' ? '中文' : '英文'}。

翻译规则：
1. 保持提示词的专业性和准确性
2. 保留技术参数（如 --niji, --ar 等）
3. 确保翻译后的提示词适合 AI 图像生成
4. 保持原有的风格和意境
5. 只输出翻译结果，不要添加额外说明`;

    const userPrompt = `请翻译以下提示词：\n\n${options.text}`;

    try {
      const result = await this.callBackendAPI(provider, config, systemPrompt, userPrompt);
      return result;
    } catch (error) {
      console.error('AI translation failed:', error);
      throw error;
    }
  }

  // 生成详细的角色人设（AI 增强）
  async generateDetailedCharacter(basicInfo: {
    name: string;
    gender: string;
    style: string;
    occupation: string;
    appearance: string;
    personality: string[];
  }): Promise<{
    detailedPersonality: string;
    detailedBackground: string;
    relationships: string;
    abilities: string;
    goals: string;
    fears: string;
    quirks: string;
  }> {
    const provider = this.getAvailableProvider();
    if (!provider) {
      throw new Error('请先配置 AI API 才能使用 AI 增强功能');
    }

    const config = this.configs.get(provider)!;

    const systemPrompt = `你是一个专业的角色设定创作专家。你的任务是根据基本信息，创作出详细、立体、有深度的角色人设。

要求：
1. 性格描述要具体、有层次，展现角色的复杂性
2. 背景故事要有起承转合，包含关键转折点
3. 人际关系要合理，符合角色设定
4. 能力特长要具体，避免空泛
5. 目标动机要清晰，推动角色发展
6. 恐惧弱点要真实，增加角色深度
7. 个人癖好要有趣，增加角色魅力

输出格式（JSON）：
{
  "detailedPersonality": "详细性格描述（200-300字）",
  "detailedBackground": "详细背景故事（300-500字）",
  "relationships": "人际关系网络（150-200字）",
  "abilities": "能力与特长（150-200字）",
  "goals": "目标与动机（100-150字）",
  "fears": "恐惧与弱点（100-150字）",
  "quirks": "个人癖好与习惯（100-150字）"
}`;

    const userPrompt = `请为以下角色创作详细人设：

基本信息：
- 姓名：${basicInfo.name}
- 性别：${basicInfo.gender}
- 风格：${basicInfo.style}
- 职业：${basicInfo.occupation}
- 外貌：${basicInfo.appearance}
- 性格关键词：${basicInfo.personality.join('、')}

请生成详细的角色人设，以 JSON 格式输出。`;

    try {
      const response = await this.callBackendAPI(provider, config, systemPrompt, userPrompt);
      
      // 尝试解析 JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // 如果无法解析，返回默认值
      throw new Error('AI 返回格式错误');
    } catch (error) {
      console.error('AI 生成详细人设失败:', error);
      throw error;
    }
  }

  // 调用后端 API（通过 Vercel Serverless Function）
  private async callBackendAPI(
    provider: AIProvider,
    config: AIConfig,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider,
          systemPrompt,
          userPrompt,
          model: config.model
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error: any) {
      console.error('Backend API call failed:', error);
      throw new Error(`AI 服务调用失败: ${error.message}`);
    }
  }

  // 获取可用的提供商
  private getAvailableProvider(): AIProvider | null {
    const providers: AIProvider[] = ['deepseek', 'openai', 'gemini', 'claude'];
    for (const provider of providers) {
      if (this.configs.has(provider)) {
        return provider;
      }
    }
    return null;
  }

  // 测试连接
  async testConnection(provider: AIProvider): Promise<boolean> {
    const config = this.configs.get(provider);
    if (!config) return false;

    try {
      await this.callBackendAPI(
        provider,
        config,
        'You are a helpful assistant.',
        'Hello'
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  // 检查是否已配置 AI
  hasAIConfigured(): boolean {
    return this.configs.size > 0;
  }
}

export const aiService = new AIService();
