# 🎯 多 API 格式支持说明

## 📋 功能概述

现在软件支持多种 API 格式，您可以在前台自由选择和配置不同的 API 提供商，无需修改代码！

## 🎨 支持的 API 格式

### 1. Midjourney 格式（默认）
- **适用于**: 大多数 Midjourney 中转服务
- **接口格式**: `/mj/submit/imagine`
- **认证方式**: Bearer Token
- **特点**: 
  - 支持异步任务
  - 支持轮询查询
  - 支持 U1-U4、V1-V4 操作

**配置示例**:
```
API Key: sk-xxxxxxxxxxxxx
API Base URL: https://api.example.com
API 格式: Midjourney 格式
模型名称: midjourney (可选)
```

**适用服务商**:
- MidJourney API
- GoAPI
- 其他支持 Midjourney 格式的中转服务

---

### 2. Gemini 图片生成
- **适用于**: Google Gemini 图片生成服务
- **接口格式**: `/v1beta/models/{model}:generateContent`
- **认证方式**: Query Parameter (key=xxx)
- **特点**:
  - 同步返回结果
  - 支持文本和图片混合生成
  - 返回 base64 格式图片

**配置示例**:
```
API Key: AIzaSyXXXXXXXXXXXXXXXXXX
API Base URL: https://api.vectorengine.ai
API 格式: Gemini 图片生成
模型名称: gemini-2.5-flash-image-preview
```

**适用服务商**:
- Google AI Studio
- VectorEngine (Gemini 服务)
- 其他 Gemini API 中转服务

---

### 3. 自定义格式
- **适用于**: 其他自定义 API 服务
- **接口格式**: 可自定义
- **认证方式**: Bearer / Query / Header
- **特点**:
  - 完全自定义接口路径
  - 灵活的认证方式
  - 适配各种特殊 API

**配置示例**:
```
API Key: your-custom-key
API Base URL: https://custom-api.com
API 格式: 自定义格式
模型名称: custom-model
```

---

## 🔧 配置步骤

### 步骤 1: 打开 API 配置

点击界面上的 "配置 API" 按钮

### 步骤 2: 选择 API 格式

在 "API 格式" 下拉菜单中选择您的服务商类型：
- **Midjourney 格式** - 适用于大多数 MJ 中转服务
- **Gemini 图片生成** - 适用于 Google Gemini
- **自定义格式** - 适用于其他服务

### 步骤 3: 填写配置信息

根据您选择的格式，填写相应的配置：

#### 必填项
- **API Key**: 从服务商获取的密钥
- **API Base URL**: 服务的基础地址
- **API 格式**: 选择对应的格式

#### 可选项
- **模型名称**: 指定使用的模型（如 gemini-2.5-flash-image-preview）
- **回调地址**: 任务完成时的回调地址

### 步骤 4: 测试连接

点击 "测试连接" 按钮，验证配置是否正确

### 步骤 5: 保存配置

测试成功后，点击 "保存配置" 按钮

---

## 📝 配置示例

### 示例 1: 使用 VectorEngine 的 Gemini 服务

```
┌─────────────────────────────────────┐
│ API 配置                            │
├─────────────────────────────────────┤
│ API Key *                           │
│ [您的 VectorEngine API Key]         │
│                                     │
│ API Base URL *                      │
│ https://api.vectorengine.ai         │
│                                     │
│ API 格式 *                          │
│ [Gemini 图片生成] ▼                 │
│                                     │
│ 模型名称 (可选)                     │
│ gemini-2.5-flash-image-preview      │
│                                     │
│ 回调地址 (可选)                     │
│ (留空)                              │
└─────────────────────────────────────┘
```

### 示例 2: 使用 Midjourney 中转服务

```
┌─────────────────────────────────────┐
│ API 配置                            │
├─────────────────────────────────────┤
│ API Key *                           │
│ [您的 MJ API Key]                   │
│                                     │
│ API Base URL *                      │
│ https://api.midjourneyapi.io        │
│                                     │
│ API 格式 *                          │
│ [Midjourney 格式] ▼                 │
│                                     │
│ 模型名称 (可选)                     │
│ midjourney                          │
│                                     │
│ 回调地址 (可选)                     │
│ (留空)                              │
└─────────────────────────────────────┘
```

---

## 🎯 不同格式的区别

| 特性 | Midjourney 格式 | Gemini 图片生成 | 自定义格式 |
|------|----------------|----------------|-----------|
| **返回方式** | 异步（需轮询） | 同步（立即返回） | 取决于实现 |
| **任务状态** | 支持查询进度 | 无需查询 | 取决于实现 |
| **操作支持** | U1-U4, V1-V4 | 不支持 | 取决于实现 |
| **认证方式** | Bearer Token | Query Parameter | 可配置 |
| **适用场景** | MJ 风格图片 | AI 生成图片 | 通用 |

---

## 🔍 故障排查

### 问题 1: 503 错误

**原因**: API 格式选择错误

**解决方法**:
1. 确认您的服务商支持的 API 格式
2. 在配置中选择正确的 "API 格式"
3. 如果是 Gemini 服务，选择 "Gemini 图片生成"
4. 如果是 MJ 中转服务，选择 "Midjourney 格式"

### 问题 2: 认证失败

**原因**: API Key 或认证方式错误

**解决方法**:
1. 检查 API Key 是否正确
2. 确认 API Key 是否有效
3. 不同格式使用不同的认证方式：
   - Midjourney: Bearer Token
   - Gemini: Query Parameter
   - 自定义: 可配置

### 问题 3: 接口路径错误

**原因**: Base URL 配置错误

**解决方法**:
1. 确认 Base URL 不包含接口路径
2. 正确格式: `https://api.example.com`
3. 错误格式: `https://api.example.com/mj/submit/imagine`

---

## 💡 最佳实践

### 1. 选择合适的 API 格式

- **如果您使用 VectorEngine 的 Gemini 服务**
  - 选择 "Gemini 图片生成"
  - 模型名称填写: `gemini-2.5-flash-image-preview`

- **如果您使用 Midjourney 中转服务**
  - 选择 "Midjourney 格式"
  - 模型名称可以留空或填写 `midjourney`

- **如果您使用其他服务**
  - 先尝试 "Midjourney 格式"
  - 如果不行，选择 "自定义格式"

### 2. 测试配置

- 保存前先点击 "测试连接"
- 确认测试成功后再保存
- 如果测试失败，检查错误信息

### 3. 查看日志

- 打开浏览器控制台（F12）
- 查看 Console 标签页
- 查找错误信息和 API 调用日志

---

## 🚀 高级功能

### 自定义接口路径（即将支持）

未来版本将支持完全自定义接口路径，例如：

```typescript
{
  customEndpoints: {
    submit: '/custom/generate',
    query: '/custom/status/{taskId}',
    action: '/custom/action'
  }
}
```

### 多配置切换（即将支持）

未来版本将支持保存多个 API 配置，快速切换：

```
配置 1: VectorEngine Gemini
配置 2: MidJourney API
配置 3: 自定义服务
```

---

## 📞 需要帮助？

如果您在配置过程中遇到问题：

1. **查看错误信息**
   - 点击 "测试连接" 查看详细错误
   - 打开浏览器控制台查看日志

2. **确认服务商文档**
   - 查看您的 API 服务商文档
   - 确认接口格式和认证方式

3. **使用测试工具**
   - 打开项目中的 `test-api.html`
   - 测试不同的 API 格式

4. **联系支持**
   - 在 GitHub 提交 Issue
   - 提供详细的错误信息和配置

---

## 🎉 总结

通过多 API 格式支持，您现在可以：

- ✅ 自由选择不同的 API 服务商
- ✅ 无需修改代码即可切换格式
- ✅ 支持 Midjourney、Gemini 等多种服务
- ✅ 灵活配置认证和接口路径

**开始使用吧！** 🚀
