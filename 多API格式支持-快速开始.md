# 🚀 多 API 格式支持 - 快速开始

## ✅ 已完成的功能

### 1. 核心文件
- ✅ `src/utils/apiFormats.ts` - API 格式定义和适配器
- ✅ `src/utils/midjourneyAPI.ts` - 更新支持多格式
- ✅ `src/components/MJConfig.tsx` - 配置界面更新

### 2. 支持的 API 格式
- ✅ **Midjourney 格式** - 标准 MJ API
- ✅ **Gemini 图片生成** - Google Gemini
- ✅ **自定义格式** - 灵活配置

## 🎯 如何使用

### 对于 VectorEngine Gemini 服务

1. **打开 API 配置**
   - 点击 "配置 API" 按钮

2. **选择 Gemini 格式**
   ```
   API Key: 您的密钥
   API Base URL: https://api.vectorengine.ai
   API 格式: [选择] Gemini 图片生成
   模型名称: gemini-2.5-flash-image-preview
   ```

3. **保存并测试**
   - 点击 "测试连接"
   - 确认成功后保存

### 对于 Midjourney 中转服务

1. **打开 API 配置**

2. **选择 Midjourney 格式**
   ```
   API Key: 您的密钥
   API Base URL: https://api.example.com
   API 格式: [选择] Midjourney 格式
   模型名称: midjourney
   ```

3. **保存并测试**

## 📋 配置界面字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| API Key | ✅ | 从服务商获取 |
| API Base URL | ✅ | 服务基础地址 |
| **API 格式** | ✅ | **新增！选择格式** |
| 模型名称 | ⭕ | 可选，指定模型 |
| 回调地址 | ⭕ | 可选 |

## 🔄 更新到在线网站

```bash
# 1. 提交代码
git add .
git commit -m "feat: 添加多API格式支持，支持Gemini和Midjourney等多种服务"

# 2. 推送到 GitHub
git push origin main

# 3. 等待 Vercel 自动部署（1-3分钟）
```

## 🎨 界面预览

配置界面现在包含 API 格式选择器：

```
┌─────────────────────────────────┐
│ API 配置                        │
├─────────────────────────────────┤
│ API Key *                       │
│ [••••••••••••••••••••••••••]    │
│                                 │
│ API Base URL *                  │
│ [https://api.vectorengine.ai]   │
│                                 │
│ API 格式 * ⭐ 新增              │
│ [Gemini 图片生成] ▼             │
│ ├─ Midjourney 格式              │
│ ├─ Gemini 图片生成              │
│ └─ 自定义格式                   │
│                                 │
│ 模型名称 (可选)                 │
│ [gemini-2.5-flash-image-preview]│
│                                 │
│ 回调地址 (可选)                 │
│ [https://...]                   │
└─────────────────────────────────┘
```

## 💡 解决您的问题

### 之前的问题
- ❌ 503 错误 - API 格式不匹配
- ❌ 只支持 Midjourney 格式

### 现在的解决方案
- ✅ 支持多种 API 格式
- ✅ 前台自由选择
- ✅ 无需修改代码
- ✅ 支持 Gemini、Midjourney 等

## 📝 下一步

1. **测试新功能**
   ```bash
   npm run dev
   ```

2. **验证配置**
   - 打开配置界面
   - 选择 "Gemini 图片生成"
   - 填写您的配置
   - 测试连接

3. **部署到线上**
   ```bash
   git add .
   git commit -m "feat: 多API格式支持"
   git push
   ```

## 🎉 完成！

现在您可以：
- ✅ 使用 VectorEngine 的 Gemini 服务
- ✅ 使用任何 Midjourney 中转服务
- ✅ 自定义其他 API 服务
- ✅ 在前台自由切换

**开始使用吧！** 🚀
