# 真实Chat页面测试清单 - 统一变量控制

## 测试前准备
1. 清除浏览器缓存: Ctrl+Shift+Delete
2. 打开应用: index.html
3. 进入Chat页面
4. F12 打开DevTools

## 测试1: 短句渲染 ✓/✗
```
1. 输入: "好"
2. 按Enter发送
3. 检查:
   ✓ 气泡高度正常（无折叠）
   ✓ 文字完整
   ✓ 头像与气泡顶部对齐
```

## 测试2: 长句渲染 ✓/✗
```
1. 输入: "这是一条测试消息，用来验证长文本是否正确换行和自动调整高度"
2. 按Enter发送
3. 检查:
   ✓ 自动换行
   ✓ 高度自适应
   ✓ 头像始终顶部对齐
```

## 测试3: 颜色设置（未改颜色，只改透明度） ✓/✗
```
1. 打开设置 → 聊天外观
2. 用户气泡颜色: 保持 #1c1c1e (默认)
3. 调整透明度滑块到 50%
4. 点击保存
5. 回到Chat页面
6. 发送新消息: "透明度测试"
7. DevTools检查气泡样式:
   ✓ backgroundColor: 空 (使用CSS)
   ✓ opacity: 空 (使用CSS)
   ✓ 实际显示: 半透明 (50%)
```

## 测试4: 颜色设置（改颜色） ✓/✗
```
1. 打开设置 → 聊天外观
2. 用户气泡颜色改为: #3a8fba (蓝色)
3. 点击保存
4. 回到Chat页面
5. 发送新消息: "颜色测试"
6. DevTools检查气泡样式:
   ✓ backgroundColor: #3a8fba
   ✓ opacity: 1 (不透明)
   ✓ 实际显示: 蓝色(不透明)
7. 刷新页面 (F5)
8. 检查:
   ✓ 刷新后新消息仍然是蓝色
   ✓ 旧消息保持原样
```

## 测试5: 颜色改回默认+透明度生效 ✓/✗
```
1. 打开设置 → 聊天外观
2. 用户气泡颜色改回: #1c1c1e (默认)
3. 透明度改为: 80%
4. 点击保存
5. 回到Chat页面
6. 发送新消息: "透明度80%"
7. DevTools检查:
   ✓ backgroundColor: 空
   ✓ opacity: 空
   ✓ 实际显示: 80%透明
8. 刷新页面 (F5)
9. 检查:
   ✓ 刷新后透明度仍为80%
   ✓ 新消息应用了80%透明度
```

## 测试6: AI气泡颜色 ✓/✗
```
1. 打开设置 → 聊天外观
2. AI气泡颜色改为: #e8f5e9 (绿色)
3. 点击保存
4. 回到Chat页面
5. 随意输入消息，等待AI回复
6. 检查AI回复气泡:
   ✓ 显示为绿色(#e8f5e9)
   ✓ 不透明
7. 刷新页面
8. 检查AI消息仍为绿色
```

## 测试7: 刷新前后一致性 ✓/✗
```
设置1: 用户#3a8fba, AI#e8f5e9, 透明度90%

步骤1: 应用所有设置
步骤2: 发送消息验证样式
步骤3: 刷新页面 (Ctrl+F5强制刷新)
步骤4: 验证:
  ✓ 新消息应用相同设置
  ✓ 旧消息样式不变
  ✓ 设置面板值相同
```

## DevTools检查命令
```javascript
// 在Console中运行:

// 检查chatAppearanceSettings
console.log('chatAppearanceSettings:', chatAppearanceSettings);

// 检查localStorage
console.log('ld_chat_bubble_opacity:', localStorage.getItem('ld_chat_bubble_opacity'));
console.log('ld_chat_user_bubble_color:', localStorage.getItem('ld_chat_user_bubble_color'));
console.log('ld_chat_ai_bubble_color:', localStorage.getItem('ld_chat_ai_bubble_color'));

// 检查CSS变量
console.log('--bubble-opacity:', getComputedStyle(document.documentElement).getPropertyValue('--bubble-opacity'));

// 检查最后一个气泡
var lastBubble = document.querySelector('.msg-row:last-child .bubble');
console.log('最后气泡样式:', {
  backgroundColor: lastBubble.style.backgroundColor,
  opacity: lastBubble.style.opacity,
  computed: getComputedStyle(lastBubble).backgroundColor
});
```

## 完成标准
所有7个测试都通过，则修复完成✅
任何测试失败，则需要检查逻辑❌
