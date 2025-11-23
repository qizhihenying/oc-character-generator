# 🚀 配置 Git 并推送代码到 GitHub

## 步骤 1：配置 Git 用户信息

在命令行中运行以下命令（替换为你的信息）：

```bash
# 配置用户名
git config --global user.name "你的GitHub用户名"

# 配置邮箱（使用你的GitHub邮箱）
git config --global user.email "你的邮箱@example.com"
```

**示例：**
```bash
git config --global user.name "qizhihenying"
git config --global user.email "your-email@example.com"
```

---

## 步骤 2：提交代码

```bash
# 进入项目目录
cd d:\夸克下载\oc-character-generator

# 查看状态
git status

# 添加所有文件
git add .

# 提交
git commit -m "feat: 添加在线部署支持和完整功能

- 新增 Vercel Serverless Functions 后端 API
- 添加在线版 AI 服务（保护 API Key）
- 扩容所有风格数据库（757个数据项）
- 添加游戏风格卡片模板
- 添加图片上传和分析功能
- 添加 Midjourney 集成
- 添加卡片下载功能
- 完善文档和部署指南"
```

---

## 步骤 3：推送到 GitHub

### 方法一：如果仓库已存在
```bash
git push origin main
```

### 方法二：如果是新仓库
```bash
# 1. 在 GitHub 创建新仓库 oc-character-generator
# 2. 添加远程仓库
git remote add origin https://github.com/你的用户名/oc-character-generator.git

# 3. 推送代码
git branch -M main
git push -u origin main
```

---

## 步骤 4：验证

访问你的 GitHub 仓库，确认代码已上传：
```
https://github.com/你的用户名/oc-character-generator
```

---

## 🔧 常见问题

### Q1: 推送时要求输入用户名密码？
**A**: GitHub 已不支持密码认证，需要使用 Personal Access Token

**解决方法：**
1. 访问 GitHub Settings → Developer settings → Personal access tokens
2. 生成新 token（勾选 repo 权限）
3. 使用 token 作为密码

### Q2: 推送失败？
**A**: 检查：
1. 网络连接
2. 远程仓库地址是否正确
3. 是否有推送权限

### Q3: 文件太大无法推送？
**A**: GitHub 单文件限制 100MB，如果有大文件：
1. 使用 Git LFS
2. 或将大文件添加到 .gitignore

---

## 📝 完整命令清单

```bash
# 1. 配置 Git
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱"

# 2. 进入项目
cd d:\夸克下载\oc-character-generator

# 3. 添加文件
git add .

# 4. 提交
git commit -m "feat: 添加在线部署支持和完整功能"

# 5. 推送
git push origin main
```

---

## ✅ 推送成功后

1. **访问 GitHub 仓库**
   - 确认代码已上传
   - 查看文件列表

2. **开始部署**
   - 访问 https://vercel.com
   - 导入 GitHub 仓库
   - 配置环境变量
   - 部署！

3. **分享你的项目**
   - 获得在线地址
   - 分享给朋友使用

---

**准备好了吗？开始配置 Git 吧！** 🚀
