// =======================================================
// 《望舟小棧 farfaring》Buffer 排程轉送站（Supabase Edge Function：buffer-relay）
//
// 後台把「文案 + 發文時間 + 圖卡網址」交給這裡，這裡確認呼叫者是主理人後，
// 用保險箱裡的 BUFFER_API_KEY 送進 Buffer 排程。金鑰永遠不會出現在瀏覽器裡。
//
// 需要的保險箱設定（Supabase ➔ Edge Functions ➔ Secrets）：
//   BUFFER_API_KEY   Buffer 個人金鑰（權限只需 account:read、posts:read、posts:write）
//
// 支援的動作（POST JSON）：
//   { "action": "channels" }
//     ➔ 列出 Buffer 上連結的頻道（用來測試連線）
//   { "action": "create", "platform": "threads" | "instagram",
//     "text": "...", "dueAt": "ISO 時間", "imageUrl": "（IG 必填）" }
//     ➔ 在指定時間排一篇貼文，回傳 Buffer 貼文編號
// =======================================================

const BUFFER_API = "https://api.buffer.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://zqkcnarvyklsifrqhfhd.supabase.co";
// 前台本來就公開的訪客鑰匙（同 data.js），只用來向資料庫詢問「呼叫者是不是主理人」
const PUBLISHABLE_KEY = "sb_publishable_czCscDq--2300rOfRMsMOA_kJVBXeUa";
const ALLOWED_ORIGINS = [
  "https://webfarfaring.vercel.app",
  "https://farfaring.space",
  "http://localhost:8765",
];
// 只接受自家圖卡空間的圖片，避免轉送站被拿去發來路不明的圖
const IMAGE_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/social-cards/`;
const TEXT_LIMITS: Record<string, number> = { threads: 500, instagram: 2200 };

type Channel = { id: string; name: string; service: string };

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Vary": "Origin",
  };
}

function reply(origin: string | null, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

// 用資料庫的 is_wangzhou_owner() 判斷，跟所有資料表權限規則同一套標準
async function isOwner(authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_wangzhou_owner`, {
    method: "POST",
    headers: { apikey: PUBLISHABLE_KEY, Authorization: authHeader, "Content-Type": "application/json" },
    body: "{}",
  });
  if (!res.ok) return false;
  return (await res.json()) === true;
}

async function bufferQuery(apiKey: string, query: string): Promise<any> {
  const res = await fetch(BUFFER_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.errors) {
    const message = json?.errors?.[0]?.message || `Buffer 回應狀態 ${res.status}`;
    throw new Error(message);
  }
  return json.data;
}

async function listChannels(apiKey: string): Promise<Channel[]> {
  const data = await bufferQuery(apiKey, "query { account { organizations { id } } }");
  const orgs: { id: string }[] = data?.account?.organizations ?? [];
  const channels: Channel[] = [];
  for (const org of orgs) {
    const result = await bufferQuery(
      apiKey,
      `query { channels(input: { organizationId: ${JSON.stringify(org.id)} }) { id name service } }`,
    );
    channels.push(...(result?.channels ?? []));
  }
  return channels;
}

// Buffer 文件只列出 instagram 的 service 名稱；Threads 以名稱包含 "threads" 判斷
function pickChannel(channels: Channel[], platform: string): Channel | undefined {
  return channels.find((c) => {
    const service = String(c.service || "").toLowerCase();
    return platform === "instagram" ? service === "instagram" : service.includes("threads");
  });
}

function validateCreate(input: any): string | null {
  const { platform, text, dueAt, imageUrl } = input;
  if (platform !== "threads" && platform !== "instagram") return "platform 只能是 threads 或 instagram";
  if (typeof text !== "string" || !text.trim()) return "文案是空的";
  if (text.length > TEXT_LIMITS[platform]) return `文案超過 ${platform} 的 ${TEXT_LIMITS[platform]} 字上限`;
  const due = Date.parse(dueAt);
  if (Number.isNaN(due)) return "發文時間格式不正確";
  if (due < Date.now() + 5 * 60 * 1000) return "發文時間至少要在 5 分鐘之後";
  if (due > Date.now() + 365 * 24 * 60 * 60 * 1000) return "發文時間不能超過一年後";
  if (platform === "instagram" && !imageUrl) return "Instagram 一定要附圖卡";
  if (imageUrl && (typeof imageUrl !== "string" || !imageUrl.startsWith(IMAGE_PREFIX) || imageUrl.includes(".."))) {
    return "圖卡必須來自小棧的 social-cards 圖片空間";
  }
  return null;
}

async function createPost(apiKey: string, input: any): Promise<{ postId: string; dueAt: string }> {
  const channels = await listChannels(apiKey);
  const channel = pickChannel(channels, input.platform);
  if (!channel) throw new Error(`Buffer 上找不到 ${input.platform} 頻道，請確認已連結帳號`);

  const dueAtIso = new Date(Date.parse(input.dueAt)).toISOString();
  // 依 Buffer 官方範例使用行內參數；字串一律經 JSON.stringify 轉成合法的 GraphQL 字串
  const fields = [
    `text: ${JSON.stringify(input.text)}`,
    `channelId: ${JSON.stringify(channel.id)}`,
    "schedulingType: automatic",
    "mode: customScheduled",
    `dueAt: ${JSON.stringify(dueAtIso)}`,
  ];
  if (input.imageUrl) fields.push(`assets: [{ image: { url: ${JSON.stringify(input.imageUrl)} } }]`);
  if (input.platform === "instagram") fields.push("metadata: { instagram: { type: post, shouldShareToFeed: true } }");

  const data = await bufferQuery(
    apiKey,
    `mutation { createPost(input: { ${fields.join(", ")} }) {
      __typename
      ... on PostActionSuccess { post { id dueAt } }
      ... on MutationError { message }
    } }`,
  );
  const result = data?.createPost;
  if (!result?.post?.id) throw new Error(result?.message || "Buffer 沒有回傳貼文編號");
  return { postId: result.post.id, dueAt: result.post.dueAt ?? dueAtIso };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== "POST") return reply(origin, 405, { ok: false, error: "只接受 POST" });
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return reply(origin, 403, { ok: false, error: "來源網站未被允許" });

  if (!(await isOwner(req.headers.get("Authorization")))) {
    return reply(origin, 403, { ok: false, error: "只有主理人登入後才能使用" });
  }

  const apiKey = Deno.env.get("BUFFER_API_KEY");
  if (!apiKey) return reply(origin, 500, { ok: false, error: "保險箱裡還沒有 BUFFER_API_KEY" });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return reply(origin, 400, { ok: false, error: "請求內容不是 JSON" });
  }

  try {
    if (body.action === "channels") {
      const channels = await listChannels(apiKey);
      return reply(origin, 200, { ok: true, channels: channels.map(({ name, service }) => ({ name, service })) });
    }
    if (body.action === "create") {
      const problem = validateCreate(body);
      if (problem) return reply(origin, 400, { ok: false, error: problem });
      const result = await createPost(apiKey, body);
      return reply(origin, 200, { ok: true, ...result });
    }
    return reply(origin, 400, { ok: false, error: "未知的 action" });
  } catch (err) {
    return reply(origin, 502, { ok: false, error: `Buffer：${(err as Error).message}` });
  }
});

