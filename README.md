# OC人设盲盒 - AI图像提示词生成器

一个专为 AI 图像生成设计的原创角色（OC）人设随机生成工具，帮助你快速获得独特的角色设定灵感。

## ✨ 特性

- 🎲 **随机组合生成**：基于丰富的元素库随机组合生成独特的角色设定
- 🚫 **防重复机制**：智能避免短时间内生成重复的提示词
- 🎨 **专业提示词**：针对 Midjourney、Stable Diffusion 等 AI 工具优化
- 📱 **响应式设计**：支持桌面和移动设备
- 📋 **一键复制**：快速复制生成的提示词
- 📊 **历史记录**：查看和管理生成历史
- 💾 **导出功能**：支持导出历史记录为 JSON 文件

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

1. 点击"抽取人设盲盒"按钮
2. 系统会随机组合各种元素生成独特的角色设定
3. 点击"复制提示词"按钮复制完整的提示词
4. 将提示词粘贴到 AI 图像生成工具中使用

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
