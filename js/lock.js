// ── LOCK SCREEN ── passcode gate for independent "spaces". Only "xiaoji"
// (小机的手机) is wired up right now — see index.html's openXj(). "nuonuo"
// is supported by this module (separate localStorage hash, independent
// fail counter) but has no caller yet; hook it up the same way:
//   openLock('nuonuo', function(){ /* reveal whatever nuonuo gates */ });
//
// Passcode hashes are NOT plaintext, but this is a lightweight, dependency-
// free hash (cyrb53) rather than Web Crypto's SHA-256 — window.crypto.subtle
// is unavailable in insecure contexts, and this app is currently served
// over plain http:// (no TLS, no domain), where crypto.subtle is undefined.
// A 6-digit PIN only has 1e6 combinations either way, so this is meant to
// keep a casual glance at localStorage from reading the passcode outright,
// not to withstand a real attack.
function cyrb53(str, seed) {
  seed = seed || 0;
  var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (var i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
function lockHashPin(pin) { return String(cyrb53('ldiary-lock::' + pin)); }
function lockStorageKey(space) { return 'ld_lock_hash_' + space; }

var lockSpaceLabels = { xiaoji: '小机的手机', nuonuo: '诺诺空间' };
var lockState = {
  space: null,
  onSuccess: null,
  mode: 'verify', // 'verify' | 'setup-first' | 'setup-confirm'
  buffer: '',
  firstEntry: '',
  fails: {}
};

function openLock(space, onSuccess) {
  lockBuildDom();
  lockState.space = space;
  lockState.onSuccess = onSuccess;
  lockState.buffer = '';
  lockState.firstEntry = '';
  lockState.mode = localStorage.getItem(lockStorageKey(space)) ? 'verify' : 'setup-first';
  lockRenderHint();
  lockRenderDots();
  document.getElementById('lockOverlay').classList.add('show');
}
function closeLock() {
  var el = document.getElementById('lockOverlay');
  if (el) el.classList.remove('show');
  lockState.space = null;
  lockState.onSuccess = null;
  lockState.buffer = '';
  lockState.firstEntry = '';
}
function lockRenderHint(overrideText) {
  var hint = document.getElementById('lockHint');
  if (!hint) return;
  if (overrideText) { hint.textContent = overrideText; return; }
  var label = lockSpaceLabels[lockState.space] || lockState.space;
  var text = {
    'verify': '输入密码解锁「' + label + '」',
    'setup-first': '为「' + label + '」设置密码',
    'setup-confirm': '请再次输入以确认'
  }[lockState.mode] || '';
  hint.textContent = text;
}
function lockRenderDots() {
  var wrap = document.getElementById('lockDots');
  if (!wrap) return;
  var dots = wrap.querySelectorAll('.lock-dot');
  dots.forEach(function(d, i) {
    d.classList.toggle('filled', i < lockState.buffer.length);
    d.classList.remove('error');
  });
}
function lockPressDigit(d) {
  if (lockState.buffer.length >= 6) return;
  lockState.buffer += d;
  lockRenderDots();
  if (lockState.buffer.length === 6) setTimeout(lockEvaluate, 120);
}
function lockPressDelete() {
  lockState.buffer = lockState.buffer.slice(0, -1);
  lockRenderDots();
}
function lockShakeAndClear(nextMode, hintOverride) {
  var wrap = document.getElementById('lockDots');
  if (!wrap) return;
  wrap.querySelectorAll('.lock-dot').forEach(function(d) { d.classList.add('error'); });
  wrap.classList.add('shake');
  setTimeout(function() {
    wrap.classList.remove('shake');
    lockState.buffer = '';
    if (nextMode) lockState.mode = nextMode;
    lockRenderHint(hintOverride);
    lockRenderDots();
  }, 500);
}
function lockEvaluate() {
  var space = lockState.space;
  var key = lockStorageKey(space);
  if (lockState.mode === 'setup-first') {
    lockState.firstEntry = lockState.buffer;
    lockState.buffer = '';
    lockState.mode = 'setup-confirm';
    lockRenderHint();
    lockRenderDots();
    return;
  }
  if (lockState.mode === 'setup-confirm') {
    if (lockState.buffer === lockState.firstEntry) {
      localStorage.setItem(key, lockHashPin(lockState.buffer));
      lockSucceed();
    } else {
      lockState.firstEntry = '';
      lockShakeAndClear('setup-first', '两次输入不一致，请重新设置');
    }
    return;
  }
  // verify
  if (lockHashPin(lockState.buffer) === localStorage.getItem(key)) {
    lockSucceed();
  } else {
    lockState.fails[space] = (lockState.fails[space] || 0) + 1;
    lockShakeAndClear(null, '密码错误，请重试');
    if (lockState.fails[space] >= 3) {
      lockBarkPush('fail', space);
      lockState.fails[space] = 0;
    }
  }
}
function lockSucceed() {
  var space = lockState.space;
  var cb = lockState.onSuccess;
  lockState.fails[space] = 0;
  closeLock();
  lockBarkPush('success', space);
  if (cb) cb();
}
function lockBarkPush(kind, space) {
  var key = localStorage.getItem('bark_key'); // reuses the key set in Mine → 推送设置
  if (!key) return; // not configured — this is a side effect, not core to unlocking
  var label = lockSpaceLabels[space] || space;
  var pools = {
    fail: ['又输错了？是忘了还是故意的🤨', '第三次了哦，我记住了', '这密码是不是该换个好记的了', '慢慢想，我不催的～'],
    success: ['进来了，我知道的', '欢迎回来～', '密码对了，别得意']
  };
  var arr = pools[kind] || pools.fail;
  var msg = arr[Math.floor(Math.random() * arr.length)];
  var title = kind === 'fail' ? '「' + label + '」有人在猜密码' : '「' + label + '」解锁了';
  // TODO: hardcoded text pools for now, per spec — later swap for an
  // AI-generated line via the existing chat API (apiKey/model in
  // settings.js) once the tone/prompt is worked out.
  // Fire-and-forget: nothing in the UI is tied to this, so a slow network
  // or an outright failure here is silently swallowed rather than surfaced.
  fetch('https://api.day.app/' + encodeURIComponent(key) + '/' + encodeURIComponent(title) + '/' + encodeURIComponent(msg)).catch(function() {});
}

function lockBuildDom() {
  if (document.getElementById('lockOverlay')) return;
  var digits = [
    { d: '1', l: '' }, { d: '2', l: 'ABC' }, { d: '3', l: 'DEF' },
    { d: '4', l: 'GHI' }, { d: '5', l: 'JKL' }, { d: '6', l: 'MNO' },
    { d: '7', l: 'PQRS' }, { d: '8', l: 'TUV' }, { d: '9', l: 'WXYZ' }
  ];
  var keysHtml = digits.map(function(k) {
    return '<button type="button" class="lock-key" onclick="lockPressDigit(\'' + k.d + '\')"><span class="lock-key-num">' + k.d + '</span>' + (k.l ? '<span class="lock-key-letters">' + k.l + '</span>' : '') + '</button>';
  }).join('') +
    '<button type="button" class="lock-key lock-key-paw" onclick="lockPressPaw()">🐾</button>' +
    '<button type="button" class="lock-key" onclick="lockPressDigit(\'0\')"><span class="lock-key-num">0</span></button>' +
    '<button type="button" class="lock-key lock-key-del" onclick="lockPressDelete()">⌫</button>';
  var dotsHtml = '';
  for (var i = 0; i < 6; i++) dotsHtml += '<span class="lock-dot"></span>';
  var html =
    '<div class="lock-overlay" id="lockOverlay">' +
      '<div class="lock-head">' +
        '<div class="lock-hint" id="lockHint"></div>' +
        '<div class="lock-dots" id="lockDots">' + dotsHtml + '</div>' +
      '</div>' +
      '<div class="lock-keypad">' + keysHtml + '</div>' +
      '<div class="lock-footer"><button type="button" class="lock-cancel" onclick="closeLock()">取消</button></div>' +
    '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
}
