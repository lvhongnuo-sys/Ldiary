// LDiary DeepSeek Token 截断测试脚本
// 在浏览器控制台直接粘贴运行此代码

(async function() {
  console.log('='.repeat(80));
  console.log('LDiary DeepSeek Token 测试开始');
  console.log('='.repeat(80));

  // 从页面获取配置
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

  console.log('\n' + '='.repeat(80));
  console.log('测试 1：发送"50字建议"请求');
  console.log('='.repeat(80));

  // 测试请求体
  var testReqBody = {
    model: model,
    messages: [
      {role: 'system', content: '你是助手，回复简洁明了。'},
      {role: 'user', content: '请给我50字的建议'}
    ],
    max_tokens: 500,
    temperature: 0.85
  };

  console.log('\n【发送的 Request Body】');
  console.log('Model:', testReqBody.model);
  console.log('Max Tokens:', testReqBody.max_tokens);
  console.log('Messages Count:', testReqBody.messages.length);
  console.log('Full Body:', JSON.stringify(testReqBody, null, 2));

  try {
    console.log('\n发送请求中...');
    var res = await fetch(getChatCompletionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(testReqBody)
    });

    if (!res.ok) {
      var errBody = await res.text();
      console.error('❌ HTTP 错误:', res.status);
      console.error('错误响应:', errBody);
      return;
    }

    var data = await res.json();

    console.log('\n【API 原始返回】');
    console.log('Full Response:', JSON.stringify(data, null, 2));

    // 解析响应
    console.log('\n【关键字段解析】');

    if (data.choices && data.choices[0]) {
      console.log('✅ 响应格式：OpenAI');
      console.log('Finish Reason (原始):', data.choices[0].finish_reason);
      console.log('Content Length (字符数):', data.choices[0].message.content.length);
      console.log('Content Preview:', data.choices[0].message.content.substring(0, 100));

      if (data.usage) {
        console.log('\n【Token 统计】');
        console.log('Prompt Tokens:', data.usage.prompt_tokens);
        console.log('Completion Tokens:', data.usage.completion_tokens);
        console.log('Total Tokens:', data.usage.total_tokens);
      }
    } else if (data.candidates && data.candidates[0]) {
      console.log('✅ 响应格式：Gemini');
      console.log('Finish Reason (原始):', data.candidates[0].finish_reason);
      console.log('Content Length (字符数):', data.candidates[0].content.parts[0].text.length);
      console.log('Content Preview:', data.candidates[0].content.parts[0].text.substring(0, 100));
    } else {
      console.error('❌ 无法识别响应格式');
      console.log('Response keys:', Object.keys(data));
    }

  } catch (e) {
    console.error('❌ 请求失败:', e.message);
  }

  console.log('\n' + '='.repeat(80));
  console.log('测试 2：发送"1000字文章"请求（测试 max_tokens 限制）');
  console.log('='.repeat(80));

  var testReqBody2 = {
    model: model,
    messages: [
      {role: 'system', content: '你是助手，尽可能详细。'},
      {role: 'user', content: '请写一篇关于人工智能的1000字文章'}
    ],
    max_tokens: 500,
    temperature: 0.85
  };

  console.log('\n【发送的 Request Body】');
  console.log('Max Tokens:', testReqBody2.max_tokens);
  console.log('Full Body:', JSON.stringify(testReqBody2, null, 2));

  try {
    console.log('\n发送请求中...');
    var res2 = await fetch(getChatCompletionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(testReqBody2)
    });

    if (!res2.ok) {
      var errBody2 = await res2.text();
      console.error('❌ HTTP 错误:', res2.status);
      console.error('错误响应:', errBody2);
      return;
    }

    var data2 = await res2.json();

    console.log('\n【API 原始返回】');
    console.log('Full Response:', JSON.stringify(data2, null, 2));

    console.log('\n【关键字段解析】');

    if (data2.choices && data2.choices[0]) {
      console.log('✅ 响应格式：OpenAI');
      console.log('Finish Reason (原始):', data2.choices[0].finish_reason);
      console.log('Content Length (字符数):', data2.choices[0].message.content.length);
      console.log('Content Preview:', data2.choices[0].message.content.substring(0, 100) + '...');

      if (data2.usage) {
        console.log('\n【Token 统计】');
        console.log('Prompt Tokens:', data2.usage.prompt_tokens);
        console.log('Completion Tokens:', data2.usage.completion_tokens);
        console.log('Total Tokens:', data2.usage.total_tokens);
      }

      console.log('\n【截断检测】');
      if (data2.choices[0].finish_reason === 'length') {
        console.log('⚠️  回复被截断！finish_reason = "length"');
        console.log('📊 max_tokens 限制生效了');
      } else if (data2.choices[0].finish_reason === 'stop') {
        console.log('✅ 回复正常完成，finish_reason = "stop"');
        if (data2.choices[0].message.content.length > 500) {
          console.log('⚠️  警告：内容长度超过 500 字符，但 finish_reason 是 stop');
          console.log('💡 可能原因：max_tokens 未被 API 遵守，或 token 计数方式不同');
        }
      }
    } else if (data2.candidates && data2.candidates[0]) {
      console.log('✅ 响应格式：Gemini');
      console.log('Finish Reason (原始):', data2.candidates[0].finish_reason);
      console.log('Content Length (字符数):', data2.candidates[0].content.parts[0].text.length);
    }

  } catch (e) {
    console.error('❌ 请求失败:', e.message);
  }

  console.log('\n' + '='.repeat(80));
  console.log('测试完成');
  console.log('='.repeat(80));
})();
