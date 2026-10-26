/**
 * 《望舟小棧 farfaring》共享數據核心（Single Source of Truth）
 * 所有前台頁面（index, resources, articles, about）與後台（admin.html）皆以此檔案為數據中心。
 * 當後台發布更新時，本檔案的 lastUpdated 與各項資料庫將同步更新。
 */

// 《關於望舟》頁面預設文案（Single Source of Truth 初始範本）
const DEFAULT_ABOUT_CONFIG = {
  heroEyebrow: "ABOUT FARFARING",
  heroTitle: "關於望舟・一個短暫停靠的地方",
  heroSubtitle: "這裡是短暫停靠的水岸小棧，陪你在迷惘時看清前方的路\n當你整理好腳步、蓄滿能量，隨時都能從容啟航，通往真正想要的生活",
  introTitle: "在小棧停靠，你能獲得什麼？",
  introText: "在生涯的河道上，很少有人是一路筆直划到底的。\n更多的時候，會遇到水霧、會覺得手臂痠痛，或是發現原本想去的地方，好像已經跟現在的自己不太一樣了。\n\n「望舟小棧」想做的，就是路途遇到的一段木棧道、一葉小舟。\n當你覺得累了、不知道下一步該往哪裡走的時候，可以先在這裡靠岸停一下。來這裡看看新事物，發現一點新靈感。\n等充好電了、看清楚方向了，隨時可以解開纜繩，帶著踏實的心情再次啟航。",
  collabTitle: "一則真誠的小記：關於這裡的產出",
  collabText: "身為職涯諮詢師的小棧長，看過許多在工作裡感到卡頓與焦慮的人，發現大家有時候需要的其實不是一場嚴肅的諮詢，而是一份實用資源的分享、一點新靈感的啟發，或是一段能讓自己慢下來、好好梳理思緒的時光。\n「望舟小棧」源自一個小小的起心動念，希望來到這裡的人，都能在這裡找到力量自己幫助自己，走出屬於自己的方向。\n\n這個小空間目前只有小棧長一人打理，時間與心力有限。為了不漏掉分散在各處的好資源與好觀點，內容由小棧長與 AI 共同協作——由 AI 協助追蹤龐雜的公開資訊與梳理初稿，再由小棧長親自逐篇查核、過濾與修正定稿。若有疏漏之處，請多包涵，也歡迎利用信箱提醒與交流。\n\n科技是輔助前行的工具，但想陪你走向理想生活的心意，才是真正的原動力。",
  consultTitle: "一對一公益職涯諮詢",
  consultDesc: "如果你正面臨具體的職涯瓶頸、職場困惑，或需要一個客觀專業的視角陪伴你梳理思緒，小棧每月定期提供限量的公益深度諮詢：",
  consultRules: [
    "參與費用：公益性質，不收取任何諮詢費用。",
    "深談時間：每次 1 小時（50 分鐘聚焦深談 ＋ 10 分鐘彙整總結）。",
    "進行方式：線上視訊會談（Google Meet 或約定工具）。",
    "善循環回饋：接受諮詢服務後，鼓勵你在未來一個月內，為身邊的人或社會做至少一項小小的公益善事，讓善意在人間流動。"
  ],
  consultBtnText: "📅 填寫諮詢預約意向 ↓",
  contactTitle: "聯絡小棧長",
  contactDesc: "如果你想預約公益職涯諮詢、交流想法，或有任何想與小棧聊聊的事，歡迎在此填表來信。"
};

const SITE_DATA = {
  // 網站全域營運設定
  siteInfo: {
    name: "望舟小棧",
    enName: "farfaring",
    tagline: "生活裡處處都是機會，陪你挖掘，陪你發現",
    siteUrl: "https://webfarfaring.vercel.app/",
    lastUpdated: "2026 年 10 月 21 日",
    adminTitle: "小棧長",
    contactEmail: "farfaring.space@gmail.com",
    instagram: "https://www.instagram.com/farfaring/",
    threads: "https://www.threads.net/@farfaring",
    disclaimer: "相關開課資訊請以各主辦單位公告為準 ｜ 望舟小棧 farfaring"
  },

  // 🌿 關於望舟頁面文案（支援後台隨時編輯微調、同步雲端）
  about: Object.assign({}, DEFAULT_ABOUT_CONFIG),

  // 首頁湖面漂浮棧板短句庫（支援後台隨時增減、調整三色分類）
  planks: [
    {
      id: "plank-01",
      categoryKey: "amber",
      categoryName: "🪵 陪伴停靠小語",
      quote: "「累了就先靠岸，棧板一直都在」",
      expanded: "並不是每個季節都要用力划槳。先把呼吸調順了、把身心照顧好了，木棧板永遠在這裡為你留一個停靠處。",
      author: "小棧長"
    },
    {
      id: "plank-02",
      categoryKey: "indigo",
      categoryName: "🌊 迷惘真實心聲",
      quote: "「不知往哪走時，停下來也是一種選擇」",
      expanded: "大家都在急著往前趕路，但停下來重新看看地圖與自己真正的需要，才不會在不適合自己的河道上筋疲力竭。",
      author: "夜航靠岸的朋友"
    },
    {
      id: "plank-03",
      categoryKey: "bamboo",
      categoryName: "🌿 帶得走的好觀點",
      quote: "「職涯不是直線，轉彎也是累積底氣」",
      expanded: "當代生涯發展研究指出：人的成長本就是非線性的。過去走過的每一段嘗試，都能在未來轉化為專屬於你的底氣。",
      author: "Herminia Ibarra 研究精華"
    },
    {
      id: "plank-04",
      categoryKey: "amber",
      categoryName: "🪵 陪伴停靠小語",
      quote: "「不要用別人的時鐘，來丈量自己的航程」",
      expanded: "每艘小舟吃水深淺不同、承載的重量不同，起風的季節也不同。走自己的節奏，本身就是一種勇氣。",
      author: "水岸漫步者"
    }
  ],

  // 木棧道・課程活動庫
  courses: [],

  // 水岸手札庫
  articles: [],

  // 訪客投稿審核箱
  submissions: [],

  // 📱 社群專屬稿庫與排程
  socialPosts: []
};

// 本機 localStorage 暫存快取回補（若主理人在後台編輯過但尚未同步或預覽）
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const localSaved = localStorage.getItem('WANGZHOU_SITE_DATA_OVERRIDE');
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (parsed && parsed.about) {
        SITE_DATA.about = Object.assign({}, SITE_DATA.about, parsed.about);
      }
    }
  }
} catch (e) {}

// =====================================================================
// ⚡ 《望舟小棧 farfaring》Supabase 雲端資料庫雙向即時連接引擎
// =====================================================================
const SUPABASE_CONFIG = {
  url: "https://zqkcnarvyklsifrqhfhd.supabase.co",
  key: "sb_publishable_czCscDq--2300rOfRMsMOA_kJVBXeUa"
};

// =====================================================================
// 🛡️ 前台輸出跳脫工具：所有從資料庫來的文字，塞進 innerHTML 前都必須經過這裡
// =====================================================================
function wzEscape(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 只允許 http/https 連結，擋掉 javascript: 等危險網址
function wzSafeUrl(value) {
  try {
    const u = new URL(String(value || ''), window.location.href);
    return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : '#';
  } catch (e) {
    return '#';
  }
}

// 用於 onclick 等屬性內的 id：只保留英數、底線與連字號
function wzSafeId(value) {
  return String(value || '').replace(/[^A-Za-z0-9_-]/g, '');
}

// 審稿等選填欄位：有值才送，避免舊畫面存檔時把雲端已有的資料蓋掉
function wzAddDefined(payload, fields) {
  Object.keys(fields).forEach(k => {
    if (fields[k] !== undefined) payload[k] = fields[k];
  });
  return payload;
}

const WangzhouCloud = {
  config: SUPABASE_CONFIG,

  // 後台登入後由 admin.html 設定，回傳有效的 access token；前台不設定，以訪客身分讀取
  getAccessToken: null,

  async request(endpoint, options = {}) {
    const url = `${this.config.url}/rest/v1/${endpoint}`;
    const headers = {
      "apikey": this.config.key,
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    if (typeof this.getAccessToken === 'function') {
      const token = await this.getAccessToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`雲端請求失敗 (${res.status}): ${err}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  },

  // 1. 手札文章 (Articles)
  async getArticles() {
    return await this.request('articles?select=*&order=created_at.desc');
  },
  async upsertArticle(article) {
    const payload = {
      id: article.id,
      cat_key: article.catKey || article.cat_key || 'career',
      cat_name: article.catName || article.cat_name || '職涯探索',
      date: article.date || '2026.10',
      title: article.title,
      prose: article.prose,
      status: article.status || 'active'
    };
    wzAddDefined(payload, {
      review_status: article.reviewStatus,
      review_note: article.reviewNote,
      audit_note: article.auditNote,
      source_url: article.sourceUrl
    });
    return await this.request('articles', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(payload)
    });
  },
  async deleteArticle(id) {
    return await this.request(`articles?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // 2. 精選課程 (Courses)
  async getCourses() {
    return await this.request('courses?select=*&order=created_at.desc');
  },
  async upsertCourse(course) {
    const payload = {
      id: course.id,
      name: course.title || course.name,
      organizer: course.provider || course.organizer,
      types: course.types || [],
      region: course.region || '線上',
      location: course.locationLabel || course.location || '線上課程',
      cost: course.cost || '免費',
      deadline: course.deadline || null,
      summary: course.summary || '',
      whisper: course.whisper || '',
      organizer_note: course.organizerNote || course.organizer_note || '',
      address: course.address || '',
      time_cycle: course.timeCycle || course.time_cycle || '',
      link: course.url || course.link,
      status: course.isDraft ? 'draft' : (course.active === false ? 'expired' : 'active')
    };
    wzAddDefined(payload, {
      review_status: course.reviewStatus,
      review_note: course.reviewNote,
      audit_note: course.auditNote
    });
    return await this.request('courses', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(payload)
    });
  },
  async deleteCourse(id) {
    return await this.request(`courses?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // 3. 木棧板小語 (Planks)
  async getPlanks() {
    return await this.request('planks?select=*&order=sort_order.asc,created_at.asc');
  },
  async upsertPlank(plank) {
    const payload = {
      id: plank.id,
      category_key: plank.categoryKey || plank.category_key || 'amber',
      category_name: plank.categoryName || plank.category_name || '🪵 陪伴停靠小語',
      quote: plank.quote,
      expanded: plank.expanded || '',
      author: plank.author || '小棧長',
      sort_order: typeof plank.sortOrder === 'number' ? plank.sortOrder : 0
    };
    return await this.request('planks', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(payload)
    });
  },
  async deletePlank(id) {
    return await this.request(`planks?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // 4. 訪客投稿審核箱 (Submissions)
  async getSubmissions() {
    return await this.request('submissions?select=*&order=created_at.desc');
  },
  // 訪客投稿：只寫入、不回讀（訪客沒有讀取投稿箱的權限）。長度上限與資料庫規則一致。
  async submitGuestFeedback(sub) {
    const clip = (v, max) => String(v || '').slice(0, max);
    const payload = {
      id: 'sub-' + Date.now(),
      type: sub.type || 'quote',
      type_name: clip(sub.typeName || sub.type_name || '棧道留言', 60),
      title: clip(sub.title, 200),
      author: clip(sub.author || '水岸漫步者', 60),
      contact: clip(sub.contact, 200),
      content: clip(sub.content, 5000),
      extra: clip(sub.extra, 2000),
      status: 'unread'
    };
    return await this.request('submissions', {
      method: 'POST',
      headers: { 'Prefer': 'return=minimal' },
      body: JSON.stringify(payload)
    });
  },
  async updateSubmissionStatus(id, status) {
    return await this.request(`submissions?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },
  async deleteSubmission(id) {
    return await this.request(`submissions?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // 4. 社群貼文排程 (Social Posts)
  async getSocialPosts() {
    return await this.request('social_posts?select=*&order=created_at.desc');
  },
  async upsertSocialPost(post) {
    const payload = {
      id: post.id,
      title: post.title,
      topic: post.topic || '生活步調',
      source_type: post.sourceType || post.source_type || 'none',
      source_id: post.sourceId || post.source_id || '',
      source_label: post.sourceLabel || post.source_label || '',
      target_platforms: post.targetPlatforms || post.target_platforms || ['threads'],
      versions: post.versions || {},
      content: post.content || '',
      media_notes: post.mediaNotes || post.media_notes || '',
      scheduled_date: post.scheduledDate || post.scheduled_date || null,
      scheduled_time_slot: post.scheduledTimeSlot || post.scheduled_time_slot || 'evening',
      time_slot_label: post.timeSlotLabel || post.time_slot_label || '🌙 晚間靠岸 (21:00)',
      status: post.status || 'scheduled',
      metrics_note: post.metricsNote || post.metrics_note || ''
    };
    wzAddDefined(payload, {
      review_status: post.reviewStatus,
      review_note: post.reviewNote,
      audit_note: post.auditNote,
      source_url: post.sourceUrl,
      image_url: post.imageUrl,
      scheduled_at: post.scheduledAt,
      buffer_post_ids: post.bufferPostIds,
      buffer_error: post.bufferError
    });
    return await this.request('social_posts', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(payload)
    });
  },
  async deleteSocialPost(id) {
    return await this.request(`social_posts?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // Buffer 排程轉送站（Supabase Edge Function：buffer-relay）；只有主理人登入後能用
  async bufferRelay(payload) {
    const token = typeof this.getAccessToken === 'function' ? await this.getAccessToken() : null;
    if (!token) throw new Error('請先登入後台');
    const res = await fetch(`${this.config.url}/functions/v1/buffer-relay`, {
      method: 'POST',
      headers: { apikey: this.config.key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || !data.ok) {
      throw new Error((data && data.error) || `轉送站回應狀態 ${res.status}`);
    }
    return data;
  },

  // 上傳 IG 圖卡到 social-cards 圖片空間，回傳公開網址（Buffer 與 Instagram 由此網址取圖）
  async uploadSocialCard(blob, fileName) {
    const token = typeof this.getAccessToken === 'function' ? await this.getAccessToken() : null;
    if (!token) throw new Error('請先登入後台');
    const path = `${wzSafeId(fileName)}.jpg`;
    const res = await fetch(`${this.config.url}/storage/v1/object/social-cards/${path}`, {
      method: 'POST',
      headers: { apikey: this.config.key, Authorization: `Bearer ${token}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
      body: blob
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`圖卡上傳失敗 (${res.status}): ${err}`);
    }
    return `${this.config.url}/storage/v1/object/public/social-cards/${path}`;
  },

  // 5. 網站全域設定與頁面文案 (Site Configs: about, etc.)
  async getSiteConfig(key) {
    const data = await this.request(`site_configs?key=eq.${encodeURIComponent(key)}&select=value`);
    return (data && data[0]) ? data[0].value : null;
  },
  async upsertSiteConfig(key, value) {
    const payload = {
      key: key,
      value: value,
      updated_at: new Date().toISOString()
    };
    return await this.request('site_configs', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(payload)
    });
  },

  // 6. 輕量流量統計與在線渡客 (Analytics & Realtime Presence)
  // 零個資、不記 IP、無 Cookie。僅記錄頁面、來源與 session，並回傳即時渡客數。
  getOrCreateSessionId() {
    if (typeof window === 'undefined') return 'server';
    try {
      let sid = sessionStorage.getItem('wz_sid');
      if (!sid) {
        sid = 'wz-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
        sessionStorage.setItem('wz_sid', sid);
      }
      return sid;
    } catch (e) {
      return 'wz-' + Date.now();
    }
  },

  detectReferrer() {
    if (typeof window === 'undefined') return '直接造訪';
    try {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get('from') || params.get('ref') || params.get('utm_source');
      if (fromParam) {
        if (fromParam.toLowerCase().includes('bio')) return 'Threads (個人首頁)';
        return fromParam;
      }
      const ref = document.referrer || '';
      if (!ref) return '直接造訪';
      const u = new URL(ref);
      const host = u.hostname.toLowerCase();
      if (host.includes('threads.net')) return 'Threads';
      if (host.includes('instagram.com')) return 'Instagram';
      if (host.includes('google.')) return 'Google 搜尋';
      if (host.includes('facebook.com')) return 'Facebook';
      if (host.includes('t.co') || host.includes('twitter.com') || host.includes('x.com')) return 'X (Twitter)';
      if (host === window.location.hostname) return '站內切換';
      return host;
    } catch (e) {
      return '其他來源';
    }
  },

  async recordVisit(page, title) {
    const sid = this.getOrCreateSessionId();
    const ref = this.detectReferrer();
    const payload = {
      p_page: page || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || 'index.html' : 'index.html'),
      p_title: title || (typeof window !== 'undefined' ? document.title : '望舟小棧'),
      p_referrer: ref,
      p_session: sid
    };
    return await this.request('rpc/record_visit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getAdminAnalytics() {
    return await this.request('rpc/get_admin_analytics', {
      method: 'POST'
    });
  },

  // 渡客意境文案生成器（配合當下真實時鐘與在線人數）
  getDockPresenceCopy(hour, onlineCount, todayCount) {
    let mainText = '';
    const isSingle = (onlineCount === undefined || onlineCount === null) ? true : (onlineCount <= 1);

    if (hour >= 5 && hour < 11) {
      mainText = isSingle ? '晨光漸透，一舟獨泊' : '晨光漸透，二三舟相隨';
    } else if (hour >= 11 && hour < 17) {
      mainText = isSingle ? '日影漫漫，且泊於此' : '日正微瀾，水岸共泊';
    } else if (hour >= 17 && hour < 21) {
      mainText = isSingle ? '暮色收攏，暫繫小纜' : '暮色如織，數舟同歇';
    } else {
      mainText = isSingle ? '夜水無聲，一燈獨照' : '夜深水闊，舟火相望';
    }

    const count = (todayCount && todayCount > 0) ? todayCount : 1;
    const subText = `（今日已有 ${count} 名渡客曾在此停佇片刻）`;
    return { mainText, subText };
  },

  // 前台自動掛載並更新水岸狀態列
  async initDockPresence() {
    if (typeof window === 'undefined') return;
    const el = document.getElementById('wangzhouDockPresence');
    if (!el) return;

    // 先依本地時鐘即時渲染初步畫面（秒開無延遲）
    const nowHour = new Date().getHours();
    const initCopy = this.getDockPresenceCopy(nowHour, 1, 1);
    el.innerHTML = `<span class="presence-main"><span class="presence-dot"></span>${initCopy.mainText}</span> <span class="presence-sub">${initCopy.subText}</span>`;

    // 呼叫雲端 RPC 記錄造訪並同步真實人數
    try {
      const stats = await this.recordVisit();
      if (stats && typeof stats.today_count !== 'undefined') {
        const liveCopy = this.getDockPresenceCopy(nowHour, stats.online_count, stats.today_count);
        el.innerHTML = `<span class="presence-main"><span class="presence-dot"></span>${liveCopy.mainText}</span> <span class="presence-sub">${liveCopy.subText}</span>`;
      }
    } catch (err) {
      // 若後台 SQL 尚未部署，靜默維持本地時間意境，不拋錯
      console.warn('水岸在線狀態同步提示：', err.message || err);
    }
  },

  // 同步雲端數據到記憶體中的 SITE_DATA
  // 前台：只抓「展出中」的手札與課程；投稿箱與社群稿庫屬於後台私有資料，絕不在前台讀取。
  // 後台（已登入）：傳入 { includePrivate: true } 才會抓全部。
  async syncToLocal({ includePrivate = false } = {}) {
    try {
      const skip = Promise.resolve(null);
      const [articles, courses, submissions, posts, planks, aboutConfig] = await Promise.all([
        (includePrivate ? this.getArticles() : this.request('articles?select=*&status=eq.active&order=created_at.desc'))
          .catch(err => { console.warn('Articles sync failed:', err); return null; }),
        (includePrivate ? this.getCourses() : this.request('courses?select=*&status=eq.active&order=created_at.desc'))
          .catch(err => { console.warn('Courses sync failed:', err); return null; }),
        includePrivate ? this.getSubmissions().catch(err => { console.warn('Submissions sync failed:', err); return null; }) : skip,
        includePrivate ? this.getSocialPosts().catch(err => { console.warn('Social posts sync failed:', err); return null; }) : skip,
        this.getPlanks().catch(err => { console.warn('Planks sync failed (using local fallback):', err); return null; }),
        this.getSiteConfig('about').catch(err => { console.warn('About config sync failed (using local fallback):', err); return null; })
      ]);

      let changed = false;

      if (Array.isArray(planks) && planks.length > 0) {
        SITE_DATA.planks = planks.map(p => ({
          id: p.id,
          categoryKey: p.category_key,
          categoryName: p.category_name,
          quote: p.quote,
          expanded: p.expanded || '',
          author: p.author || '小棧長',
          sortOrder: p.sort_order || 0
        }));
        changed = true;
      }

      if (Array.isArray(articles)) {
        SITE_DATA.articles = articles.map(a => ({
          id: a.id,
          catKey: a.cat_key,
          catName: a.cat_name,
          date: a.date,
          title: a.title,
          prose: a.prose,
          status: a.status,
          isDraft: a.status === 'draft',
          reviewStatus: a.review_status || '',
          reviewNote: a.review_note || '',
          auditNote: a.audit_note || '',
          sourceUrl: a.source_url || '',
          createdAt: a.created_at || ''
        }));
        changed = true;
      }

      if (Array.isArray(courses)) {
        SITE_DATA.courses = courses.map(c => ({
          id: c.id,
          title: c.name,
          types: c.types || [],
          region: c.region,
          locationLabel: c.location,
          provider: c.organizer,
          cost: c.cost,
          deadline: c.deadline,
          summary: c.summary || '',
          whisper: c.whisper || '',
          organizerNote: c.organizer_note || '',
          address: c.address || '',
          timeCycle: c.time_cycle || '',
          url: c.link,
          active: c.status === 'active',
          isDraft: c.status === 'draft',
          reviewStatus: c.review_status || '',
          reviewNote: c.review_note || '',
          auditNote: c.audit_note || '',
          createdAt: c.created_at || ''
        }));
        changed = true;
      }

      if (Array.isArray(submissions)) {
        SITE_DATA.submissions = submissions.map(s => ({
          id: s.id,
          type: s.type,
          typeName: s.type_name,
          title: s.title,
          author: s.author,
          contact: s.contact,
          content: s.content,
          extra: s.extra,
          status: s.status,
          createdAt: s.created_at ? s.created_at.replace('T', ' ').substring(0, 16) : ''
        }));
        changed = true;
      }

      if (Array.isArray(posts)) {
        SITE_DATA.socialPosts = posts.map(p => ({
          id: p.id,
          title: p.title,
          topic: p.topic,
          sourceType: p.source_type,
          sourceId: p.source_id,
          sourceLabel: p.source_label,
          targetPlatforms: p.target_platforms || [],
          platform: (p.target_platforms && p.target_platforms[0]) || 'threads',
          versions: p.versions || {},
          content: p.content,
          mediaNotes: p.media_notes,
          scheduledDate: p.scheduled_date,
          scheduledTimeSlot: p.scheduled_time_slot,
          timeSlotLabel: p.time_slot_label,
          status: p.status,
          metricsNote: p.metrics_note,
          reviewStatus: p.review_status || 'pending',
          reviewNote: p.review_note || '',
          auditNote: p.audit_note || '',
          sourceUrl: p.source_url || '',
          imageUrl: p.image_url || '',
          scheduledAt: p.scheduled_at || null,
          bufferPostIds: p.buffer_post_ids || {},
          bufferError: p.buffer_error || '',
          createdAt: p.created_at || ''
        }));
        changed = true;
      }

      if (aboutConfig && typeof aboutConfig === 'object') {
        SITE_DATA.about = Object.assign({}, SITE_DATA.about || {}, aboutConfig);
        changed = true;
      }

      if (changed && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('WangzhouDataSynced', { detail: { timestamp: Date.now() } }));
      }
      return true;
    } catch (err) {
      console.warn('雲端同步例外：', err);
      return false;
    }
  }
};

// 全域掛載供所有頁面隨時呼叫
if (typeof window !== 'undefined') {
  window.SITE_DATA = SITE_DATA;
  window.DEFAULT_ABOUT_CONFIG = DEFAULT_ABOUT_CONFIG;
  window.WangzhouCloud = WangzhouCloud;
  // 前台頁面載入時自動在背景同步公開數據；後台改由登入後自行同步
  if (!window.WANGZHOU_ADMIN_MODE) {
    setTimeout(() => {
      WangzhouCloud.syncToLocal().catch(console.warn);
      WangzhouCloud.initDockPresence().catch(console.warn);
    }, 100);
  }
}
