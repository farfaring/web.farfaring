-- =======================================================
-- 《望舟小棧 farfaring》輕量流量統計與在線渡客引擎 (v2.1 終極防護版)
-- 感謝 Claude 團隊專業深度的 Code Review，本版本完成以下關鍵防禦加固：
--   1. 【非法格式零寫入】：格式不合者完全不寫入 active_sessions 或 page_views，純讀取人數回傳，阻斷垃圾代號攻擊。
--   2. 【全站上限前置防護】：將每分鐘 120 筆之斷路器移至最前端，active_sessions 之「新增」全面納入斷路器管轄。
--   3. 【換代號機器人防線】：在線人數增設 200 艘防爆上限，避免輪換 Session 代號之腳本惡意灌高「在線渡客」。
--   4. 【快照清理收斂】：過期在線連線清理週期由 1 小時收縮至 20 分鐘，確保 active_sessions 表維持在極致羽量級。
-- 
-- 執行方式：Supabase 控制台 ➔ SQL Editor ➔ 貼上整份 ➔ Run
-- 特點：可重複執行、不破壞現有資料、零個資、不記 IP、無 Cookie、完全免費
-- =======================================================

-- 1. 建立造訪紀錄表 (page_views)
CREATE TABLE IF NOT EXISTS public.page_views (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  page_path text NOT NULL,
  page_title text,
  referrer text,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 索引加速統計查詢
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON public.page_views(session_id);

-- 2. 建立即時在線連線表 (active_sessions)
CREATE TABLE IF NOT EXISTS public.active_sessions (
  session_id text PRIMARY KEY,
  page_path text,
  last_seen_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_last_seen ON public.active_sessions(last_seen_at);

-- 啟用行級安全防護 (RLS)
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- 訪客不能直接透過 REST API 對資料表進行 SELECT/UPDATE/DELETE
-- 只有通過驗證的主理人帳號能讀取統計明細
DROP POLICY IF EXISTS "Owner read page_views" ON public.page_views;
CREATE POLICY "Owner read page_views" ON public.page_views
  FOR SELECT TO authenticated
  USING (public.is_wangzhou_owner());

DROP POLICY IF EXISTS "Owner read active_sessions" ON public.active_sessions;
CREATE POLICY "Owner read active_sessions" ON public.active_sessions
  FOR SELECT TO authenticated
  USING (public.is_wangzhou_owner());


-- =======================================================
-- 3. 訪客無聲打卡與心跳函數 (record_visit)
-- =======================================================
CREATE OR REPLACE FUNCTION public.record_visit(
  p_page text,
  p_title text,
  p_referrer text,
  p_session text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- 鎖定 search_path，杜絕提權風險
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
  -- 以台灣時間 Asia/Taipei 的當日 00:00 嚴格定義「今日」起算點
  v_today_start := date_trunc('day', now() AT TIME ZONE 'Asia/Taipei') AT TIME ZONE 'Asia/Taipei';

  -- 【加固 1】：嚴格檢查 Session 代號格式（由 data.js 規範生成）
  -- 只有格式完全正確時才認定為合法 Session；若格式不符，保持 false，完全不寫入資料庫
  IF p_session IS NOT NULL AND p_session ~ '^wz-[a-zA-Z0-9_\-]{6,64}$' THEN
    v_is_valid_session := true;
    v_clean_sid := p_session;
  END IF;

  -- 【加固 2 & 3】：只有在「代號合法」且「全站流量未觸發斷路器」時才執行資料庫寫入
  IF v_is_valid_session THEN

    -- 全站突發斷路器檢查前置：計算過去 1 分鐘全站寫入量
    SELECT count(*) INTO v_global_minutely_views
    FROM public.page_views
    WHERE created_at > now() - interval '1 minute';

    -- 當全站 1 分鐘寫入低於 120 筆時才放行寫入；超過則跳過寫入，直接回傳當前人次
    IF v_global_minutely_views < 120 THEN

      -- 取得目前活躍在線數（近 5 分鐘）
      SELECT count(*) INTO v_current_active_count
      FROM public.active_sessions
      WHERE last_seen_at >= now() - interval '5 minutes';

      -- 取得該 Session 上次在線心跳時間
      SELECT last_seen_at INTO v_last_seen
      FROM public.active_sessions
      WHERE session_id = v_clean_sid;

      v_clean_page := substr(regexp_replace(coalesce(p_page, '/'), '[^a-zA-Z0-9_\-\.\/]', '', 'g'), 1, 80);
      IF v_clean_page = '' THEN v_clean_page := 'index.html'; END IF;

      -- 寫入 active_sessions 規則：
      -- (a) 既有 Session：間隔大於 15 秒才更新 last_seen_at（防抖，減少 DB 負擔）
      -- (b) 全新 Session：只有當前在線數未達 200 艘上限時才允許新增（防範換代號腳本灌爆在線名單）
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

      -- 寫入 page_views 歷史足跡規則：
      -- 單一 Session 1 小時內最多記錄 45 筆頁面足跡，且同頁面 3 分鐘內不重複計入
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

    END IF; -- 結束 1 分鐘突發斷路保護
  END IF; -- 結束合法 Session 判定

  -- 【加固 4】：輕量過期清理（每次呼叫約 10% 機率清理超過 20 分鐘無心跳之在線連線，確保表格輕盈）
  IF random() < 0.10 THEN
    DELETE FROM public.active_sessions WHERE last_seen_at < now() - interval '20 minutes';
  END IF;

  -- 唯讀計算：當前在線渡客（近 5 分鐘內有心跳者，保底 1 人，上限 200 人）
  SELECT least(greatest(count(*), 1), 200) INTO v_online_count
  FROM public.active_sessions
  WHERE last_seen_at >= now() - interval '5 minutes';

  -- 唯讀計算：今日獨立造訪渡客數（台灣時間今日 00:00 起算）
  SELECT greatest(count(DISTINCT session_id), 1) INTO v_today_count
  FROM public.page_views
  WHERE created_at >= v_today_start;

  -- 移除全表 count(*)，維持毫秒級極速回應
  RETURN json_build_object(
    'online_count', v_online_count,
    'today_count', v_today_count
  );
END;
$$;


-- =======================================================
-- 4. 主理人專屬營運分析報表函數 (get_admin_analytics)
-- =======================================================
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- 鎖定 search_path
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
  -- 權限檢查：只有主理人登入後能執行
  IF NOT public.is_wangzhou_owner() THEN
    RAISE EXCEPTION '未授權存取營運數據';
  END IF;

  -- 精準定義台灣時間今日起算點
  v_today_start := date_trunc('day', now() AT TIME ZONE 'Asia/Taipei') AT TIME ZONE 'Asia/Taipei';

  -- 當前在線與今日數據
  SELECT least(greatest(count(*), 0), 200) INTO v_online
  FROM public.active_sessions
  WHERE last_seen_at >= now() - interval '5 minutes';

  SELECT count(DISTINCT session_id) INTO v_today
  FROM public.page_views
  WHERE created_at >= v_today_start;

  -- 全站歷史總瀏覽數僅在後台小棧長審閱時才計算，不浪費前台資源
  SELECT count(*) INTO v_total FROM public.page_views;

  -- 近 7 日每日渡客人潮趨勢（使用 generate_series 搭配精準台灣時區切分）
  SELECT json_agg(t) INTO v_trend FROM (
    SELECT
      to_char(d, 'MM/DD') as date_label,
      to_char(d, 'Dy') as day_name,
      count(DISTINCT pv.session_id) as visitors
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

  -- 來源分佈 (Threads, Instagram, Google, Direct 等，近 30 天)
  SELECT json_agg(s) INTO v_sources FROM (
    SELECT
      coalesce(referrer, '直接造訪') as source_name,
      count(*) as count
    FROM public.page_views
    WHERE created_at >= now() - interval '30 days'
    GROUP BY referrer
    ORDER BY count DESC
    LIMIT 6
  ) s;

  -- 最常停靠頁面 Top 5
  SELECT json_agg(p) INTO v_pages FROM (
    SELECT
      page_path,
      max(page_title) as page_title,
      count(*) as views
    FROM public.page_views
    WHERE created_at >= now() - interval '30 days'
    GROUP BY page_path
    ORDER BY views DESC
    LIMIT 5
  ) p;

  -- 最近 10 筆動態足跡
  SELECT json_agg(r) INTO v_recent FROM (
    SELECT
      page_title,
      page_path,
      referrer,
      created_at
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


-- =======================================================
-- 5. 函數執行權限明確收斂（縱深安全防護）
-- =======================================================
-- 收回 public/anon 對管理後台報表的執行權限，只授權給登入後的主理人
REVOKE ALL ON FUNCTION public.get_admin_analytics() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_admin_analytics() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_analytics() TO authenticated;

-- 放行打卡心跳函數給一般訪客與主理人呼叫
GRANT EXECUTE ON FUNCTION public.record_visit(text, text, text, text) TO anon, authenticated;
