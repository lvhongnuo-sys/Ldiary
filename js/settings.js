// ── SETTINGS STATE (api / profile / bg / player / bubble / avatar) ──
var apiKey=localStorage.getItem('ld_key')||'';
var model=localStorage.getItem('ld_model')||'gpt-4o-mini';
var apiBaseUrl=localStorage.getItem('ld_baseurl')||'https://api.openai.com/v1';
var myName=localStorage.getItem('ld_myname')||'L';
var myBio=localStorage.getItem('ld_mybio')||'你的私人空间';
var aiName=localStorage.getItem('ld_ainame')||'';
var aiPrompt=localStorage.getItem('ld_aiprompt')||'';
var currentAssistantId=localStorage.getItem('ld_current_assistant_id')||null;
var playerTheme=localStorage.getItem('ld_playertheme')||'#1c1c1e';

// ── PROFILE SYNC (实时同步 chat 消息中的 profile 信息) ──
function updateChatProfileInfo(){
  var messagesEl=document.getElementById('messages');
  if(!messagesEl)return;
  var msgRows=messagesEl.querySelectorAll('.msg-row');
  msgRows.forEach(function(row){
    if(row.classList.contains('user')){
      // 更新用户消息中的用户名
      var author=row.querySelector('.msg-author');
      if(author)author.textContent=myName||'L';
      // 更新用户头像
      var avatar=row.querySelector('.msg-avatar');
      if(avatar){
        var userAvatar=localStorage.getItem('ld_avatar');
        if(userAvatar){
          if(!avatar.querySelector('img')){
            avatar.innerHTML='<img src="'+userAvatar+'" style="width:100%;height:100%;object-fit:cover;"/>';
            avatar.textContent='';
          }else{
            avatar.querySelector('img').src=userAvatar;
          }
        }
      }
    }else if(row.classList.contains('ai')){
      // 更新 AI 消息中的 AI 名称
      var author=row.querySelector('.msg-author');
      if(author)author.textContent=aiName||'小机';
      // 更新 AI 头像
      var avatar=row.querySelector('.msg-avatar');
      if(avatar){
        var currentAsst=null;
        if(typeof getAssistantList==='function'){
          var list=getAssistantList();
          currentAsst=list.find(function(a){return a.id===currentAssistantId;})||list[0];
        }
        if(currentAsst&&currentAsst.avatar){
          if(!avatar.querySelector('img')){
            avatar.innerHTML='<img src="'+currentAsst.avatar+'" style="width:100%;height:100%;object-fit:cover;"/>';
            avatar.textContent='';
          }else{
            avatar.querySelector('img').src=currentAsst.avatar;
          }
        }
      }
    }
  });
}
var playerThemeImg=localStorage.getItem('ld_playerthemeimg')||'';
var playerOpacity=parseInt(localStorage.getItem('ld_playeropacity')||'100');
var barkKey=localStorage.getItem('bark_key')||'';
var customModels=JSON.parse(localStorage.getItem('ld_custom_models')||'[]');
var pendingPT=playerTheme,pendingPTI=playerThemeImg,pendingPO=playerOpacity;

var bgOptions=[
  {id:'default',color:'#f0eeeb',label:'默认'},{id:'warm',color:'#f5ede3',label:'暖'},
  {id:'cool',color:'#e8edf2',label:'冷'},{id:'dark',color:'#1a1a1a',label:'深色'},
  {id:'rose',color:'#f5e8e8',label:'玫瑰'},{id:'sage',color:'#e8f0e8',label:'绿'},
  {id:'lavender',color:'#ede8f5',label:'薰衣草'},{id:'sand',color:'#f0ebe0',label:'沙'}
];
var playerThemes=[
  {color:'#1c1c1e',label:'深色'},{color:'#3a3a38',label:'炭灰'},{color:'#4a3728',label:'棕'},
  {color:'#2d3a4a',label:'海军'},{color:'#3a2d4a',label:'紫夜'},{color:'#4a2d35',label:'酒红'}
];
var bgState={
  home:JSON.parse(localStorage.getItem('ld_bg_home')||'{"id":"default","custom":""}'),
  chat:JSON.parse(localStorage.getItem('ld_bg_chat')||'{"id":"default","custom":""}'),
  memory:JSON.parse(localStorage.getItem('ld_bg_memory')||'{"id":"default","custom":""}'),
  together:JSON.parse(localStorage.getItem('ld_bg_together')||'{"id":"default","custom":""}')
};
var calendarData=JSON.parse(localStorage.getItem('ld_calendar_data')||'{}');
var currentBgTab='chat',pendingBg={};

function ensureCalendarData(dateKey){
  if(!calendarData[dateKey]){
    calendarData[dateKey]={date:dateKey,events:[],aiNotes:[],reminders:[]};
    localStorage.setItem('ld_calendar_data', JSON.stringify(calendarData));
  }
  return calendarData[dateKey];
}
function formatCalendarDate(date){
  var d=new Date(date+'T00:00:00');
  var y=d.getFullYear();
  var m=String(d.getMonth()+1).padStart(2,'0');
  var day=String(d.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+day;
}
function getCalendarDateKey(date){
  if(!date){
    var now=new Date();
    return formatCalendarDate(now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0'));
  }
  return formatCalendarDate(date);
}
function openCalendarPage(){
  switchTab('calendar',document.getElementById('nav-home'));
  renderCalendarPage();
}
function renderCalendarPage(){
  var currentDateEl=document.getElementById('calendarCurrentDate');
  var dateInput=document.getElementById('calendarDateInput');
  var emptyState=document.getElementById('calendarEmptyState');
  if(!currentDateEl || !dateInput || !emptyState) return;
  var selectedDate=getCalendarDateKey(dateInput.value || new Date().toISOString().slice(0,10));
  var currentDate=new Date();
  var label=(currentDate.getMonth()+1)+' 月 '+currentDate.getDate()+' 日';
  currentDateEl.textContent=label;
  dateInput.value=selectedDate;
  var dayData=ensureCalendarData(selectedDate);
  if(dayData.events.length || dayData.aiNotes.length || dayData.reminders.length){
    emptyState.textContent='今日暂无记录';
    emptyState.style.display='block';
  } else {
    emptyState.textContent='暂无记录';
    emptyState.style.display='block';
  }
}
function initCalendarPage(){
  var dateInput=document.getElementById('calendarDateInput');
  if(!dateInput) return;
  var today=new Date().toISOString().slice(0,10);
  dateInput.value=today;
  dateInput.onchange=function(){
    renderCalendarPage();
  };
  renderCalendarPage();
}

if(typeof window !== 'undefined'){
  window.calendarData = calendarData;
  window.ensureCalendarData = ensureCalendarData;
  window.openCalendarPage = openCalendarPage;
  window.renderCalendarPage = renderCalendarPage;
}

// ── BG ──
function applyPageBg(page){
  var s=bgState[page];
  var color=s.id==='custom'?null:(bgOptions.find(function(b){return b.id===s.id;})||bgOptions[0]).color;
  if(page==='home'){
    var el=document.getElementById('homeWallpaper');
    el.style.backgroundImage=s.id==='custom'&&s.custom?'url('+s.custom+')':'none';
    el.style.backgroundColor=color||'';
  } else {
    var el=document.getElementById('page-'+page);
    el.style.backgroundImage=s.id==='custom'&&s.custom?'url('+s.custom+')':'';
    el.style.backgroundColor=s.id==='custom'?'':color;
  }
}
function applyPlayerStyle(){var disc=document.getElementById('discBg'),np=document.getElementById('nowPlayingCard'),op=playerOpacity/100;if(playerThemeImg){disc.style.backgroundImage='url('+playerThemeImg+')';np.style.background='url('+playerThemeImg+') center/cover';}else{disc.style.backgroundImage='none';disc.style.backgroundColor=playerTheme;np.style.background=playerTheme;}np.style.opacity=op;document.getElementById('discPlayer').style.opacity=op;}

// ── BG MODAL ──
function openBgModalFor(page){
  pendingBg={home:Object.assign({},bgState.home),chat:Object.assign({},bgState.chat),memory:Object.assign({},bgState.memory),together:Object.assign({},bgState.together)};
  currentBgTab=page;
  var pageOrder=['home','chat','memory','together'];
  document.querySelectorAll('#bgTabBar .tab-btn').forEach(function(b,i){b.classList.toggle('active',pageOrder[i]===page);});
  renderBgGrid(page);openModal('bgModal');
}
function openBgModal(){openBgModalFor('chat');}
function switchBgTab(page,el){currentBgTab=page;document.querySelectorAll('#bgTabBar .tab-btn').forEach(function(b){b.classList.remove('active');});el.classList.add('active');renderBgGrid(page);}
function renderBgGrid(page){
  var grid=document.getElementById('bgGrid');grid.innerHTML='';
  bgOptions.forEach(function(opt){var sw=document.createElement('div');sw.className='bg-swatch'+(pendingBg[page].id===opt.id?' selected':'');sw.style.backgroundColor=opt.color;sw.title=opt.label;sw.onclick=function(){document.querySelectorAll('#bgGrid .bg-swatch').forEach(function(s){s.classList.remove('selected');});sw.classList.add('selected');pendingBg[page]={id:opt.id,custom:''};bgState[page]={id:opt.id,custom:''};applyPageBg(page);};grid.appendChild(sw);});
  if(pendingBg[page].id==='custom'&&pendingBg[page].custom){var sw=document.createElement('div');sw.className='bg-swatch selected';sw.style.backgroundImage='url('+pendingBg[page].custom+')';sw.style.backgroundSize='cover';grid.appendChild(sw);}
}
function handleBgUpload(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){var src=ev.target.result;pendingBg[currentBgTab]={id:'custom',custom:src};bgState[currentBgTab]={id:'custom',custom:src};applyPageBg(currentBgTab);renderBgGrid(currentBgTab);};reader.readAsDataURL(file);e.target.value='';}
function saveBg(){bgState[currentBgTab]=Object.assign({},pendingBg[currentBgTab]);localStorage.setItem('ld_bg_'+currentBgTab,JSON.stringify(bgState[currentBgTab]));applyPageBg(currentBgTab);closeModal('bgModal');}

// ── PLAYER / BUBBLE ──
function openPlayerThemeModal(){pendingPT=playerTheme;pendingPTI=playerThemeImg;pendingPO=playerOpacity;document.getElementById('playerOpacityRange').value=playerOpacity;document.getElementById('opacityLabel').textContent=playerOpacity+'%';renderPlayerThemeGrid();openModal('playerThemeModal');}
function renderPlayerThemeGrid(){var grid=document.getElementById('playerThemeGrid');grid.innerHTML='';playerThemes.forEach(function(t){var sw=document.createElement('div');sw.className='theme-swatch'+(pendingPT===t.color&&!pendingPTI?' selected':'');sw.style.background=t.color;sw.textContent=t.label;sw.onclick=function(){document.querySelectorAll('.theme-swatch').forEach(function(s){s.classList.remove('selected');});sw.classList.add('selected');pendingPT=t.color;pendingPTI='';};grid.appendChild(sw);});if(pendingPTI){var sw=document.createElement('div');sw.className='theme-swatch selected';sw.style.backgroundImage='url('+pendingPTI+')';sw.style.backgroundSize='cover';sw.textContent='自定义';grid.appendChild(sw);}}
function handlePlayerBgUpload(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){pendingPTI=ev.target.result;renderPlayerThemeGrid();};reader.readAsDataURL(file);e.target.value='';}
function updateOpacityLabel(val){pendingPO=parseInt(val);document.getElementById('opacityLabel').textContent=val+'%';}
function savePlayerTheme(){playerTheme=pendingPT;playerThemeImg=pendingPTI;playerOpacity=pendingPO;localStorage.setItem('ld_playertheme',playerTheme);localStorage.setItem('ld_playerthemeimg',playerThemeImg);localStorage.setItem('ld_playeropacity',String(playerOpacity));updatePlayerThemeVal();applyPlayerStyle();closeModal('playerThemeModal');}
function openBubbleOpacityModal(){document.getElementById('bubbleOpacityRange').value=chatAppearanceSettings.bubbleOpacity;document.getElementById('bubbleOpacityLabel').textContent=chatAppearanceSettings.bubbleOpacity+'%';openModal('bubbleOpacityModal');}
function previewBubbleOpacity(val){document.getElementById('bubbleOpacityLabel').textContent=val+'%';document.documentElement.style.setProperty('--bubble-opacity',parseInt(val)/100);}
function saveBubbleOpacity(){
  chatAppearanceSettings.bubbleOpacity=parseInt(document.getElementById('bubbleOpacityRange').value);
  localStorage.setItem('ld_chat_bubble_opacity',String(chatAppearanceSettings.bubbleOpacity));
  document.documentElement.style.setProperty('--bubble-opacity',chatAppearanceSettings.bubbleOpacity/100);
  applyChatAppearanceSettings();
  document.getElementById('bubbleOpacityVal').textContent=chatAppearanceSettings.bubbleOpacity+'%';
  closeModal('bubbleOpacityModal');
}

// ── PROFILE / AI / API / AVATAR ──
function normalizeApiBaseUrl(value){
  var raw=(value||'https://api.openai.com/v1').trim();
  if(!raw) return 'https://api.openai.com/v1';
  return raw.replace(/\/+$/, '');
}
function getDefaultModelOptions(){
  return ['gpt-4o-mini','gpt-4o','gpt-4.1-mini','deepseek-chat','deepseek-reasoner','qwen2.5-72b-instruct','qwen-max'];
}
var modelOptionsCache=getDefaultModelOptions();
function extractModelNames(payload){
  var names=[];
  if(!payload) return names;
  var candidates=[];
  if(Array.isArray(payload)) candidates=payload;
  else if(Array.isArray(payload.data)) candidates=payload.data;
  else if(Array.isArray(payload.models)) candidates=payload.models;
  else if(Array.isArray(payload.result)) candidates=payload.result;
  else if(payload && typeof payload==='object'){Object.keys(payload).forEach(function(key){if(Array.isArray(payload[key])) candidates = payload[key];});}
  candidates.forEach(function(item){
    if(typeof item==='string'&&item.trim()) names.push(item.trim());
    else if(item&&typeof item==='object'){
      if(item.id && typeof item.id==='string') names.push(item.id.trim());
      else if(item.model && typeof item.model==='string') names.push(item.model.trim());
    }
  });
  return Array.from(new Set(names.filter(Boolean)));
}
function persistCustomModels(){localStorage.setItem('ld_custom_models', JSON.stringify(customModels));}
function renderCustomModelList(){
  var list=document.getElementById('customModelList');
  if(!list) return;
  if(!customModels.length){list.innerHTML='<div class="custom-model-empty">还没有自定义模型</div>';return;}
  list.innerHTML=customModels.map(function(entry){
    return '<div class="custom-model-row"><div class="custom-model-row-info"><div class="custom-model-row-name">'+entry.name+'</div><div class="custom-model-row-id">'+entry.id+'</div></div><button type="button" class="custom-model-row-remove" onclick="deleteCustomModel(\''+entry.id.replace(/'/g,"\\'")+'\')">删除</button></div>';
  }).join('');
}
function openCustomModelModal(){
  var nameInput=document.getElementById('customModelNameInput');
  var idInput=document.getElementById('customModelIdInput');
  if(nameInput) nameInput.value='';
  if(idInput) idInput.value='';
  renderCustomModelList();
  openModal('customModelModal');
}
function saveCustomModel(){
  var nameInput=document.getElementById('customModelNameInput');
  var idInput=document.getElementById('customModelIdInput');
  var name=(nameInput?nameInput.value:'').trim();
  var id=(idInput?idInput.value:'').trim();
  if(!name){alert('请填写模型显示名称');return;}
  if(!id){alert('请填写模型 ID');return;}
  if(customModels.some(function(entry){return entry.id===id;})){alert('该模型 ID 已存在');return;}
  customModels.push({name:name,id:id});
  persistCustomModels();
  model=id;
  if(nameInput) nameInput.value='';
  if(idInput) idInput.value='';
  renderCustomModelList();
  renderModelOptions('');
  var modelSelect=document.getElementById('modelSelect');
  if(modelSelect) modelSelect.value=id;
}
function deleteCustomModel(id){
  customModels=customModels.filter(function(entry){return entry.id!==id;});
  persistCustomModels();
  if(model===id){
    model=getDefaultModelOptions()[0];
    localStorage.setItem('ld_model', model);
  }
  renderCustomModelList();
  renderModelOptions(model);
}
function renderModelOptions(filterText){
  var select=document.getElementById('modelSelect');
  if(!select) return;
  var q=(filterText||'').trim().toLowerCase();
  var items=modelOptionsCache.slice();
  if(q){items=items.filter(function(name){return name.toLowerCase().indexOf(q)!==-1;});}
  var effectiveModel=(model==='__custom__')?'':model;
  var customById={};
  customModels.forEach(function(entry){customById[entry.id]=entry;});
  var selectValueKnown=select.value && select.value!=='__custom__' && (items.indexOf(select.value)!==-1 || !!customById[select.value]);
  var currentValue=selectValueKnown?select.value:(effectiveModel||items[0]||'');
  if(currentValue && items.indexOf(currentValue)===-1 && !customById[currentValue]){items=[currentValue].concat(items);}
  var seen={};
  select.innerHTML='';
  items.forEach(function(name){
    if(!name || seen[name]) return;
    seen[name]=true;
    var opt=document.createElement('option');
    opt.value=name;
    opt.textContent=name;
    if(name===currentValue){opt.selected=true;}
    select.appendChild(opt);
  });
  customModels.forEach(function(entry){
    if(seen[entry.id]) return;
    seen[entry.id]=true;
    var opt=document.createElement('option');
    opt.value=entry.id;
    opt.textContent=entry.name;
    if(entry.id===currentValue){opt.selected=true;}
    select.appendChild(opt);
  });
  var customOpt=document.createElement('option');
  customOpt.value='__custom__';
  customOpt.textContent='+ 添加自定义模型';
  select.appendChild(customOpt);
  if(!currentValue && items.length){currentValue=items[0];}
  if(currentValue){select.value=currentValue;}
  if(select.value==='__custom__' && (items.indexOf(model||'')!==-1 || customById[model||''])){select.value=model||items[0];}
  select.onchange=function(){
    if(select.value==='__custom__'){
      openCustomModelModal();
      if(effectiveModel && (items.indexOf(effectiveModel)!==-1 || customById[effectiveModel])){select.value=effectiveModel;}
      else if(items.length){select.value=items[0];}
      else if(customModels.length){select.value=customModels[0].id;}
      return;
    }
    model=select.value;
  };
}
function handleModelSearchInput(value){
  var query=(value||'').trim();
  renderModelOptions(query);
}
function handleManualModelInput(value){
  var query=(value||'').trim();
  renderModelOptions(query);
}
async function fetchModelOptions(){
  var baseUrlValue=(document.getElementById('baseUrlInput')?document.getElementById('baseUrlInput').value:apiBaseUrl)||apiBaseUrl;
  var url=normalizeApiBaseUrl(baseUrlValue) + '/models';
  var key=(document.getElementById('keyInput')?document.getElementById('keyInput').value.trim():apiKey)||'';
  var status=document.getElementById('modelStatus');
  if(status) status.textContent='正在加载模型…';
  try{
    var headers={'Content-Type':'application/json'};
    if(key) headers.Authorization='Bearer ' + key;
    var res=await fetch(url,{method:'GET',headers:headers});
    if(!res.ok) throw new Error('HTTP '+res.status);
    var data=await res.json();
    var names=extractModelNames(data);
    if(names.length){
      modelOptionsCache=names;
      if(status) status.textContent=names.length + ' 个模型可用';
    } else {
      modelOptionsCache=getDefaultModelOptions();
      if(status) status.textContent='未返回模型列表，已使用默认列表';
    }
    if(model && modelOptionsCache.indexOf(model)===-1){
      modelOptionsCache=[model].concat(modelOptionsCache);
    }
  } catch(err){
    modelOptionsCache=getDefaultModelOptions();
    if(status) status.textContent='获取失败，已使用默认列表';
  }
  renderModelOptions(model||'');
}
function getChatCompletionUrl(){
  return normalizeApiBaseUrl(apiBaseUrl) + '/chat/completions';
}
function isGeminiResponse(data){
  return data && data.candidates && Array.isArray(data.candidates) && !data.choices;
}
function extractUsageMeta(data){
  if(!data) return null;
  var usage=null;
  var nestedCandidates=[];

  if(data.usage){usage=data.usage;}
  else if(data.usageMetadata){usage=data.usageMetadata;}
  else if(data.usage_metadata){usage=data.usage_metadata;}
  else if(data.metadata&&data.metadata.usage){usage=data.metadata.usage;}
  else if(data.choices&&data.choices[0]&&data.choices[0].usage){usage=data.choices[0].usage;}
  else if(data.candidates&&data.candidates[0]&&data.candidates[0].usageMetadata){usage=data.candidates[0].usageMetadata;}
  else if(data.candidates&&data.candidates[0]&&data.candidates[0].usage_metadata){usage=data.candidates[0].usage_metadata;}

  if(!usage && data.metadata && typeof data.metadata==='object'){usage=data.metadata;}
  if(!usage){return null;}

  nestedCandidates.push(usage);
  if(usage && usage.metadata && typeof usage.metadata==='object'){nestedCandidates.push(usage.metadata);}
  if(data && data.metadata && typeof data.metadata==='object'){nestedCandidates.push(data.metadata);}
  if(data && data.usageMetadata && typeof data.usageMetadata==='object'){nestedCandidates.push(data.usageMetadata);}
  if(data && data.usage_metadata && typeof data.usage_metadata==='object'){nestedCandidates.push(data.usage_metadata);}

  function pickFirstValue(obj, keys){
    if(!obj || typeof obj!=='object') return undefined;
    for(var i=0;i<keys.length;i++){
      if(typeof obj[keys[i]]!=='undefined' && obj[keys[i]] !== null && obj[keys[i]] !== '') return obj[keys[i]];
    }
    return undefined;
  }

  function pickRemaining(obj){
    if(!obj || typeof obj!=='object') return undefined;
    var value = pickFirstValue(obj,['remaining_tokens','remainingTokens','remaining_token_count','remainingTokenCount']);
    if(typeof value!=='undefined') return value;
    if(obj.metadata && typeof obj.metadata==='object'){
      var nested = pickFirstValue(obj.metadata,['remaining_tokens','remainingTokens','remaining_token_count','remainingTokenCount']);
      if(typeof nested!=='undefined') return nested;
    }
    return undefined;
  }

  var normalized={};
  var prompt = pickFirstValue(usage,['prompt_tokens','promptTokenCount','prompt_token_count']);
  var completion = pickFirstValue(usage,['completion_tokens','output_tokens','outputTokenCount','candidatesTokenCount','completionTokenCount']);
  var total = pickFirstValue(usage,['total_tokens','totalTokenCount','total_token_count']);
  var context = pickFirstValue(usage,['context_tokens','contextTokenCount','context_token_count']);
  var remaining = undefined;
  for(var i=0;i<nestedCandidates.length;i++){
    var candidate = nestedCandidates[i];
    if(typeof remaining==='undefined') remaining = pickRemaining(candidate);
  }
  if(typeof remaining==='undefined'){remaining = pickFirstValue(data,['remaining_tokens','remainingTokens','remaining_token_count','remainingTokenCount']);}
  if(typeof prompt!=='undefined') normalized.prompt_tokens=Number(prompt)||0;
  if(typeof completion!=='undefined') normalized.completion_tokens=Number(completion)||0;
  if(typeof total!=='undefined') normalized.total_tokens=Number(total)||0;
  if(typeof context!=='undefined') normalized.context_tokens=Number(context)||0;
  if(typeof remaining!=='undefined' && remaining !== null && remaining !== '') normalized.remaining_tokens=Number(remaining)||0;
  if(!normalized.total_tokens && normalized.prompt_tokens && normalized.completion_tokens){normalized.total_tokens=normalized.prompt_tokens+normalized.completion_tokens;}
  if(!normalized.prompt_tokens && normalized.total_tokens && normalized.completion_tokens){normalized.prompt_tokens=Math.max(0, normalized.total_tokens - normalized.completion_tokens);}
  if(!normalized.completion_tokens && normalized.total_tokens && normalized.prompt_tokens){normalized.completion_tokens=Math.max(0, normalized.total_tokens - normalized.prompt_tokens);}
  if(typeof normalized.context_tokens==='undefined' && typeof normalized.prompt_tokens!=='undefined'){normalized.context_tokens=Number(normalized.prompt_tokens)||0;}
  if(typeof normalized.remaining_tokens!=='undefined' && normalized.remaining_tokens < 0){normalized.remaining_tokens = 0;}
  return Object.keys(normalized).length ? normalized : null;
}
function normalizeResponse(data){
  if(isGeminiResponse(data)){
    var candidate=data.candidates[0];
    if(!candidate) return null;
    var content=candidate.content&&candidate.content.parts&&candidate.content.parts[0]?candidate.content.parts[0].text:'';
    var finishReason=candidate.finish_reason;
    var normalizedReason='stop';
    if(finishReason==='MAX_TOKENS') normalizedReason='length';
    else if(finishReason==='STOP'||finishReason==='stop') normalizedReason='stop';
    return {content:content,finish_reason:normalizedReason,usage:extractUsageMeta(data)};
  }else if(data&&data.choices&&data.choices[0]){
    return {content:data.choices[0].message.content,finish_reason:data.choices[0].finish_reason||'stop',usage:extractUsageMeta(data)};
  }
  return null;
}
function openApiModal(){
  document.getElementById('baseUrlInput').value=apiBaseUrl;
  document.getElementById('keyInput').value=apiKey;
  modelOptionsCache=getDefaultModelOptions();
  if(model && modelOptionsCache.indexOf(model)===-1){modelOptionsCache=[model].concat(modelOptionsCache);}
  renderModelOptions(model||'');
  fetchModelOptions();
  openModal('apiModal');
}
function saveApi(){
  apiBaseUrl=normalizeApiBaseUrl(document.getElementById('baseUrlInput').value);
  apiKey=document.getElementById('keyInput').value.trim();
  var modelSelect=document.getElementById('modelSelect');
  model=(modelSelect?modelSelect.value:'')||model||'gpt-4o-mini';
  if(model==='__custom__'){model='gpt-4o-mini';}
  localStorage.setItem('ld_baseurl', apiBaseUrl);
  localStorage.setItem('ld_key', apiKey);
  localStorage.setItem('ld_model', model);
  updateApiStatus();
  if(apiKey) document.getElementById('apiVal').textContent=model;
  if(!apiKey) document.getElementById('apiVal').textContent='未配置';
  fetchModelOptions();
  closeModal('apiModal');
}
function openProfileModal(){document.getElementById('myNameInput').value=myName;document.getElementById('myBioInput').value=myBio;openModal('profileModal');}
function saveProfile(){myName=document.getElementById('myNameInput').value.trim()||'L';myBio=document.getElementById('myBioInput').value.trim()||'你的私人空间';localStorage.setItem('ld_myname',myName);localStorage.setItem('ld_mybio',myBio);document.getElementById('profileName').textContent=myName;document.getElementById('profileSub').textContent=myBio;renderRoleProfilePage();updateChatProfileInfo();closeModal('profileModal');}
function switchAssistantEditorTab(tabName){
  document.querySelectorAll('.assistant-editor-panel').forEach(function(panel){
    panel.classList.toggle('active', panel.id === 'assistant-editor-' + tabName);
  });
  document.querySelectorAll('.tab-btn[data-tab]').forEach(function(btn){
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
}
function insertPromptVariable(token, targetId){
  var textarea = targetId ? document.getElementById(targetId) : document.getElementById('personaPrompt');
  if(!textarea) return;
  var start = textarea.selectionStart;
  var end = textarea.selectionEnd;
  var value = textarea.value;
  textarea.value = value.slice(0, start) + token + value.slice(end);
  textarea.focus();
  var pos = start + token.length;
  textarea.setSelectionRange(pos, pos);
}
function openPromptFullscreenEditor(){
  var source = document.getElementById('personaPrompt');
  var target = document.getElementById('promptFullscreenTextarea');
  if(!source || !target) return;
  target.value = source.value;
  document.getElementById('promptFullscreenOverlay').classList.add('show');
  setTimeout(function(){target.focus();}, 100);
}
function closePromptFullscreenEditor(){
  var overlay = document.getElementById('promptFullscreenOverlay');
  if(overlay) overlay.classList.remove('show');
}
function savePromptFullscreenEditor(){
  var source = document.getElementById('personaPrompt');
  var target = document.getElementById('promptFullscreenTextarea');
  if(source && target){
    source.value = target.value;
  }
  closePromptFullscreenEditor();
}
window.insertPromptVariable = insertPromptVariable;
window.openPromptFullscreenEditor = openPromptFullscreenEditor;
window.closePromptFullscreenEditor = closePromptFullscreenEditor;
window.savePromptFullscreenEditor = savePromptFullscreenEditor;
function triggerAssistantAvatarUpload(){
  var input=document.getElementById('assistantAvatarInput');
  if(input) input.click();
}
function handleAssistantAvatar(e){
  var file=e.target.files[0];
  if(!file) return;
  var reader=new FileReader();
  reader.onload=function(ev){
    var src=ev.target.result;
    var list=getAssistantList();
    var selected=list.find(function(entry){return entry.id===currentAssistantId;}) || list[0];
    if(selected){
      selected.avatar=src;
      localStorage.setItem('ld_assistants', JSON.stringify(list));
    }
    var avatarNode=document.getElementById('assistantAvatarStatic');
    if(avatarNode){
      avatarNode.innerHTML = '<img src="'+src+'" style="width:100%;height:100%;object-fit:cover;border-radius:18px;" />';
    }
    if(typeof renderRoleProfilePage === 'function') renderRoleProfilePage();
    renderAssistantCards();
    updateChatProfileInfo();
  };
  reader.readAsDataURL(file);
  e.target.value='';
}
function getAssistantList(){
  try{
    var list=JSON.parse(localStorage.getItem('ld_assistants')||'[]');
    if(!Array.isArray(list) || !list.length){
      list=[
        {id:'assistant-default',name:'小机',bio:'你的私人 AI 伙伴，温柔、聪明且有边界。',prompt:aiPrompt||'',avatar:'',model:model||'gpt-4o-mini'},
        {id:'assistant-l',name:'L 助手',bio:'陪伴式助手，适合记录日常、总结情绪与灵感。',prompt:aiPrompt||'',avatar:'',model:model||'gpt-4o-mini'}
      ];
      localStorage.setItem('ld_assistants', JSON.stringify(list));
    }
    return list;
  }catch(err){
    return [];
  }
}
function setCurrentAssistant(id){
  var list=getAssistantList();
  var item=list.find(function(entry){return entry.id===id;})||list[0];
  if(!item) return;
  currentAssistantId=item.id;
  localStorage.setItem('ld_current_assistant_id', currentAssistantId);
  aiName=item.name||'';
  aiPrompt=item.prompt||'';
  if(item.model){model=item.model;localStorage.setItem('ld_model', model);}
  localStorage.setItem('ld_ainame', aiName);
  localStorage.setItem('ld_aiprompt', aiPrompt);
  updateChatProfileInfo();
}
function renderAssistantCards(){
  var host=document.getElementById('assistantCardList');
  if(!host) return;
  var list=getAssistantList();
  if(!list.length){
    host.innerHTML='';
    return;
  }
  if(!currentAssistantId || !list.some(function(entry){return entry.id===currentAssistantId;})){
    setCurrentAssistant(list[0].id);
  }
  host.innerHTML='';
  list.forEach(function(item){
    var wrap=document.createElement('div');
    wrap.className='assistant-card-wrap';
    wrap.setAttribute('data-id', item.id);

    var deleteBtn=document.createElement('button');
    deleteBtn.className='assistant-card-delete';
    deleteBtn.type='button';
    deleteBtn.textContent='删除';
    deleteBtn.onclick=function(e){
      e.stopPropagation();
      if(confirm('确定删除该助手吗？删除后无法恢复。')){
        deleteAssistant(item.id);
      } else {
        var card=wrap.querySelector('.assistant-card');
        if(card){card.classList.remove('swiped');}
      }
    };

    var card=document.createElement('div');
    card.className='assistant-card';
    card.setAttribute('data-id', item.id);
    card.style.transform='translateX(0)';

    var touchStartX=0; var touchDeltaX=0; var touchDragging=false;

    function closeSwipe(){
      card.classList.remove('swiped');
      card.style.transform='translateX(0)';
    }
    function openSwipe(){
      card.classList.add('swiped');
      card.style.transform='translateX(-88px)';
    }

    card.onclick=function(e){
      if(card.dataset.swipeLock === '1'){
        card.dataset.swipeLock='0';
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if(card.classList.contains('swiped')){
        closeSwipe();
        return;
      }
      openAssistantEditor(item.id);
    };

    function beginTouch(clientX){
      if(document.querySelector('.assistant-card.swiped') && document.querySelector('.assistant-card.swiped') !== card){
        document.querySelectorAll('.assistant-card.swiped').forEach(function(other){other.classList.remove('swiped');other.style.transform='translateX(0)';});
      }
      touchStartX=clientX;
      touchDeltaX=0;
      touchDragging=true;
      card.dataset.swipeLock='0';
    }
    function handleTouchMove(clientX){
      if(!touchDragging) return;
      touchDeltaX=clientX-touchStartX;
      if(Math.abs(touchDeltaX) < 4) return;
      var baseOffset = card.classList.contains('swiped') ? -88 : 0;
      var nextX=Math.max(-88, Math.min(0, baseOffset + touchDeltaX));
      card.style.transform='translateX('+nextX+'px)';
      card.dataset.swipeLock='1';
    }
    function finishTouch(){
      if(!touchDragging) return;
      touchDragging=false;
      var currentX = parseFloat(card.style.transform.replace(/[^-\d.]/g,'')) || 0;
      if(currentX <= -44 || (card.classList.contains('swiped') && touchDeltaX < 0)){
        openSwipe();
      } else {
        closeSwipe();
      }
      if(card.classList.contains('swiped')){
        card.dataset.swipeLock='1';
      } else {
        card.dataset.swipeLock='0';
      }
    }

    card.addEventListener('touchstart', function(e){ if(e.touches && e.touches[0]) beginTouch(e.touches[0].clientX); }, {passive:true});
    card.addEventListener('touchmove', function(e){ if(!touchDragging || !e.touches || !e.touches[0]) return; handleTouchMove(e.touches[0].clientX); e.preventDefault(); }, {passive:false});
    card.addEventListener('touchend', function(){ finishTouch(); });
    card.addEventListener('touchcancel', function(){ touchDragging=false; closeSwipe(); card.dataset.swipeLock='0'; });

    var avatarHtml = item.avatar ? '<img src="'+item.avatar+'" style="width:100%;height:100%;object-fit:cover;border-radius:16px;" />' : (item.name ? item.name.charAt(0).toUpperCase() : 'A');
    card.innerHTML='<div class="assistant-card-avatar">'+avatarHtml+'</div><div class="assistant-card-body"><div class="assistant-card-name">'+(item.name||'新助手')+'</div><div class="assistant-card-bio">'+(item.bio || '你的专属助手。')+'</div></div><div class="assistant-card-arrow">›</div>';
    wrap.appendChild(deleteBtn);
    wrap.appendChild(card);
    host.appendChild(wrap);
  });
}
function deleteAssistant(id){
  var list=getAssistantList();
  var filtered=list.filter(function(entry){return entry.id!==id;});
  if(filtered.length===0){
    localStorage.setItem('ld_assistants', JSON.stringify([]));
    currentAssistantId=null;
    localStorage.removeItem('ld_current_assistant_id');
    renderAssistantCards();
    return;
  }
  localStorage.setItem('ld_assistants', JSON.stringify(filtered));
  currentAssistantId=filtered[0].id;
  localStorage.setItem('ld_current_assistant_id', currentAssistantId);
  renderAssistantCards();
}
function openAssistantEditor(id){
  setCurrentAssistant(id);
  var selected=getAssistantList().find(function(entry){return entry.id===currentAssistantId;}) || getAssistantList()[0];
  var avatarNode=document.getElementById('assistantAvatarStatic');
  if(avatarNode){
    var avatarHtml = selected && selected.avatar ? '<img src="'+selected.avatar+'" style="width:100%;height:100%;object-fit:cover;border-radius:18px;" />' : ((selected && selected.name) ? (selected.name.charAt(0).toUpperCase()) : 'A');
    avatarNode.innerHTML=avatarHtml;
  }
  if(document.getElementById('personaAiName')) document.getElementById('personaAiName').value=(selected&&selected.name)||'';
  if(document.getElementById('assistantBio')) document.getElementById('assistantBio').value=(selected&&selected.bio)||'';
  if(document.getElementById('personaPrompt')) document.getElementById('personaPrompt').value=(selected&&selected.prompt)||'';
  populateAssistantModelSelect();
  switchTab('persona-editor',null);
}
function createAssistant(){
  var list=getAssistantList();
  var item={
    id:'assistant-'+Date.now()+Math.random().toString(16).slice(2),
    name:'新助手',
    bio:'新的助手描述，记录日常与灵感。',
    prompt:'',
    avatar:'',
    model:model||'gpt-4o-mini'
  };
  list.push(item);
  localStorage.setItem('ld_assistants', JSON.stringify(list));
  setCurrentAssistant(item.id);
  if(document.getElementById('personaAiName')) document.getElementById('personaAiName').value='';
  if(document.getElementById('assistantBio')) document.getElementById('assistantBio').value='';
  if(document.getElementById('personaPrompt')) document.getElementById('personaPrompt').value='';
  populateAssistantModelSelect();
  switchTab('persona-editor',null);
}
function openAiModal(){
  switchTab('assistant-settings',null);
  renderAssistantCards();
  var aiNameInput=document.getElementById('personaAiName');
  var aiPromptInput=document.getElementById('personaPrompt');
  if(aiNameInput) aiNameInput.value=aiName||'';
  if(aiPromptInput) aiPromptInput.value=aiPrompt||'';
  populateAssistantModelSelect();
}
function saveAi(){aiName=document.getElementById('aiNameInput').value.trim();aiPrompt=document.getElementById('aiPromptInput').value.trim();localStorage.setItem('ld_ainame',aiName);localStorage.setItem('ld_aiprompt',aiPrompt);document.getElementById('aiNameVal').textContent=aiName||'未设置';renderRoleProfilePage();updateChatProfileInfo();closeModal('aiModal');}
function renderRoleProfilePage(){var pageName=document.getElementById('profilePageName');var pageBio=document.getElementById('profilePageBio');var pageAvatar=document.getElementById('profilePageAvatar');var roleName=document.getElementById('roleNameValue');var roleBio=document.getElementById('roleBioValue');var roleAiName=document.getElementById('roleAiNameValue');var roleAiRole=document.getElementById('roleAiRoleValue');var rolePrompt=document.getElementById('rolePromptValue');if(pageName)pageName.textContent=myName||'L';if(pageBio)pageBio.textContent=myBio||'你的私人空间';if(pageAvatar){var avatar=localStorage.getItem('ld_avatar');pageAvatar.innerHTML=avatar?'<img src="'+avatar+'" />':'◇';}if(roleName)roleName.textContent=myName||'L';if(roleBio)roleBio.textContent=myBio||'你的私人空间';if(roleAiName)roleAiName.textContent=aiName||'未设置';if(roleAiRole)roleAiRole.textContent=aiName?('陪伴型助手'):'私人伴侣';if(rolePrompt)rolePrompt.textContent=aiPrompt||'尚未填写人设，当前保持为温暖、克制、陪伴的默认设定。';}
function openRoleProfilePage(){switchTab('profile',null);renderRoleProfilePage();}
function populateAssistantModelSelect(){
  var select=document.getElementById('assistantModelSelect');
  if(!select) return;
  var options=[].concat(modelOptionsCache||getDefaultModelOptions());
  if(model && options.indexOf(model)===-1){options=[model].concat(options);}
  var seen={};
  select.innerHTML='';
  options.forEach(function(name){
    if(!name || seen[name]) return;
    seen[name]=true;
    var opt=document.createElement('option');
    opt.value=name; opt.textContent=name;
    if(name===model){opt.selected=true;}
    select.appendChild(opt);
  });
  if(!model && options.length){model=options[0];}
  select.value=model||options[0]||'';
  select.onchange=function(){
    model=select.value || model || 'gpt-4o-mini';
    localStorage.setItem('ld_model', model);
  };
}
function openPersonaEditorPage(){switchTab('persona-editor',null);var myNameInput=document.getElementById('personaMyNameInput');var myBioInput=document.getElementById('personaMyBioInput');var aiNameInput=document.getElementById('personaAiNameInput');var aiPromptInput=document.getElementById('personaAiPromptInput');if(myNameInput)myNameInput.value=myName||'L';if(myBioInput)myBioInput.value=myBio||'你的私人空间';if(aiNameInput)aiNameInput.value=aiName||'';if(aiPromptInput)aiPromptInput.value=aiPrompt||'';populateAssistantModelSelect();}
function savePersonaPage(){
  var aiNameInput=document.getElementById('personaAiName');
  var assistantBioInput=document.getElementById('assistantBio');
  var aiPromptInput=document.getElementById('personaPrompt');
  var modelSelect=document.getElementById('assistantModelSelect');
  var currentModelValue=(modelSelect&&modelSelect.value)?modelSelect.value:(model||'gpt-4o-mini');
  var nextAssistantName=(aiNameInput?aiNameInput.value.trim():aiName)||'';
  var nextAssistantBio=(assistantBioInput?assistantBioInput.value.trim(): '')||'';
  var nextAssistantPrompt=(aiPromptInput?aiPromptInput.value.trim():aiPrompt)||'';
  var list=getAssistantList();
  var selected=list.find(function(entry){return entry.id===currentAssistantId;})||list[0];
  if(selected){
    selected.name=nextAssistantName || selected.name || '新助手';
    selected.bio=nextAssistantBio || selected.bio || '你的专属助手。';
    selected.prompt=nextAssistantPrompt;
    selected.model=currentModelValue || selected.model || 'gpt-4o-mini';
  }
  aiName=selected ? selected.name : nextAssistantName;
  aiPrompt=selected ? selected.prompt : nextAssistantPrompt;
  model=selected ? selected.model : currentModelValue;
  localStorage.setItem('ld_ainame', aiName);
  localStorage.setItem('ld_aiprompt', aiPrompt);
  localStorage.setItem('ld_model', model);
  localStorage.setItem('ld_assistants', JSON.stringify(list));
  if(document.getElementById('aiNameVal')) document.getElementById('aiNameVal').textContent=aiName||'未设置';
  renderRoleProfilePage();
  renderAssistantCards();
  updateChatProfileInfo();
  if(document.getElementById('headerTitle')) document.getElementById('headerTitle').textContent='角色档案';
  switchTab('assistant-settings',null);
}
function triggerAvatarUpload(){document.getElementById('avatarInput').click();}
function handleAvatar(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){localStorage.setItem('ld_avatar',ev.target.result);document.getElementById('avatarDisplay').innerHTML='<img src="'+ev.target.result+'"/>';renderRoleProfilePage();updateChatProfileInfo();};reader.readAsDataURL(file);}

// ── PUSH / BARK ──
function openBarkModal(){document.getElementById('barkKeyInput').value=barkKey;openModal('barkModal');}
function saveBark(){barkKey=document.getElementById('barkKeyInput').value.trim();localStorage.setItem('bark_key',barkKey);updateBarkStatus();closeModal('barkModal');}
function updateBarkStatus(){var ok=!!barkKey;['barkStatusDot','barkStatusDot2'].forEach(function(id){var el=document.getElementById(id);if(el)el.className='status-dot'+(ok?' ok':'');});var barkVal=document.getElementById('barkVal');if(barkVal)barkVal.textContent=ok?'已配置':'未配置';}
function testBarkPush(){
  var input=document.getElementById('barkKeyInput');
  var key=(input&&input.value.trim())||barkKey;
  if(!key){alert('请先填写 Bark Key');return;}
  var btn=document.getElementById('barkTestBtn');
  var hint=document.getElementById('barkTestHint');
  var resetLabel='🔔 测试推送';
  if(btn){btn.disabled=true;btn.textContent='发送中…';}
  if(hint)hint.textContent='';
  var url='https://api.day.app/'+encodeURIComponent(key)+'/'+encodeURIComponent('LDiary测试')+'/'+encodeURIComponent('推送成功，小机在线');
  // Verified directly against api.day.app: a 200 response DOES carry
  // Access-Control-Allow-Origin:* (curl-checked with a real key), so on a
  // valid key a plain fetch() resolves and we can read the real body. Only
  // *error* responses (bad key etc.) come back with no CORS header at all —
  // that specific case still surfaces as an opaque rejection we can't read
  // past, which is a Bark-server asymmetry, not something fixable here.
  // AbortController forces a decision after 12s — without it, a request
  // that just hangs (network path to api.day.app stalling) never settles
  // either .then or .catch, leaving the button stuck on "发送中…" forever.
  var timedOut=false;
  var controller=(typeof AbortController!=='undefined')?new AbortController():null;
  var timeoutId=controller?setTimeout(function(){timedOut=true;controller.abort();},12000):null;
  fetch(url,controller?{signal:controller.signal}:{})
    .then(function(res){
      clearTimeout(timeoutId);
      return res.json().catch(function(){return null;}).then(function(data){
        var ok=res.ok&&data&&data.code===200;
        if(btn)btn.textContent=ok?'✅ 已发送，请查看手机通知':'⚠️ 服务器拒绝';
        if(hint)hint.textContent=ok?'':'Bark 返回：'+(data&&data.message?data.message:('HTTP '+res.status))+'，请检查 Key 是否正确';
      });
    })
    .catch(function(err){
      clearTimeout(timeoutId);
      if(timedOut){
        // Settled by our own abort, not a real browser error — the request
        // never got a response within 12s. That points at the network path
        // from this device to api.day.app, not at the app's code (a curl
        // from a different network can succeed while this still times out).
        if(btn)btn.textContent='⏱ 请求超时';
        if(hint)hint.textContent='12 秒内无响应，请换一个网络（WiFi/蜂窝切换）再试';
      } else {
        // A real network-level failure (offline, blocked, or — very likely
        // if this page was opened as a local file — Safari refusing
        // outbound fetch() from a file:// origin).
        if(btn)btn.textContent='❌ 发送失败';
        if(hint)hint.textContent='请求未发出：'+(err&&err.message?err.message:String(err));
      }
    })
    .then(function(){
      setTimeout(function(){
        if(btn){btn.disabled=false;btn.textContent=resetLabel;}
      },6000);
    });
}

// ── QUICK MENU (header gear · menu items adapt to the active page) ──
var quickMenuConfig={
  home:[
    {icon:'◫',label:'壁纸设置',action:function(){openBgModalFor('home');}},
    {icon:'⠿',label:'图标排序',action:function(){enterEditMode();}}
  ],
  chat:[
    {icon:'◫',label:'背景设置',action:function(){openBgModalFor('chat');}},
    {icon:'◑',label:'气泡透明度',action:function(){openBubbleOpacityModal();}},
    {icon:'⚙',label:'API 设置',action:function(){openApiModal();}}
  ],
  memory:[
    {icon:'◫',label:'背景设置',action:function(){openBgModalFor('memory');}},
    {icon:'⚙',label:'API 设置',action:function(){openApiModal();}}
  ],
  together:[
    {icon:'◫',label:'背景设置',action:function(){openBgModalFor('together');}},
    {icon:'♪',label:'播放器主题',action:function(){openPlayerThemeModal();}},
    {icon:'⚙',label:'API 设置',action:function(){openApiModal();}}
  ],
  profile:[
    {icon:'✎',label:'编辑人设',action:function(){openPersonaEditorPage();}},
    {icon:'◈',label:'AI 设置',action:function(){openAiModal();}}
  ],
  'persona-editor':[
    {icon:'◉',label:'角色档案',action:function(){openRoleProfilePage();}},
    {icon:'◎',label:'保存人设',action:function(){savePersonaPage();}}
  ]
};
function currentPageKey(){var active=document.querySelector('.page.active');return active?active.id.replace('page-',''):'home';}
var quickMenuClearTimer=null;
function openQuickMenu(){
  clearTimeout(quickMenuClearTimer);
  var menu=document.getElementById('quickMenu');
  var items=quickMenuConfig[currentPageKey()]||quickMenuConfig.home;
  menu.innerHTML='';
  items.forEach(function(item){
    var row=document.createElement('div');
    row.className='quickmenu-item';
    row.innerHTML='<div class="quickmenu-icon">'+item.icon+'</div><span>'+item.label+'</span>';
    row.addEventListener('click',function(e){
      spawnQuickMenuRipple(row,e);
      item.action();
      setTimeout(closeQuickMenu,120);
    });
    menu.appendChild(row);
  });
  menu.classList.add('show');
}
function closeQuickMenu(){
  var menu=document.getElementById('quickMenu');
  menu.classList.remove('show');
  // Drop the rendered items once the slide-up finishes (300ms, matches the
  // CSS transition) so the box goes back to zero height while hidden. Left
  // in place, the stale items gave the closed menu real height, and its
  // translateY(-100%) then dragged that tall box up over the header —
  // covering the gear button and swallowing its clicks.
  clearTimeout(quickMenuClearTimer);
  quickMenuClearTimer=setTimeout(function(){menu.innerHTML='';},300);
}
function spawnQuickMenuRipple(el,e){
  var rect=el.getBoundingClientRect();
  var size=Math.max(rect.width,rect.height);
  var ripple=document.createElement('span');
  ripple.className='quickmenu-ripple';
  ripple.style.width=ripple.style.height=size+'px';
  ripple.style.left=(e.clientX-rect.left-size/2)+'px';
  ripple.style.top=(e.clientY-rect.top-size/2)+'px';
  el.appendChild(ripple);
  setTimeout(function(){ripple.remove();},500);
}
document.addEventListener('click',function(e){
  var menu=document.getElementById('quickMenu');
  if(menu&&menu.classList.contains('show')&&!menu.contains(e.target)&&!e.target.closest('.header-left'))closeQuickMenu();
});

// ── SETTINGS NAVIGATION ──
function openSettingsPage(){
  closeDrawer();
  switchTab('settings',null);
}
function openAssistantSettingsPage(){
  renderAssistantCards();
  switchTab('assistant-settings',null);
}
function openModelSettingsPage(){
  updateModelSettingsDisplay();
  var target=document.getElementById('page-model-settings');
  document.querySelectorAll('.page').forEach(function(page){page.classList.remove('active');});
  if(target){target.classList.add('active');}
}
function updateModelSettingsDisplay(){
  var apiDesc=document.getElementById('modelSettingsApiDesc');
  var currentValue=document.getElementById('modelSettingsCurrentValue');
  var barkDesc=document.getElementById('modelSettingsBarkDesc');
  if(apiDesc) apiDesc.textContent=apiKey ? '已配置 - '+model : '未配置';
  if(currentValue) currentValue.textContent=model||'gpt-4o-mini';
  if(barkDesc) barkDesc.textContent=barkKey ? '已配置' : '未配置';
}
function openDataManagementPanel(){
  switchTab('settings',null);
  catBubbleShow('数据管理功能在 Mine 的设置中',2000);
}
function openPersonalizationPanel(){
  switchTab('settings',null);
  catBubbleShow('个性化设置在 Mine 的设置中',2000);
}

// ── MODAL HELPERS ──
function openModal(id){document.getElementById(id).classList.add('show');}
function closeModal(id){document.getElementById(id).classList.remove('show');}
function closeModalOutside(e,id){if(e.target===document.getElementById(id))closeModal(id);}

// ── SETTINGS DISPLAY HELPERS ──
function updateApiStatus(){var ok=!!apiKey;['statusDot','statusDot2'].forEach(function(id){var el=document.getElementById(id);if(el)el.className='status-dot'+(ok?' ok':'');});}
function updatePlayerThemeVal(){var t=playerThemes.find(function(t){return t.color===playerTheme;});var label=playerThemeImg?'自定义图片':(t?t.label:'自定义');var el=document.getElementById('playerThemeVal');if(el)el.textContent=label+' · '+playerOpacity+'%';}

// ── CHAT APPEARANCE SETTINGS ──
// 状态变量
var chatAppearanceSettings={
  avatarSize:parseInt(localStorage.getItem('ld_chat_avatar_size')||'56'),
  avatarShape:localStorage.getItem('ld_chat_avatar_shape')||'circle',
  bubbleMaxWidth:parseInt(localStorage.getItem('ld_chat_bubble_max_width')||'70'),
  bubbleRadius:parseInt(localStorage.getItem('ld_chat_bubble_radius')||'16'),
  bubblePadding:parseInt(localStorage.getItem('ld_chat_bubble_padding')||'10'),
  userBubbleColor:localStorage.getItem('ld_chat_user_bubble_color')||'#1c1c1e',
  aiBubbleColor:localStorage.getItem('ld_chat_ai_bubble_color')||'#ffffff',
  bubbleOpacity:parseInt(localStorage.getItem('ld_chat_bubble_opacity')||'92'),
  showUserName:localStorage.getItem('ld_chat_show_username')!=='false',
  showAiName:localStorage.getItem('ld_chat_show_ainame')!=='false',
  showMessageTime:localStorage.getItem('ld_chat_show_time')!=='false'
};

function openChatAppearancePage(){
  switchTab('chat-appearance',null);
  initChatAppearanceSettings();
}

function initChatAppearanceSettings(){
  // 初始化滑块
  var avatarSizeSlider=document.getElementById('avatarSizeSlider');
  var bubbleWidthSlider=document.getElementById('bubbleWidthSlider');
  var bubbleRadiusSlider=document.getElementById('bubbleRadiusSlider');
  var bubblePaddingSlider=document.getElementById('bubblePaddingSlider');
  var bubbleOpacityRange=document.getElementById('bubbleOpacityRange');

  if(avatarSizeSlider)avatarSizeSlider.value=chatAppearanceSettings.avatarSize;
  if(bubbleWidthSlider)bubbleWidthSlider.value=chatAppearanceSettings.bubbleMaxWidth;
  if(bubbleRadiusSlider)bubbleRadiusSlider.value=chatAppearanceSettings.bubbleRadius;
  if(bubblePaddingSlider)bubblePaddingSlider.value=chatAppearanceSettings.bubblePadding;
  if(bubbleOpacityRange){
    bubbleOpacityRange.value=chatAppearanceSettings.bubbleOpacity;
    document.getElementById('bubbleOpacityLabel').textContent=chatAppearanceSettings.bubbleOpacity+'%';
  }

  // 初始化颜色
  var userColorInput=document.getElementById('userBubbleColorInput');
  var aiColorInput=document.getElementById('aiBubbleColorInput');
  if(userColorInput)userColorInput.value=chatAppearanceSettings.userBubbleColor;
  if(aiColorInput)aiColorInput.value=chatAppearanceSettings.aiBubbleColor;

  // 初始化形状按钮
  document.querySelectorAll('.chat-appearance-shape-btn').forEach(function(btn){
    btn.classList.remove('active');
    if(btn.dataset.shape===chatAppearanceSettings.avatarShape){
      btn.classList.add('active');
    }
  });

  // 初始化复选框
  var showUserName=document.getElementById('showUserName');
  var showAiName=document.getElementById('showAiName');
  var showTime=document.getElementById('showMessageTime');
  if(showUserName)showUserName.checked=chatAppearanceSettings.showUserName;
  if(showAiName)showAiName.checked=chatAppearanceSettings.showAiName;
  if(showTime)showTime.checked=chatAppearanceSettings.showMessageTime;

  // 更新预览
  updateChatAppearancePreview();
}

function updateChatAppearancePreview(){
  // 获取所有输入值
  var avatarSize=parseInt(document.getElementById('avatarSizeSlider')?.value||56);
  var bubbleWidth=parseInt(document.getElementById('bubbleWidthSlider')?.value||70);
  var bubbleRadius=parseInt(document.getElementById('bubbleRadiusSlider')?.value||16);
  var bubblePadding=parseInt(document.getElementById('bubblePaddingSlider')?.value||10);
  var userBubbleColor=document.getElementById('userBubbleColorInput')?.value||'#1c1c1e';
  var aiBubbleColor=document.getElementById('aiBubbleColorInput')?.value||'#ffffff';
  var showUserName=document.getElementById('showUserName')?.checked!==false;
  var showAiName=document.getElementById('showAiName')?.checked!==false;
  var showTime=document.getElementById('showMessageTime')?.checked!==false;

  // 更新标签
  document.getElementById('avatarSizeLabel').textContent=avatarSize<=40?'小':avatarSize<=56?'中':'大';
  document.getElementById('bubbleWidthLabel').textContent=bubbleWidth;
  document.getElementById('bubbleRadiusLabel').textContent=bubbleRadius;
  document.getElementById('bubblePaddingLabel').textContent=bubblePadding;
  document.getElementById('userBubbleColorLabel').textContent=userBubbleColor;
  document.getElementById('aiBubbleColorLabel').textContent=aiBubbleColor;

  // 更新预览消息样式
  var previewAiMsg=document.getElementById('previewAiMsg');
  var previewUserMsg=document.getElementById('previewUserMsg');
  var previewAiAvatar=document.getElementById('previewAiAvatar');
  var previewUserAvatar=document.getElementById('previewUserAvatar');
  var previewAiName=document.getElementById('previewAiName');
  var previewUserName=document.getElementById('previewUserName');
  var previewAiTime=document.getElementById('previewAiTime');
  var previewUserTime=document.getElementById('previewUserTime');
  var previewMessages=document.getElementById('previewMessages');

  if(previewMessages){
    previewMessages.style.border='none';
    previewMessages.style.borderWidth='0';
    previewMessages.style.borderStyle='none';
    previewMessages.style.borderColor='transparent';
    previewMessages.style.outline='none';
    previewMessages.style.boxShadow='none';
  }

  // 更新头像尺寸和形状
  if(previewAiAvatar){
    previewAiAvatar.style.width=avatarSize+'px';
    previewAiAvatar.style.height=avatarSize+'px';
    applyAvatarShape(previewAiAvatar,chatAppearanceSettings.avatarShape);
  }
  if(previewUserAvatar){
    previewUserAvatar.style.width=avatarSize+'px';
    previewUserAvatar.style.height=avatarSize+'px';
    applyAvatarShape(previewUserAvatar,chatAppearanceSettings.avatarShape);
  }

  // 更新气泡样式
  var bubbles=document.querySelectorAll('#previewMessages .bubble');
  bubbles.forEach(function(bubble){
    bubble.style.borderRadius=bubbleRadius+'px';
    bubble.style.padding=bubblePadding+'px '+(bubblePadding+4)+'px';
    if(bubble.closest('.msg-row.ai')){
      bubble.style.backgroundColor=aiBubbleColor;
      bubble.style.color=getContrastColor(aiBubbleColor);
      bubble.style.opacity='1';
    }else if(bubble.closest('.msg-row.user')){
      bubble.style.backgroundColor=userBubbleColor;
      bubble.style.color='#fff';
      bubble.style.opacity='1';
    }
  });

  // 更新名称和时间显示
  if(previewAiName)previewAiName.style.display=showAiName?'block':'none';
  if(previewUserName)previewUserName.style.display=showUserName?'block':'none';
  if(previewAiTime)previewAiTime.style.display=showTime?'block':'none';
  if(previewUserTime)previewUserTime.style.display=showTime?'block':'none';

  // 优化预览定位：确保预览区域滚动到可见范围
  var previewBox=document.querySelector('.chat-appearance-preview-box');
  if(previewBox){
    previewBox.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}

function applyAvatarShape(avatarEl,shape){
  switch(shape){
    case 'circle':
      avatarEl.style.borderRadius='50%';
      break;
    case 'rounded':
      avatarEl.style.borderRadius='12px';
      break;
    case 'square':
      avatarEl.style.borderRadius='0';
      break;
  }
}

function setChatAvatarShape(shape){
  chatAppearanceSettings.avatarShape=shape;
  document.querySelectorAll('.chat-appearance-shape-btn').forEach(function(btn){
    btn.classList.remove('active');
    if(btn.dataset.shape===shape){
      btn.classList.add('active');
    }
  });
  updateChatAppearancePreview();
}

function getContrastColor(hexColor){
  var normalized=(hexColor||'#ffffff').trim();
  if(normalized.startsWith('#')===false) normalized='#'+normalized;
  var clean=normalized.replace('#','');
  if(clean.length===3){clean=clean.split('').map(function(ch){return ch+ch;}).join('');}
  var r=parseInt(clean.substr(0,2),16)||0;
  var g=parseInt(clean.substr(2,2),16)||0;
  var b=parseInt(clean.substr(4,2),16)||0;
  var brightness=(r*299+g*587+b*114)/1000;
  return brightness>155?'#000':'#fff';
}
function colorToRgba(hexColor, opacityPercent){
  var normalized=(hexColor||'#1c1c1e').trim();
  if(normalized.startsWith('rgba(') || normalized.startsWith('rgb(')){ return normalized; }
  if(normalized.startsWith('#')===false) normalized='#'+normalized;
  var clean=normalized.replace('#','');
  if(clean.length===3){clean=clean.split('').map(function(ch){return ch+ch;}).join('');}
  var r=parseInt(clean.substr(0,2),16)||0;
  var g=parseInt(clean.substr(2,2),16)||0;
  var b=parseInt(clean.substr(4,2),16)||0;
  var alpha=Math.max(0,Math.min(1,(parseInt(opacityPercent||100,10)/100)));
  return 'rgba('+r+', '+g+', '+b+', '+alpha+')';
}

function resetChatAppearance(){
  if(confirm('确定要恢复默认设置吗？')){
    chatAppearanceSettings={
      avatarSize:56,
      avatarShape:'circle',
      bubbleMaxWidth:70,
      bubbleRadius:16,
      bubblePadding:10,
      userBubbleColor:'#1c1c1e',
      aiBubbleColor:'#ffffff',
      bubbleOpacity:92,
      showUserName:true,
      showAiName:true,
      showMessageTime:true
    };
    localStorage.setItem('ld_chat_bubble_opacity',String(chatAppearanceSettings.bubbleOpacity));
    document.documentElement.style.setProperty('--bubble-opacity',chatAppearanceSettings.bubbleOpacity/100);
    initChatAppearanceSettings();
    applyChatAppearanceSettings();
  }
}

function saveChatAppearance(){
  // 从 UI 获取最新值
  chatAppearanceSettings.avatarSize=parseInt(document.getElementById('avatarSizeSlider')?.value||56);
  chatAppearanceSettings.bubbleMaxWidth=parseInt(document.getElementById('bubbleWidthSlider')?.value||70);
  chatAppearanceSettings.bubbleRadius=parseInt(document.getElementById('bubbleRadiusSlider')?.value||16);
  chatAppearanceSettings.bubblePadding=parseInt(document.getElementById('bubblePaddingSlider')?.value||10);
  chatAppearanceSettings.userBubbleColor=document.getElementById('userBubbleColorInput')?.value||'#1c1c1e';
  chatAppearanceSettings.aiBubbleColor=document.getElementById('aiBubbleColorInput')?.value||'#ffffff';
  chatAppearanceSettings.bubbleOpacity=parseInt(document.getElementById('bubbleOpacityRange')?.value||92);
  chatAppearanceSettings.showUserName=document.getElementById('showUserName')?.checked!==false;
  chatAppearanceSettings.showAiName=document.getElementById('showAiName')?.checked!==false;
  chatAppearanceSettings.showMessageTime=document.getElementById('showMessageTime')?.checked!==false;

  // 保存到 localStorage
  localStorage.setItem('ld_chat_avatar_size',String(chatAppearanceSettings.avatarSize));
  localStorage.setItem('ld_chat_avatar_shape',chatAppearanceSettings.avatarShape);
  localStorage.setItem('ld_chat_bubble_max_width',String(chatAppearanceSettings.bubbleMaxWidth));
  localStorage.setItem('ld_chat_bubble_radius',String(chatAppearanceSettings.bubbleRadius));
  localStorage.setItem('ld_chat_bubble_padding',String(chatAppearanceSettings.bubblePadding));
  localStorage.setItem('ld_chat_user_bubble_color',chatAppearanceSettings.userBubbleColor);
  localStorage.setItem('ld_chat_ai_bubble_color',chatAppearanceSettings.aiBubbleColor);
  localStorage.setItem('ld_chat_bubble_opacity',String(chatAppearanceSettings.bubbleOpacity));
  localStorage.setItem('ld_chat_show_username',String(chatAppearanceSettings.showUserName));
  localStorage.setItem('ld_chat_show_ainame',String(chatAppearanceSettings.showAiName));
  localStorage.setItem('ld_chat_show_time',String(chatAppearanceSettings.showMessageTime));

  // 应用CSS变量
  document.documentElement.style.setProperty('--bubble-opacity',chatAppearanceSettings.bubbleOpacity/100);

  // 应用设置到当前聊天页面
  applyChatAppearanceSettings();

  alert('设置已保存！');
  openSettingsPage();
}

function applyChatAppearanceSettings(){
  // 应用到所有消息
  var messages=document.getElementById('messages');
  if(!messages)return;

  // 更新CSS变量
  document.documentElement.style.setProperty('--bubble-opacity',chatAppearanceSettings.bubbleOpacity/100);
  if(document.getElementById('bubbleOpacityRange')) document.getElementById('bubbleOpacityRange').value=chatAppearanceSettings.bubbleOpacity;
  if(document.getElementById('bubbleOpacityLabel')) document.getElementById('bubbleOpacityLabel').textContent=chatAppearanceSettings.bubbleOpacity+'%';

  var msgRows=messages.querySelectorAll('.msg-row');
  msgRows.forEach(function(row){
    // 更新头像
    var avatar=row.querySelector('.msg-avatar');
    if(avatar){
      avatar.style.width=chatAppearanceSettings.avatarSize+'px';
      avatar.style.height=chatAppearanceSettings.avatarSize+'px';
      applyAvatarShape(avatar,chatAppearanceSettings.avatarShape);
    }

    // 更新气泡
    var bubble=row.querySelector('.bubble');
    if(bubble){
      bubble.style.borderRadius=chatAppearanceSettings.bubbleRadius+'px';
      bubble.style.padding=chatAppearanceSettings.bubblePadding+'px '+(chatAppearanceSettings.bubblePadding+4)+'px';
      bubble.style.minHeight='0';
      bubble.style.height='auto';

      var userBubbleColor = colorToRgba(chatAppearanceSettings.userBubbleColor || '#1c1c1e', chatAppearanceSettings.bubbleOpacity);
      var aiBubbleColor = colorToRgba(chatAppearanceSettings.aiBubbleColor || '#ffffff', chatAppearanceSettings.bubbleOpacity);

      if(row.classList.contains('ai')){
        bubble.style.backgroundColor=aiBubbleColor;
        bubble.style.opacity='1';
        bubble.style.color=getContrastColor(chatAppearanceSettings.aiBubbleColor||'#ffffff');
      }else if(row.classList.contains('user')){
        bubble.style.backgroundColor=userBubbleColor;
        bubble.style.opacity='1';
        bubble.style.color='#fff';
      }
    }

    // 更新名称和时间显示
    var author=row.querySelector('.msg-author');
    var time=row.querySelector('.msg-time');
    if(author)author.style.display=(row.classList.contains('ai')?chatAppearanceSettings.showAiName:chatAppearanceSettings.showUserName)?'block':'none';
    if(time)time.style.display=chatAppearanceSettings.showMessageTime?'block':'none';
  });
}
