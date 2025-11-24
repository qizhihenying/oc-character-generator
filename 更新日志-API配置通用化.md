# 更新日志 - API 配置通用化

## 📅 更新时间
2025-11-24

## 🎯 更新目标
将 "Midjourney API 配置" 改为更通用的 "API 配置"，使软件支持各种中转API提供商。

## ✅ 修改内容

### 1. 配置界面标题更新
**文件**: `src/components/MJConfig.tsx`

- ✅ 标题：`Midjourney API 配置` → `API 配置`
- ✅ API Key 占位符：`输入你的 Midjourney API Key` → `输入你的 API Key`
- ✅ 说明文字：`从你的 Midjourney API 服务商获取` → `从你的 API 服务商获取`

### 2. API 服务文件更新
**文件**: `src/utils/midjourneyAPI.ts`

- ✅ 文件注释：`Midjourney API 服务` → `绘图 API 服务`
- ✅ 描述：`处理与第三方 Midjourney API 的交互` → `处理与第三方绘图 API 的交互（支持 Midjourney 和其他中转服务）`
- ✅ 错误信息：`Midjourney API 未配置` → `API 未配置`

### 3. 绘图按钮组件更新
**文件**: `src/components/MJDrawButton.tsx`

- ✅ 警告信息：`尚未配置 Midjourney API` → `尚未配置 API`

### 4. 新增功能
**文件**: `src/utils/midjourneyAPI.ts` 和 `src/components/MJConfig.tsx`

- ✅ 添加 `modelName` 字段到配置接口
- ✅ 在配置界面添加"模型名称"输入框
- ✅ 支持各种中转API提供商的模型配置

## 📋 配置界面字段

更新后的配置界面包含以下字段：

| 字段名称 | 是否必填 | 说明 |
|---------|---------|------|
| **API Key** | 必填 ⭐ | 从 API 服务商获取 |
| **API Base URL** | 必填 ⭐ | API 服务的基础地址 |
| **模型名称** | 可选 | 指定使用的模型名称，支持各种中转API提供商 |
| **回调地址** | 可选 | 任务完成时的回调地址 |

## 🎨 使用示例

### 示例 1: VectorEngine
```
API Key: sk-xxxxxxxxxxxxx
API Base URL: https://api.vectorengine.ai
模型名称: midjourney
回调地址: (留空)
```

### 示例 2: 其他中转服务商
```
API Key: your-api-key
API Base URL: https://your-provider.com/api
模型名称: niji-6 (或其他支持的模型)
回调地址: (留空)
```

### 示例 3: 自定义中转API
```
API Key: custom-key
API Base URL: https://custom-api.example.com
模型名称: custom-model-name
回调地址: https://your-domain.com/webhook
```

## 🔧 技术细节

### 接口定义
```typescript
export interface MJConfig {
  apiKey: string;
  baseUrl: string;
  modelName?: string; // 新增：模型名称，支持各种中转API提供商
  notifyHook?: string;
}
```

### 配置存储
- 配置保存在浏览器 `localStorage` 中
- 键名：`mj_api_config`
- API Key 仅保存在本地，不会上传到服务器

## 🌟 优势

1. **更通用** - 不再局限于 Midjourney，支持任何兼容的API服务
2. **更灵活** - 可以配置不同的模型名称
3. **更友好** - 界面文字更加通用和易懂
4. **向后兼容** - 现有配置仍然可以正常使用

## 📝 注意事项

1. **模型名称为可选字段**
   - 如果不填写，将使用默认值或 API 服务商的默认模型
   - 具体支持的模型名称请参考你的 API 服务商文档

2. **API Base URL 格式**
   - 必须包含完整的协议（http:// 或 https://）
   - 不要在末尾添加斜杠
   - 例如：`https://api.example.com`

3. **兼容性**
   - 确保你的 API 服务商兼容 Midjourney API 格式
   - 主要接口：`/mj/submit/imagine` 和 `/mj/task/{taskId}/fetch`

## 🚀 后续计划

- [ ] 添加更多预设的 API 服务商配置
- [ ] 支持多个 API 配置切换
- [ ] 添加 API 配置测试功能增强
- [ ] 支持更多绘图参数配置

## 📞 技术支持

如果在使用过程中遇到问题：
1. 检查 API Key 是否正确
2. 检查 API Base URL 是否可访问
3. 查看浏览器控制台的错误信息
4. 联系你的 API 服务商确认接口格式

---

**更新完成！** 🎉 现在软件支持更多的 API 服务商了！
