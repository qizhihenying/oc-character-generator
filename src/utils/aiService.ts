// AI 服务集成 - 支持多个 AI 提供商
// GPT, DeepSeek, Gemini, Claude

export type AIProvider = 'openai' | 'deepseek' | 'gemini' | 'claude';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
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
7. ${options.enhanceDetails ? '大幅增强细节描述' : '适度优化'}`;

    const userPrompt = `请优化以下提示词：\n\n${options.prompt}\n\n${options.style ? `风格倾向：${options.style}` : ''}`;

    try {
      const result = await this.callAI(provider, config, systemPrompt, userPrompt);
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
      const result = await this.callAI(provider, config, systemPrompt, userPrompt);
      return result;
    } catch (error) {
      console.error('AI translation failed:', error);
      throw error;
    }
  }

  // 生成元素推荐
  async generateRecommendations(history: string[], preferences: any): Promise<string[]> {
    const provider = this.getAvailableProvider();
    if (!provider) {
      return [];
    }

    const config = this.configs.get(provider)!;

    const systemPrompt = `你是一个 AI 角色设计推荐专家。根据用户的历史记录和偏好，推荐合适的角色元素组合。

推荐规则：
1. 分析用户的历史偏好
2. 推荐相似但有创新的元素组合
3. 确保推荐的元素协调搭配
4. 每次推荐 5-10 个元素
5. 输出格式为 JSON 数组`;

    const userPrompt = `用户历史记录：\n${history.slice(-10).join('\n')}\n\n用户偏好：\n${JSON.stringify(preferences)}\n\n请推荐合适的元素组合。`;

    try {
      const result = await this.callAI(provider, config, systemPrompt, userPrompt);
      return JSON.parse(result);
    } catch (error) {
      console.error('AI recommendation failed:', error);
      return [];
    }
  }

  // 分析提示词
  async analyzePrompt(prompt: string): Promise<{
    elements: string[];
    style: string;
    mood: string;
    suggestions: string[];
  }> {
    const provider = this.getAvailableProvider();
    if (!provider) {
      throw new Error('No AI provider configured');
    }

    const config = this.configs.get(provider)!;

    const systemPrompt = `你是一个 AI 图像提示词分析专家。分析提示词的组成部分，并提供改进建议。

输出 JSON 格式：
{
  "elements": ["元素1", "元素2", ...],
  "style": "艺术风格",
  "mood": "整体氛围",
  "suggestions": ["建议1", "建议2", ...]
}`;

    const userPrompt = `请分析以下提示词：\n\n${prompt}`;

    try {
      const result = await this.callAI(provider, config, systemPrompt, userPrompt);
      return JSON.parse(result);
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw error;
    }
  }

  // 调用 AI API
  private async callAI(
    provider: AIProvider,
    config: AIConfig,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    switch (provider) {
      case 'openai':
        return this.callOpenAI(config, systemPrompt, userPrompt);
      case 'deepseek':
        return this.callDeepSeek(config, systemPrompt, userPrompt);
      case 'gemini':
        return this.callGemini(config, systemPrompt, userPrompt);
      case 'claude':
        return this.callClaude(config, systemPrompt, userPrompt);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  // OpenAI API
  private async callOpenAI(
    config: AIConfig,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    const model = config.model || 'gpt-3.5-turbo';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  // DeepSeek API (兼容 OpenAI 格式)
  private async callDeepSeek(
    config: AIConfig,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const baseUrl = config.baseUrl || 'https://api.deepseek.com/v1';
    const model = config.model || 'deepseek-chat';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  // Gemini API
  private async callGemini(
    config: AIConfig,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const model = config.model || 'gemini-pro';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  }

  // Claude API
  private async callClaude(
    config: AIConfig,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
    const model = config.model || 'claude-3-sonnet-20240229';

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  }

  // 获取可用的提供商
  private getAvailableProvider(): AIProvider | null {
    const providers: AIProvider[] = ['openai', 'deepseek', 'gemini', 'claude'];
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
      await this.callAI(provider, config, 'You are a helpful assistant.', 'Hello');
      return true;
    } catch (error) {
      return false;
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
      const response = await this.callAI(provider, config, systemPrompt, userPrompt);
      
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

  // 检查是否已配置 AI
  hasAIConfigured(): boolean {
    return this.configs.size > 0;
  }
}

export const aiService = new AIService();
