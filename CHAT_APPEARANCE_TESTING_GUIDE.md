# 聊天外观设置 - 功能验证指南

## 🚀 快速开始

### 1. 访问聊天外观设置
```
菜单路径：设置 → 个性化设置 → 聊天外观
```

### 2. 实时预览
- 设置页面上方有"实时预览"区域
- 包含示例的用户消息和 AI 消息
- 修改任何参数后预览立即更新

### 3. 保存设置
- 调整完毕后点击"保存设置"按钮
- 设置立即应用到聊天页面所有消息
- 无需刷新页面

## ✅ 功能检查清单

### A. 头像设置
- [ ] **头像尺寸调节**
  - 移动滑块，预览中头像尺寸实时变化
  - 标签显示：小(≤40px) / 中(≤56px) / 大(>56px)
  - 范围：32px - 80px

- [ ] **头像形状选择**
  - 点击"圆形"：预览头像变为圆形 (border-radius: 50%)
  - 点击"圆角方形"：预览头像变为圆角方形 (border-radius: 12px)
  - 点击"方形"：预览头像变为方形 (border-radius: 0)
  - 只有一个按钮被激活（高亮显示）

### B. 气泡设置
- [ ] **最大宽度比例**
  - 移动滑块：预览消息气泡宽度变化
  - 范围：50% - 90%
  - 标签显示当前百分比

- [ ] **气泡圆角**
  - 移动滑块：预览气泡圆角变化
  - 范围：4px - 24px
  - 标签显示当前像素值

- [ ] **气泡 Padding**
  - 移动滑块：预览气泡内边距变化
  - 范围：6px - 16px
  - 标签显示当前像素值

### C. 颜色自定义
- [ ] **用户气泡颜色**
  - 点击颜色选择器
  - 选择任意颜色
  - 预览用户消息气泡颜色实时更新
  - 文字颜色自动调整（深色背景用白字，浅色背景用黑字）

- [ ] **AI 气泡颜色**
  - 点击颜色选择器
  - 选择任意颜色
  - 预览 AI 消息气泡颜色实时更新
  - 文字颜色自动调整

### D. 信息显示控制
- [ ] **显示用户名**
  - 打开开关：预览中用户消息显示名称
  - 关闭开关：预览中用户消息隐藏名称

- [ ] **显示 AI 名称**
  - 打开开关：预览中 AI 消息显示名称
  - 关闭开关：预览中 AI 消息隐藏名称

- [ ] **显示时间**
  - 打开开关：预览中显示时间信息
  - 关闭开关：预览中隐藏时间信息

### E. 操作按钮
- [ ] **恢复默认**
  - 点击按钮
  - 弹出确认对话框
  - 确认后所有设置恢复到默认值
  - 预览更新为默认效果

- [ ] **保存设置**
  - 调整完设置后点击
  - 页面返回到"设置"菜单
  - 弹出"设置已保存！"提示

## 🧪 集成测试

### Test 1: 设置保存并应用到聊天页面
```
步骤：
1. 打开聊天外观设置页面
2. 将头像尺寸改为 80px（大）
3. 选择"圆角方形"形状
4. 将气泡最大宽度改为 80%
5. 选择红色作为用户气泡颜色
6. 点击"保存设置"

预期结果：
- 返回设置页面
- 进入聊天页面
- 所有用户消息显示为：
  * 80px 的圆角方形头像
  * 80% 宽度的红色气泡
- 如果之前有 AI 消息，应用新设置
```

### Test 2: 新消息创建时应用设置
```
步骤：
1. 完成 Test 1
2. 在聊天框输入一条新消息
3. 点击发送

预期结果：
- 新消息立即显示新的外观设置
- 头像：80px 圆角方形
- 气泡：80% 宽度、红色
```

### Test 3: 页面刷新后设置保持
```
步骤：
1. 完成 Test 2
2. 按 F5 或 Ctrl+R 刷新页面

预期结果：
- 页面刷新后所有消息仍保持自定义设置
- 用户消息显示 80px 圆角方形头像和红色气泡
- 头像和气泡样式完全一致
```

### Test 4: 聊天历史恢复后应用设置
```
步骤：
1. 确保浏览器 localStorage 中有之前的聊天记录
2. 打开 Ldiary 应用

预期结果：
- 页面加载完成后
- 所有恢复的聊天消息应用了保存的外观设置
- 新旧消息样式一致
```

### Test 5: 恢复默认设置
```
步骤：
1. 打开聊天外观设置页面
2. 点击"恢复默认"按钮
3. 在弹出框中点击"确定"

预期结果：
- 所有滑块恢复默认值：
  * 头像尺寸：56
  * 气泡宽度：70%
  * 气泡圆角：16px
  * 气泡 Padding：10px
- 颜色恢复：
  * 用户气泡：#1c1c1e（深色）
  * AI 气泡：#ffffff（白色）
- 所有显示开关打开
- 预览显示默认效果
```

### Test 6: 多次切换设置
```
步骤：
1. 打开聊天外观设置
2. 调整到配置 A（如：小头像，蓝色气泡）
3. 保存
4. 重新打开设置
5. 调整到配置 B（如：大头像，绿色气泡）
6. 保存
7. 进入聊天页面验证

预期结果：
- 最新的配置 B 被应用
- 所有消息显示配置 B 的样式
```

### Test 7: 响应式设计
```
步骤：
1. 在不同设备/窗口大小测试
2. 调整浏览器窗口大小
3. 在移动设备上测试

预期结果：
- 设置页面在各种屏幕大小上正常显示
- 预览区域自适应
- 控件可以正常操作
- 气泡宽度百分比正确响应
```

## 🔍 边界情况测试

### 1. 极端颜色组合
```
测试：选择非常相似的用户和 AI 气泡颜色
预期：文字仍然可读（对比度自动调整）
```

### 2. 极端尺寸
```
测试：
- 头像尺寸最小（32px）和最大（80px）
- 气泡宽度最小（50%）和最大（90%）
预期：所有消息正确渲染，无错位或溢出
```

### 3. 长消息
```
测试：发送很长的消息文本
预期：气泡宽度设置正确应用，文字正确换行
```

### 4. 快速连续操作
```
测试：快速调整多个参数，立即保存
预期：所有设置正确保存，无遗漏或冲突
```

## 📊 localStorage 验证

### 检查保存的设置
打开浏览器开发者工具（F12），在 Console 中运行：

```javascript
// 查看所有聊天外观设置
console.log('Avatar Size:', localStorage.getItem('ld_chat_avatar_size'));
console.log('Avatar Shape:', localStorage.getItem('ld_chat_avatar_shape'));
console.log('Bubble Max Width:', localStorage.getItem('ld_chat_bubble_max_width'));
console.log('Bubble Radius:', localStorage.getItem('ld_chat_bubble_radius'));
console.log('Bubble Padding:', localStorage.getItem('ld_chat_bubble_padding'));
console.log('User Bubble Color:', localStorage.getItem('ld_chat_user_bubble_color'));
console.log('AI Bubble Color:', localStorage.getItem('ld_chat_ai_bubble_color'));
console.log('Show Username:', localStorage.getItem('ld_chat_show_username'));
console.log('Show AI Name:', localStorage.getItem('ld_chat_show_ainame'));
console.log('Show Message Time:', localStorage.getItem('ld_chat_show_time'));

// 或者一次性查看所有设置对象
console.log(chatAppearanceSettings);
```

### 手动清除设置（测试用）
```javascript
// 清除所有聊天外观设置
localStorage.removeItem('ld_chat_avatar_size');
localStorage.removeItem('ld_chat_avatar_shape');
localStorage.removeItem('ld_chat_bubble_max_width');
localStorage.removeItem('ld_chat_bubble_radius');
localStorage.removeItem('ld_chat_bubble_padding');
localStorage.removeItem('ld_chat_user_bubble_color');
localStorage.removeItem('ld_chat_ai_bubble_color');
localStorage.removeItem('ld_chat_show_username');
localStorage.removeItem('ld_chat_show_ainame');
localStorage.removeItem('ld_chat_show_time');
```

## 🎯 性能检查

### 1. 页面加载时间
- 页面加载不应该明显变慢
- applyChatAppearanceSettings() 应该在 100ms 内完成

### 2. 预览响应时间
- 调整滑块时预览应该实时响应
- 无明显延迟

### 3. 大量消息处理
- 如果有 100+ 条消息，保存设置应该在 500ms 内完成
- 应用设置时无明显卡顿

## 📝 已知限制

1. **颜色选择器浏览器支持**
   - 某些旧浏览器可能不支持 `<input type="color">`
   - 现代浏览器（Chrome、Firefox、Safari、Edge）完全支持

2. **CSS 属性支持**
   - border-radius：所有现代浏览器支持
   - 无需浏览器前缀

3. **localStorage 限制**
   - 通常限制为 5-10MB
   - 聊天外观设置仅使用 ~500 字节

## 🚨 故障排除

### 问题 1：设置未保存
**症状：** 刷新后设置消失

**解决步骤：**
1. 检查浏览器是否允许 localStorage
2. 在开发者工具中查看 localStorage 中是否有 `ld_chat_*` 键
3. 尝试清除浏览器缓存后重试
4. 检查浏览器隐私模式是否启用

### 问题 2：预览不更新
**症状：** 调整滑块后预览区域未变化

**解决步骤：**
1. 刷新页面
2. 检查浏览器控制台是否有 JavaScript 错误
3. 确保 settings.js 已正确加载
4. 尝试在不同浏览器中测试

### 问题 3：新消息未应用设置
**症状：** 发送新消息后新消息不使用自定义样式

**解决步骤：**
1. 确保已保存设置
2. 刷新页面后重试
3. 检查 chatAppearanceSettings 对象是否正确初始化
4. 查看浏览器控制台是否有错误

### 问题 4：样式冲突
**症状：** 某些消息样式显示不正确

**解决步骤：**
1. 清除浏览器缓存和 CSS 缓存
2. 进行硬刷新（Ctrl+Shift+R）
3. 检查是否有浏览器扩展程序干扰
4. 在隐私窗口中测试

## ✨ 最佳实践

1. **定期检查**：每次更新后都在不同浏览器中测试
2. **清除缓存**：修改样式后清除浏览器缓存
3. **渐进式测试**：先测试单个功能，再测试集成
4. **记录设置**：保存喜欢的设置配置，以便快速恢复

## 📞 技术支持信息

如需帮助，请提供：
1. 浏览器版本（如 Chrome 120）
2. 操作步骤（如何重现问题）
3. 浏览器控制台中的错误信息
4. localStorage 中的设置值
5. 预期行为 vs 实际行为对比
