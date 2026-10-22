/**
 * 《望舟小棧 farfaring》共享數據核心（Single Source of Truth）
 * 所有前台頁面（index, resources, articles, about）與後台（admin.html）皆以此檔案為數據中心。
 * 當後台發布更新時，本檔案的 lastUpdated 與各項資料庫將同步更新。
 */

const SITE_DATA = {
  // 網站全域營運設定
  siteInfo: {
    name: "望舟小棧",
    enName: "farfaring",
    tagline: "生活裡處處都是機會，陪你挖掘，陪你發現",
    siteUrl: "https://farfaring.github.io/web.farfaring/",
    lastUpdated: "2026 年 10 月 21 日",
    adminTitle: "小棧長",
    contactEmail: "farfaring.space@gmail.com",
    instagram: "https://www.instagram.com/farfaring/",
    threads: "https://www.threads.net/@farfaring",
    disclaimer: "相關開課資訊請以各主辦單位公告為準 ｜ 望舟小棧 farfaring"
  },

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

// =====================================================================
// ⚡ 《望舟小棧 farfaring》Supabase 雲端資料庫雙向即時連接引擎
// =====================================================================
const SUPABASE_CONFIG = {
  url: "https://zqkcnarvyklsifrqhfhd.supabase.co",
  key: "sb_publishable_czCscDq--2300rOfRMsMOA_kJVBXeUa"
};

const WangzhouCloud = {
  config: SUPABASE_CONFIG,

  async request(endpoint, options = {}) {
    const url = `${this.config.url}/rest/v1/${endpoint}`;
    const headers = {
      "apikey": this.config.key,
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
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
      deadline: course.deadline || '近期截止',
      summary: course.summary,
      whisper: course.whisper,
      link: course.url || course.link,
      status: course.active === false ? 'expired' : 'active'
    };
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

  // 3. 訪客投稿審核箱 (Submissions)
  async getSubmissions() {
    return await this.request('submissions?select=*&order=created_at.desc');
  },
  async submitGuestFeedback(sub) {
    const payload = {
      id: sub.id || ('sub-' + Date.now()),
      type: sub.type || 'quote',
      type_name: sub.typeName || sub.type_name || '棧道留言',
      title: sub.title || '',
      author: sub.author || '水岸漫步者',
      contact: sub.contact || '',
      content: sub.content,
      extra: sub.extra || '',
      status: sub.status || 'unread'
    };
    return await this.request('submissions', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
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

  // 自動同步雲端所有數據到記憶體中的 SITE_DATA
  async syncToLocal() {
    try {
      const [articles, courses, submissions, posts] = await Promise.all([
        this.getArticles().catch(err => { console.warn('Articles sync failed:', err); return null; }),
        this.getCourses().catch(err => { console.warn('Courses sync failed:', err); return null; }),
        this.getSubmissions().catch(err => { console.warn('Submissions sync failed:', err); return null; }),
        this.getSocialPosts().catch(err => { console.warn('Social posts sync failed:', err); return null; })
      ]);

      let changed = false;

      if (Array.isArray(articles)) {
        SITE_DATA.articles = articles.map(a => ({
          id: a.id,
          catKey: a.cat_key,
          catName: a.cat_name,
          date: a.date,
          title: a.title,
          prose: a.prose,
          status: a.status,
          isDraft: a.status === 'draft'
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
          summary: c.summary,
          whisper: c.whisper,
          url: c.link,
          active: c.status === 'active',
          isDraft: c.status === 'draft'
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
          versions: p.versions || {},
          content: p.content,
          mediaNotes: p.media_notes,
          scheduledDate: p.scheduled_date,
          scheduledTimeSlot: p.scheduled_time_slot,
          timeSlotLabel: p.time_slot_label,
          status: p.status,
          metricsNote: p.metrics_note
        }));
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
  window.WangzhouCloud = WangzhouCloud;
  // 頁面載入時自動嘗試在背景同步雲端最新數據
  setTimeout(() => {
    WangzhouCloud.syncToLocal().catch(console.warn);
  }, 100);
}
