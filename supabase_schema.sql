-- =======================================================
-- 《望舟小棧 farfaring》Supabase 資料庫完整結構
-- 用途：從零建立整個資料庫（資料表、權限規則、圖卡存放空間、流量統計、預設內容）
-- 執行方式：Supabase 控制台 ➔ SQL Editor ➔ 貼上整份 ➔ Run
-- 可重複執行：已存在的資料表與資料不會被覆蓋或刪除
-- =======================================================


-- =======================================================
-- 1. 主理人身分判斷（登入者 email 必須是小棧信箱）
-- =======================================================
CREATE OR REPLACE FUNCTION public.is_wangzhou_owner()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(auth.jwt() ->> 'email', '') = 'farfaring.space@gmail.com'
$$;


-- =======================================================
-- 2. 資料表
-- =======================================================

-- 水岸手札
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  cat_key TEXT DEFAULT 'career',
  cat_name TEXT DEFAULT '職涯探索',
  date TEXT DEFAULT '2026.10',
  title TEXT NOT NULL,
  prose TEXT NOT NULL,
  status TEXT DEFAULT 'active',  -- active: 展出中, draft: 待審草稿, retired: 退役／未採用
  review_status TEXT,            -- 審稿工作台：pending 待審, approved 可以發, revise 要修改, rejected 不要發
  review_note TEXT,              -- 主理人的修改意見
  audit_note TEXT,               -- Claude 預先稽核與風險提示
  source_url TEXT,               -- 免費開放全文來源
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 課程活動
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  organizer TEXT,
  types TEXT[],                  -- deep: 深度培訓, upskill: 技能增強, events: 講座工作坊
  region TEXT DEFAULT '線上',
  location TEXT DEFAULT '線上課程',
  cost TEXT DEFAULT '免費政府補助',
  deadline TEXT,                 -- 報名截止日 YYYY-MM-DD（台灣時間當日 23:59:59 後前台自動隱藏）
  summary TEXT,
  whisper TEXT,
  organizer_note TEXT,
  address TEXT,
  time_cycle TEXT,
  link TEXT,
  status TEXT DEFAULT 'active',  -- active: 開放中, draft: 待審草稿, expired: 已下架／未採用
  review_status TEXT,            -- 審稿工作台：pending 待審, approved 可以發, revise 要修改, rejected 不要發
  review_note TEXT,              -- 主理人的修改意見
  audit_note TEXT,               -- Claude 預先稽核與風險提示（來源即官方報名網址 link）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 首頁木棧板短句
CREATE TABLE IF NOT EXISTS public.planks (
  id TEXT PRIMARY KEY,
  category_key TEXT NOT NULL DEFAULT 'amber',  -- amber / indigo / bamboo
  category_name TEXT NOT NULL DEFAULT '🪵 陪伴停靠小語',
  quote TEXT NOT NULL,
  expanded TEXT,
  author TEXT DEFAULT '小棧長',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 讀者投稿箱
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'quote',     -- quote: 棧道留言, story: 故事投稿, course: 課程推薦, error: 資訊勘誤, letter: 來信
  type_name TEXT DEFAULT '棧道留言',
  title TEXT,
  author TEXT DEFAULT '水岸漫步者',
  contact TEXT,
  content TEXT NOT NULL,
  extra TEXT,
  status TEXT DEFAULT 'unread',  -- unread: 待處理, reviewed: 已審閱
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 社群貼文稿庫
CREATE TABLE IF NOT EXISTS public.social_posts (
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
  status TEXT DEFAULT 'scheduled',  -- draft, scheduled, published, retired
  metrics_note TEXT,
  review_status TEXT DEFAULT 'pending',  -- 審稿：pending 待審, approved 可以發, revise 要修改, rejected 不要發
  review_note TEXT,                      -- 主理人的修改意見
  audit_note TEXT,                       -- Claude 預先稽核與風險提示
  source_url TEXT,                       -- 免費開放全文來源
  image_url TEXT,                        -- IG 圖卡（social-cards 圖片空間的公開網址）
  scheduled_at TIMESTAMPTZ,              -- 確切發文時間
  buffer_post_ids JSONB DEFAULT '{}'::jsonb,  -- Buffer 回傳的貼文編號 { "threads": "...", "instagram": "..." }
  buffer_error TEXT,                     -- 最近一次送進 Buffer 失敗的原因
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 流量統計：造訪紀錄（不記 IP、不用 Cookie）
CREATE TABLE IF NOT EXISTS public.page_views (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON public.page_views(session_id);

-- 流量統計：目前在線
CREATE TABLE IF NOT EXISTS public.active_sessions (
  session_id TEXT PRIMARY KEY,
  page_path TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_seen ON public.active_sessions(last_seen_at);

-- 網站全域設定與頁面文案（關於望舟、公告等）
CREATE TABLE IF NOT EXISTS public.site_configs (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =======================================================
-- 3. 權限規則（Row Level Security）
--    訪客：只能讀展出中的手札與課程、木棧板短句；只能新增投稿
--    主理人：登入後可完整管理所有內容、讀取流量統計
-- =======================================================
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_configs ENABLE ROW LEVEL SECURITY;

-- 訪客公開讀取
DROP POLICY IF EXISTS "Public read active articles" ON public.articles;
CREATE POLICY "Public read active articles" ON public.articles
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Public read active courses" ON public.courses;
CREATE POLICY "Public read active courses" ON public.courses
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Public read planks" ON public.planks;
CREATE POLICY "Public read planks" ON public.planks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read site_configs" ON public.site_configs;
CREATE POLICY "Public read site_configs" ON public.site_configs
  FOR SELECT USING (true);

-- 訪客投稿：只能新增、只能是待處理、欄位格式與長度受限；不能讀取任何投稿
DROP POLICY IF EXISTS "Public insert submissions" ON public.submissions;
CREATE POLICY "Public insert submissions" ON public.submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'unread'
    AND id ~ '^sub-[0-9]{10,16}$'
    AND type IN ('quote', 'story', 'course', 'error', 'letter')
    AND char_length(content) BETWEEN 1 AND 5000
    AND char_length(coalesce(title, '')) <= 200
    AND char_length(coalesce(type_name, '')) <= 60
    AND char_length(coalesce(author, '')) <= 60
    AND char_length(coalesce(contact, '')) <= 200
    AND char_length(coalesce(extra, '')) <= 2000
  );

-- 主理人完整管理
DROP POLICY IF EXISTS "Owner full access articles" ON public.articles;
CREATE POLICY "Owner full access articles" ON public.articles FOR ALL TO authenticated
  USING (public.is_wangzhou_owner()) WITH CHECK (public.is_wangzhou_owner());

DROP POLICY IF EXISTS "Owner full access courses" ON public.courses;
CREATE POLICY "Owner full access courses" ON public.courses FOR ALL TO authenticated
  USING (public.is_wangzhou_owner()) WITH CHECK (public.is_wangzhou_owner());

DROP POLICY IF EXISTS "Owner full access planks" ON public.planks;
CREATE POLICY "Owner full access planks" ON public.planks FOR ALL TO authenticated
  USING (public.is_wangzhou_owner()) WITH CHECK (public.is_wangzhou_owner());

DROP POLICY IF EXISTS "Owner full access submissions" ON public.submissions;
CREATE POLICY "Owner full access submissions" ON public.submissions FOR ALL TO authenticated
  USING (public.is_wangzhou_owner()) WITH CHECK (public.is_wangzhou_owner());

DROP POLICY IF EXISTS "Owner full access social_posts" ON public.social_posts;
CREATE POLICY "Owner full access social_posts" ON public.social_posts FOR ALL TO authenticated
  USING (public.is_wangzhou_owner()) WITH CHECK (public.is_wangzhou_owner());

DROP POLICY IF EXISTS "Owner full access site_configs" ON public.site_configs;
CREATE POLICY "Owner full access site_configs" ON public.site_configs FOR ALL TO authenticated
  USING (public.is_wangzhou_owner()) WITH CHECK (public.is_wangzhou_owner());

-- 流量統計明細：只有主理人能讀；寫入一律透過下方 record_visit 函數
DROP POLICY IF EXISTS "Owner read page_views" ON public.page_views;
CREATE POLICY "Owner read page_views" ON public.page_views FOR SELECT TO authenticated
  USING (public.is_wangzhou_owner());

DROP POLICY IF EXISTS "Owner read active_sessions" ON public.active_sessions;
CREATE POLICY "Owner read active_sessions" ON public.active_sessions FOR SELECT TO authenticated
  USING (public.is_wangzhou_owner());


-- =======================================================
-- 4. 社群圖卡存放空間（social-cards）
--    公開讀取：Buffer 與 Instagram 需要能直接打開圖片網址
--    只有主理人能上傳、覆蓋、刪除；只收 JPEG、單檔 8 MB 以內
-- =======================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('social-cards', 'social-cards', true, 8388608, ARRAY['image/jpeg'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Owner upload social cards" ON storage.objects;
CREATE POLICY "Owner upload social cards" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'social-cards' AND public.is_wangzhou_owner());

DROP POLICY IF EXISTS "Owner update social cards" ON storage.objects;
CREATE POLICY "Owner update social cards" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'social-cards' AND public.is_wangzhou_owner())
  WITH CHECK (bucket_id = 'social-cards' AND public.is_wangzhou_owner());

DROP POLICY IF EXISTS "Owner delete social cards" ON storage.objects;
CREATE POLICY "Owner delete social cards" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'social-cards' AND public.is_wangzhou_owner());


-- =======================================================
-- 5. 流量統計函數
-- =======================================================

-- 訪客造訪打卡：記錄造訪並回傳「在線人數」與「今日人數」
-- 防灌水：代號格式不符不寫入；全站每分鐘超過 120 筆暫停寫入；
--         在線名單上限 200；單一訪客每小時最多 45 筆；同頁 3 分鐘內不重複計入
CREATE OR REPLACE FUNCTION public.record_visit(
  p_page text,
  p_title text,
  p_referrer text,
  p_session text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_online_count int;
  v_today_count int;
  v_clean_page text;
  v_clean_title text;
  v_clean_ref text;
  v_clean_sid text;
  v_is_valid_session boolean := false;
  v_session_hourly_views int := 0;
  v_global_minutely_views int := 0;
  v_current_active_count int := 0;
  v_last_seen timestamptz;
  v_today_start timestamptz;
BEGIN
  -- 台灣時間今日 00:00
  v_today_start := date_trunc('day', now() AT TIME ZONE 'Asia/Taipei') AT TIME ZONE 'Asia/Taipei';

  IF p_session IS NOT NULL AND p_session ~ '^wz-[a-zA-Z0-9_\-]{6,64}$' THEN
    v_is_valid_session := true;
    v_clean_sid := p_session;
  END IF;

  IF v_is_valid_session THEN
    SELECT count(*) INTO v_global_minutely_views
    FROM public.page_views
    WHERE created_at > now() - interval '1 minute';

    IF v_global_minutely_views < 120 THEN
      SELECT count(*) INTO v_current_active_count
      FROM public.active_sessions
      WHERE last_seen_at >= now() - interval '5 minutes';

      SELECT last_seen_at INTO v_last_seen
      FROM public.active_sessions
      WHERE session_id = v_clean_sid;

      v_clean_page := substr(regexp_replace(coalesce(p_page, '/'), '[^a-zA-Z0-9_\-\.\/]', '', 'g'), 1, 80);
      IF v_clean_page = '' THEN v_clean_page := 'index.html'; END IF;

      -- 在線名單：既有訪客 15 秒內不重複更新；新訪客在線未滿 200 才加入
      IF v_last_seen IS NOT NULL THEN
        IF v_last_seen < now() - interval '15 seconds' THEN
          UPDATE public.active_sessions
          SET page_path = v_clean_page, last_seen_at = now()
          WHERE session_id = v_clean_sid;
        END IF;
      ELSIF v_current_active_count < 200 THEN
        INSERT INTO public.active_sessions (session_id, page_path, last_seen_at)
        VALUES (v_clean_sid, v_clean_page, now())
        ON CONFLICT (session_id)
        DO UPDATE SET page_path = EXCLUDED.page_path, last_seen_at = now();
      END IF;

      -- 造訪紀錄
      SELECT count(*) INTO v_session_hourly_views
      FROM public.page_views
      WHERE session_id = v_clean_sid
        AND created_at > now() - interval '1 hour';

      IF v_session_hourly_views < 45 THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.page_views
          WHERE session_id = v_clean_sid
            AND page_path = v_clean_page
            AND created_at > now() - interval '3 minutes'
        ) THEN
          v_clean_title := substr(coalesce(p_title, '望舟小棧'), 1, 100);
          v_clean_ref := substr(coalesce(p_referrer, '直接造訪'), 1, 60);

          INSERT INTO public.page_views (page_path, page_title, referrer, session_id, created_at)
          VALUES (v_clean_page, v_clean_title, v_clean_ref, v_clean_sid, now());
        END IF;
      END IF;
    END IF;
  END IF;

  -- 偶爾清理 20 分鐘沒動靜的在線紀錄
  IF random() < 0.10 THEN
    DELETE FROM public.active_sessions WHERE last_seen_at < now() - interval '20 minutes';
  END IF;

  SELECT least(greatest(count(*), 1), 200) INTO v_online_count
  FROM public.active_sessions
  WHERE last_seen_at >= now() - interval '5 minutes';

  SELECT greatest(count(DISTINCT session_id), 1) INTO v_today_count
  FROM public.page_views
  WHERE created_at >= v_today_start;

  RETURN json_build_object(
    'online_count', v_online_count,
    'today_count', v_today_count
  );
END;
$$;

-- 主理人後台報表：在線、今日、總瀏覽、近 7 日趨勢、來源、熱門頁面、最近足跡
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_trend json;
  v_sources json;
  v_pages json;
  v_recent json;
  v_online int;
  v_today int;
  v_total bigint;
  v_today_start timestamptz;
BEGIN
  IF NOT public.is_wangzhou_owner() THEN
    RAISE EXCEPTION '未授權存取營運數據';
  END IF;

  v_today_start := date_trunc('day', now() AT TIME ZONE 'Asia/Taipei') AT TIME ZONE 'Asia/Taipei';

  SELECT least(greatest(count(*), 0), 200) INTO v_online
  FROM public.active_sessions
  WHERE last_seen_at >= now() - interval '5 minutes';

  SELECT count(DISTINCT session_id) INTO v_today
  FROM public.page_views
  WHERE created_at >= v_today_start;

  SELECT count(*) INTO v_total FROM public.page_views;

  SELECT json_agg(t) INTO v_trend FROM (
    SELECT
      to_char(d, 'MM/DD') AS date_label,
      to_char(d, 'Dy') AS day_name,
      count(DISTINCT pv.session_id) AS visitors
    FROM generate_series(
      date_trunc('day', now() AT TIME ZONE 'Asia/Taipei') - interval '6 days',
      date_trunc('day', now() AT TIME ZONE 'Asia/Taipei'),
      interval '1 day'
    ) d
    LEFT JOIN public.page_views pv
      ON pv.created_at >= d AT TIME ZONE 'Asia/Taipei'
     AND pv.created_at < (d + interval '1 day') AT TIME ZONE 'Asia/Taipei'
    GROUP BY d
    ORDER BY d ASC
  ) t;

  SELECT json_agg(s) INTO v_sources FROM (
    SELECT
      coalesce(referrer, '直接造訪') AS source_name,
      count(*) AS count
    FROM public.page_views
    WHERE created_at >= now() - interval '30 days'
    GROUP BY referrer
    ORDER BY count DESC
    LIMIT 6
  ) s;

  SELECT json_agg(p) INTO v_pages FROM (
    SELECT
      page_path,
      max(page_title) AS page_title,
      count(*) AS views
    FROM public.page_views
    WHERE created_at >= now() - interval '30 days'
    GROUP BY page_path
    ORDER BY views DESC
    LIMIT 5
  ) p;

  SELECT json_agg(r) INTO v_recent FROM (
    SELECT page_title, page_path, referrer, created_at
    FROM public.page_views
    ORDER BY created_at DESC
    LIMIT 10
  ) r;

  RETURN json_build_object(
    'online_count', v_online,
    'today_count', v_today,
    'total_views', v_total,
    'trend', coalesce(v_trend, '[]'::json),
    'sources', coalesce(v_sources, '[]'::json),
    'pages', coalesce(v_pages, '[]'::json),
    'recent', coalesce(v_recent, '[]'::json)
  );
END;
$$;

-- 函數執行權限：後台報表只開放給登入者（函數內再檢查是否為主理人）；打卡開放給所有訪客
REVOKE ALL ON FUNCTION public.get_admin_analytics() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_admin_analytics() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_visit(text, text, text, text) TO anon, authenticated;


-- =======================================================
-- 6. 預設內容（已存在則不覆蓋）
-- =======================================================
INSERT INTO public.planks (id, category_key, category_name, quote, expanded, author, sort_order) VALUES
('plank-01', 'amber', '🪵 陪伴停靠小語', '「累了就先靠岸，棧板一直都在」', '並不是每個季節都要用力划槳。先把呼吸調順了、把身心照顧好了，木棧板永遠在這裡為你留一個停靠處。', '小棧長', 1),
('plank-02', 'indigo', '🌊 迷惘真實心聲', '「不知往哪走時，停下來也是一種選擇」', '大家都在急著往前趕路，但停下來重新看看地圖與自己真正的需要，才不會在不適合自己的河道上筋疲力竭。', '夜航靠岸的朋友', 2),
('plank-03', 'bamboo', '🌿 帶得走的好觀點', '「職涯不是直線，轉彎也是累積底氣」', '當代生涯發展研究指出：人的成長本就是非線性的。過去走過的每一段嘗試，都能在未來轉化為專屬於你的底氣。', 'Herminia Ibarra 研究精華', 3),
('plank-04', 'amber', '🪵 陪伴停靠小語', '「不要用別人的時鐘，來丈量自己的航程」', '每艘小舟吃水深淺不同、承載的重量不同，起風的季節也不同。走自己的節奏，本身就是一種勇氣。', '水岸漫步者', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.articles (id, cat_key, cat_name, date, title, prose) VALUES
('note-01', 'career', '職涯探索', '2026.10', '當你試了好多新方向，卻覺得還在原地打轉的時候', '有些人在離開原本熟悉的位置、或是換到比較安穩但少了點成就感的工作之後，為了想趕快找回生活的重心，會開始同時嘗試好多事——下班學剪輯、週末研究開小賣場、又報名了幾堂證照課。\n\n看起來每天的行程都排得好滿，但過了幾個月，卻覺得自己好像只是很累，小舟卻沒有真正往前走。\n\n如果你最近也是這樣，想先跟你說：這真的不是因為你不夠好。相反的，是因為你太認真想為自己找路了。\n\n只是在水流還不清楚的時候，如果急著往每個方向都用力划兩槳，船反而會在原地打轉。當力氣被分散在五件零散的小事上，每一件事都只推進了一點點，自然很難看見讓自己安心的風景。\n\n這週不妨先在木棧板上停一下，試著做個溫柔的減法：\n先把手上覺得「好像應該做」的五件事暫時放下三件，只留下一件「能接上你過去累積過的經驗」、或是「你做完之後心裡覺得踏實、有精神」的事。\n\n給自己三個月的時間，只專心划這一槳看看。'),
('note-02', 'career', '職涯探索', '2026.10', '走過的路不會白費：為什麼「舊經驗＋一點新工具」反而最珍貴？', '很多人在考慮轉換跑道或重新找方向時，心裡常會有個聲音：「我不是本科系出身，現在才學來得及嗎？」\n\n「過去做行政／做人資／跑業務累積的經驗，到了新領域是不是全都歸零了？」\n\n這種「歸零的恐慌」，常讓人遲遲不敢踏出第一步。\n\n但在水岸邊看過許多靠岸的小舟，往往真正走得遠的，不是那些一開始就懂得最新技術的人，而是「帶著舊領域扎實基本功，再加上一點點新工具」的轉職者。\n\n因為科技與工具每年都在變，但你過去所學會的「如何理解別人的需求」、「如何在混亂中把事情理出條理」、「如何跟不同個性的人好好說話」，這些都是無法被輕易取代的底層肌肉。\n\n新工具只是新槳，而你過去幾年積累的人生歷練，才是這艘小舟最重要的吃水深度。\n\n不用急著把過去的一切推翻抹去，試著把你的舊專長，輕輕搭上一件新工具試試看。')
ON CONFLICT (id) DO NOTHING;

-- 關於望舟頁面預設文案
INSERT INTO public.site_configs (key, value) VALUES
(
  'about',
  jsonb_build_object(
    'heroEyebrow', 'ABOUT FARFARING',
    'heroTitle', '關於望舟・一個短暫停靠的地方',
    'heroSubtitle', E'這裡是短暫停靠的水岸小棧，陪你在迷惘時看清前方的路\n當你整理好腳步、蓄滿能量，隨時都能從容啟航，通往真正想要的生活',
    'introTitle', '在小棧停靠，你能獲得什麼？',
    'introText', E'在生涯的河道上，很少有人是一路筆直划到底的。\n更多的時候，會遇到水霧、會覺得手臂痠痛，或是發現原本想去的地方，好像已經跟現在的自己不太一樣了。\n\n「望舟小棧」想做的，就是路途遇到的一段木棧道、一葉小舟。\n當你覺得累了、不知道下一步該往哪裡走的時候，可以先在這裡靠岸停一下。來這裡看看新事物，發現一點新靈感。\n等充好電了、看清楚方向了，隨時可以解開纜繩，帶著踏實的心情再次啟航。',
    'collabTitle', '一則真誠的小記：關於這裡的產出',
    'collabText', E'身為職涯諮詢師的小棧長，看過許多在工作裡感到卡頓與焦慮的人，發現大家有時候需要的其實不是一場嚴肅的諮詢，而是一份實用資源的分享、一點新靈感的啟發，或是一段能讓自己慢下來、好好梳理思緒的時光。\n「望舟小棧」源自一個小小的起心動念，希望來到這裡的人，都能在這裡找到力量自己幫助自己，走出屬於自己的方向。\n\n這個小空間目前只有小棧長一人打理，時間與心力有限。為了不漏掉分散在各處的好資源與好觀點，內容由小棧長與 AI 共同協作——由 AI 協助追蹤龐雜的公開資訊與梳理初稿，再由小棧長親自逐篇查核、過濾與修正定稿。若有疏漏之處，請多包涵，也歡迎利用信箱提醒與交流。\n\n科技是輔助前行的工具，但想陪你走向理想生活的心意，才是真正的原動力。',
    'consultTitle', '一對一公益職涯諮詢',
    'consultDesc', '如果你正面臨具體的職涯瓶頸、職場困惑，或需要一個客觀專業的視角陪伴你梳理思緒，小棧每月定期提供限量的公益深度諮詢：',
    'consultRules', jsonb_build_array(
      '參與費用：公益性質，不收取任何諮詢費用。',
      '深談時間：每次 1 小時（50 分鐘聚焦深談 ＋ 10 分鐘彙整總結）。',
      '進行方式：線上視訊會談（Google Meet 或約定工具）。',
      '善循環回饋：接受諮詢服務後，鼓勵你在未來一個月內，為身邊的人或社會做至少一項小小的公益善事，讓善意在人間流動。'
    ),
    'consultBtnText', '📅 填寫諮詢預約意向 ↓',
    'contactTitle', '聯絡小棧長',
    'contactDesc', '如果你想預約公益職涯諮詢、交流想法，或有任何想與小棧聊聊的事，歡迎在此填表來信。'
  )
)
ON CONFLICT (key) DO NOTHING;
