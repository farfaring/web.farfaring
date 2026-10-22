-- =======================================================
-- 《望舟小棧 farfaring》安全修補腳本（給「已經建好表」的現有資料庫使用）
-- 執行方式：Supabase 控制台 ➔ SQL Editor ➔ 貼上整份 ➔ Run
-- 可重複執行，不會動到任何資料，只更換權限規則。
--
-- 修補內容：
--   1. 移除「任何人都能讀寫刪」的 Admin full access 規則
--   2. 改為只有主理人帳號（登入後）能完整管理
--   3. 投稿箱：訪客只能「新增」，不能讀取任何投稿（含聯絡方式）
--   4. 投稿新增時檢查 id 格式、類型、狀態與長度，避免被塞入惡意內容
-- =======================================================

-- 0. 主理人身分判斷（登入者 email 必須是小棧信箱）
CREATE OR REPLACE FUNCTION public.is_wangzhou_owner()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(auth.jwt() ->> 'email', '') = 'farfaring.space@gmail.com'
$$;

-- 1. 移除舊的全開放規則
DROP POLICY IF EXISTS "Admin full access articles" ON articles;
DROP POLICY IF EXISTS "Admin full access courses" ON courses;
DROP POLICY IF EXISTS "Admin full access submissions" ON submissions;
DROP POLICY IF EXISTS "Admin full access social_posts" ON social_posts;
DROP POLICY IF EXISTS "Public read approved submissions" ON submissions;
DROP POLICY IF EXISTS "Public insert submissions" ON submissions;

-- 2. 主理人完整管理權限（必須登入）
DROP POLICY IF EXISTS "Owner full access articles" ON articles;
DROP POLICY IF EXISTS "Owner full access courses" ON courses;
DROP POLICY IF EXISTS "Owner full access submissions" ON submissions;
DROP POLICY IF EXISTS "Owner full access social_posts" ON social_posts;

CREATE POLICY "Owner full access articles" ON articles FOR ALL TO authenticated
  USING (public.is_wangzhou_owner()) WITH CHECK (public.is_wangzhou_owner());
CREATE POLICY "Owner full access courses" ON courses FOR ALL TO authenticated
  USING (public.is_wangzhou_owner()) WITH CHECK (public.is_wangzhou_owner());
CREATE POLICY "Owner full access submissions" ON submissions FOR ALL TO authenticated
  USING (public.is_wangzhou_owner()) WITH CHECK (public.is_wangzhou_owner());
CREATE POLICY "Owner full access social_posts" ON social_posts FOR ALL TO authenticated
  USING (public.is_wangzhou_owner()) WITH CHECK (public.is_wangzhou_owner());

-- 3. 訪客投稿：只能新增、只能是「待處理」、欄位格式與長度受限
CREATE POLICY "Public insert submissions" ON submissions FOR INSERT TO anon, authenticated
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

-- 4. 公開展示規則維持不變（任何人可讀「展出中」的手札與課程）
--    "Public read active articles" / "Public read active courses" 已存在，無需重建。
