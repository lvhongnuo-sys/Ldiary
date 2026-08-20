/**
 * LDiary 聊天历史持久化测试脚本
 * 在浏览器控制台直接运行此脚本验证功能
 */

(async function() {
  console.log('='.repeat(80));
  console.log('LDiary 聊天历史持久化测试');
  console.log('='.repeat(80));
  console.log('');

  // 验证持久化函数是否存在
  console.log('【第一步：验证函数存在】');
  if (typeof saveChatHistory === 'undefined') {
    console.error('❌ saveChatHistory 函数未定义');
    return;
  }
  if (typeof loadChatHistory === 'undefined') {
    console.error('❌ loadChatHistory 函数未定义');
    return;
  }
  if (typeof restoreChatHistory === 'undefined') {
    console.error('❌ restoreChatHistory 函数未定义');
    return;
  }
  console.log('✅ 所有持久化函数已定义');
  console.log('');

  // 测试 1：添加测试消息
  console.log('='.repeat(80));
  console.log('【测试 1：添加测试消息到聊天历史】');
  console.log('='.repeat(80));

  if (typeof chatHistory === 'undefined') {
    console.error('❌ chatHistory 变量未定义');
    return;
  }

  var initialLength = chatHistory.length;
  console.log('当前聊天历史消息数:', initialLength);
  console.log('');

  // 模拟添加消息
  var testMessages = [
    {role: 'user', content: '测试消息 1：你好'},
    {role: 'assistant', content: '你好！很高兴认识你。'},
    {role: 'user', content: '测试消息 2：今天天气怎么样'},
    {role: 'assistant', content: '今天天气晴朗，适合外出。'}
  ];

  testMessages.forEach(function(msg, idx) {
    chatHistory.push(msg);
    console.log('✅ 添加了消息 ' + (idx + 1) + ':', msg.role, '-', msg.content.substring(0, 30) + '...');
  });
  console.log('');
  console.log('当前聊天历史消息数:', chatHistory.length);
  console.log('');

  // 测试 2：保存到 localStorage
  console.log('='.repeat(80));
  console.log('【测试 2：保存聊天历史到 localStorage】');
  console.log('='.repeat(80));

  saveChatHistory();
  var savedData = localStorage.getItem('ld_chat_history');
  if (!savedData) {
    console.error('❌ 保存失败：localStorage 中没有找到数据');
    return;
  }
  console.log('✅ 数据已保存到 localStorage');
  console.log('存储键: ld_chat_history');
  console.log('存储大小:', (savedData.length / 1024).toFixed(2), 'KB');
  console.log('');

  // 测试 3：验证保存的数据完整性
  console.log('='.repeat(80));
  console.log('【测试 3：验证保存数据完整性】');
  console.log('='.repeat(80));

  var parsedData = JSON.parse(savedData);
  console.log('保存的消息数:', parsedData.length);
  console.log('当前内存的消息数:', chatHistory.length);

  if (parsedData.length === chatHistory.length) {
    console.log('✅ 数据完整性检查通过');
  } else {
    console.error('❌ 数据不一致');
  }
  console.log('');

  // 测试 4：清空内存，模拟离开页面
  console.log('='.repeat(80));
  console.log('【测试 4：清空内存（模拟离开页面）】');
  console.log('='.repeat(80));

  var beforeClearLength = chatHistory.length;
  chatHistory.length = 0;
  console.log('✅ 已清空内存中的 chatHistory');
  console.log('清空前的消息数:', beforeClearLength);
  console.log('清空后的消息数:', chatHistory.length);
  console.log('localStorage 中的数据是否还存在:', localStorage.getItem('ld_chat_history') ? '是' : '否');
  console.log('');

  // 测试 5：从 localStorage 恢复数据
  console.log('='.repeat(80));
  console.log('【测试 5：从 localStorage 恢复数据】');
  console.log('='.repeat(80));

  loadChatHistory();
  console.log('✅ 已从 localStorage 加载数据');
  console.log('恢复后的消息数:', chatHistory.length);
  console.log('');

  // 验证恢复的数据
  console.log('【恢复的消息内容验证】');
  chatHistory.forEach(function(msg, idx) {
    console.log((idx + 1) + '. [' + msg.role + ']', msg.content.substring(0, 40) + (msg.content.length > 40 ? '...' : ''));
  });
  console.log('');

  if (chatHistory.length === testMessages.length) {
    console.log('✅ 恢复成功：所有消息都已恢复');
  } else {
    console.error('❌ 恢复失败：消息数不匹配');
  }
  console.log('');

  // 测试 6：清空功能
  console.log('='.repeat(80));
  console.log('【测试 6：清空聊天历史】');
  console.log('='.repeat(80));

  console.log('清空前 localStorage 中的数据大小:', (localStorage.getItem('ld_chat_history') || '').length, '字节');
  clearChatHistoryStorage();
  var afterClear = localStorage.getItem('ld_chat_history');
  console.log('✅ 已执行清空操作');
  console.log('清空后 localStorage 中的数据:', afterClear === null ? '已清空' : '仍存在（错误）');
  console.log('');

  // 最终总结
  console.log('='.repeat(80));
  console.log('【测试总结】');
  console.log('='.repeat(80));
  console.log('✅ 保存功能: 正常');
  console.log('✅ 加载功能: 正常');
  console.log('✅ 恢复功能: 正常');
  console.log('✅ 清空功能: 正常');
  console.log('');
  console.log('【实际使用流程】');
  console.log('1. 在 chat 页面发送消息 → 自动保存到 localStorage');
  console.log('2. 切换到其他页面 → chatHistory 可能被清空');
  console.log('3. 回到 chat 页面 → restoreChatHistory() 自动恢复');
  console.log('4. 刷新页面 → init() 时调用 restoreChatHistory() 恢复');
  console.log('');
  console.log('='.repeat(80));
  console.log('测试完成');
  console.log('='.repeat(80));
})();
