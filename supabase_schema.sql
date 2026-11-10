-- =======================================================
-- 《望舟小棧 farfaring》Supabase 資料庫完整結構
-- 用途：從零建立整個資料庫（資料表、權限規則、圖卡存放空間、流量統計、預設內容）
-- 執行方式：Supabase 控制台 ➔ SQL Editor ➔ 貼上整份 ➔ Run
-- 可重複執行：已存在的資料表與資料不會被覆蓋或刪除
--
-- 已經在運作的資料庫要升級時，不要整份貼上，改貼檔案最後面的兩段（分兩次執行）：
--   「第一段」：新增欄位（先執行，不影響現有網站）
--   「第二段」：收緊權限（網站檔上傳完成後才執行）
-- 從零建立時整份貼上即可（第一段、第二段都會一起跑）。
-- 第 8、9 節是後續升級段落，已在運作的資料庫單獨貼上該節即可（第 9 節＝自動上架與讀者回報）。
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
  region TEXT,                   -- 沒填就留空，前台顯示「請見官方頁面」，不替官方推論
  location TEXT,
  cost TEXT,
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
  -- 開放報名日與「請 AI 重做」用的欄位，在檔案最後的「第一段」加入
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
  marketing_note TEXT,                   -- 行銷小教室：這則為什麼這樣寫（學習用，不影響審稿）
  marketing_review TEXT,                 -- 發文後成效回顧（主理人在後台填，150 字內）
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
-- （手札與課程的公開讀取規則，連同「只開放前台用得到的欄位」，放在檔案最後的「第二段」）

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
('plank-04', 'amber', '🪵 陪伴停靠小語', '「不要用別人的時鐘，來丈量自己的航程」', '每艘小舟吃水深淺不同、承載的重量不同，起風的季節也不同。走自己的節奏，本身就是一種勇氣。', '水岸漫步者', 4),
('plank-05', 'amber', '🪵 陪伴停靠小語', '「今天只要把自己帶回岸邊就好」', '不必今天就解決所有事。先把自己帶回安穩的地方，讓問題留到明天的光線下再看一次，也許會看得清楚些。', '小棧長', 5),
('plank-06', 'amber', '🪵 陪伴停靠小語', '「燈還亮著，慢慢走過來就好」', '夜裡的水面看不清遠方，這很正常。棧道盡頭的燈一直亮著，你可以照自己的步調靠近，不必趕在天亮前想通。', '小棧長', 6),
('plank-07', 'amber', '🪵 陪伴停靠小語', '「先喝口熱茶，水面自己會平靜」', '有時候不需要答案，只需要一杯溫熱的水、一小段安靜的時間。水面會慢慢沉澱，等你願意，再看看想去哪裡。', '水岸漫步者', 7),
('plank-08', 'amber', '🪵 陪伴停靠小語', '「小舟停在港邊，也還是小舟」', '船在港邊停著，不代表它不是船。有些日子用來補給、修補、看看天色，也都是航程裡會有的一段。', '小棧長', 8),
('plank-09', 'indigo', '🌊 迷惘真實心聲', '「說不清想去哪，但我還在這裡」', '說不清方向，也說不清想要什麼，這樣的時刻很多人都經歷過。不用急著給自己一個名字，停在這裡也可以。', '夜航靠岸的朋友', 9),
('plank-10', 'indigo', '🌊 迷惘真實心聲', '「看別人陸續啟航，心裡有點悶」', '看到身邊的人換跑道、升職、出發，心裡悶悶的，是很自然的感受。每條河的長度不同，岸邊也不只一種風景。', '岸邊歇腳的人', 10),
('plank-11', 'indigo', '🌊 迷惘真實心聲', '「想往外走，又捨不得熟悉的岸」', '想往外走，又怕失去穩穩的位置。兩種心情可以同時存在。先看看熟悉的岸有哪些是想帶著走的，再慢慢決定。', '夜航靠岸的朋友', 11),
('plank-12', 'indigo', '🌊 迷惘真實心聲', '「忙了一整天，心裡卻空空的」', '事情做了很多，心裡卻空空的。這種感覺常在忙完之後出現，先歇一會兒，等心裡有空間，再慢慢看想留下哪些。', '岸邊歇腳的人', 12),
('plank-13', 'bamboo', '🌿 帶得走的好觀點', '「先做一件小事，下一步也許就清楚了」', '方向不清楚的時候，先挑一件小到不會有壓力的事去做。做完再看看周圍的風景，下一步也許會慢慢清楚。', '小棧長', 13),
('plank-14', 'bamboo', '🌿 帶得走的好觀點', '「一次踩好一塊棧板就夠了」', '整條棧道看起來很長，但每次只需要踩好腳下這一塊。把想做的事切成小塊，今天完成一塊，就是往前了。', '水岸漫步者', 14),
('plank-15', 'bamboo', '🌿 帶得走的好觀點', '「把力氣留給長的路，不必一次用完」', '航程比想像中長，力氣像水壺裡的水，分幾口慢慢喝，比一口氣喝完更能走遠。今天只用一部分，也剛剛好。', '小棧長', 15),
('plank-16', 'bamboo', '🌿 帶得走的好觀點', '「耐心與溝通，換個地方也用得上」', '過去練出的耐心、溝通、整理事情的方法，常常能帶到新的地方。換到新的水域，也可以跟著小舟一起出發。', '水岸漫步者', 16)
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
    'collabText', E'在工作裡覺得卡住或焦慮的時候，常常需要的是一份實用的資源、一點新的靈感，或是一段能讓自己慢下來、好好梳理思緒的時光。\n「望舟小棧」源自一個小小的起心動念，希望來到這裡的人，都能在這裡找到力量自己幫助自己，走出屬於自己的方向。\n\n這個小空間目前只有小棧長一人打理，時間與心力有限。為了不漏掉分散在各處的好資源與好觀點，內容由小棧長與 AI 共同協作——由 AI 協助追蹤龐雜的公開資訊與梳理初稿，再由小棧長親自逐篇查核、過濾與修正定稿。若有疏漏之處，請多包涵，也歡迎利用信箱提醒與交流。\n\n科技是輔助前行的工具，但想陪你走向理想生活的心意，才是真正的原動力。',
    'contactTitle', '聯絡小棧長',
    'contactDesc', '讀完有想法、發現需要補充或更正的地方，或只是想打聲招呼，都歡迎在此填表來信。'
  )
)
ON CONFLICT (key) DO NOTHING;


-- =======================================================
-- 7. 課程「請 AI 重做」與「開放報名日」
--
-- 升級現有資料庫時，照順序分兩次執行，中間要先上傳網站檔：
--   ① 貼上並執行「第一段」
--   ② 上傳網站檔（data.js、admin.html、resources.html、styles.css 與各頁 HTML），並重新部署 draft-inbox
--   ③ 貼上並執行「第二段」
-- 順序不能顛倒：新版網站檔會讀 reg_open_date 欄位（第一段先建好）；
-- 第二段會收回整表讀取權限，舊版網站檔還在讀整表時會出錯（所以網站檔要先換成新版）。
-- =======================================================


-- -------------------------------------------------------
-- 【第一段・加欄位，先執行】只新增欄位與格式檢查，不影響現有網站
--   reg_open_date          開放報名日期與時間（前台公開；沒填代表即日起開放報名）
--   deadline_time          報名截止的時刻 HH:MM（前台公開；可空，沒填就只看截止日）
--   reg_checked_at         主理人確認「開放後已複查」的時間（內部）
--   revision_state         重做進度：requested 重做中（等 AI 送新版）／submitted 新版待審（內部）
--   revision_note          主理人給 AI 的重做意見（內部）
--   revision_payload       AI 送來的整門課新版，主理人核准前不會上架（內部）
--   revision_submitted_at  新版送達時間，核准時用來確認看到的就是這一版（內部）
-- -------------------------------------------------------
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS reg_open_date TIMESTAMPTZ;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS deadline_time TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS reg_checked_at TIMESTAMPTZ;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS revision_state TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS revision_note TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS revision_payload JSONB;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS revision_submitted_at TIMESTAMPTZ;

ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_deadline_time_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_deadline_time_check
  CHECK (deadline_time IS NULL OR deadline_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');

-- 課程資訊（summary）改成選填：官方頁面沒寫的就不放（若原本是 NOT NULL 會在這裡放寬，已是可空則不影響）
ALTER TABLE public.courses ALTER COLUMN summary DROP NOT NULL;

ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_revision_state_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_revision_state_check
  CHECK (revision_state IS NULL OR revision_state IN ('requested', 'submitted'));

ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_revision_note_length;
ALTER TABLE public.courses ADD CONSTRAINT courses_revision_note_length
  CHECK (revision_note IS NULL OR char_length(revision_note) <= 2000);

-- 新版稿件必須是 JSON 物件，且 types 必須是清單（不能是 null 或單一文字）
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_revision_payload_shape;
ALTER TABLE public.courses ADD CONSTRAINT courses_revision_payload_shape
  CHECK (
    revision_payload IS NULL
    OR (jsonb_typeof(revision_payload) = 'object' AND jsonb_typeof(revision_payload -> 'types') = 'array')
  );

-- 「新版待審」一定要有新版內容與送達時間；「重做中」不能殘留舊的新版
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_revision_payload_check_submitted;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_revision_state_consistent;
ALTER TABLE public.courses ADD CONSTRAINT courses_revision_state_consistent
  CHECK (
    (revision_state IS NULL AND revision_payload IS NULL AND revision_submitted_at IS NULL)
    OR (revision_state = 'requested' AND revision_payload IS NULL AND revision_submitted_at IS NULL)
    OR (revision_state = 'submitted' AND revision_payload IS NOT NULL AND revision_submitted_at IS NOT NULL)
  );
-- ======================= 第一段結束 =======================


-- -------------------------------------------------------
-- 【第二段・權限，網站檔上傳後才執行】
--   ・手札與課程的公開讀取規則只給訪客（anon）；登入但不是主理人的帳號一律讀不到
--   ・訪客只能讀前台用得到的欄位；稽核提示、修改意見、重做內容等內部欄位一律讀不到
--   ・主理人（登入後）維持完整欄位權限，後台不受影響
--   ・日後新增「要給訪客看」的欄位，要同步加進下面的欄位清單與 data.js 的欄位清單
-- 另外請主理人到 Supabase 控制台 ➔ Authentication ➔ Sign In / Providers（或 User Signups），
-- 關閉「Allow new users to sign up」，避免陌生人自己註冊帳號。
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Public read active articles" ON public.articles;
CREATE POLICY "Public read active articles" ON public.articles
  FOR SELECT TO anon USING (status = 'active');

DROP POLICY IF EXISTS "Public read active courses" ON public.courses;
CREATE POLICY "Public read active courses" ON public.courses
  FOR SELECT TO anon USING (status = 'active');

REVOKE SELECT ON public.articles FROM PUBLIC, anon;
GRANT SELECT (
  id, cat_key, cat_name, date, title, prose, status, created_at
) ON public.articles TO anon;

REVOKE SELECT ON public.courses FROM PUBLIC, anon;
GRANT SELECT (
  id, name, organizer, types, region, location, cost, deadline, deadline_time, reg_open_date,
  summary, whisper, organizer_note, address, time_cycle, link, status, created_at
) ON public.courses TO anon;

-- 主理人登入角色與後端服務維持完整權限
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles, public.courses TO authenticated, service_role;

-- 通知 API 重新載入權限與欄位結構
NOTIFY pgrst, 'reload schema';
-- ======================= 第二段結束 =======================


-- =======================================================
-- 8. IG 輪播：一則貼文可附多張圖卡（升級段落，可重複執行）
--
-- 升級現有資料庫時，單獨貼上並執行本段即可（不必重跑前面）。
--   image_urls   IG 圖卡的公開網址清單，依頁序排列，第 1 張＝封面（最多 10 張，由後台與收件匣把關）
--   image_url    維持原樣，永遠等於封面（第 1 張），舊程式與舊資料照常運作
--
-- 權限：社群貼文只有主理人（登入後）讀寫，訪客本來就讀不到，所以這個欄位不需要、也不要 GRANT 給 anon。
-- 順序提醒：先執行本段，再重新部署 draft-inbox，之後送稿才寫得進 image_urls。
-- =======================================================
ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS image_urls TEXT[];

NOTIFY pgrst, 'reload schema';
-- ======================= 第 8 節結束 =======================


-- =======================================================
-- 9. 超時自動上架與讀者回報課程問題（升級段落，可重複執行）
--
-- 升級現有資料庫時，單獨貼上並執行本段即可（不必重跑前面）。
-- 順序提醒：先執行本段，再重新部署 draft-inbox（它會寫入 auto_publish_at 等新欄位）。
--
-- 規則（CLAUDE.md 4-1）：
--   ・只有「待審」（review_status = pending 且 status = draft）會自動上架；要修改、不要發一律不動
--   ・送進審稿台 72 小時沒審就上架；距截止不到 5 天的課程改 24 小時；已截止的不上架
--   ・hold_for_owner = true 的稿件不自動上架（AI 標「需主理人確認」，或主理人自己扣住）
--   ・已上架課程的「重做新版」到期也照同規則，以新版替換舊版
--   ・每個台灣日最多自動上架 10 篇；開關（site_configs 的 auto_publish_enabled）關閉就整個停
--
-- 注意（已與總經理確認的保守做法）：主理人在後台把「要修改」的稿件儲存回「待審」時，觸發器會清掉舊的自動上架時間，
--   該稿不會再自動上架，直到由收件匣重新送稿起算（或主理人手動上架）；這是為了避免殘留的舊時間造成立刻上架。
--
-- 欄位（手札 articles、課程 courses 都有）：
--   auto_publish_at     預計自動上架的時間（空＝不排程）
--   auto_published      目前是否為「自動上架、待抽查」（主理人抽查後改回 false；下架時自動歸 false）
--   auto_published_at   最近一次自動上架的時間（用來計算每日上限與後台排序）
--   hold_for_owner      需主理人確認，不自動上架
-- 這些欄位只有主理人與後端讀得到，不開放給訪客（第二段的欄位清單沒有它們）。
-- =======================================================

-- 課程報名截止的確切時間點（台灣時間）：有填截止時刻就用，沒填就是當日 23:59:59；格式不對回傳空值
CREATE OR REPLACE FUNCTION public.course_deadline_at(p_deadline text, p_time text)
RETURNS timestamptz
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_deadline IS NULL OR p_deadline !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RETURN NULL;
  END IF;
  -- 格式對但日期不存在（例如 2026-02-30、2026-13-01）會轉型失敗，一律回傳 NULL，不讓一筆壞資料拖垮整次自動上架
  RETURN (p_deadline::date + coalesce(
            CASE WHEN p_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN p_time::time END,
            time '23:59:59'))
         AT TIME ZONE 'Asia/Taipei';
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.course_deadline_at(text, text) FROM PUBLIC, anon, authenticated;

-- 新增欄位；第一次新增時，順便替「已在審稿台待審」的稿件排時間（從現在起算 72 小時，課程距截止不到 5 天為 24 小時）。
-- 只在欄位還不存在時做一次，重複執行不會重新起算。
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'articles' AND column_name = 'auto_publish_at'
  ) THEN
    ALTER TABLE public.articles ADD COLUMN auto_publish_at timestamptz;
    ALTER TABLE public.courses  ADD COLUMN IF NOT EXISTS auto_publish_at timestamptz;
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS hold_for_owner boolean NOT NULL DEFAULT false;
    ALTER TABLE public.courses  ADD COLUMN IF NOT EXISTS hold_for_owner boolean NOT NULL DEFAULT false;

    UPDATE public.articles
       SET auto_publish_at = now() + interval '72 hours'
     WHERE review_status = 'pending' AND status = 'draft';

    UPDATE public.courses
       SET auto_publish_at = now() + CASE
             WHEN public.course_deadline_at(deadline, deadline_time) IS NOT NULL
              AND public.course_deadline_at(deadline, deadline_time) < now() + interval '5 days'
             THEN interval '24 hours' ELSE interval '72 hours' END
     WHERE review_status = 'pending' AND status = 'draft';

    -- 已上架、新版待審的課程：新版從現在起算 72 小時
    UPDATE public.courses
       SET auto_publish_at = now() + interval '72 hours'
     WHERE status = 'active' AND revision_state = 'submitted';

    -- 稽核欄第一行寫了「官方頁面未載明：」的待審稿（費用、資格等官方沒寫，需主理人確認）先扣住，不自動上架。
    -- 比對含舊字樣「官方未載明」、半形冒號與前面的空白；只在第一次初始化時做一次。
    UPDATE public.articles SET hold_for_owner = true
     WHERE review_status = 'pending' AND status = 'draft'
       AND audit_note ~ '^\s*官方(頁面)?未載明\s*[：:]';
    UPDATE public.courses SET hold_for_owner = true
     WHERE review_status = 'pending' AND status = 'draft'
       AND audit_note ~ '^\s*官方(頁面)?未載明\s*[：:]';
  END IF;
END $$;

ALTER TABLE public.courses  ADD COLUMN IF NOT EXISTS auto_publish_at timestamptz;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS auto_published boolean NOT NULL DEFAULT false;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS auto_published_at timestamptz;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS hold_for_owner boolean NOT NULL DEFAULT false;
ALTER TABLE public.courses  ADD COLUMN IF NOT EXISTS auto_published boolean NOT NULL DEFAULT false;
ALTER TABLE public.courses  ADD COLUMN IF NOT EXISTS auto_published_at timestamptz;
ALTER TABLE public.courses  ADD COLUMN IF NOT EXISTS hold_for_owner boolean NOT NULL DEFAULT false;
-- 自動替換時備份被換掉的舊版（欄位與重做新版相同），主理人抽查發現有誤可用 restore_course_prev_version 一鍵還原
ALTER TABLE public.courses  ADD COLUMN IF NOT EXISTS revision_prev_payload jsonb;

CREATE INDEX IF NOT EXISTS idx_articles_auto_due ON public.articles(auto_publish_at) WHERE auto_publish_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_courses_auto_due  ON public.courses(auto_publish_at)  WHERE auto_publish_at IS NOT NULL;

-- 防呆（避免「舊時間殘留，一改回待審就立刻上架」）：
--   ・稿件下架（離開上架狀態）➔ 自動上架標記歸零
--   ・審稿狀態或上架狀態改變（課程另含重做狀態改變），而且這次更新沒有同時給新的自動上架時間 ➔ 清掉舊的自動上架時間
--   ・「需主理人確認」（hold_for_owner）在主理人處理完那一次審核後自動解除
--   主理人把稿件退回待審後，不會自己又被自動上架；要再自動上架，需由收件匣重新送稿起算。
CREATE OR REPLACE FUNCTION public.reset_auto_publish_marks()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_changed boolean;
BEGIN
  IF NEW.status IS DISTINCT FROM 'active' THEN
    NEW.auto_published := false;
  END IF;

  v_changed := NEW.review_status IS DISTINCT FROM OLD.review_status
            OR NEW.status IS DISTINCT FROM OLD.status;
  IF TG_TABLE_NAME = 'courses' THEN
    v_changed := v_changed OR (to_jsonb(NEW) -> 'revision_state') IS DISTINCT FROM (to_jsonb(OLD) -> 'revision_state');
  END IF;

  IF v_changed AND NEW.auto_publish_at IS NOT DISTINCT FROM OLD.auto_publish_at THEN
    NEW.auto_publish_at := NULL;
  END IF;

  -- 「需主理人確認」只管當下這一次審核：主理人處理完（離開待審，或課程新版審完）就解除，不會殘留到下一次
  IF OLD.review_status IS NOT DISTINCT FROM 'pending' AND NEW.review_status IS DISTINCT FROM 'pending' THEN
    NEW.hold_for_owner := false;
  END IF;
  IF TG_TABLE_NAME = 'courses'
     AND (to_jsonb(OLD) ->> 'revision_state') = 'submitted'
     AND (to_jsonb(NEW) ->> 'revision_state') IS NULL THEN
    NEW.hold_for_owner := false;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_articles_reset_auto_publish ON public.articles;
CREATE TRIGGER trg_articles_reset_auto_publish
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.reset_auto_publish_marks();

DROP TRIGGER IF EXISTS trg_courses_reset_auto_publish ON public.courses;
CREATE TRIGGER trg_courses_reset_auto_publish
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.reset_auto_publish_marks();

-- 開關與上次檢查紀錄（沿用 site_configs；訪客本來就讀得到這張表，內容只有開關與時間，沒有敏感資料；只有主理人能改）
INSERT INTO public.site_configs (key, value) VALUES
  ('auto_publish_enabled', '{"enabled": true}'::jsonb),
  ('auto_publish_last_check', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 自動上架：不收參數，只做「時間到、仍待審、沒被扣住、未截止」的上架。
-- 任何人呼叫都只會提早做本來就要做的事，所以不需要額外密碼；5 分鐘內重複呼叫直接略過，避免被刷寫入。
CREATE OR REPLACE FUNCTION public.auto_publish_due()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  c_daily_cap constant int := 10;
  v_enabled boolean := true;
  v_last timestamptz;
  v_day_start timestamptz;
  v_done_today int;
  v_published int := 0;
  v_replaced int := 0;
  v_skipped_error int := 0;
  r record;
  p jsonb;
BEGIN
  -- 同一時間只讓一個執行者進來
  IF NOT pg_try_advisory_xact_lock(hashtext('farfaring_auto_publish_due')) THEN
    RETURN json_build_object('ok', true, 'skipped', 'busy');
  END IF;

  SELECT (value ->> 'at')::timestamptz INTO v_last
  FROM public.site_configs WHERE key = 'auto_publish_last_check';
  IF v_last IS NOT NULL AND v_last > now() - interval '5 minutes' THEN
    RETURN json_build_object('ok', true, 'skipped', 'too_soon');
  END IF;

  SELECT coalesce((value ->> 'enabled')::boolean, true) INTO v_enabled
  FROM public.site_configs WHERE key = 'auto_publish_enabled';
  v_enabled := coalesce(v_enabled, true);

  IF v_enabled THEN
    v_day_start := date_trunc('day', now() AT TIME ZONE 'Asia/Taipei') AT TIME ZONE 'Asia/Taipei';
    SELECT
      (SELECT count(*) FROM public.articles WHERE auto_published_at >= v_day_start)
      + (SELECT count(*) FROM public.courses WHERE auto_published_at >= v_day_start)
    INTO v_done_today;

    -- 候選：依「預定時間」由早到晚；每筆各自一個子交易，單筆資料有問題不影響其他筆
    -- 排序：有截止日的課程，截止越近越優先；其次依預定時間（避免急件被手札擠到過期）
    FOR r IN
      SELECT * FROM (
        SELECT 'article'::text AS kind, id, auto_publish_at AS due, 'infinity'::timestamptz AS dl FROM public.articles
         WHERE review_status = 'pending' AND status = 'draft'
           AND hold_for_owner = false AND auto_publish_at IS NOT NULL AND auto_publish_at <= now()
        UNION ALL
        SELECT 'course', id, auto_publish_at,
               coalesce(public.course_deadline_at(deadline, deadline_time), 'infinity'::timestamptz)
          FROM public.courses
         WHERE review_status = 'pending' AND status = 'draft'
           AND hold_for_owner = false AND auto_publish_at IS NOT NULL AND auto_publish_at <= now()
        UNION ALL
        SELECT 'revision', id, auto_publish_at,
               coalesce(public.course_deadline_at(revision_payload ->> 'deadline', revision_payload ->> 'deadline_time'), 'infinity'::timestamptz)
          FROM public.courses
         WHERE status = 'active' AND revision_state = 'submitted'
           AND hold_for_owner = false AND auto_publish_at IS NOT NULL AND auto_publish_at <= now()
      ) q
      ORDER BY dl, due, id
    LOOP
      EXIT WHEN v_done_today >= c_daily_cap;
      BEGIN
        IF r.kind = 'article' THEN
          UPDATE public.articles
             SET status = 'active', review_status = 'approved',
                 auto_published = true, auto_published_at = now(), auto_publish_at = NULL
           WHERE id = r.id AND review_status = 'pending' AND status = 'draft'
             AND hold_for_owner = false AND auto_publish_at <= now();
          IF FOUND THEN v_published := v_published + 1; v_done_today := v_done_today + 1; END IF;

        ELSIF r.kind = 'course' THEN
          -- 已截止的不上架（日期格式不明的也不上架）
          UPDATE public.courses
             SET status = 'active', review_status = 'approved',
                 auto_published = true, auto_published_at = now(), auto_publish_at = NULL
           WHERE id = r.id AND review_status = 'pending' AND status = 'draft'
             AND hold_for_owner = false AND auto_publish_at <= now()
             AND (
               (deadline IS NULL OR deadline = '')
               OR public.course_deadline_at(deadline, deadline_time) > now()
             );
          IF FOUND THEN v_published := v_published + 1; v_done_today := v_done_today + 1; END IF;

        ELSE
          -- 重做新版：以新版整欄替換（與後台「核准新版」相同：沒寫的欄位就是清空）
          SELECT revision_payload INTO p FROM public.courses
           WHERE id = r.id AND status = 'active' AND revision_state = 'submitted'
             AND hold_for_owner = false AND auto_publish_at <= now();
          CONTINUE WHEN p IS NULL;
          -- 替換前驗證新版內容；不合格就跳過、記一筆錯誤（每小時會再試，直到主理人處理）
          IF coalesce(p ->> 'name', '') = '' OR coalesce(p ->> 'link', '') !~ '^https?://'
             OR jsonb_typeof(p -> 'types') IS DISTINCT FROM 'array' OR jsonb_array_length(p -> 'types') = 0
             OR (coalesce(p ->> 'deadline', '') <> '' AND (p ->> 'deadline') !~ '^\d{4}-\d{2}-\d{2}$')
             OR (coalesce(p ->> 'deadline', '') <> '' AND public.course_deadline_at(p ->> 'deadline', NULL) IS NULL)
             OR (coalesce(p ->> 'deadline_time', '') <> '' AND (p ->> 'deadline_time') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
             OR (coalesce(p ->> 'reg_open_date', '') <> ''
                 AND (p ->> 'reg_open_date') !~ '^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?([+-]\d{2}(:?\d{2})?|Z)?$') THEN
            v_skipped_error := v_skipped_error + 1;
            CONTINUE;
          END IF;
          -- 新版已截止（依新版自己的截止日判斷）就不替換
          CONTINUE WHEN coalesce(p ->> 'deadline', '') <> ''
                    AND public.course_deadline_at(p ->> 'deadline', p ->> 'deadline_time') <= now();

          UPDATE public.courses SET
            revision_prev_payload = jsonb_build_object(
              'name', name, 'organizer', organizer, 'types', to_jsonb(types), 'region', region,
              'location', location, 'cost', cost, 'deadline', deadline, 'deadline_time', deadline_time,
              'reg_open_date', reg_open_date, 'summary', summary, 'whisper', whisper,
              'organizer_note', organizer_note, 'address', address, 'time_cycle', time_cycle,
              'link', link, 'audit_note', audit_note, 'replaced_at', now()),
            name = p ->> 'name',
            organizer = nullif(p ->> 'organizer', ''),
            types = ARRAY(SELECT jsonb_array_elements_text(p -> 'types')),
            region = nullif(p ->> 'region', ''),
            location = nullif(p ->> 'location', ''),
            cost = nullif(p ->> 'cost', ''),
            deadline = nullif(p ->> 'deadline', ''),
            deadline_time = nullif(p ->> 'deadline_time', ''),
            reg_open_date = nullif(p ->> 'reg_open_date', '')::timestamptz,
            summary = nullif(p ->> 'summary', ''),
            whisper = nullif(p ->> 'whisper', ''),
            organizer_note = nullif(p ->> 'organizer_note', ''),
            address = nullif(p ->> 'address', ''),
            time_cycle = nullif(p ->> 'time_cycle', ''),
            link = p ->> 'link',
            audit_note = nullif(p ->> 'audit_note', ''),
            status = 'active', review_status = 'approved',
            reg_checked_at = now(),
            revision_state = NULL, revision_note = NULL, revision_payload = NULL, revision_submitted_at = NULL,
            auto_published = true, auto_published_at = now(), auto_publish_at = NULL
          WHERE id = r.id AND status = 'active' AND revision_state = 'submitted'
            AND hold_for_owner = false AND auto_publish_at <= now();
          IF FOUND THEN v_replaced := v_replaced + 1; v_done_today := v_done_today + 1; END IF;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        v_skipped_error := v_skipped_error + 1;
      END;
    END LOOP;
  END IF;

  INSERT INTO public.site_configs (key, value, updated_at)
  VALUES ('auto_publish_last_check',
          jsonb_build_object('at', now(), 'enabled', v_enabled,
                             'published', v_published, 'replaced', v_replaced, 'errors', v_skipped_error),
          now())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

  RETURN json_build_object('ok', true, 'enabled', v_enabled,
                           'published', v_published, 'replaced', v_replaced, 'errors', v_skipped_error);
END;
$$;

-- Supabase 預設會把新函數開放給 anon，這裡先全部收回，再只給需要的角色：
-- anon（GitHub Actions 每小時用公開金鑰呼叫）、authenticated 與 service_role
REVOKE ALL ON FUNCTION public.auto_publish_due() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auto_publish_due() TO anon, authenticated, service_role;

-- 一鍵還原：把剛被自動替換的課程換回舊版（只有主理人能呼叫）。
-- 被換下的新版會退回「課程修訂」待審區並標為「需主理人確認」，不會再被自動上架；備份清空、標記為已抽查。
-- 這門課正有別的重做進行中（revision_state 不是空的）時不能還原，回傳 false。
CREATE OR REPLACE FUNCTION public.restore_course_prev_version(p_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  p jsonb;
  n jsonb;
  v_state text;
BEGIN
  IF NOT public.is_wangzhou_owner() THEN
    RAISE EXCEPTION '未授權';
  END IF;
  SELECT revision_prev_payload, revision_state,
         jsonb_build_object(
           'name', name, 'organizer', organizer, 'types', to_jsonb(types), 'region', region,
           'location', location, 'cost', cost, 'deadline', deadline, 'deadline_time', deadline_time,
           'reg_open_date', reg_open_date, 'summary', summary, 'whisper', whisper,
           'organizer_note', organizer_note, 'address', address, 'time_cycle', time_cycle,
           'link', link, 'audit_note', audit_note)
    INTO p, v_state, n
    FROM public.courses WHERE id = p_id FOR UPDATE;
  IF p IS NULL OR v_state IS NOT NULL THEN RETURN false; END IF;
  UPDATE public.courses SET
    name = p ->> 'name',
    organizer = nullif(p ->> 'organizer', ''),
    types = ARRAY(SELECT jsonb_array_elements_text(p -> 'types')),
    region = nullif(p ->> 'region', ''),
    location = nullif(p ->> 'location', ''),
    cost = nullif(p ->> 'cost', ''),
    deadline = nullif(p ->> 'deadline', ''),
    deadline_time = nullif(p ->> 'deadline_time', ''),
    reg_open_date = nullif(p ->> 'reg_open_date', '')::timestamptz,
    summary = nullif(p ->> 'summary', ''),
    whisper = nullif(p ->> 'whisper', ''),
    organizer_note = nullif(p ->> 'organizer_note', ''),
    address = nullif(p ->> 'address', ''),
    time_cycle = nullif(p ->> 'time_cycle', ''),
    link = p ->> 'link',
    audit_note = nullif(p ->> 'audit_note', ''),
    revision_prev_payload = NULL,
    auto_published = false,
    revision_payload = n,
    revision_state = 'submitted',
    revision_note = NULL,
    revision_submitted_at = now(),
    hold_for_owner = true,
    auto_publish_at = NULL
  WHERE id = p_id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.restore_course_prev_version(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.restore_course_prev_version(text) TO authenticated;

-- 公開投稿的防灌水（前端的蜜罐與冷卻擋不住直接呼叫 API，所以在資料庫再擋一次）：
-- 全站每分鐘最多 10 筆；同一門課未讀的回報最多 5 筆。計數需讀 submissions，訪客沒有讀取權限，所以用 SECURITY DEFINER 輔助函數。
CREATE OR REPLACE FUNCTION public.submission_rate_ok(p_course_id text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT count(*) FROM public.submissions WHERE created_at > now() - interval '1 minute') >= 10 THEN
    RETURN false;
  END IF;
  IF p_course_id IS NOT NULL AND
     (SELECT count(*) FROM public.submissions WHERE course_id = p_course_id AND status = 'unread') >= 5 THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.submission_rate_ok(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submission_rate_ok(text) TO anon, authenticated;

-- 讀者回報課程問題：submissions 加兩欄（課程編號、問題類型）。
-- 一般投稿兩欄都留空；回報時兩欄都要有。其餘欄位的規則與防灌水限制維持原樣。
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS course_id TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS issue_type TEXT;

ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_issue_type_check;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_issue_type_check
  CHECK (issue_type IS NULL OR issue_type IN ('deadline_wrong', 'link_broken', 'fee_or_eligibility', 'full_or_cancelled', 'other'));

ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_course_id_check;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_course_id_check
  CHECK (course_id IS NULL OR course_id ~ '^[A-Za-z0-9_-]{1,80}$');

ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_report_pair_check;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_report_pair_check
  CHECK ((course_id IS NULL) = (issue_type IS NULL));

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
    AND (
      -- 一般投稿：兩欄都空
      (course_id IS NULL AND issue_type IS NULL)
      -- 課程問題回報：type 沿用「資訊勘誤」(error)，問題類型合法，且課程確實存在、正在上架
      OR (
        type = 'error'
        AND course_id ~ '^[A-Za-z0-9_-]{1,80}$'
        AND issue_type IN ('deadline_wrong', 'link_broken', 'fee_or_eligibility', 'full_or_cancelled', 'other')
        AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.status = 'active')
      )
    )
    AND public.submission_rate_ok(course_id)
  );

NOTIFY pgrst, 'reload schema';
-- ======================= 第 9 節結束 =======================
