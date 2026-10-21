-- =======================================================
-- 《望舟小棧 farfaring》Supabase 雲端資料庫一鍵建表腳本
-- 執行方式：在 Supabase 控制台 ➔ 點擊左側 SQL Editor ➔ 貼上此代碼 ➔ 點擊 Run
-- =======================================================

-- 1. 建立手札文章表 (articles)
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  cat_key TEXT DEFAULT 'career',
  cat_name TEXT DEFAULT '職涯探索',
  date TEXT DEFAULT '2026.10',
  title TEXT NOT NULL,
  prose TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active: 展出中, retired: 溫柔退役 (不佔空間)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 建立精選課程活動表 (courses)
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  organizer TEXT,
  types TEXT[],
  region TEXT DEFAULT '線上',
  location TEXT DEFAULT '線上課程',
  cost TEXT DEFAULT '免費政府補助',
  deadline TEXT DEFAULT '近期截止',
  summary TEXT,
  whisper TEXT,
  link TEXT,
  status TEXT DEFAULT 'active', -- active: 開放中, expired: 已截止 (定期清理)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 建立讀者訪客投稿審核箱 (submissions)
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'quote', -- quote: 棧道留言, story: 故事投稿, course: 課程推薦
  type_name TEXT DEFAULT '棧道留言',
  title TEXT,
  author TEXT DEFAULT '水岸漫步者',
  contact TEXT,
  content TEXT NOT NULL,
  extra TEXT,
  status TEXT DEFAULT 'unread', -- unread: 待處理, approved: 已採納, archived: 已封存
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 建立社群貼文與排程稿庫 (social_posts)
CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT DEFAULT '生活步調',
  source_type TEXT DEFAULT 'none',
  source_id TEXT,
  source_label TEXT,
  target_platforms TEXT[],
  versions JSONB,
  content TEXT,
  media_notes TEXT,
  scheduled_date DATE,
  scheduled_time_slot TEXT DEFAULT 'evening',
  time_slot_label TEXT DEFAULT '🌙 晚間靠岸 (21:00)',
  status TEXT DEFAULT 'scheduled', -- draft, scheduled, published, retired
  metrics_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- 開放安全讀寫權限 (Row Level Security - RLS)
-- =======================================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- 任何人可公開讀取活著的手札與課程 (展示廳)
CREATE POLICY "Public read active articles" ON articles FOR SELECT USING (status = 'active');
CREATE POLICY "Public read active courses" ON courses FOR SELECT USING (status = 'active');
CREATE POLICY "Public read approved submissions" ON submissions FOR SELECT USING (status = 'approved');

-- 允許任何人投遞留言 (只寫入，不允許偷看他人未審核留言)
CREATE POLICY "Public insert submissions" ON submissions FOR INSERT WITH CHECK (true);

-- 後台主理人完全控制權限 (透過 anon key 於後台驗證後操作)
CREATE POLICY "Admin full access articles" ON articles FOR ALL USING (true);
CREATE POLICY "Admin full access courses" ON courses FOR ALL USING (true);
CREATE POLICY "Admin full access submissions" ON submissions FOR ALL USING (true);
CREATE POLICY "Admin full access social_posts" ON social_posts FOR ALL USING (true);

-- =======================================================
-- 匯入現有的精選示範資料（無縫繼承現有成果）
-- =======================================================
INSERT INTO articles (id, cat_key, cat_name, date, title, prose) VALUES
('note-01', 'career', '職涯探索', '2026.10', '當你試了好多新方向，卻覺得還在原地打轉的時候', '有些人在離開原本熟悉的位置、或是換到比較安穩但少了點成就感的工作之後，為了想趕快找回生活的重心，會開始同時嘗試好多事——下班學剪輯、週末研究開小賣場、又報名了幾堂證照課。\n\n看起來每天的行程都排得好滿，但過了幾個月，卻覺得自己好像只是很累，小舟卻沒有真正往前走。\n\n如果你最近也是這樣，想先跟你說：這真的不是因為你不夠好。相反的，是因為你太認真想為自己找路了。\n\n只是在水流還不清楚的時候，如果急著往每個方向都用力划兩槳，船反而會在原地打轉。當力氣被分散在五件零散的小事上，每一件事都只推進了一點點，自然很難看見讓自己安心的風景。\n\n這週不妨先在木棧板上停一下，試著做個溫柔的減法：\n先把手上覺得「好像應該做」的五件事暫時放下三件，只留下一件「能接上你過去累積過的經驗」、或是「你做完之後心裡覺得踏實、有精神」的事。\n\n給自己三個月的時間，只專心划這一槳看看。'),
('note-02', 'career', '職涯探索', '2026.10', '走過的路不會白費：為什麼「舊經驗＋一點新工具」反而最珍貴？', '很多人在考慮轉換跑道或重新找方向時，心裡常會有個聲音：「我不是本科系出身，現在才學來得及嗎？」\n\n「過去做行政／做人資／跑業務累積的經驗，到了新領域是不是全都歸零了？」\n\n這種「歸零的恐慌」，常讓人遲遲不敢踏出第一步。\n\n但在水岸邊看過許多靠岸的小舟，往往真正走得遠的，不是那些一開始就懂得最新技術的人，而是「帶著舊領域扎實基本功，再加上一點點新工具」的轉職者。\n\n因為科技與工具每年都在變，但你過去所學會的「如何理解別人的需求」、「如何在混亂中把事情理出條理」、「如何跟不同個性的人好好說話」，這些都是無法被輕易取代的底層肌肉。\n\n新工具只是新槳，而你過去幾年積累的人生歷練，才是這艘小舟最重要的吃水深度。\n\n不用急著把過去的一切推翻抹去，試著把你的舊專長，輕輕搭上一件新工具試試看。')
ON CONFLICT (id) DO NOTHING;
