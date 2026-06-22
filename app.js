/* ============================================================
   스킬판 — 데이터 + 렌더링
   ------------------------------------------------------------
   · stars = 숫자(폴백). 실제 표시·정렬은 stars.json(매일 GitHub Action 자동 갱신)이 덮어씀.
   · added = 큐레이션 추가일(최신순 정렬용).  repo = 별 갱신 대상(Action이 이 필드를 긁음).
   · 별 실측 검증(2026-06-22): superpowers 235k · karpathy 180k · anthropics/skills 153k
     · claude-mem 83.5k · understand 65.3k · frontend-slides 22.4k · prompt-master 9.66k
     · notebooklm 7.1k · claude-video 2.2k 등.  설치법은 각 repo README/marketplace.json 실측.
   ============================================================ */

const CATS = {
  doc:      { label: "문서·오피스",   color: "var(--cat-doc)" },
  design:   { label: "콘텐츠·디자인", color: "var(--cat-design)" },
  flow:     { label: "AI 워크플로우", color: "var(--cat-flow)" },
  research: { label: "리서치·이해",   color: "var(--cat-research)" },
  write:    { label: "글쓰기·소통",   color: "var(--cat-write)" },
  dev:      { label: "개발 도구",     color: "var(--cat-dev)" },
};

const BADGES = {
  official: { label: "🏛 공식",   cls: "badge--official" },
  popular:  { label: "🔥 인기",   cls: "badge--popular" },
  pick:     { label: "⭐ 강력추천", cls: "badge--pick" },
  new:      { label: "🌱 신규",   cls: "badge--new" },
};

const DOCS = "https://github.com/anthropics/skills"; // Anthropic 공식 스킬 저장소
// 공식 스킬 설치 명령어 (저장소 README 실측) — 문서팩 / 예제팩 2종
const I_DOC = "/plugin marketplace add anthropics/skills\n/plugin install document-skills@anthropic-agent-skills";
const I_EX  = "/plugin marketplace add anthropics/skills\n/plugin install example-skills@anthropic-agent-skills";

const SKILLS = [
  { id:"xlsx", name:"엑셀 척척", cat:"doc", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"엑셀(.xlsx)을 만들고 고쳐줘요. 수식·차트·표 정리까지 한 번에.",
    take:"함수 못 외워도 <b>“이 데이터로 월별 매출 차트 만들어줘”</b> 한마디면 끝.",
    src:"Anthropic 공식", url:DOCS, install:I_DOC },

  { id:"docx", name:"워드 문서 비서", cat:"doc", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"워드 문서를 작성·편집해요. 목차·표·서식·페이지 번호 자동.",
    take:"보고서 양식 잡기 귀찮을 때 <b>초안부터 자동</b>으로.",
    src:"Anthropic 공식", url:DOCS, install:I_DOC },

  { id:"pptx", name:"PPT 초안 자동", cat:"doc", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"발표용 슬라이드(.pptx)를 만들고 편집해요.",
    take:"<b>빈 슬라이드 공포증</b>에 특효. 뼈대 깔고 시작.",
    src:"Anthropic 공식", url:DOCS, install:I_DOC },

  { id:"pdf", name:"PDF 만능 칼", cat:"doc", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"PDF 읽기·합치기·자르기·양식 채우기·스캔본 글자 인식(OCR).",
    take:"흩어진 <b>PDF 합치고 표만 쏙</b> 뽑을 때.",
    src:"Anthropic 공식", url:DOCS, install:I_DOC },

  { id:"csv-summarizer", name:"CSV 데이터 요약", cat:"doc", badge:"new", repo:"coffeefuelbump/csv-data-summarizer-claude-skill", stars:410, added:"2026-06-22",
    desc:"CSV(엑셀류) 데이터를 한눈에 보이게 요약·정리해줘요.",
    take:"<b>숫자 잔뜩인 표</b> 받았을 때 핵심만 쏙.",
    src:"coffeefuelbump", url:"https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill",
    install:"git clone https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill.git ~/.claude/skills/csv-summarizer" },

  { id:"frontend-slides", name:"웹 슬라이드 만들기", cat:"doc", badge:"popular", repo:"zarazhangrui/frontend-slides", stars:22443, added:"2026-06-22",
    desc:"파워포인트 말고, 웹으로 예쁜 발표 슬라이드를 만들어줘요.",
    take:"<b>발표자료 디자인</b>에 시간 녹는 사람에게.",
    src:"zarazhangrui", url:"https://github.com/zarazhangrui/frontend-slides",
    install:"/plugin marketplace add zarazhangrui/frontend-slides\n/plugin install frontend-slides@frontend-slides" },

  { id:"canvas-design", name:"디자인 대신 해줌", cat:"design", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"포스터·카드뉴스 같은 이미지/PDF 비주얼을 코드로 만들어요.",
    take:"디자인 감각 없어도 결과물이 <b>‘디자인된’ 느낌</b>이 나요.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"frontend-design", name:"웹페이지 고퀄로", cat:"design", badge:"pick", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"AI 티 안 나는 진짜 같은 웹 화면을 만들어줘요.",
    take:"바이브코딩 결과 <b>촌스러움 탈출 1순위</b>. (이 사이트도 이걸로 만듦)",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"theme-factory", name:"테마 입히기", cat:"design", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"만든 문서·사이트에 색·폰트 테마를 입혀 통일감을 줘요.",
    take:"결과물이 <b>들쭉날쭉할 때</b> 한 방에 정리.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"slack-gif-creator", name:"슬랙 움짤 공장", cat:"design", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"슬랙용 움직이는 GIF 짤을 만들어요.",
    take:"팀 슬랙에 <b>드립 칠 때</b> (은근 인기).",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"algorithmic-art", name:"코드로 그리는 예술", cat:"design", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-22",
    desc:"p5.js로 흐름장·파티클 같은 ‘제너러티브 아트’를 코드로 만들어요.",
    take:"그림 감각 없어도 <b>알고리즘이 알아서</b> 패턴을 그려줘요.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"anydesign", name:"디자인 가이드 척척", cat:"design", badge:"new", repo:"uxKero/anydesign", stars:113, added:"2026-06-22",
    desc:"상황에 맞는 UI·그래픽 디자인을 제안하고 적용해줘요.",
    take:"<b>디자인 어떻게 할지</b> 감 안 올 때 길잡이.",
    src:"uxKero", url:"https://github.com/uxKero/anydesign",
    install:"git clone https://github.com/uxKero/anydesign.git\ncp -r anydesign ~/.claude/skills/" },

  { id:"web-asset-generator", name:"아이콘·이미지 생성", cat:"design", badge:"new", repo:"alonw0/web-asset-generator", stars:421, added:"2026-06-22",
    desc:"로고·문구로 파비콘·앱 아이콘·SNS 이미지를 자동으로 만들어줘요.",
    take:"<b>썸네일·아이콘</b> 매번 만들기 귀찮을 때.",
    src:"alonw0", url:"https://github.com/alonw0/web-asset-generator",
    install:"/plugin marketplace add alonw0/web-asset-generator\n/plugin install web-asset-generator@web-asset-generator-marketplace" },

  { id:"brand-guidelines", name:"브랜드 톤 적용", cat:"design", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"브랜드 색·폰트를 결과물에 자동으로 맞춰줘요.",
    take:"<b>브랜드 톤 맞춰야 할 때.</b>",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"superpowers", name:"클로드 일잘러 모드", cat:"flow", badge:"popular", repo:"obra/superpowers", stars:234953, added:"2026-06-21",
    desc:"막 코딩하지 않고 계획→테스트→검토 순서로 일하게 만들어요.",
    take:"결과물 퀄이 확 올라가요. <b>입문자 필수템.</b>",
    src:"Jesse Vincent", url:"https://github.com/obra/superpowers",
    install:"/plugin install superpowers@claude-plugins-official" },

  { id:"karpathy-guidelines", name:"실수 줄이는 규칙", cat:"flow", badge:"pick", repo:"multica-ai/andrej-karpathy-skills", stars:179678, added:"2026-06-21",
    desc:"클로드의 흔한 실수를 줄이는 4가지 규칙(질문 먼저·단순하게·시키는 것만).",
    take:"설치 10초, <b>체감은 즉시.</b>",
    src:"Karpathy 가이드라인", url:"https://github.com/multica-ai/andrej-karpathy-skills",
    install:"/plugin marketplace add multica-ai/andrej-karpathy-skills\n/plugin install andrej-karpathy-skills@karpathy-skills" },

  { id:"skill-creator", name:"나만의 스킬 제작", cat:"flow", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"내가 자주 시키는 일을 ‘나만의 스킬’로 직접 만들어줘요(외울 것 없음).",
    take:"<b>가장 강력한 스킬은 직접 만든 것</b> — 안트로픽 공식.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"prompt-master", name:"프롬프트 대신 써줌", cat:"flow", badge:"pick", repo:"nidhinjs/prompt-master", stars:9660, added:"2026-06-22",
    desc:"어떤 AI 툴에든 ‘정확한 프롬프트’를 대신 작성해줘요.",
    take:"<b>뭐라고 시켜야 할지 막막할 때.</b> 시키는 말부터 잘 만들어줘요.",
    src:"nidhinjs", url:"https://github.com/nidhinjs/prompt-master",
    install:"git clone https://github.com/nidhinjs/prompt-master.git ~/.claude/skills/prompt-master" },

  { id:"claude-mem", name:"기억하는 클로드", cat:"flow", badge:"popular", repo:"thedotmack/claude-mem", stars:83558, added:"2026-06-21",
    desc:"대화 내용을 자동 기억해, 새 세션에 필요한 것만 다시 꺼내줘요.",
    take:"<b>매번 처음부터 설명하기</b> 지칠 때.",
    src:"thedotmack", url:"https://github.com/thedotmack/claude-mem",
    install:"npx claude-mem install" },

  { id:"understand", name:"코드·자료 이해", cat:"research", badge:"popular", repo:"Egonex-AI/Understand-Anything", stars:65322, added:"2026-06-21",
    desc:"코드·문서·PDF를 한눈에 보는 ‘지식 지도’와 대시보드로 정리해요.",
    take:"<b>처음 보는 자료가 막막할 때</b> 길잡이.",
    src:"Egonex-AI", url:"https://github.com/Egonex-AI/Understand-Anything",
    install:"/plugin marketplace add Egonex-AI/Understand-Anything\n/plugin install understand-anything" },

  { id:"notebooklm", name:"노트북LM에 자료 정리", cat:"research", badge:"pick", repo:"PleasePrompto/notebooklm-skill", stars:7138, added:"2026-06-22",
    desc:"흩어진 자료를 모아 구글 노트북LM(NotebookLM)에 착착 넣어줘요.",
    take:"<b>공부·리서치 자료</b> 한 곳에 모을 때.",
    src:"PleasePrompto", url:"https://github.com/PleasePrompto/notebooklm-skill",
    install:"git clone https://github.com/PleasePrompto/notebooklm-skill ~/.claude/skills/notebooklm" },

  { id:"watch", name:"유튜브 영상 분석", cat:"research", badge:"pick", repo:"bradautomates/claude-video", stars:2241, added:"2026-06-21",
    desc:"유튜브 영상을 클로드가 직접 보고 요약·분석해줘요.",
    take:"긴 영상 안 보고 <b>핵심만</b>. (이 가이드도 영상 보고 만듦)",
    src:"Bradley Bonanno", url:"https://github.com/bradautomates/claude-video",
    install:"/plugin marketplace add bradautomates/claude-video\n/plugin install watch@claude-video" },

  { id:"second-brain-skills", name:"제2의 뇌 만들기", cat:"research", badge:"new", repo:"coleam00/second-brain-skills", stars:778, added:"2026-06-22",
    desc:"흩어진 메모·자료를 모아 ‘제2의 뇌’처럼 정리하는 스킬 묶음이에요.",
    take:"유명 AI 유튜버(Cole Medin)가 만든 <b>지식 정리 세트.</b>",
    src:"coleam00", url:"https://github.com/coleam00/second-brain-skills" },

  { id:"family-history", name:"가족사·족보 연구", cat:"research", badge:"new", repo:"emaynard/claude-family-history-research-skill", stars:84, added:"2026-06-22",
    desc:"가족사·족보(계보) 조사를 단계별로 계획하고 정리하게 도와줘요.",
    take:"<b>“이런 것도 돼?”</b> 싶은 취미·기록 정리에.",
    src:"emaynard", url:"https://github.com/emaynard/claude-family-history-research-skill" },

  { id:"doc-coauthoring", name:"문서 같이 쓰기", cat:"write", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"기획서·제안서 같은 문서를 단계별로 같이 써주는 방식이에요.",
    take:"<b>뭐부터 쓸지 막막한 문서</b>에.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"internal-comms", name:"사내 글 작성", cat:"write", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"공지·보고·뉴스레터를 회사 톤에 맞춰 써줘요.",
    take:"<b>주간보고·공지 쓰기 싫을 때.</b>",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"rampstack-brand", name:"브랜드 만들기", cat:"write", badge:"new", repo:"rampstackco/claude-skills", stars:367, added:"2026-06-22",
    desc:"이름·메시지·톤 같은 브랜드 기초를 같이 잡아줘요.",
    take:"<b>1인 창업·사이드프로젝트</b> 브랜딩 막막할 때.",
    src:"rampstackco", url:"https://github.com/rampstackco/claude-skills",
    install:"/plugin marketplace add rampstackco/claude-skills\n/plugin install rampstack-skills@rampstack" },

  { id:"mcp-builder", name:"외부앱 연결(MCP)", cat:"dev", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"노션·슬랙 같은 외부 서비스를 클로드에 연결하는 다리를 만들어요.",
    take:"<b>내가 쓰는 앱이랑 연결</b>하고 싶을 때.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"webapp-testing", name:"내 웹앱 점검", cat:"dev", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-21",
    desc:"만든 웹앱이 잘 도는지 자동으로 눌러보고 스크린샷을 찍어요.",
    take:"<b>내가 만든 거 안 깨졌나</b> 확인.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"web-artifacts-builder", name:"작은 웹앱 만들기", cat:"dev", badge:"official", repo:"anthropics/skills", stars:153497, added:"2026-06-22",
    desc:"리액트·디자인 컴포넌트로 진짜 작동하는 웹 화면·도구를 만들어요.",
    take:"<b>계산기·대시보드</b> 같은 내 전용 미니 앱을 뚝딱.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },
];

/* ---------- 별 갱신 (stars.json — Action이 매일 자동 갱신) ---------- */
async function loadStars() {
  try {
    const res = await fetch("stars.json", { cache: "no-store" });
    if (!res.ok) return false;
    const live = await res.json();
    let changed = false;
    for (const s of SKILLS) {
      if (s.repo && typeof live[s.repo] === "number") { s.stars = live[s.repo]; changed = true; }
    }
    return changed;
  } catch { return false; }
}

function fmtStars(n) {
  if (n >= 100000) return Math.round(n / 1000) + "k";
  if (n >= 1000)   return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return "" + n;
}

/* ---------- 렌더링 ---------- */
const grid = document.getElementById("grid");
const chipsEl = document.getElementById("chips");
const sortEl = document.getElementById("sort");
const sourceEl = document.getElementById("source");
const searchEl = document.getElementById("search");
const emptyEl = document.getElementById("empty");
document.getElementById("skill-count").textContent = SKILLS.length;

let activeCat = "all";
let query = "";
let sortMode = "rec"; // rec(추천순) · pop(인기순) · new(최신순)
let sourceMode = "all"; // all · community(공식 제외) · official(공식만)

const SORTS = [["rec", "추천순"], ["pop", "인기순"], ["new", "최신순"]];
const SOURCES = [["all", "전체"], ["community", "커뮤니티"], ["official", "공식"]];
const isOfficial = s => s.repo === "anthropics/skills";

function buildChips() {
  const cats = [["all", { label: "전체" }], ...Object.entries(CATS)];
  chipsEl.innerHTML = cats.map(([key, c]) =>
    `<button class="chip" role="tab" data-cat="${key}" aria-selected="${key === activeCat}">${c.label}</button>`
  ).join("");
  chipsEl.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => { activeCat = btn.dataset.cat; buildChips(); render(); });
  });
}

function buildSort() {
  sortEl.innerHTML = SORTS.map(([key, label]) =>
    `<button class="sortbtn" data-sort="${key}" aria-pressed="${key === sortMode}">${label}</button>`
  ).join("");
  sortEl.querySelectorAll(".sortbtn").forEach(btn => {
    btn.addEventListener("click", () => { sortMode = btn.dataset.sort; buildSort(); render(); });
  });
}

function buildSource() {
  sourceEl.innerHTML = SOURCES.map(([key, label]) =>
    `<button class="sortbtn" data-src="${key}" aria-pressed="${key === sourceMode}">${label}</button>`
  ).join("");
  sourceEl.querySelectorAll(".sortbtn").forEach(btn => {
    btn.addEventListener("click", () => { sourceMode = btn.dataset.src; buildSource(); render(); });
  });
}

function applySort(list) {
  if (sortMode === "pop") return [...list].sort((a, b) => b.stars - a.stars);
  if (sortMode === "new") return [...list].sort((a, b) => (a.added < b.added ? 1 : a.added > b.added ? -1 : 0));
  return list; // 추천순 = 큐레이터가 정한 배열 순서
}

// 카드별 '설치법 보기' — 설치 명령어가 있으면 복사 버튼, 없으면 저장소 안내
function installHTML(s) {
  if (s.install) {
    return `
      <details class="how">
        <summary>설치법 보기</summary>
        <div class="how__body">
          <pre class="cmd">${s.install}</pre>
          <div class="how__row">
            <button class="copy" type="button">복사</button>
            <span class="how__hint">클로드 코드 입력창에 붙여넣기</span>
          </div>
        </div>
      </details>`;
  }
  return `
    <details class="how">
      <summary>설치법 보기</summary>
      <div class="how__body">
        <p class="how__hint">스킬 묶음이라 설치가 조금 달라요 —
          <a href="${s.url}" target="_blank" rel="noopener">저장소 안내</a>를 따라 해주세요.</p>
      </div>
    </details>`;
}

function cardHTML(s, i) {
  const cat = CATS[s.cat];
  const badge = BADGES[s.badge];
  const stars = s.stars ? `<span class="stars">★ <b>${fmtStars(s.stars)}</b></span>` : `<span></span>`;
  return `
    <article class="card" style="--cat:${cat.color}; animation-delay:${i * 40}ms">
      <div class="card__top">
        <span class="cat"><span class="dot"></span>${cat.label}</span>
        <span class="badge ${badge.cls}">${badge.label}</span>
      </div>
      <h3 class="card__name">${s.name}</h3>
      <div class="card__id">${s.id}</div>
      <p class="card__desc">${s.desc}</p>
      <p class="take">${s.take}</p>
      <div class="card__foot">
        ${stars}
        <a class="src" href="${s.url}" target="_blank" rel="noopener">${s.src} →</a>
      </div>
      ${installHTML(s)}
    </article>`;
}

function render() {
  const q = query.trim().toLowerCase();
  const list = applySort(SKILLS.filter(s => {
    const catOk = activeCat === "all" || s.cat === activeCat;
    const srcOk = sourceMode === "all" || (sourceMode === "official" ? isOfficial(s) : !isOfficial(s));
    const text = (s.name + s.desc + s.take + s.id + CATS[s.cat].label).toLowerCase();
    return catOk && srcOk && (!q || text.includes(q));
  }));
  grid.innerHTML = list.map(cardHTML).join("");
  emptyEl.hidden = list.length > 0;
}

// 설치 명령어 복사 (이벤트 위임 — 재렌더에도 유지)
grid.addEventListener("click", e => {
  const btn = e.target.closest(".copy");
  if (!btn) return;
  const cmd = btn.closest(".how__body").querySelector(".cmd").textContent;
  navigator.clipboard?.writeText(cmd);
  btn.textContent = "복사됨!";
  setTimeout(() => { btn.textContent = "복사"; }, 1400);
});

searchEl.addEventListener("input", e => { query = e.target.value; render(); });

buildChips();
buildSort();
buildSource();
render();
// 별 라이브 갱신되면 다시 그림(인기순일 때 순서도 반영)
loadStars().then(ok => { if (ok) render(); });
