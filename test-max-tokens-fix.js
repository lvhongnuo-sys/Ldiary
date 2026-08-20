/**
 * LDiary max_tokens 修复验证测试
 * 在浏览器控制台直接运行此脚本
 */

(async function() {
  console.log('='.repeat(80));
  console.log('LDiary max_tokens 修复验证测试');
  console.log('='.repeat(80));
  console.log('');

  // 检查必要的全局变量
  if (typeof apiKey === 'undefined' || !apiKey) {
    console.error('❌ 错误：apiKey 未定义。请先在 LDiary 中配置 API Key');
    return;
  }

  if (typeof model === 'undefined' || !model) {
    console.error('❌ 错误：model 未定义。请先在 LDiary 中选择模型');
    return;
  }

  if (typeof getChatCompletionUrl === 'undefined') {
    console.error('❌ 错误：getChatCompletionUrl 函数未定义');
    return;
  }

  console.log('✅ 环境检查通过');
  console.log('API Key 已配置:', apiKey.substring(0, 10) + '...');
  console.log('当前模型:', model);
  console.log('API 端点:', getChatCompletionUrl());
  console.log('');

  console.log('='.repeat(80));
  console.log('测试：发送长内容生成请求（验证新的 max_tokens=4000）');
  console.log('='.repeat(80));
  console.log('');

  // 构造测试请求
  var testReqBody = {
    model: model,
    messages: [
      {role: 'system', content: '你是一个助手，请生成详细的长回复。'},
      {role: 'user', content: '请写一篇关于人工智能发展历史和未来前景的详细文章，内容要充分、完整。'}
    ],
    max_tokens: 4000,  // 新修改的值
    temperature: 0.85
  };

  console.log('【请求参数验证】');
  console.log('✅ Model:', testReqBody.model);
  console.log('✅ Max Tokens:', testReqBody.max_tokens, '← 新修改值（原为 1000）');
  console.log('✅ Messages Count:', testReqBody.messages.length);
  console.log('✅ Temperature:', testReqBody.temperature);
  console.log('');
  console.log('【完整 Request Body】');
  console.log(JSON.stringify(testReqBody, null, 2));
  console.log('');

  try {
    console.log('📤 发送请求到 API...');
    var res = await fetch(getChatCompletionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(testReqBody)
    });

    if (!res.ok) {
      var errBody = await res.text().catch(function(){return '';});
      console.error('❌ HTTP 错误:', res.status);
      console.error('错误响应:', errBody);
      return;
    }

    var data = await res.json();

    console.log('');
    console.log('='.repeat(80));
    console.log('📥 API 响应接收完成');
    console.log('='.repeat(80));
    console.log('');

    // 解析响应
    console.log('【响应格式检测】');
    var isOpenAI = data.choices && Array.isArray(data.choices);
    var isGemini = data.candidates && Array.isArray(data.candidates);

    if (isOpenAI) {
      console.log('✅ 响应格式：OpenAI/兼容格式');
      console.log('');
      console.log('【关键字段解析】');
      var choice = data.choices[0];
      console.log('Finish Reason:', choice.finish_reason);
      console.log('Content Type:', typeof choice.message.content);
      console.log('Content Length (字符数):', choice.message.content.length);
      console.log('');

      console.log('【截断检测】');
      if (choice.finish_reason === 'length') {
        console.log('⚠️  警告：回复被截断！finish_reason = "length"');
        console.log('原因：生成内容达到了 max_tokens 限制');
        console.log('🔧 解决方案：继续增加 max_tokens 值');
      } else if (choice.finish_reason === 'stop') {
        console.log('✅ 成功：回复正常完成，finish_reason = "stop"');
        console.log('💡 这表示 AI 自然结束了生成，没有被 token 限制截断');
      } else {
        console.log('ℹ️  finish_reason:', choice.finish_reason);
      }
      console.log('');

      if (data.usage) {
        console.log('【Token 统计】');
        console.log('Prompt Tokens (输入):', data.usage.prompt_tokens);
        console.log('Completion Tokens (输出):', data.usage.completion_tokens);
        console.log('Total Tokens:', data.usage.total_tokens);
        console.log('Max Tokens 限制:', testReqBody.max_tokens);
        console.log('使用率:', Math.round((data.usage.completion_tokens / testReqBody.max_tokens) * 100) + '%');
        console.log('');
      }

      console.log('【内容预览】');
      console.log('前 200 字符：');
      console.log('"' + choice.message.content.substring(0, 200) + '..."');
      console.log('');
      console.log('后 200 字符：');
      console.log('"...' + choice.message.content.substring(Math.max(0, choice.message.content.length - 200)) + '"');
      console.log('');

    } else if (isGemini) {
      console.log('✅ 响应格式：Gemini 格式');
      console.log('');
      console.log('【关键字段解析】');
      var candidate = data.candidates[0];
      console.log('Finish Reason:', candidate.finish_reason);
      console.log('Content Length (字符数):', candidate.content.parts[0].text.length);
      console.log('');

      console.log('【截断检测】');
      if (candidate.finish_reason === 'MAX_TOKENS') {
        console.log('⚠️  警告：回复被截断！finish_reason = "MAX_TOKENS"');
        console.log('原因：生成内容达到了 max_tokens 限制');
        console.log('🔧 解决方案：继续增加 max_tokens 值');
      } else if (candidate.finish_reason === 'STOP' || candidate.finish_reason === 'stop') {
        console.log('✅ 成功：回复正常完成');
        console.log('💡 这表示 AI 自然结束了生成，没有被 token 限制截断');
      } else {
        console.log('ℹ️  finish_reason:', candidate.finish_reason);
      }
      console.log('');

      console.log('【内容预览】');
      var fullText = candidate.content.parts[0].text;
      console.log('前 200 字符：');
      console.log('"' + fullText.substring(0, 200) + '..."');
      console.log('');
      console.log('后 200 字符：');
      console.log('"...' + fullText.substring(Math.max(0, fullText.length - 200)) + '"');

    } else {
      console.error('❌ 无法识别响应格式');
      console.log('Response keys:', Object.keys(data));
    }

    console.log('');
    console.log('【完整原始响应】');
    console.log(JSON.stringify(data, null, 2));

  } catch (e) {
    console.error('❌ 请求失败:', e.message);
    console.error('完整错误:', e);
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('测试完成');
  console.log('='.repeat(80));
})();
