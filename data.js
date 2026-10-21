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
    // 真實最後維護日期（由主理人在後台點擊發布時真實烙印，絕非讀者端偽造之當天時間）
    lastUpdated: "2026 年 10 月 20 日",
    adminTitle: "小棧長",
    contactEmail: "farfaring.space@gmail.com",
    instagram: "https://www.instagram.com/farfaring",
    threads: "https://www.threads.net/@farfaring",
    disclaimer: "相關資訊皆以各主辦單位公告為準 ｜ 望舟小棧 farfaring"
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

  // 木棧道・課程活動庫（包含辦訓單位、真實報名網址、各項篩選標籤）
  courses: [
    {
      id: "161624",
      title: "AI 財務與 Gemini 應用班 第 01 期",
      types: ["deep", "upskill"],
      region: "北部",
      locationLabel: "桃園中壢 ． 實體訓練",
      provider: "社團法人台灣產學職涯發展協會（勞動部產投計畫）",
      address: "桃園市中壢區復興路 46 號 8 樓",
      timeCycle: "每週二、四 18:30-21:30，共計 48 小時",
      deadline: "2026-10-26",
      statusType: "urgent",
      statusText: "倒數報名中",
      summary: "實用掌握 Gemini 提示詞工程、財務分析自動化與日常營運報表產出。",
      whisper: "適合已有會計或行政基礎者，將既有經驗接軌生成式 AI 工具，減輕日常繁瑣手工作業。",
      organizerNote: "結訓輔導考取技術士證照，提供電腦上機實戰教室。",
      cost: "政府產投補助 80%~100%（特定資格全額補助，一般學員自付 20%）",
      how: "至台灣就業通產業人才投資方案線上報名（課程代碼 161624）",
      url: "https://its.taiwanjobs.gov.tw/Course/Detail?ID=161624",
      active: true
    },
    {
      id: "2026-pm-02",
      title: "非本科系的人，如何將跨界經驗整理成專案履歷亮點？",
      types: ["events"],
      region: "線上",
      locationLabel: "線上 ． 同步交流",
      provider: "Youth 青年職涯發展中心",
      address: "線上 Cisco Webex 會議室（報名後寄發連結）",
      timeCycle: "單場活動：週六 14:00 - 16:30（共 2.5 小時）",
      deadline: "2026-10-24",
      statusType: "open",
      statusText: "開放報名中",
      summary: "專案經理實例拆解：把日常行政、跨部門協調以專案框架呈現，打造亮眼履歷。",
      whisper: "著重在跨領域轉職者如何盤點非典型專案經歷，提供線上實用履歷範本與 Q&A 交流。",
      organizerNote: "完全免費公益講座，名額有限需提前登錄。",
      cost: "完全免費（公部門青年職涯資源）",
      how: "於 Youth 青年職涯平台線上預約",
      url: "https://youth.taiwanjobs.gov.tw/",
      active: true
    },
    {
      id: "2026-wood-03",
      title: "空間規劃與實用室內裝修技術專修班",
      types: ["deep"],
      region: "中部",
      locationLabel: "台中西屯 ． 實作訓練場",
      provider: "勞動力發展署中彰投分署",
      address: "台中市西屯區工業區一路 100 號",
      timeCycle: "週一至週五 08:30-16:30（全日密集訓練，共 360 小時）",
      deadline: "2026-11-05",
      statusType: "open",
      statusText: "招生中",
      summary: "扎實動手操作：木工工法、天花板隔間施工與泥作基礎，結訓輔導考照。",
      whisper: "適合想培養實體一技之長、渴望擺脫純辦公室螢幕的學員，由資深匠師帶領上機練習。",
      organizerNote: "符合待業資格可申請受訓生活津貼，結訓安排現場廠商徵才。",
      cost: "符合待業資格者學費全免；特定對象可請領受訓津貼",
      how: "於台灣就業通職前訓練網或就服站臨櫃登記",
      url: "https://tcnr.wda.gov.tw/",
      active: true
    },
    {
      id: "2026-east-04",
      title: "東部永續地方創生與社群營運實務工作坊",
      types: ["events", "upskill"],
      region: "東部",
      locationLabel: "花蓮市 ． 實體工作坊",
      provider: "花蓮縣創生發展協會 ＆ 洄瀾青年交流據點",
      address: "花蓮市中山路 180 號（青年共創空間）",
      timeCycle: "週末工作坊：週六 10:00 - 17:00（共 6 小時）",
      deadline: "2026-11-12",
      statusType: "open",
      statusText: "開放報名",
      summary: "地方品牌營運經驗拆解：農特產包裝轉型、社群故事打造與小規模電子商務實作。",
      whisper: "適合移居東部或在地青年探索第二專長，現場與多位在地自營品牌主理人深度交流。",
      organizerNote: "提供在地小農茶點，歡迎對地方創生感興趣的夥伴。",
      cost: "免費參與（名額 25 人）",
      how: "至洄瀾共創據點表單線上登記",
      url: "https://youth.taiwanjobs.gov.tw/",
      active: true
    },
    {
      id: "2026-island-05",
      title: "離島數位自雇行銷與微型文旅設計講堂",
      types: ["upskill", "events"],
      region: "離島",
      locationLabel: "澎湖馬公 ． 實體＋線上",
      provider: "澎湖青年創生基地 ＆ 澎湖就服中心",
      address: "澎湖縣馬公市民族路 32 號（創生講堂）",
      timeCycle: "週日 14:00 - 17:00（共 3 小時）",
      deadline: "2026-11-18",
      statusType: "open",
      statusText: "開放報名",
      summary: "如何打破海島地理限制：遠距數位工具接案、觀光微品牌視覺包裝與行銷漏斗入門。",
      whisper: "特別適合離島想開展不受地域限制之數位兼職或自雇型態之工作者。",
      organizerNote: "馬公實體教室開放 30 席，台澎金馬線上同步開放直播會議室。",
      cost: "完全免費",
      how: "於青年職涯平台填寫報名表單",
      url: "https://youth.taiwanjobs.gov.tw/",
      active: true
    }
  ],

  // 水岸手札庫（三大實務觀察分類：職場觀察、職涯探索、生活步調）
  articles: [
    {
      id: "note-01",
      catKey: "career",
      catName: "職涯探索",
      date: "2026.10",
      title: "當你試了好多新方向，卻覺得還在原地打轉的時候",
      prose: `有些人在離開原本熟悉的位置、或是換到比較安穩但少了點成就感的工作之後，為了想趕快找回生活的重心，會開始同時嘗試好多事——下班學剪輯、週末研究開小賣場、又報名了幾堂證照課。

看起來每天的行程都排得好滿，但過了幾個月，卻覺得自己好像只是很累，小舟卻沒有真正往前走。

如果你最近也是這樣，想先跟你說：這真的不是因為你不夠好。相反的，是因為你太認真想為自己找路了。

只是在水流還不清楚的時候，如果急著往每個方向都用力划兩槳，船反而會在原地打轉。當力氣被分散在五件零散的小事上，每一件事都只推進了一點點，自然很難看見讓自己安心的風景。

這週不妨先在木棧板上停一下，試著做個溫柔的減法：
先把手上覺得「好像應該做」的五件事暫時放下三件，只留下一件「能接上你過去累積過的經驗」、或是「你做完之後心裡覺得踏實、有精神」的事。

給自己三個月的時間，只專心划這一槳看看。`
    },
    {
      id: "note-02",
      catKey: "career",
      catName: "職涯探索",
      date: "2026.10",
      title: "走過的路不會白費：為什麼「舊經驗＋一點新工具」反而最珍貴？",
      prose: `很多人在考慮轉換跑道或重新找方向時，心裡常會有個聲音：「我不是本科系出身，現在才學來得及嗎？」

這陣子觀察了許多團隊的用人需求，其實有一個很溫暖的趨勢：比起只會操作新軟體、卻還不熟悉職場運作的新手，許多地方反而更珍惜那些「原本就有幾年行政、企劃、服務或管理歷練，同時願意多學一點數位工具」的人。

因為軟體跟工具的操作，往往靠一兩個月的密集課程就能補起來；但你過去在工作裡磨練出來的溝通分寸、理解別人難處的體貼、還有知道事情卡在哪裡的直覺，卻是任何 AI 或短期課程都取代不了的底氣。

所以，過去走過的每一步都算數。你不需要推翻過去的自己，只需要幫原本的經驗接上一個新的轉接頭而已。`
    },
    {
      id: "note-03",
      catKey: "workplace",
      catName: "職場觀察",
      date: "2026.10",
      title: "哈佛學者眼中的迷惘期：轉職不是想清楚才出發，而是邊走邊試出新的自己",
      prose: `我們從小被教導的職涯觀念，常常是「先想清楚自己要什麼、做測驗、立定目標，然後朝著它前進」。
所以當生活出現停滯或迷惘時，很多人會把自己關在房間裡苦思：「我到底適合做什麼？下一步到底在哪裡？」

但在哈佛商學院專門研究職涯轉型的組織行為學學者 Herminia Ibarra，在長達數年追蹤了上百位成功跨領域轉換跑道的人之後，卻發現了一個完全相反的實證真相：

真正順利找到新方向的人，幾乎沒有人是「坐在書桌前想通的」。

她的研究提出了一個很溫暖的理論叫做「微型實驗（Small Experiments）」：
人的職涯身分不是單一固定、等待被挖掘的寶藏，而是由好多個「可能的身分（Possible Selves）」組成的。
你不需要在一夕之間辭職或做出重大宣誓；相反地，最有效的轉型方式，是從小小的低成本行動開始：
・去上一堂平日晚上或週末的短期技能課。
・去聽一場自己完全不了解的行業講座，跟講師或旁邊的人聊兩句。
・幫朋友做一個小小的兼職或側邊專案。

這些小小的停靠與嘗試，不是在「浪費時間」，而是大腦正在透過真實的觸碰，幫你確認「這個方向的生活，是不是我真正想過的」。

所以，當你現在還看不清楚終點在哪裡時，真的不用急著逼自己把五年後的大圖畫出來。
只要去試一朵小浪花、去木棧道旁邊踩踩水，新的方向就會在行動裡自己長出來。`
    },
    {
      id: "note-04",
      catKey: "lifestyle",
      catName: "生活步調",
      date: "2026.10",
      title: "白天在職場運轉，下班後如何找回屬於自己的生活節奏？",
      prose: `很多工作者常有一種感受：明明下班了，坐在沙發上滑手機，腦袋裡卻依然在重播白天開會的片段，或者焦慮著明天還沒回完的信件。

這其實不是你不夠自律，而是我們的大腦缺乏一個明確的「靠岸儀式」。

在望舟小棧的日常觀察中，真正能在職場與生活間游刃有餘的人，往往不是工作量最少的人，而是擁有強固「停靠界線」的人。
比如：
・下班走出公司門口時，深呼吸三次，在心裡默念一句「今天的營業時間結束了」。
・回家路上特意繞一條沒走過的小巷，看一朵路邊開的花。
・吃晚餐的時候，把工作手機收進抽屜，不讓訊息提示音打斷咀嚼的味道。

生活不是工作的附屬品。工作只是划船時借用的一條水道，而岸上的風景、家人朋友的笑容、安靜讀一本好書的夜晚，才是我們生活的本體。`
    }
  ],

  // 訪客投稿審核箱資料庫（儲存來自前台的所有推薦、故事、來信與勘誤）
  submissions: [
    {
      id: "sub-init-01",
      type: "course",
      typeName: "課程活動推薦",
      title: "ESG 永續碳盤查基礎證照班",
      author: "林旅人",
      contact: "lin@example.com",
      content: "推薦勞動部近期開辦的碳盤查實務班，免學費且有輔導考照，非常適合想要跨入永續領域的朋友。",
      extra: "主辦單位：財團法人工業技術研究院",
      createdAt: "2026-10-20 14:30",
      status: "unread"
    },
    {
      id: "sub-init-02",
      type: "story",
      typeName: "故事投稿",
      title: "從行政轉職前端工程師的那一年，我學會了不焦慮",
      author: "水岸漫步者",
      contact: "wanderer@example.com",
      content: "三十歲決定裸辭轉職，剛開始每天都很慌張。後來看了小棧的文章，開始從小專案嘗試，才慢慢把心定下來。謝謝這個溫暖的小棧。",
      extra: "",
      createdAt: "2026-10-20 16:15",
      status: "unread"
    }
  ]
};

// 輔助函式：若瀏覽器本地有主理人編輯過的暫存（localStorage），優先讀取本地最新狀態
(function initializeData() {
  try {
    const localOverride = localStorage.getItem("WANGZHOU_SITE_DATA_OVERRIDE");
    if (localOverride) {
      const parsed = JSON.parse(localOverride);
      Object.assign(SITE_DATA, parsed);
    }
  } catch (e) {
    console.warn("未能讀取本地暫存覆蓋，使用原始 data.js 數據", e);
  }
})();
