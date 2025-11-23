# OC人设盲盒 - AI图像提示词生成器

一个专为 AI 图像生成设计的原创角色（OC）人设随机生成工具，帮助你快速获得独特的角色设定灵感。

## ✨ 特性

- 🎲 **随机组合生成**：基于丰富的元素库随机组合生成独特的角色设定
- 🖼️ **垫图参考**：上传参考图片，AI 自动分析并提取角色特征
- 🤖 **AI 智能分析**：自动识别发型、服装、风格等特征
- 🎨 **Midjourney 集成**：一键发送到 Midjourney 自动绘图（新功能！）
- 🖼️ **垫图支持**：上传参考图片，MJ 根据图片风格生成角色
- 📊 **画板展示**：实时显示绘图进度和结果
- ⚡ **MJ 操作**：支持 U1-U4、V1-V4、重绘等完整功能
- 🚫 **防重复机制**：智能避免短时间内生成重复的提示词
- 🎯 **高级选项**：色调、年龄、体型、表情等精细控制
- 🔄 **一致性模式**：生成系列角色，保持特征一致
- 📱 **响应式设计**：支持桌面和移动设备
- 📋 **一键复制**：快速复制生成的提示词
- 📊 **历史记录**：查看和管理生成历史
- 💾 **导出功能**：支持导出历史记录为 JSON 文件
- 🌓 **暗色模式**：支持明暗主题切换

## 🎯 元素类别

- **基础外貌**：年龄、性别、整体印象
- **发型发色**：各种发型和颜色组合
- **眼睛特征**：眼睛颜色和形状特点
- **服装风格**：从日常到奇幻的各种服装
- **性格特质**：丰富的性格描述
- **职业背景**：从现代到奇幻的各种职业
- **场景环境**：多样化的背景设置
- **特殊元素**：魔法、科技等特殊效果
- **艺术风格**：不同的绘画风格
- **画质修饰**：提升图像质量的关键词

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### Web 版本

#### 启动开发服务器
```bash
npm run dev
```

#### 构建生产版本
```bash
npm run build
```

### 桌面应用版本（Windows EXE）

#### 开发模式运行
```bash
npm run electron:dev
```

#### 打包为 Windows 安装程序
```bash
npm run dist
```

打包完成后，安装程序将生成在 `dist-electron` 目录下。

#### 仅打包不创建安装程序
```bash
npm run pack
```

## 🛠️ 技术栈

- **React 18** - 现代化的前端框架
- **TypeScript** - 类型安全的开发体验
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Vite** - 快速的构建工具
- **Lucide React** - 美观的图标库
- **Electron** - 跨平台桌面应用框架
- **Electron Builder** - 应用打包工具

## 📖 使用方法

### 基础使用
1. 点击"抽取人设盲盒"按钮
2. 系统会随机组合各种元素生成独特的角色设定
3. 点击"复制提示词"按钮复制完整的提示词
4. 将提示词粘贴到 AI 图像生成工具中使用

### 垫图参考
1. 点击"垫图参考"卡片上传参考图片
2. 配置 AI Vision API（首次使用需要）
3. 点击"AI 分析图片"按钮
4. 系统自动提取图片中的角色特征
5. 生成的角色会融入参考图片的特征

详细使用说明请查看 [IMAGE-REFERENCE-FEATURE.md](IMAGE-REFERENCE-FEATURE.md)

### Midjourney 自动绘图（新功能）
1. 配置 Midjourney API（点击设置图标）
2. 生成角色提示词
3. 选择 Bot 类型（Midjourney/Niji Journey）
4. （可选）上传垫图参考（最多 5 张）
5. 点击"AI 绘图"按钮
6. 在画板中查看生成进度和结果
7. 使用 U/V/重绘等功能进一步优化
8. 下载喜欢的图片

详细使用说明请查看 [MIDJOURNEY-INTEGRATION.md](MIDJOURNEY-INTEGRATION.md)

## 🎨 提示词示例

```
Anime male OC character sheet, dark purple messy hair with purple streaks, glowing purple eyes, wearing a black long coat with purple lining, cross accessories and chains, holding a black leather book, a raven perching on shoulder, watercolor ink wash style, dramatic shadow, white grid background, multiple angles (close-up, full body, bust), cool color palette, 8K --niji 6 --style expressive --ar 3:4
```

生成的提示词包含：
- 完整的角色描述（外貌、服装、配饰等）
- 艺术风格和光影效果
- 构图和背景设定
- Midjourney 技术参数（--niji/--v, --style, --ar 等）

## 🔧 自定义元素

你可以通过修改 `src/data/characterElements.ts` 文件来添加或修改元素：

```typescript
{
  category: "新类别",
  items: [
    "元素1",
    "元素2",
    "元素3"
  ]
}
```

## 📝 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 💡 使用建议

- 生成的提示词可以直接用于各种 AI 图像生成工具
- 如果某个元素不符合你的需求，可以手动修改提示词
- 建议保存喜欢的提示词组合以备后用
- 可以基于生成的提示词进行二次创作和修改

---

🎨 让创意无限，让每个角色都独一无二！
