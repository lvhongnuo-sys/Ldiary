// Supabase 客户端配置
// 需要在 HTML 中引入 Supabase SDK：
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

var supabaseClient = null;
var supabaseUrl = localStorage.getItem('sb_url') || '';
var supabaseAnonKey = localStorage.getItem('sb_anonkey') || '';

function initSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] 未配置 URL 或 ANON_KEY，跳过初始化');
    return;
  }

  if (typeof window.supabase === 'undefined') {
    console.error('[Supabase] SDK 未加载，请在 HTML 中引入 Supabase CDN');
    return;
  }

  supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  console.log('[Supabase] 客户端初始化成功');
}

function getSupabaseClient() {
  if (!supabaseClient) {
    initSupabase();
  }
  return supabaseClient;
}

function setSupabaseConfig(url, anonKey) {
  supabaseUrl = url;
  supabaseAnonKey = anonKey;
  localStorage.setItem('sb_url', url);
  localStorage.setItem('sb_anonkey', anonKey);
  supabaseClient = null;
  initSupabase();
}