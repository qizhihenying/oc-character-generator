# 🚀 Vercel 更新部署完整指南

## 📋 目录
1. [首次部署到 Vercel](#首次部署到-vercel)
2. [如何更新已部署的网站](#如何更新已部署的网站)
3. [自动部署流程](#自动部署流程)
4. [手动触发部署](#手动触发部署)
5. [常见问题解决](#常见问题解决)

---

## 🎯 首次部署到 Vercel

### 前提条件
- ✅ 已有 GitHub 账号
- ✅ 代码已推送到 GitHub 仓库
- ✅ 本地测试通过

### 步骤 1: 注册并连接 Vercel

1. **访问 Vercel 官网**
   ```
   https://vercel.com
   ```

2. **使用 GitHub 登录**
   - 点击 "Sign Up" 或 "Login"
   - 选择 "Continue with GitHub"
   - 授权 Vercel 访问你的 GitHub 账号

### 步骤 2: 导入项目

1. **创建新项目**
   - 登录后，点击 "Add New..." → "Project"
   - 或直接访问：https://vercel.com/new

2. **选择仓库**
   - 在列表中找到 `oc-character-generator`
   - 点击 "Import"

3. **配置项目设置**
   Vercel 会自动检测到 Vite 项目，默认配置如下：
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
   
   ✅ **通常不需要修改这些设置**

### 步骤 3: 配置环境变量（可选）

如果你的项目使用了 AI 服务（如 DeepSeek API），需要配置环境变量：

1. 在部署前，点击 "Environment Variables"
2. 添加以下变量：
   ```
   DEEPSEEK_API_KEY = sk-your-api-key-here
   ```

### 步骤 4: 部署

1. **开始部署**
   - 点击 "Deploy" 按钮
   - 等待 1-3 分钟

2. **部署完成**
   - 看到 "🎉 Congratulations!" 表示部署成功
   - 获得你的网站地址，例如：
     ```
     https://oc-character-generator.vercel.app
     ```

3. **访问网站**
   - 点击 "Visit" 或直接访问上面的地址
   - 测试所有功能是否正常

---

## 🔄 如何更新已部署的网站

### 方法一：自动部署（推荐 ⭐⭐⭐⭐⭐）

**最简单的方式！** Vercel 会自动监听你的 GitHub 仓库，每次推送代码都会自动重新部署。

#### 完整流程：

1. **在本地修改代码**
   ```bash
   # 例如：修改了某个组件或添加了新功能
   # 编辑文件...
   ```

2. **本地测试（推荐）**
   ```bash
   # 启动开发服务器测试
   npm run dev
   
   # 或者构建并预览
   npm run build
   npm run preview
   ```

3. **提交代码到 Git**
   ```bash
   # 查看修改的文件
   git status
   
   # 添加所有修改的文件
   git add .
   
   # 提交修改（写清楚修改内容）
   git commit -m "添加模型名称配置字段"
   
   # 推送到 GitHub
   git push origin main
   ```
   
   💡 **注意**：如果你的主分支是 `master`，使用 `git push origin master`

4. **等待自动部署**
   - 推送成功后，Vercel 会自动检测到更新
   - 自动开始构建和部署
   - 通常需要 1-3 分钟

5. **查看部署状态**
   - 访问 Vercel 控制台：https://vercel.com/dashboard
   - 找到你的项目
   - 在 "Deployments" 标签页查看部署进度
   - 部署成功后会显示 "Ready"

6. **访问更新后的网站**
   - 部署完成后，直接访问你的网站地址
   - 刷新页面即可看到更新

#### 自动部署流程图：
```
本地修改代码
    ↓
git add & commit
    ↓
git push 到 GitHub
    ↓
Vercel 自动检测到更新
    ↓
自动构建项目 (npm run build)
    ↓
自动部署到生产环境
    ↓
网站更新完成 ✅
```

### 方法二：手动触发部署

如果自动部署没有触发，可以手动触发：

1. **访问 Vercel 控制台**
   ```
   https://vercel.com/dashboard
   ```

2. **选择项目**
   - 点击 `oc-character-generator` 项目

3. **手动部署**
   - 点击 "Deployments" 标签
   - 点击右上角的 "Redeploy" 按钮
   - 选择 "Redeploy with existing Build Cache" 或 "Redeploy without Cache"
   - 确认部署

### 方法三：从 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   # 部署到预览环境
   vercel
   
   # 部署到生产环境
   vercel --prod
   ```

---

## 🤖 自动部署流程详解

### Vercel 的自动部署机制

Vercel 通过 **GitHub Integration** 实现自动部署：

1. **监听 GitHub 仓库**
   - Vercel 会监听你指定的 GitHub 仓库
   - 默认监听 `main` 或 `master` 分支

2. **触发条件**
   - 当你 `git push` 代码到 GitHub
   - Vercel 会立即收到 webhook 通知
   - 自动开始构建流程

3. **构建过程**
   ```
   1. 拉取最新代码
   2. 安装依赖 (npm install)
   3. 运行构建命令 (npm run build)
   4. 部署构建产物 (dist 目录)
   5. 更新生产环境
   ```

4. **部署完成**
   - 自动更新你的网站
   - 保留历史版本（可回滚）
   - 发送部署通知（如果配置了）

### 查看部署日志

1. **访问项目控制台**
   ```
   https://vercel.com/你的用户名/oc-character-generator
   ```

2. **查看部署列表**
   - 点击 "Deployments" 标签
   - 每次部署都会显示在列表中

3. **查看详细日志**
   - 点击某个部署记录
   - 查看 "Building" 和 "Deployment" 日志
   - 如果部署失败，这里会显示错误信息

---

## 🎯 完整更新示例

### 场景：添加了新功能，需要更新到线上

```bash
# 1. 确保在正确的分支
git branch
# 应该显示 * main 或 * master

# 2. 查看当前状态
git status
# 会显示修改的文件

# 3. 添加所有修改
git add .

# 4. 提交修改（写清楚做了什么）
git commit -m "feat: 添加Midjourney API模型名称配置字段

- 在 MJConfig 接口中添加 modelName 字段
- 在配置界面添加模型名称输入框
- 支持各种中转API提供商的模型配置"

# 5. 推送到 GitHub
git push origin main

# 6. 等待 Vercel 自动部署（1-3分钟）
# 可以访问 https://vercel.com/dashboard 查看进度

# 7. 部署完成后，访问你的网站
# https://你的项目名.vercel.app
```

---

## 🔍 验证更新是否成功

### 方法一：检查部署状态

1. 访问 Vercel 控制台
2. 查看最新的部署记录
3. 确认状态为 "Ready"

### 方法二：访问网站测试

1. 打开你的网站
2. 强制刷新页面（Ctrl + F5 或 Cmd + Shift + R）
3. 测试新功能是否生效

### 方法三：检查版本号

如果你在代码中添加了版本号：
```typescript
// 在某个组件中显示版本号
const VERSION = '2.2.1';
```

访问网站后检查版本号是否更新。

---

## 🚨 常见问题解决

### 问题 1: 推送代码后没有自动部署

**可能原因：**
- GitHub 和 Vercel 的连接断开
- 推送到了错误的分支
- Vercel 项目设置中禁用了自动部署

**解决方法：**
```bash
# 1. 检查当前分支
git branch

# 2. 确认推送到正确的分支
git push origin main  # 或 master

# 3. 检查 Vercel 设置
# 访问项目设置 → Git → 确认 Production Branch 设置正确

# 4. 手动触发部署
# 在 Vercel 控制台点击 "Redeploy"
```

### 问题 2: 部署失败

**查看错误日志：**
1. 访问 Vercel 控制台
2. 点击失败的部署记录
3. 查看 "Building" 日志中的错误信息

**常见错误：**

#### 错误 A: 构建失败
```
Error: Build failed
```

**解决方法：**
```bash
# 在本地测试构建
npm run build

# 如果本地构建失败，修复错误后重新推送
```

#### 错误 B: 依赖安装失败
```
Error: npm install failed
```

**解决方法：**
```bash
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装依赖
npm install

# 提交更新的 package-lock.json
git add package-lock.json
git commit -m "fix: 更新依赖锁定文件"
git push
```

#### 错误 C: TypeScript 类型错误
```
Error: Type error
```

**解决方法：**
```bash
# 在本地运行类型检查
npm run build

# 修复所有类型错误后重新推送
```

### 问题 3: 网站更新了但看不到变化

**原因：** 浏览器缓存

**解决方法：**
```
1. 强制刷新页面
   - Windows: Ctrl + F5
   - Mac: Cmd + Shift + R
   
2. 清除浏览器缓存
   - Chrome: 设置 → 隐私和安全 → 清除浏览数据
   
3. 使用无痕模式测试
   - Chrome: Ctrl + Shift + N
   - Firefox: Ctrl + Shift + P
```

### 问题 4: 环境变量没有生效

**解决方法：**
1. 访问 Vercel 项目设置
2. 点击 "Environment Variables"
3. 确认变量已添加
4. 重新部署项目（环境变量更新后需要重新部署）

### 问题 5: 部署成功但页面空白

**可能原因：**
- 路由配置错误
- 资源路径错误

**解决方法：**
```typescript
// 检查 vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/', // 确保是 '/' 而不是仓库名
  // ...
})
```

---

## 📊 部署最佳实践

### 1. 提交信息规范

使用清晰的提交信息：
```bash
# 好的提交信息 ✅
git commit -m "feat: 添加模型名称配置字段"
git commit -m "fix: 修复API调用错误"
git commit -m "docs: 更新部署文档"

# 不好的提交信息 ❌
git commit -m "update"
git commit -m "fix bug"
git commit -m "修改"
```

### 2. 本地测试后再部署

```bash
# 推荐的工作流程
npm run dev        # 开发时测试
npm run build      # 构建前测试
npm run preview    # 预览构建结果
git push           # 确认无误后推送
```

### 3. 使用分支管理

```bash
# 创建功能分支
git checkout -b feature/add-model-name

# 开发和测试
# ...

# 合并到主分支
git checkout main
git merge feature/add-model-name
git push origin main
```

### 4. 监控部署状态

- 配置 Vercel 通知（邮件或 Slack）
- 定期检查部署日志
- 使用 Vercel Analytics 监控网站性能

---

## 🎯 快速参考

### 常用命令

```bash
# 查看状态
git status

# 添加文件
git add .
git add 文件名

# 提交
git commit -m "提交信息"

# 推送
git push origin main

# 拉取最新代码
git pull origin main

# 查看提交历史
git log --oneline

# 撤销修改
git checkout -- 文件名

# 回退到上一个提交
git reset --hard HEAD^
```

### Vercel 控制台快捷链接

```
控制台首页: https://vercel.com/dashboard
项目设置: https://vercel.com/你的用户名/项目名/settings
部署列表: https://vercel.com/你的用户名/项目名/deployments
环境变量: https://vercel.com/你的用户名/项目名/settings/environment-variables
域名设置: https://vercel.com/你的用户名/项目名/settings/domains
```

---

## 🎉 总结

### 更新网站的完整流程

1. **修改代码** → 在本地开发和测试
2. **提交代码** → `git add` + `git commit`
3. **推送代码** → `git push origin main`
4. **自动部署** → Vercel 自动检测并部署
5. **验证更新** → 访问网站确认更新成功

### 关键点

- ✅ 每次 `git push` 都会触发自动部署
- ✅ 部署通常需要 1-3 分钟
- ✅ 可以在 Vercel 控制台查看部署状态
- ✅ 部署失败时查看日志排查问题
- ✅ 强制刷新浏览器查看最新版本

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 Vercel 部署日志
2. 检查本地构建是否成功
3. 查阅 Vercel 官方文档：https://vercel.com/docs
4. 在 GitHub Issues 中提问

**祝你部署顺利！** 🚀
