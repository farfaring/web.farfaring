/**
 * 《望舟小棧 farfaring》共享數據核心（Single Source of Truth）
 * 所有前台頁面（index, resources, articles, about）與後台（admin.html）皆以此檔案為數據中心。
 * 當後台發布更新時，本檔案的 lastUpdated 與各項資料庫將同步更新。
 */

// 只當雲端讀不到時的備用；網站介紹文字以雲端為準，後台不得一鍵覆蓋雲端
// 《關於望舟》頁面預設文案（Single Source of Truth 初始範本）
const DEFAULT_ABOUT_CONFIG = {
  heroEyebrow: "ABOUT FARFARING",
  heroTitle: "關於望舟・一個短暫停靠的地方",
  heroSubtitle: "這裡是短暫停靠的水岸小棧，陪你在迷惘時看清前方的路\n當你整理好腳步、蓄滿能量，隨時都能從容啟航，通往真正想要的生活",
  introTitle: "在小棧停靠，你能獲得什麼？",
  introText: "在生涯的河道上，很少有人是一路筆直划到底的。\n更多的時候，會遇到水霧、會覺得手臂痠痛，或是發現原本想去的地方，好像已經跟現在的自己不太一樣了。\n\n「望舟小棧」想做的，就是路途遇到的一段木棧道、一葉小舟。\n當你覺得累了、不知道下一步該往哪裡走的時候，可以先在這裡靠岸停一下。來這裡看看新事物，發現一點新靈感。\n等充好電了、看清楚方向了，隨時可以解開纜繩，帶著踏實的心情再次啟航。",
  collabTitle: "一則真誠的小記：關於這裡的產出",
  collabText: "在工作裡覺得卡住或焦慮的時候，常常需要的是一份實用的資源、一點新的靈感，或是一段能讓自己慢下來、好好梳理思緒的時光。\n「望舟小棧」源自一個小小的起心動念，希望來到這裡的人，都能在這裡找到力量自己幫助自己，走出屬於自己的方向。\n\n這個小空間目前只有小棧長一人打理，時間與心力有限。為了不漏掉分散在各處的好資源與好觀點，內容由小棧長與 AI 共同協作——由 AI 協助追蹤龐雜的公開資訊與梳理初稿，再由小棧長親自逐篇查核、過濾與修正定稿。若有疏漏之處，請多包涵，也歡迎利用信箱提醒與交流。\n\n科技是輔助前行的工具，但想陪你走向理想生活的心意，才是真正的原動力。",
  contactTitle: "聯絡小棧長",
  contactDesc: "讀完有想法、發現需要補充或更正的地方，或只是想打聲招呼，都歡迎在此填表來信。"
};

const SITE_DATA = {
  // 網站全域營運設定
  siteInfo: {
    name: "望舟小棧",
    enName: "farfaring",
    tagline: "生活裡處處都是機會，陪你挖掘，陪你發現",
    siteUrl: "https://webfarfaring.vercel.app/",
    lastUpdated: "2026 年 11 月 10 日",
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

// 網址的顯示文字：去掉 http(s)://，太長時截斷加「…」。
// mode 'end'（預設）：保留開頭；'middle'：保留開頭與結尾，中間用「…」。
function wzUrlShort(url, max, mode) {
  let t = String(url || '').trim().replace(/^https?:\/\//i, '');
  if (/^[^/?#]+\/$/.test(t)) t = t.slice(0, -1);
  const chars = Array.from(t);
  if (chars.length <= max) return t;
  if (mode === 'middle') {
    const tail = Math.floor((max - 1) * 0.35);
    const head = max - 1 - tail;
    return chars.slice(0, head).join('') + '…' + chars.slice(chars.length - tail).join('');
  }
  return chars.slice(0, max).join('') + '…';
}

// 網址是否以 http:// 或 https:// 開頭（不含空白）
function wzIsHttpUrl(value) {
  return /^https?:\/\/[^\s]+$/i.test(String(value || '').trim());
}

// 文字內的網址轉成可點連結（前後台共用）：先跳脫，再只把 http/https 網址換成連結；
// 網址尾端標點不納入。預設連結文字只顯示網域加 ↗；opts.path 時顯示「網域＋路徑」（去 https://，超過 40 字截斷）。完整網址放 href 與 title。
function wzLinkify(text, opts) {
  const showPath = !!(opts && opts.path);
  const parts = String(text === null || text === undefined ? '' : text).split(/(https?:\/\/[^\s<>"')）」』》】〉　-〿＀-￯一-鿿]+)/g);
  return parts.map((seg, i) => {
    if (i % 2 === 0) return wzEscape(seg);
    const m = seg.match(/^(.*?)([。，、；：,;.!?！？]*)$/);
    const url = m[1], tail = m[2];
    const safe = wzSafeUrl(url);
    if (safe === '#') return wzEscape(seg);
    let label;
    if (showPath) label = wzUrlShort(url, 40);
    else { try { label = new URL(safe).host; } catch (e) { label = url.slice(0, 30); } }
    return `<a href="${wzEscape(safe)}" title="${wzEscape(url)}" target="_blank" rel="noopener noreferrer" style="color:#2B4C65; text-decoration:underline; overflow-wrap:anywhere;">${wzEscape(label)} ↗</a>${wzEscape(tail)}`;
  }).join('');
}

// 課程資訊條列（前後台共用）：每行「標籤：內容」（第一個全形「：」分隔）畫成兩欄清單；
// 舊資料只要有一行沒有「：」或整段只有一行，就整段當一般文字顯示（保留換行），不會壞掉。
// opts.linkify 時，內容裡的網址會變成可點連結（後台用）。
function wzFacts(text, opts) {
  const fmt = (opts && opts.linkify) ? (t => wzLinkify(t, { path: true })) : wzEscape;
  const raw = String(text === null || text === undefined ? '' : text).trim();
  const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const rows = lines.map(l => { const i = l.indexOf('：'); return i > 0 && i <= 6 ? [l.slice(0, i), l.slice(i + 1).trim()] : null; });
  if (lines.length < 2 || rows.some(r => !r)) return `<span class="wz-plain">${fmt(raw)}</span>`;
  return `<dl class="wz-facts">${rows.map(r => `<dt>${wzEscape(r[0])}</dt><dd>${fmt(r[1])}</dd>`).join('')}</dl>`;
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

// 台灣時間工具（前後台共用）：資料庫存的是有時區的時間點，畫面一律用台灣時間（Asia/Taipei），
// 不依賴訪客或主理人電腦的時區。
const WZ_TIMEZONE = 'Asia/Taipei';
const WZ_WEEKDAY_ZH = { Mon: '一', Tue: '二', Wed: '三', Thu: '四', Fri: '五', Sat: '六', Sun: '日' };

// 把時間點拆成台灣時間的年月日時分；無法解析回傳 null
function wzTaipeiParts(value) {
  const t = Date.parse(value);
  if (!value || Number.isNaN(t)) return null;
  const o = {};
  new Intl.DateTimeFormat('en-GB', {
    timeZone: WZ_TIMEZONE, hourCycle: 'h23', weekday: 'short',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  }).formatToParts(new Date(t)).forEach(p => { o[p.type] = p.value; });
  return {
    year: Number(o.year), month: Number(o.month), day: Number(o.day),
    hour: o.hour, minute: o.minute, weekday: WZ_WEEKDAY_ZH[o.weekday] || ''
  };
}

// 寫入雲端前：沒有時區的時間（例如 datetime-local 的 2026-11-09T10:00）一律視為台灣時間，補上 :00+08:00；
// 已有時區的原樣保留；空值回傳 null
function wzToCloudTime(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  if (/(?:Z|[+-]\d{2}:\d{2}|[+-]\d{4})$/.test(s)) return s;
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::\d{2})?$/.exec(s);
  return m ? `${m[1]}T${m[2]}:${m[3]}:00+08:00` : s;
}

// 雲端的時間點 ➔ <input type="datetime-local"> 要的字串（台灣時間）；空值回傳空字串
function wzToDatetimeLocal(value) {
  const p = wzTaipeiParts(value);
  if (!p) return '';
  const two = n => String(n).padStart(2, '0');
  return `${p.year}-${two(p.month)}-${two(p.day)}T${p.hour}:${p.minute}`;
}

// 開放報名日的顯示：同年省略年份、跨年才加年份；00:00 省略時間。opts.weekday 時加「（一）」
function wzFormatRegOpen(value, opts) {
  const p = wzTaipeiParts(value);
  if (!p) return '';
  const now = wzTaipeiParts(new Date().toISOString());
  const year = now && now.year !== p.year ? `${p.year}/` : '';
  const wd = opts && opts.weekday && p.weekday ? `（${p.weekday}）` : '';
  const time = p.hour === '00' && p.minute === '00' ? '' : ` ${p.hour}:${p.minute}`;
  return `${year}${p.month}/${p.day}${wd}${time}`;
}

// 報名截止的「時刻」今天已經過了嗎？（台灣時間；沒填時刻或截止日不是今天就回傳 false。午夜下架的邏輯不受影響）
function wzDeadlineClosedToday(deadline, deadlineTime) {
  if (!deadline || !/^([01]\d|2[0-3]):[0-5]\d$/.test(deadlineTime || '')) return false;
  const n = wzTaipeiParts(new Date().toISOString());
  if (!n) return false;
  const two = x => String(x).padStart(2, '0');
  if (`${n.year}-${two(n.month)}-${two(n.day)}` !== deadline) return false;
  return `${n.hour}:${n.minute}` >= deadlineTime;
}

// 還沒到開放報名時間？沒填開放日、時間已過或格式不對都回傳 false
function wzRegNotYetOpen(value) {
  const t = Date.parse(value);
  return !!value && !Number.isNaN(t) && t > Date.now();
}

// 前台（訪客）只讀這些欄位；內部欄位（稽核提示、修改意見、重做內容等）資料庫本來就不開放給訪客。
// 日後要讓訪客看到新欄位，這裡與 supabase_schema.sql 第二段的欄位清單要一起加。
const WZ_PUBLIC_COURSE_COLUMNS = 'id,name,organizer,types,region,location,cost,deadline,deadline_time,reg_open_date,summary,whisper,organizer_note,address,time_cycle,link,status,created_at';
const WZ_PUBLIC_ARTICLE_COLUMNS = 'id,cat_key,cat_name,date,title,prose,status,created_at';

// 資料庫的一列課程 ➔ 前後台使用的課程物件（前台讀不到的內部欄位會是空值）
function wzCourseFromRow(c) {
  return {
    id: c.id,
    title: c.name,
    types: c.types || [],
    region: c.region,
    locationLabel: c.location,
    provider: c.organizer,
    cost: c.cost,
    deadline: c.deadline,
    deadlineTime: c.deadline_time || '',
    regOpenDate: c.reg_open_date || '',
    regCheckedAt: c.reg_checked_at || '',
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
    revisionState: c.revision_state || '',
    revisionNote: c.revision_note || '',
    revisionPayload: c.revision_payload || null,
    revisionSubmittedAt: c.revision_submitted_at || '',
    revisionPrevPayload: c.revision_prev_payload || null,
    // 自動上架相關（只有後台讀得到；前台的欄位清單沒有它們，值會是空的）
    autoPublishAt: c.auto_publish_at || '',
    autoPublished: c.auto_published === true,
    autoPublishedAt: c.auto_published_at || '',
    holdForOwner: c.hold_for_owner === true,
    createdAt: c.created_at || ''
  };
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
  // 後台（主理人登入）讀全部欄位；前台改用 WZ_PUBLIC_ARTICLE_COLUMNS 明列欄位
  async getArticles() {
    return await this.request('articles?select=*&order=created_at.desc');
  },
  _articlePayload(article) {
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
    return payload;
  },
  async upsertArticle(article) {
    const payload = this._articlePayload(article);
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
  _coursePayload(course) {
    const payload = {
      id: course.id,
      name: course.title || course.name,
      organizer: course.provider || course.organizer,
      types: course.types || [],
      // 沒填就留空，不替官方推論地區、地點或費用；前台空值整列不顯示
      region: course.region || null,
      location: course.locationLabel || course.location || null,
      cost: course.cost || null,
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
      audit_note: course.auditNote,
      deadline_time: course.deadlineTime === undefined ? undefined : (course.deadlineTime || null),
      // 沒填開放報名日存成 null；沒帶這個欄位的舊物件不動雲端的值
      reg_open_date: course.regOpenDate === undefined ? undefined : wzToCloudTime(course.regOpenDate)
    });
    return payload;
  },
  async upsertCourse(course) {
    const payload = this._coursePayload(course);
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

  // 課程「請 AI 重做」：重做的內容全放在這一列的內部欄位，核准前網站上的舊版不變。
  // 每個動作都帶「讀到的狀態」當條件；狀態已被另一個分頁改過就不會寫入並回報錯誤（避免核准到沒看過的新版）。
  async patchCourseGuarded(id, filters, body) {
    const q = [`id=eq.${encodeURIComponent(id)}`, ...filters].join('&');
    const rows = await this.request(`courses?${q}&select=*`, {
      method: 'PATCH',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(body)
    });
    if (!Array.isArray(rows) || rows.length !== 1) {
      throw new Error('這門課的狀態剛剛有變動（可能在另一個分頁處理過了），請按「從雲端同步」重新整理後再試。');
    }
    return rows[0];
  },
  _revisionFilters(expectState, expectSubmittedAt) {
    const f = [expectState ? `revision_state=eq.${expectState}` : 'revision_state=is.null'];
    if (expectState === 'submitted') f.push(`revision_submitted_at=eq.${encodeURIComponent(expectSubmittedAt || '')}`);
    return f;
  },
  // 記下重做意見（沒有重做 ➔ 重做中；改意見；或把待審的新版退回再重做）。expect 是畫面上讀到的狀態。
  async requestCourseRevision(id, note, expect) {
    const e = expect || {};
    return await this.patchCourseGuarded(id, ['status=eq.active', ...this._revisionFilters(e.state || '', e.submittedAt)], {
      revision_state: 'requested',
      revision_note: note,
      revision_payload: null,
      revision_submitted_at: null
    });
  },
  // 撤回重做（只能撤回還在等 AI 的）
  async withdrawCourseRevision(id) {
    return await this.patchCourseGuarded(id, ['revision_state=eq.requested'], {
      revision_state: null, revision_note: null, revision_payload: null, revision_submitted_at: null
    });
  },
  // 不採用新版：丟棄新版與意見，網站維持舊版
  async discardCourseRevision(id, submittedAt) {
    return await this.patchCourseGuarded(id, this._revisionFilters('submitted', submittedAt), {
      revision_state: null, revision_note: null, revision_payload: null, revision_submitted_at: null
    });
  },
  // 核准新版：以新版白名單欄位整欄覆蓋（沒寫的欄位就是清空），並確認這一版就是畫面上看過的那一版
  async approveCourseRevision(id, submittedAt, payload) {
    const p = payload || {};
    if (!p.name || !p.link || !Array.isArray(p.types) || p.types.length === 0) {
      throw new Error('新版內容不完整（缺少名稱、報名網址或類別），不能替換。');
    }
    const orNull = v => (v === undefined || v === '' ? null : v);
    return await this.patchCourseGuarded(id, this._revisionFilters('submitted', submittedAt), {
      name: p.name,
      organizer: orNull(p.organizer),
      types: p.types,
      region: orNull(p.region),
      location: orNull(p.location),
      cost: orNull(p.cost),
      deadline: orNull(p.deadline),
      deadline_time: orNull(p.deadline_time),
      reg_open_date: wzToCloudTime(p.reg_open_date),
      summary: orNull(p.summary),
      whisper: orNull(p.whisper),
      organizer_note: orNull(p.organizer_note),
      address: orNull(p.address),
      time_cycle: orNull(p.time_cycle),
      link: p.link,
      audit_note: orNull(p.audit_note),
      status: 'active',
      review_status: 'approved',
      reg_checked_at: new Date().toISOString(),
      auto_published: false,  // 主理人親自核准，不是「自動上架、待抽查」
      revision_state: null,
      revision_note: null,
      revision_payload: null,
      revision_submitted_at: null
    });
  },
  // 開放報名後主理人確認「沒有變動」：只記下複查時間
  async markCourseRegChecked(id) {
    return await this.patchCourseGuarded(id, [], { reg_checked_at: new Date().toISOString() });
  },

  // 審稿台專用（手札與課程）：只 PATCH 必要欄位，並帶「讀到的狀態」當條件。
  // 不用整列覆蓋，避免把「剛被自動上架」或「AI 剛重送」的新內容蓋回瀏覽器裡的舊內容。
  // before = { status, reviewStatus }（畫面上讀到的狀態）；條件不符就不寫入並丟出錯誤。
  // 暫定提示字句（待品審）：「這篇稿件的狀態剛剛有變動……請按「從雲端同步」重新整理後再試。」
  async patchReviewItemGuarded(kind, id, before, body) {
    const table = kind === 'course' ? 'courses' : 'articles';
    const b = before || {};
    const q = [`id=eq.${encodeURIComponent(id)}`];
    q.push(b.status ? `status=eq.${encodeURIComponent(b.status)}` : 'status=is.null');
    q.push(b.reviewStatus ? `review_status=eq.${encodeURIComponent(b.reviewStatus)}` : 'review_status=is.null');
    const rows = await this.request(`${table}?${q.join('&')}&select=id`, {
      method: 'PATCH',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(body)
    });
    if (!Array.isArray(rows) || rows.length !== 1) {
      throw new Error('這篇稿件的狀態剛剛有變動（可能已自動上架，或有新版稿件送達），請按「從雲端同步」重新整理後再試。');
    }
    return rows[0];
  },
  // 只改單一內容欄位（例如網址），不帶狀態條件、不碰其他欄位
  async patchItemFields(kind, id, body) {
    const table = kind === 'course' ? 'courses' : 'articles';
    return await this.request(`${table}?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Prefer': 'return=minimal' },
      body: JSON.stringify(body)
    });
  },

  // 編輯表單或上下架切換：只寫表單實際欄位（不含修改意見），並帶「讀到的狀態」當條件；
  // 狀態不符（例如剛被自動上架）就不寫入並提示重新整理。新增稿件（雲端還沒有這一列）才用 upsert。
  async saveItemGuarded(kind, item, before) {
    const payload = kind === 'course' ? this._coursePayload(item) : this._articlePayload(item);
    delete payload.id;
    delete payload.review_note;
    return await this.patchReviewItemGuarded(kind, item.id, before, payload);
  },

  // 一鍵還原：把剛被自動替換的課程換回舊版（資料庫函數 restore_course_prev_version，只有主理人登入後才能執行）；回傳 false 代表沒有可還原的舊版
  async restoreCourseVersion(id) {
    return await this.request('rpc/restore_course_prev_version', {
      method: 'POST',
      body: JSON.stringify({ p_id: id })
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
    // 讀者回報課程問題：兩欄要一起帶（資料庫也這樣檢查）；一般投稿不帶，不受影響
    if (sub.courseId && sub.issueType) {
      payload.course_id = clip(sub.courseId, 80);
      payload.issue_type = sub.issueType;
    }
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
    // IG 圖卡：imageUrls（依頁序，第 1 張＝封面）為準，image_url 永遠同步成封面，舊資料與舊程式照常運作
    const hasImageList = Array.isArray(post.imageUrls);
    wzAddDefined(payload, {
      review_status: post.reviewStatus,
      review_note: post.reviewNote,
      audit_note: post.auditNote,
      marketing_note: post.marketingNote,
      marketing_review: post.marketingReview,
      source_url: post.sourceUrl,
      image_url: hasImageList ? (post.imageUrls[0] || null) : post.imageUrl,
      image_urls: hasImageList ? post.imageUrls : undefined,
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
  // 全站最後維護日期：雲端 site_last_updated 的 { at: ISO 時間 }，格式化為台灣時間「2026 年 11 月 10 日」；讀不到回傳 null
  formatTaipeiDate(iso) {
    const t = Date.parse(iso);
    if (!isFinite(t)) return null;
    const d = new Date(t + 8 * 3600 * 1000); // 台灣沒有日光節約，固定 UTC+8
    return `${d.getUTCFullYear()} 年 ${d.getUTCMonth() + 1} 月 ${d.getUTCDate()} 日`;
  },
  async getLastUpdatedText() {
    try {
      const v = await this.getSiteConfig('site_last_updated');
      return (v && v.at) ? this.formatTaipeiDate(v.at) : null;
    } catch (e) {
      return null;
    }
  },
  // 前台頁尾：先放備用值，雲端讀到再換成雲端的日期
  async showLastUpdated(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerText = SITE_DATA.siteInfo.lastUpdated;
    const text = await this.getLastUpdatedText();
    if (text) { SITE_DATA.siteInfo.lastUpdated = text; el.innerText = text; }
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
      const [articles, courses, submissions, posts, planks, aboutConfig, autoEnabledCfg, autoCheckCfg, lastUpdatedText] = await Promise.all([
        (includePrivate ? this.getArticles() : this.request(`articles?select=${WZ_PUBLIC_ARTICLE_COLUMNS}&status=eq.active&order=created_at.desc`))
          .catch(err => { console.warn('Articles sync failed:', err); return null; }),
        (includePrivate ? this.getCourses() : this.request(`courses?select=${WZ_PUBLIC_COURSE_COLUMNS}&status=eq.active&order=created_at.desc`))
          .catch(err => { console.warn('Courses sync failed:', err); return null; }),
        includePrivate ? this.getSubmissions().catch(err => { console.warn('Submissions sync failed:', err); return null; }) : skip,
        includePrivate ? this.getSocialPosts().catch(err => { console.warn('Social posts sync failed:', err); return null; }) : skip,
        this.getPlanks().catch(err => { console.warn('Planks sync failed (using local fallback):', err); return null; }),
        this.getSiteConfig('about').catch(err => { console.warn('About config sync failed (using local fallback):', err); return null; }),
        includePrivate ? this.getSiteConfig('auto_publish_enabled').catch(() => null) : skip,
        includePrivate ? this.getSiteConfig('auto_publish_last_check').catch(() => null) : skip,
        includePrivate ? this.getLastUpdatedText() : skip
      ]);

      // 後台：最後維護日期以雲端為準（讀不到就維持原值）
      if (includePrivate && lastUpdatedText) SITE_DATA.siteInfo.lastUpdated = lastUpdatedText;

      // 後台：自動上架開關與上次檢查紀錄（沒讀到就維持 null，畫面不顯示警示）
      if (includePrivate) {
        SITE_DATA.autoPublish = {
          enabled: autoEnabledCfg && typeof autoEnabledCfg === 'object' ? autoEnabledCfg.enabled !== false : true,
          lastCheckAt: autoCheckCfg && autoCheckCfg.at ? autoCheckCfg.at : ''
        };
      }

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
          autoPublishAt: a.auto_publish_at || '',
          autoPublished: a.auto_published === true,
          autoPublishedAt: a.auto_published_at || '',
          holdForOwner: a.hold_for_owner === true,
          createdAt: a.created_at || ''
        }));
        changed = true;
      }

      if (Array.isArray(courses)) {
        SITE_DATA.courses = courses.map(wzCourseFromRow);
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
          courseId: s.course_id || '',
          issueType: s.issue_type || '',
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
          marketingNote: p.marketing_note || '',
          marketingReview: p.marketing_review || '',
          sourceUrl: p.source_url || '',
          imageUrl: p.image_url || '',
          imageUrls: Array.isArray(p.image_urls) && p.image_urls.length ? p.image_urls : (p.image_url ? [p.image_url] : []),
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
