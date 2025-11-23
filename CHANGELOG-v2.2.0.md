# 更新日志 v2.2.0

## 🎉 新功能

### 1. Midjourney API 集成
- ✅ 一键发送提示词到 Midjourney 自动绘图
- ✅ 实时显示绘图进度和结果
- ✅ 支持 Midjourney 和 Niji Journey 两种模式

### 2. 垫图功能
- ✅ 支持上传 1-5 张参考图片
- ✅ 自动转换为 base64 格式
- ✅ 直接发送给 Midjourney API
- ✅ 实时预览和删除功能

### 3. MJ 操作功能
- ✅ U1-U4：放大指定位置的图片
- ✅ V1-V4：生成指定位置的变体
- ✅ Reroll：重新生成整张图片
- ✅ Download：保存生成的图片

### 4. 画板展示
- ✅ 网格布局展示所有任务
- ✅ 实时状态更新（等待/生成中/完成/失败）
- ✅ 进度百分比显示
- ✅ 全屏查看功能

### 5. 测试连接功能（新增）
- ✅ 验证 API 配置是否正确
- ✅ 检查网络连接状态
- ✅ 显示详细的错误信息
- ✅ 避免配置错误导致的问题

## 🔧 修复和改进

### API 配置修复
- ✅ **修复默认 API 地址**：从 `https://api.midjourneyapi.xyz` 更正为 `https://api.vectorengine.ai`
- ✅ **添加测试连接功能**：配置前可以测试 API 是否可用
- ✅ **改进错误提示**：更友好的错误信息，帮助快速定位问题

### 功能区分
- ✅ **AI 分析垫图**：用于分析图片特征，影响提示词生成（需要 AI Vision API）
- ✅ **MJ 垫图**：直接发送图片给 Midjourney，影响图片生成（需要 MJ API）
- ✅ 两种功能互补，可以同时使用

## 📋 API 规范对照

### 请求格式
```yaml
POST /mj/submit/imagine
Headers:
  Authorization: Bearer {API_KEY}
  Content-Type: application/json
Body:
  botType: MID_JOURNEY | NIJI_JOURNEY  # 必需
  prompt: string                        # 必需
  base64Array: string[]                 # 可选
  notifyHook: string                    # 可选
  state: string                         # 可选
```

### 响应格式
```json
{
  "code": 1,
  "description": "Submit success",
  "result": "任务ID",
  "properties": {
    "discordChannelId": "...",
    "discordInstanceId": "..."
  }
}
```

## 🎯 使用流程

### 配置 API
1. 点击设置图标打开配置面板
2. 输入 API Key
3. 确认 Base URL：`https://api.vectorengine.ai`
4. **点击"测试连接"验证配置**
5. 测试成功后点击"保存配置"

### 开始绘图
1. 生成角色提示词
2. 选择 Bot 类型（MJ/Niji）
3. （可选）上传垫图参考
4. 点击"AI 绘图"
5. 在画板查看结果

## 🐛 已知问题

### 已修复
- ✅ API 地址错误导致连接失败
- ✅ 缺少测试连接功能
- ✅ 错误提示不够友好

### 待优化
- ⏳ 任务历史持久化存储
- ⏳ 批量下载功能
- ⏳ 成本统计功能

## 📝 文档更新

- ✅ `README.md` - 更新功能列表
- ✅ `MIDJOURNEY-INTEGRATION.md` - 完整使用指南
- ✅ `FEATURES-COMPARISON.md` - 功能对比说明
- ✅ `CHANGELOG-v2.2.0.md` - 本更新日志

## 🚀 下一步计划

- [ ] 支持 Blend 混合功能
- [ ] 支持 Describe 图生文
- [ ] 批量提交（连抽结果一键绘图）
- [ ] 任务历史导出
- [ ] 自定义参数配置

## 💡 使用建议

1. **首次使用**：
   - 配置 API 后先点击"测试连接"
   - 确认连接成功再开始使用

2. **垫图功能**：
   - AI 分析垫图：影响提示词生成
   - MJ 垫图：影响图片生成
   - 可以同时使用获得最佳效果

3. **错误处理**：
   - 遇到"Failed to fetch"：检查网络和 API 地址
   - 遇到"API 返回错误"：检查 API Key 和额度
   - 使用"测试连接"快速诊断问题

## 📞 反馈

如有问题或建议，欢迎反馈！

---

**版本**: v2.2.0  
**发布日期**: 2025-11-22  
**主要改进**: 修复 API 配置，新增测试连接功能

🎨 让 AI 绘图更简单，让创作更自由！
