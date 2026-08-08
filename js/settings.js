// ── SETTINGS STATE (api / profile / bg / player / bubble / avatar) ──
var apiKey=localStorage.getItem('ld_key')||'';
var model=localStorage.getItem('ld_model')||'gpt-4o-mini';
var myName=localStorage.getItem('ld_myname')||'L';
var myBio=localStorage.getItem('ld_mybio')||'你的私人空间';
var aiName=localStorage.getItem('ld_ainame')||'';
var aiPrompt=localStorage.getItem('ld_aiprompt')||'';
var playerTheme=localStorage.getItem('ld_playertheme')||'#1c1c1e';
var playerThemeImg=localStorage.getItem('ld_playerthemeimg')||'';
var playerOpacity=parseInt(localStorage.getItem('ld_playeropacity')||'100');
var bubbleOpacity=parseInt(localStorage.getItem('ld_bubbleopacity')||'92');
var barkKey=localStorage.getItem('bark_key')||'';
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
var currentBgTab='chat',pendingBg={};

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
function applyBubbleOpacity(){document.documentElement.style.setProperty('--bubble-opacity',bubbleOpacity/100);}

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
function openBubbleOpacityModal(){document.getElementById('bubbleOpacityRange').value=bubbleOpacity;document.getElementById('bubbleOpacityLabel').textContent=bubbleOpacity+'%';openModal('bubbleOpacityModal');}
function previewBubbleOpacity(val){document.getElementById('bubbleOpacityLabel').textContent=val+'%';document.documentElement.style.setProperty('--bubble-opacity',parseInt(val)/100);}
function saveBubbleOpacity(){bubbleOpacity=parseInt(document.getElementById('bubbleOpacityRange').value);localStorage.setItem('ld_bubbleopacity',String(bubbleOpacity));applyBubbleOpacity();document.getElementById('bubbleOpacityVal').textContent=bubbleOpacity+'%';closeModal('bubbleOpacityModal');}

// ── PROFILE / AI / API / AVATAR ──
function openApiModal(){document.getElementById('keyInput').value=apiKey;document.getElementById('modelSelect').value=model;openModal('apiModal');}
function saveApi(){apiKey=document.getElementById('keyInput').value.trim();model=document.getElementById('modelSelect').value;localStorage.setItem('ld_key',apiKey);localStorage.setItem('ld_model',model);updateApiStatus();if(apiKey)document.getElementById('apiVal').textContent=model;closeModal('apiModal');}
function openProfileModal(){document.getElementById('myNameInput').value=myName;document.getElementById('myBioInput').value=myBio;openModal('profileModal');}
function saveProfile(){myName=document.getElementById('myNameInput').value.trim()||'L';myBio=document.getElementById('myBioInput').value.trim()||'你的私人空间';localStorage.setItem('ld_myname',myName);localStorage.setItem('ld_mybio',myBio);document.getElementById('profileName').textContent=myName;document.getElementById('profileSub').textContent=myBio;closeModal('profileModal');}
function openAiModal(){document.getElementById('aiNameInput').value=aiName;document.getElementById('aiPromptInput').value=aiPrompt;openModal('aiModal');}
function saveAi(){aiName=document.getElementById('aiNameInput').value.trim();aiPrompt=document.getElementById('aiPromptInput').value.trim();localStorage.setItem('ld_ainame',aiName);localStorage.setItem('ld_aiprompt',aiPrompt);document.getElementById('aiNameVal').textContent=aiName||'未设置';closeModal('aiModal');}
function triggerAvatarUpload(){document.getElementById('avatarInput').click();}
function handleAvatar(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){localStorage.setItem('ld_avatar',ev.target.result);document.getElementById('avatarDisplay').innerHTML='<img src="'+ev.target.result+'"/>';};reader.readAsDataURL(file);}

// ── PUSH / BARK ──
function openBarkModal(){document.getElementById('barkKeyInput').value=barkKey;var log=document.getElementById('barkDebugLog');if(log){log.style.display='none';log.textContent='';}openModal('barkModal');}
function barkLog(msg){
  var log=document.getElementById('barkDebugLog');
  if(!log)return;
  log.style.display='block';
  log.textContent+=(log.textContent?'\n':'')+msg;
  log.scrollTop=log.scrollHeight;
}
function saveBark(){barkKey=document.getElementById('barkKeyInput').value.trim();localStorage.setItem('bark_key',barkKey);updateBarkStatus();closeModal('barkModal');}
function updateBarkStatus(){var ok=!!barkKey;['barkStatusDot','barkStatusDot2'].forEach(function(id){var el=document.getElementById(id);if(el)el.className='status-dot'+(ok?' ok':'');});document.getElementById('barkVal').textContent=ok?'已配置':'未配置';}
function testBarkPush(){
  var input=document.getElementById('barkKeyInput');
  var key=(input&&input.value.trim())||barkKey;
  if(!key){alert('请先填写 Bark Key');return;}
  var btn=document.getElementById('barkTestBtn');
  var hint=document.getElementById('barkTestHint');
  var log=document.getElementById('barkDebugLog');
  var resetLabel='🔔 测试推送';
  if(btn){btn.disabled=true;btn.textContent='发送中…';}
  if(hint)hint.textContent='';
  if(log){log.textContent='';log.style.display='none';}
  var url='https://api.day.app/'+encodeURIComponent(key)+'/'+encodeURIComponent('LDiary测试')+'/'+encodeURIComponent('推送成功，小机在线');
  // Verified directly against api.day.app: a 200 response DOES carry
  // Access-Control-Allow-Origin:* (curl-checked with a real key), so on a
  // valid key a plain fetch() resolves and we can read the real body. Only
  // *error* responses (bad key etc.) come back with no CORS header at all —
  // that specific case still surfaces as an opaque rejection we can't read
  // past, which is a Bark-server asymmetry, not something fixable here.
  // Everything below goes into #barkDebugLog (visible on the page, not just
  // console.log) — most testers here are on iPhone Safari with no devtools,
  // so the exact failure point needs to be readable without an inspector.
  barkLog('请求 URL: '+url);
  barkLog('页面地址: '+location.href);
  fetch(url)
    .then(function(res){
      barkLog('收到响应: HTTP '+res.status+'（ok='+res.ok+', type='+res.type+'）');
      return res.json().catch(function(jsonErr){barkLog('响应体不是 JSON: '+jsonErr);return null;}).then(function(data){
        barkLog('响应内容: '+(data?JSON.stringify(data):'(空)'));
        var ok=res.ok&&data&&data.code===200;
        if(btn)btn.textContent=ok?'✅ 已发送，请查看手机通知':'⚠️ 服务器拒绝';
        if(hint)hint.textContent=ok?'':'Bark 返回：'+(data&&data.message?data.message:('HTTP '+res.status))+'，请检查 Key 是否正确';
      });
    })
    .catch(function(err){
      // A real network-level failure (offline, blocked, or — very likely if
      // this page was opened as a local file — Safari refusing outbound
      // fetch() from a file:// origin).
      barkLog('fetch 被拒绝: '+(err&&err.name)+' — '+(err&&err.message?err.message:String(err)));
      if(btn)btn.textContent='❌ 发送失败';
      if(hint)hint.textContent='请求未发出，详情见下方日志';
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

// ── MODAL HELPERS ──
function openModal(id){document.getElementById(id).classList.add('show');}
function closeModal(id){document.getElementById(id).classList.remove('show');}
function closeModalOutside(e,id){if(e.target===document.getElementById(id))closeModal(id);}

// ── SETTINGS DISPLAY HELPERS ──
function updateApiStatus(){var ok=!!apiKey;['statusDot','statusDot2'].forEach(function(id){document.getElementById(id).className='status-dot'+(ok?' ok':'');});}
function updatePlayerThemeVal(){var t=playerThemes.find(function(t){return t.color===playerTheme;});var label=playerThemeImg?'自定义图片':(t?t.label:'自定义');document.getElementById('playerThemeVal').textContent=label+' · '+playerOpacity+'%';}
