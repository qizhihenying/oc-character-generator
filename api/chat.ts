import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Serverless Function - AI 代理服务
// 用于保护 API Key，避免在前端暴露

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider, systemPrompt, userPrompt, model } = req.body;

    // 验证必需参数
    if (!provider || !systemPrompt || !userPrompt) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 从环境变量获取 API Key
    const apiKey = getApiKey(provider);
    if (!apiKey) {
      return res.status(500).json({ error: `API key not configured for ${provider}` });
    }

    // 调用对应的 AI 服务
    let result: string;
    switch (provider) {
      case 'openai':
        result = await callOpenAI(apiKey, systemPrompt, userPrompt, model);
        break;
      case 'deepseek':
        result = await callDeepSeek(apiKey, systemPrompt, userPrompt, model);
        break;
      case 'gemini':
        result = await callGemini(apiKey, systemPrompt, userPrompt, model);
        break;
      case 'claude':
        result = await callClaude(apiKey, systemPrompt, userPrompt, model);
        break;
      default:
        return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }

    return res.status(200).json({ result });
  } catch (error: any) {
    console.error('AI API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}

// 获取 API Key
function getApiKey(provider: string): string | undefined {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY;
    case 'deepseek':
      return process.env.DEEPSEEK_API_KEY;
    case 'gemini':
      return process.env.GEMINI_API_KEY;
    case 'claude':
      return process.env.CLAUDE_API_KEY;
    default:
      return undefined;
  }
}

// OpenAI API
async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model?: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// DeepSeek API
async function callDeepSeek(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model?: string
): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`DeepSeek API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Gemini API
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model?: string
): Promise<string> {
  const modelName = model || 'gemini-pro';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

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
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}

// Claude API
async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model?: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model || 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text.trim();
}
