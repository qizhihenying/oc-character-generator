# 调试指南 - Midjourney 集成

## 🐛 问题：点击 AI 绘图后没有显示任务

### 已添加的调试功能

#### 1. **控制台日志**
打开浏览器开发者工具（F12），查看 Console 标签页，应该看到以下日志：

**提交任务时**：
```
Submitting imagine task... {botType: "MID_JOURNEY", prompt: "...", imageCount: 0}
MJ API: Task created and stored {id: "...", prompt: "...", status: "pending", ...}
MJ API: Total tasks: 1
MJ API: Dispatching task update event
Task submitted successfully: {id: "...", ...}
```

**Gallery 接收更新时**：
```
MJGallery: Task update event received Event {...}
MJGallery: Updated tasks [{id: "...", ...}]
```

#### 2. **成功提示**
任务提交成功后会弹出提示框：
```
✅ 绘图任务已提交！
任务ID: 1234567890
请在下方画板查看进度
```

### 🔍 调试步骤

#### 步骤 1：检查 API 配置
1. 打开配置面板
2. 点击"测试连接"
3. 确认显示"连接成功"

#### 步骤 2：提交任务
1. 生成一个提示词
2. 点击"AI 绘图"按钮
3. 观察控制台输出

#### 步骤 3：检查日志

**如果看到**：
```
Submitting imagine task...
MJ API: Task created and stored
```
说明任务创建成功。

**如果看到**：
```
MJ API: Dispatching task update event
MJGallery: Task update event received
```
说明事件触发成功。

**如果看到**：
```
MJGallery: Updated tasks [...]
```
说明 Gallery 已更新，但可能 UI 没有刷新。

### 🔧 常见问题排查

#### 问题 1：没有看到任何日志
**可能原因**：
- 代码没有重新编译
- 浏览器缓存没有清除

**解决方法**：
1. 停止开发服务器（Ctrl+C）
2. 运行 `npm run dev`
3. 硬刷新浏览器（Ctrl+Shift+R）

#### 问题 2：看到 "Task created" 但没有 "Task update event received"
**可能原因**：
- 事件监听器没有正确注册
- Gallery 组件没有挂载

**解决方法**：
1. 检查 App.tsx 中是否渲染了 MJGallery 组件
2. 检查控制台是否有 React 错误

#### 问题 3：看到 "Task update event received" 但 UI 没有更新
**可能原因**：
- React 状态更新问题
- tasks 数组为空

**解决方法**：
1. 在控制台输入：`mjAPI.getAllTasks()`
2. 查看返回的任务列表
3. 检查 Gallery 的渲染逻辑

#### 问题 4：提交失败
**可能原因**：
- API Key 错误
- 网络问题
- API 额度不足

**解决方法**：
1. 查看控制台错误信息
2. 重新测试连接
3. 检查 API 服务商账户

### 📊 手动测试命令

在浏览器控制台中执行：

```javascript
// 1. 检查 API 配置
mjAPI.isConfigured()
// 应该返回 true

// 2. 查看所有任务
mjAPI.getAllTasks()
// 应该返回任务数组

// 3. 手动触发事件
window.dispatchEvent(new CustomEvent('mj-task-update'))
// 应该看到 Gallery 更新

// 4. 检查任务数量
mjAPI.getAllTasks().length
// 应该返回任务数量
```

### 🎯 预期行为

#### 正常流程：
1. 用户点击"AI 绘图"
2. 控制台显示 "Submitting imagine task..."
3. API 返回任务 ID
4. 控制台显示 "Task created and stored"
5. 触发 "mj-task-update" 事件
6. Gallery 接收事件并更新
7. 控制台显示 "Updated tasks"
8. UI 显示任务卡片
9. 弹出成功提示框

#### 任务卡片应该显示：
- 提示词（截断显示）
- 状态：等待中 / 生成中 / 完成 / 失败
- 进度条（如果生成中）
- 时间戳

### 🚨 如果仍然不工作

#### 最后的检查清单：
- [ ] 已运行 `npm run dev`
- [ ] 已清除浏览器缓存
- [ ] 已打开开发者工具
- [ ] API 测试连接成功
- [ ] 控制台没有错误
- [ ] MJGallery 组件已渲染
- [ ] 事件监听器已注册

#### 提供反馈时请包含：
1. 控制台完整日志
2. 网络请求详情（Network 标签）
3. API 配置信息（隐藏 Key）
4. 浏览器版本
5. 操作系统

### 📝 临时解决方案

如果 UI 不更新，可以手动刷新：

```javascript
// 在控制台执行
window.dispatchEvent(new CustomEvent('mj-task-update'))
```

或者刷新整个页面（F5）。

---

**提示**：调试日志会在生产版本中移除，仅用于开发调试。

🔧 祝调试顺利！
