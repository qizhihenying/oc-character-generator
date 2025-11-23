# 🚀 OC人设盲盒 - 在线部署说明

## 📋 快速开始

### 方案一：Vercel 一键部署（推荐）⭐⭐⭐⭐⭐

**3 步完成部署：**

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "准备部署"
   git push
   ```

2. **访问 Vercel 并导入项目**
   - 打开 https://vercel.com
   - 用 GitHub 登录
   - 点击 "New Project"
   - 选择 `oc-character-generator`
   - 点击 "Deploy"

3. **配置环境变量**
   - 在 Vercel 项目设置中添加：
   - `DEEPSEEK_API_KEY` = 你的 API Key

**完成！** 🎉 访问你的网站：`https://你的项目名.vercel.app`

---

## 📦 项目文件说明

### 新增文件
```
api/
  └── chat.ts                    # 后端 API（保护 API Key）

src/utils/
  └── aiService.online.ts        # 在线版 AI 服务

vercel.json                      # Vercel 配置
.env.example                     # 环境变量示例
```

### 配置文件
- `vercel.json` - Vercel 部署配置
- `.env.example` - 环境变量模板
- `package.json` - 已添加 @vercel/node 依赖

---

## 🔑 获取 API Key

### DeepSeek（推荐，便宜）
1. 访问：https://platform.deepseek.com/
2. 注册并创建 API Key
3. 价格：¥0.001/1K tokens

### 其他选项
- OpenAI：https://platform.openai.com/
- Gemini：https://makersuite.google.com/
- Claude：https://console.anthropic.com/

---

## ⚙️ 环境变量配置

在 Vercel 项目设置中添加：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | `sk-xxxxx` |
| `OPENAI_API_KEY` | OpenAI API 密钥（可选） | `sk-xxxxx` |
| `GEMINI_API_KEY` | Gemini API 密钥（可选） | `xxxxx` |
| `CLAUDE_API_KEY` | Claude API 密钥（可选） | `sk-ant-xxxxx` |

**注意**：至少配置一个 AI 服务的 API Key

---

## 🔧 本地测试

### 1. 安装依赖
```bash
npm install
```

### 2. 构建项目
```bash
npm run build
```

### 3. 预览
```bash
npm run preview
```

访问：http://localhost:4173

---

## 🌐 部署平台对比

| 平台 | 难度 | 速度 | 费用 | 推荐度 |
|------|------|------|------|--------|
| **Vercel** | ⭐ | ⭐⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐⭐ |
| **Netlify** | ⭐ | ⭐⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages** | ⭐⭐ | ⭐⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐ |
| **GitHub Pages** | ⭐⭐⭐ | ⭐⭐⭐⭐ | 免费 | ⭐⭐⭐ |

**推荐使用 Vercel**，因为：
- ✅ 支持 Serverless Functions
- ✅ 自动部署
- ✅ 免费额度充足
- ✅ 配置简单

---

## 🔒 安全说明

### ✅ 已实现的安全措施
1. **API Key 保护**
   - API Key 存储在服务器环境变量
   - 前端不暴露任何密钥
   - 通过后端代理调用 AI 服务

2. **HTTPS 加密**
   - Vercel 自动提供 HTTPS
   - 所有数据传输加密

3. **环境隔离**
   - 开发环境和生产环境分离
   - `.env` 文件不提交到 Git

---

## 📊 功能说明

### 无需 API 的功能
- ✅ 随机生成角色
- ✅ 选择风格和元素
- ✅ 导出图片
- ✅ 保存历史记录

### 需要 API 的功能
- ✅ AI 优化提示词
- ✅ 翻译提示词（中英互译）
- ✅ AI 生成详细人设
- ✅ 智能推荐

**注意**：即使不配置 API，基础功能仍然可用！

---

## 🆘 常见问题

### Q: 部署后页面空白？
**A**: 检查浏览器控制台错误，确认 `vite.config.ts` 的 `base` 配置

### Q: API 调用失败？
**A**: 
1. 检查 Vercel 环境变量是否配置
2. 检查 API Key 是否有效
3. 查看 Vercel Functions 日志

### Q: 如何更新网站？
**A**: 推送代码到 GitHub，Vercel 会自动重新部署

### Q: 如何查看日志？
**A**: Vercel 控制台 → Functions → 查看实时日志

### Q: 费用如何？
**A**: 
- Vercel：免费（个人使用完全够用）
- DeepSeek API：约 ¥10 可用很久

---

## 📚 详细文档

- 📖 [在线部署指南](./在线部署指南.md) - 完整教程
- 🚀 [快速部署指南](./快速部署指南.md) - 快速上手
- 📝 [部署总结](./部署总结.md) - 技术细节

---

## 🎯 部署检查清单

### 部署前
- [ ] 代码已推送到 GitHub
- [ ] 本地构建测试通过
- [ ] API Key 已准备好
- [ ] 已阅读部署文档

### 部署后
- [ ] 网站可以访问
- [ ] 基础功能正常
- [ ] AI 功能正常（如果配置了）
- [ ] 移动端显示正常

---

## 💡 提示

1. **首次部署**：建议先不配置 API，测试基础功能
2. **API 配置**：可以随时在 Vercel 添加环境变量
3. **自定义域名**：可以在 Vercel 绑定自己的域名
4. **自动部署**：每次推送代码都会自动更新网站

---

## 🎉 开始部署

选择你的部署方式：

### 方式一：完全自动（推荐）
```bash
# 1. 推送代码
git push

# 2. 在 Vercel 导入项目
# 3. 配置环境变量
# 完成！
```

### 方式二：本地测试后部署
```bash
# 1. 本地测试
npm run build
npm run preview

# 2. 确认无误后推送
git push

# 3. 在 Vercel 导入
# 完成！
```

---

**祝你部署顺利！** 🚀

如有问题，请查看详细文档或提交 Issue。
