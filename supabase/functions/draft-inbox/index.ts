// =======================================================
// 《望舟小棧 farfaring》草稿收件匣（Supabase Edge Function：draft-inbox）
//
// AI 工作室寫好的稿件（社群貼文、手札、課程）由主理人電腦上的送稿腳本
// tools/send_draft.ps1 投遞到這裡。這裡確認送稿鑰匙正確後，把稿件以
// 「待審草稿」寫進資料庫，主理人在後台「📝 審稿工作台」就看得到。
//
// 這把鑰匙只能「投遞待審草稿」：
//   ・伺服器一律把稿件設成 review_status = pending、status = draft，
//     社群貼文另外清空排程時間與 Buffer 紀錄；呼叫者無法指定這些欄位
//   ・同一個 id 只有在「待審」或「要修改」、而且還沒送進 Buffer 時才能重送覆蓋，
//     並保留主理人寫的修改意見；主理人審過或已送 Buffer 的稿一律回 409
//
// 只給伺服器對伺服器使用：不開放跨網站存取（沒有 CORS），帶瀏覽器 Origin 標頭的請求一律拒絕。
//
// 需要的保險箱設定（Supabase ➔ Edge Functions ➔ Secrets）：
//   DRAFT_INBOX_KEY   送稿鑰匙（至少 32 字元的亂數；主理人電腦的 FARFARING_DRAFT_KEY 要設成同一串）
// Supabase 內建、不需設定：SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY（只在本函式內使用，不回傳給任何人）
//
// 部署時要關閉 Supabase 的 JWT 驗證（本函式自己檢查 x-draft-key）：
//   supabase functions deploy draft-inbox --no-verify-jwt
//
// 請求（POST，Content-Type: application/json，UTF-8，標頭 x-draft-key）：
//   { "kind": "social_post" | "article" | "course",
//     "id": "只能英數、底線、連字號，最多 80 字",
//     ...各類別允許的欄位（見下方 FIELDS），
//     "image_base64": "（選填，只限 social_post）JPEG 圖卡的 base64，原檔 2 MB 以內" }
// 回應：
//   { "ok": true, "kind": "...", "id": "...", "action": "created" | "updated", "imageUrl": "（有附圖卡時）" }
//   { "ok": false, "error": "中文原因" }
// =======================================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://zqkcnarvyklsifrqhfhd.supabase.co";
const REST = `${SUPABASE_URL}/rest/v1`;
// 圖卡放在 social-cards 圖片空間，檔名為 <安全化 id>-<時間戳>.jpg（每次新檔、不覆蓋），
// 公開網址以 buffer-relay 的 IMAGE_PREFIX 開頭，排程時的圖卡來源檢查才會通過
const CARD_BUCKET = "social-cards";
const CARD_PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${CARD_BUCKET}/`;

const MAX_BODY_BYTES = 3_200_000;          // 2 MB 圖卡轉成 base64 約 2.8 MB，再加上文字
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;   // 圖卡原檔上限 2 MB
const MIN_KEY_LENGTH = 32;                 // 送稿鑰匙太短等於沒鎖
const MAX_PENDING_PER_TABLE = 30;          // 防灌水：每類待審草稿最多 30 篇，滿了就先請主理人審
const ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;
const VERSION_LIMITS: Record<string, number> = { threads: 500, ig: 2200 };

type Kind = "social_post" | "article" | "course";
const TABLES: Record<Kind, string> = { social_post: "social_posts", article: "articles", course: "courses" };

type Rule = {
  type: "text" | "url" | "date" | "list" | "versions";
  max?: number;
  required?: boolean;
  pattern?: RegExp;
  oneOf?: string[];
  allowed?: string[];
};

// 白名單：每一類只收這些欄位（對應 data.js 的 upsertSocialPost / upsertArticle / upsertCourse）。
// review_status、status、review_note、排程與 Buffer 欄位都不在名單裡，由伺服器決定。
const FIELDS: Record<Kind, Record<string, Rule>> = {
  social_post: {
    title: { type: "text", max: 120, required: true },
    topic: { type: "text", max: 30 },
    source_type: { type: "text", max: 20, oneOf: ["none", "article", "course", "submission"] },
    source_id: { type: "text", max: 80, pattern: /^[A-Za-z0-9_-]*$/ },
    source_label: { type: "text", max: 120 },
    target_platforms: { type: "list", required: true, allowed: ["threads", "ig"] },
    versions: { type: "versions", required: true },
    content: { type: "text", max: 2200 },
    media_notes: { type: "text", max: 1000 },
    audit_note: { type: "text", max: 4000 },
    marketing_note: { type: "text", max: 4000 },
    source_url: { type: "url", max: 500 },
  },
  article: {
    title: { type: "text", max: 120, required: true },
    prose: { type: "text", max: 20000, required: true },
    cat_key: { type: "text", max: 30, pattern: /^[a-z_-]+$/ },
    cat_name: { type: "text", max: 30 },
    date: { type: "text", max: 20 },
    audit_note: { type: "text", max: 4000 },
    source_url: { type: "url", max: 500 },
  },
  course: {
    name: { type: "text", max: 200, required: true },
    organizer: { type: "text", max: 120 },
    types: { type: "list", allowed: ["deep", "upskill", "events"] },
    region: { type: "text", max: 30 },
    location: { type: "text", max: 120 },
    cost: { type: "text", max: 120 },
    deadline: { type: "date" },
    summary: { type: "text", max: 2000 },
    whisper: { type: "text", max: 1000 },
    organizer_note: { type: "text", max: 2000 },
    address: { type: "text", max: 200 },
    time_cycle: { type: "text", max: 200 },
    link: { type: "url", max: 500, required: true },
    audit_note: { type: "text", max: 4000 },
  },
};

function reply(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function fail(status: number, error: string): Response {
  return reply(status, { ok: false, error });
}

// 固定時間比較：先各自算 SHA-256 再逐位元比對，比對時間不會透露鑰匙長度或對了幾個字
async function sameSecret(given: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(given)),
    crypto.subtle.digest("SHA-256", enc.encode(secret)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return given.length > 0 && diff === 0;
}

// 邊讀邊算大小，超過上限立刻停止；內容必須是合法的 UTF-8（避免中文在送出時被轉成亂碼）
async function readBodyText(req: Request): Promise<string | null> {
  const declared = Number(req.headers.get("Content-Length") ?? "0");
  if (declared > MAX_BODY_BYTES) return null;
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(all);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function checkText(name: string, rule: Rule, value: unknown): string | null {
  if (typeof value !== "string") return `${name} 必須是文字`;
  if (rule.required && !value.trim()) return `${name} 不能是空的`;
  if (value.includes("\u0000")) return `${name} 含有無效字元`;
  if (rule.max && value.length > rule.max) return `${name} 超過 ${rule.max} 字上限`;
  if (rule.pattern && !rule.pattern.test(value)) return `${name} 格式不正確`;
  if (rule.oneOf && !rule.oneOf.includes(value)) return `${name} 只能是 ${rule.oneOf.join("、")}`;
  return null;
}

function checkField(name: string, rule: Rule, value: unknown): string | null {
  if (value === null || value === undefined) return rule.required ? `缺少必填欄位 ${name}` : null;
  switch (rule.type) {
    case "text":
      return checkText(name, rule, value);
    case "url": {
      const problem = checkText(name, rule, value);
      if (problem) return problem;
      try {
        const u = new URL(value as string);
        if (u.protocol !== "https:" && u.protocol !== "http:") return `${name} 必須是 http 或 https 網址`;
      } catch {
        return `${name} 不是有效的網址`;
      }
      return null;
    }
    case "date": {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${name} 必須是 YYYY-MM-DD`;
      const d = new Date(`${value}T00:00:00Z`);
      if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return `${name} 不是有效的日期`;
      return null;
    }
    case "list": {
      const allowed = rule.allowed ?? [];
      if (!Array.isArray(value)) return `${name} 必須是清單`;
      if (rule.required && value.length === 0) return `${name} 至少要有一項`;
      if (new Set(value).size !== value.length) return `${name} 有重複項目`;
      if (value.some((v) => typeof v !== "string" || !allowed.includes(v))) return `${name} 只能包含 ${allowed.join("、")}`;
      return null;
    }
    case "versions": {
      if (!isPlainObject(value)) return `${name} 必須是 { "threads": "...", "ig": "..." }`;
      for (const [platform, text] of Object.entries(value)) {
        const limit = VERSION_LIMITS[platform];
        if (!limit) return `${name} 只能有 threads、ig`;
        if (typeof text !== "string" || !text.trim()) return `${name}.${platform} 是空的`;
        if (text.includes("\u0000")) return `${name}.${platform} 含有無效字元`;
        if (text.length > limit) return `${name}.${platform} 超過 ${limit} 字上限`;
      }
      return null;
    }
  }
}

// 檢查整份稿件，回傳要寫進資料庫的欄位（只含呼叫者有提供的白名單欄位）
function validateDraft(kind: Kind, body: Record<string, unknown>): { row?: Record<string, unknown>; error?: string } {
  const rules = FIELDS[kind];
  const allowedKeys = new Set(["kind", "id", ...Object.keys(rules), ...(kind === "social_post" ? ["image_base64"] : [])]);
  const unknown = Object.keys(body).filter((k) => !allowedKeys.has(k));
  if (unknown.length) return { error: `不接受的欄位：${unknown.join("、")}` };

  const row: Record<string, unknown> = {};
  for (const [name, rule] of Object.entries(rules)) {
    const problem = checkField(name, rule, body[name]);
    if (problem) return { error: problem };
    if (body[name] !== undefined) row[name] = body[name];
  }

  if (kind === "social_post") {
    const versions = body.versions as Record<string, string>;
    for (const platform of body.target_platforms as string[]) {
      if (!versions[platform]) return { error: `target_platforms 有 ${platform}，但 versions.${platform} 是空的` };
    }
  }
  return { row };
}

function decodeJpeg(value: unknown): { bytes?: Uint8Array; error?: string } {
  if (typeof value !== "string" || !value) return { error: "image_base64 必須是 base64 文字" };
  if (value.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) return { error: "圖卡超過 2 MB 上限" };
  if (value.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return { error: "圖卡不是有效的 base64" };
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  if (bytes.length > MAX_IMAGE_BYTES) return { error: "圖卡超過 2 MB 上限" };
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return { error: "圖卡必須是 JPEG 檔" };
  return { bytes };
}

// 與 data.js 的 wzSafeId 相同規則
function safeId(value: string): string {
  return String(value || "").replace(/[^A-Za-z0-9_-]/g, "");
}

// 資料庫與圖片空間的請求一律同時帶 apikey 與 Authorization（都是內建的 service role 金鑰）
function serviceHeaders(serviceKey: string, extra: Record<string, string> = {}): Record<string, string> {
  return { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, ...extra };
}

async function dbError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  return `資料庫回應狀態 ${res.status}${text ? `：${text.slice(0, 200)}` : ""}`;
}

function isEmptyBufferIds(v: unknown): boolean {
  return v === null || v === undefined || (isPlainObject(v) && Object.keys(v).length === 0);
}

// 已存在的稿件能不能覆蓋：只有待審或要修改、還在草稿階段、沒送進 Buffer 的才可以
function overwriteBlocked(kind: Kind, existing: Record<string, unknown>): string | null {
  if (existing.review_status !== "pending" && existing.review_status !== "revise") {
    return "這篇稿件不在「待審」或「要修改」狀態（主理人可能已經審過），收件匣不能覆蓋。若要另外送稿，請換一個新的 id。";
  }
  if (kind === "social_post") {
    if (existing.status === "published") return "這則貼文已經在社群發布，收件匣不能覆蓋。";
    if (!isEmptyBufferIds(existing.buffer_post_ids)) return "這則貼文已經送進 Buffer，收件匣不能覆蓋。";
  } else if (existing.status !== "draft") {
    return "這篇已經在網站上架或下架，收件匣不能覆蓋。";
  }
  return null;
}

// 用「讀到的狀態」當更新條件；若讀完到寫入之間主理人剛好審過，就不會更新到任何一筆
function sameStateFilter(column: string, value: unknown): string {
  if (value === null || value === undefined) return `${column}=is.null`;
  return `${column}=eq.${encodeURIComponent(String(value))}`;
}

async function countPending(serviceKey: string, table: string): Promise<number> {
  const res = await fetch(`${REST}/${table}?select=id&review_status=eq.pending&status=eq.draft&limit=1`, {
    headers: serviceHeaders(serviceKey, { Prefer: "count=exact" }),
  });
  if (!res.ok) throw new Error(await dbError(res));
  await res.body?.cancel();
  const total = Number((res.headers.get("Content-Range") ?? "").split("/")[1]);
  return Number.isFinite(total) ? total : 0;
}

// 每次都用新檔名、不覆蓋既有圖檔：就算檢查之後主理人剛好核准了這篇，也不會蓋掉已核准貼文的圖。
// 代價是寫入資料庫失敗時，可能留下一張沒被任何貼文引用的圖檔（可接受）。
async function uploadCard(serviceKey: string, id: string, bytes: Uint8Array): Promise<string> {
  const path = `${safeId(id)}-${Date.now()}.jpg`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${CARD_BUCKET}/${path}`, {
    method: "POST",
    headers: serviceHeaders(serviceKey, { "Content-Type": "image/jpeg" }),
    body: bytes,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`圖卡上傳失敗（${res.status}）${text ? `：${text.slice(0, 200)}` : ""}`);
  }
  // 網址以 buffer-relay 的 IMAGE_PREFIX（.../storage/v1/object/public/social-cards/）開頭
  return `${CARD_PUBLIC_PREFIX}${path}`;
}

Deno.serve(async (req) => {
  if (req.headers.get("Origin")) return fail(403, "草稿收件匣不接受瀏覽器呼叫");
  if (req.method !== "POST") return fail(405, "只接受 POST");

  const secret = Deno.env.get("DRAFT_INBOX_KEY") ?? "";
  if (secret.length < MIN_KEY_LENGTH) {
    return fail(503, "保險箱裡還沒有設定 DRAFT_INBOX_KEY（或長度不足 32 字元），收件匣暫停收件");
  }
  if (!(await sameSecret(req.headers.get("x-draft-key") ?? "", secret))) {
    return fail(401, "送稿鑰匙不正確");
  }

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) return fail(500, "伺服器缺少資料庫寫入金鑰");

  const contentType = (req.headers.get("Content-Type") ?? "").toLowerCase();
  if (!contentType.startsWith("application/json")) return fail(415, "請用 application/json 送出");

  let text: string | null;
  try {
    text = await readBodyText(req);
  } catch {
    return fail(400, "請求內容不是 UTF-8 編碼，中文可能變成亂碼了");
  }
  if (text === null) return fail(413, "請求內容太大（圖卡請控制在 2 MB 以內）");

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return fail(400, "請求內容不是 JSON");
  }
  if (!isPlainObject(body)) return fail(400, "請求內容必須是一個 JSON 物件");

  const kind = body.kind as Kind;
  if (!Object.prototype.hasOwnProperty.call(TABLES, kind)) return fail(400, "kind 只能是 social_post、article 或 course");
  const id = body.id;
  if (typeof id !== "string" || !ID_PATTERN.test(id)) {
    return fail(400, "id 只能用英文、數字、底線、連字號，最多 80 字");
  }

  const { row, error } = validateDraft(kind, body);
  if (error || !row) return fail(400, error ?? "稿件格式不正確");

  let card: Uint8Array | undefined;
  if (body.image_base64 !== undefined) {
    const decoded = decodeJpeg(body.image_base64);
    if (decoded.error) return fail(400, decoded.error);
    card = decoded.bytes;
  }

  const table = TABLES[kind];
  const columns = kind === "social_post" ? "id,review_status,status,buffer_post_ids" : "id,review_status,status";

  try {
    const found = await fetch(`${REST}/${table}?id=eq.${encodeURIComponent(id)}&select=${columns}`, {
      headers: serviceHeaders(serviceKey),
    });
    if (!found.ok) throw new Error(await dbError(found));
    const existing = ((await found.json()) as Record<string, unknown>[])[0];

    if (existing) {
      const blocked = overwriteBlocked(kind, existing);
      if (blocked) return fail(409, blocked);
    } else if ((await countPending(serviceKey, table)) >= MAX_PENDING_PER_TABLE) {
      return fail(429, `待審草稿已有 ${MAX_PENDING_PER_TABLE} 篇，請主理人先審過一些再送`);
    }

    // 伺服器強制設定：只能是待審草稿；社群貼文清空排程與 Buffer 紀錄
    const forced: Record<string, unknown> = { review_status: "pending", status: "draft" };
    if (kind === "social_post") {
      Object.assign(forced, { scheduled_at: null, scheduled_date: null, buffer_post_ids: {}, buffer_error: null });
    }

    let imageUrl: string | undefined;
    if (card) imageUrl = await uploadCard(serviceKey, id, card);

    // review_note（主理人的修改意見）不在白名單裡，更新時不會被動到
    const payload = { ...row, ...(imageUrl ? { image_url: imageUrl } : {}), ...forced };

    if (existing) {
      const filters = [
        `id=eq.${encodeURIComponent(id)}`,
        sameStateFilter("review_status", existing.review_status),
        sameStateFilter("status", existing.status),
      ];
      const res = await fetch(`${REST}/${table}?${filters.join("&")}&select=id`, {
        method: "PATCH",
        headers: serviceHeaders(serviceKey, { "Content-Type": "application/json", Prefer: "return=representation" }),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await dbError(res));
      const updated = (await res.json()) as unknown[];
      if (updated.length !== 1) return fail(409, "這篇稿件的狀態剛剛有變動（主理人可能正在審），這次沒有覆蓋，請重新確認後再送");
      return reply(200, { ok: true, kind, id, action: "updated", ...(imageUrl ? { imageUrl } : {}) });
    }

    const res = await fetch(`${REST}/${table}`, {
      method: "POST",
      headers: serviceHeaders(serviceKey, { "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify({ id, ...payload }),
    });
    if (res.status === 409) return fail(409, "同一個 id 剛好也被建立了，這次沒有寫入，請重新確認後再送");
    if (!res.ok) throw new Error(await dbError(res));
    return reply(200, { ok: true, kind, id, action: "created", ...(imageUrl ? { imageUrl } : {}) });
  } catch (err) {
    return fail(502, `寫入失敗：${(err as Error).message}`);
  }
});
