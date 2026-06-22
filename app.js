/* ============================================================
   스킬판 — 데이터 + 렌더링
   링크·별(star)·설치법 gh 실측 검증(2026-06-22):
     anthropics/skills 153k · obra/superpowers 235k · claude-mem 83.5k
     · understand-anything 65.3k · claude-video 2.2k · prompt-master 9.66k · second-brain 778
     · karpathy-skills(multica-ai) 180k · notebooklm 7.1k · csv-summarizer 410 · rampstack 367 · anydesign 113
   설치법 3패턴: ①플러그인 마켓(/plugin marketplace add) ②수동 폴더(git clone ~/.claude/skills) ③도구형(npx)
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

const DOCS = "https://github.com/anthropics/skills"; // Anthropic 공식 스킬 저장소 (15.3만★, 검증됨)
// 공식 스킬 설치 명령어 (저장소 README 실측) — 문서팩 / 예제팩 2종
const I_DOC = "/plugin marketplace add anthropics/skills\n/plugin install document-skills@anthropic-agent-skills";
const I_EX  = "/plugin marketplace add anthropics/skills\n/plugin install example-skills@anthropic-agent-skills";

const SKILLS = [
  { id:"xlsx", name:"엑셀 척척", cat:"doc", badge:"official",
    desc:"엑셀(.xlsx)을 만들고 고쳐줘요. 수식·차트·표 정리까지 한 번에.",
    take:"함수 못 외워도 <b>“이 데이터로 월별 매출 차트 만들어줘”</b> 한마디면 끝.",
    src:"Anthropic 공식", url:DOCS, install:I_DOC },

  { id:"docx", name:"워드 문서 비서", cat:"doc", badge:"official",
    desc:"워드 문서를 작성·편집해요. 목차·표·서식·페이지 번호 자동.",
    take:"보고서 양식 잡기 귀찮을 때 <b>초안부터 자동</b>으로.",
    src:"Anthropic 공식", url:DOCS, install:I_DOC },

  { id:"pptx", name:"PPT 초안 자동", cat:"doc", badge:"official",
    desc:"발표용 슬라이드(.pptx)를 만들고 편집해요.",
    take:"<b>빈 슬라이드 공포증</b>에 특효. 뼈대 깔고 시작.",
    src:"Anthropic 공식", url:DOCS, install:I_DOC },

  { id:"pdf", name:"PDF 만능 칼", cat:"doc", badge:"official",
    desc:"PDF 읽기·합치기·자르기·양식 채우기·스캔본 글자 인식(OCR).",
    take:"흩어진 <b>PDF 합치고 표만 쏙</b> 뽑을 때.",
    src:"Anthropic 공식", url:DOCS, install:I_DOC },

  { id:"csv-summarizer", name:"CSV 데이터 요약", cat:"doc", badge:"new", stars:"410",
    desc:"CSV(엑셀류) 데이터를 한눈에 보이게 요약·정리해줘요.",
    take:"<b>숫자 잔뜩인 표</b> 받았을 때 핵심만 쏙.",
    src:"coffeefuelbump", url:"https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill",
    install:"git clone https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill.git ~/.claude/skills/csv-summarizer" },

  { id:"canvas-design", name:"디자인 대신 해줌", cat:"design", badge:"official",
    desc:"포스터·카드뉴스 같은 이미지/PDF 비주얼을 코드로 만들어요.",
    take:"디자인 감각 없어도 결과물이 <b>‘디자인된’ 느낌</b>이 나요.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"frontend-design", name:"웹페이지 고퀄로", cat:"design", badge:"pick",
    desc:"AI 티 안 나는 진짜 같은 웹 화면을 만들어줘요.",
    take:"바이브코딩 결과 <b>촌스러움 탈출 1순위</b>. (이 사이트도 이걸로 만듦)",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"theme-factory", name:"테마 입히기", cat:"design", badge:"official",
    desc:"만든 문서·사이트에 색·폰트 테마를 입혀 통일감을 줘요.",
    take:"결과물이 <b>들쭉날쭉할 때</b> 한 방에 정리.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"slack-gif-creator", name:"슬랙 움짤 공장", cat:"design", badge:"official",
    desc:"슬랙용 움직이는 GIF 짤을 만들어요.",
    take:"팀 슬랙에 <b>드립 칠 때</b> (은근 인기).",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"algorithmic-art", name:"코드로 그리는 예술", cat:"design", badge:"official",
    desc:"p5.js로 흐름장·파티클 같은 ‘제너러티브 아트’를 코드로 만들어요.",
    take:"그림 감각 없어도 <b>알고리즘이 알아서</b> 패턴을 그려줘요.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"anydesign", name:"디자인 가이드 척척", cat:"design", badge:"new", stars:"113",
    desc:"상황에 맞는 UI·그래픽 디자인을 제안하고 적용해줘요.",
    take:"<b>디자인 어떻게 할지</b> 감 안 올 때 길잡이.",
    src:"uxKero", url:"https://github.com/uxKero/anydesign",
    install:"git clone https://github.com/uxKero/anydesign.git\ncp -r anydesign ~/.claude/skills/" },

  { id:"superpowers", name:"클로드 일잘러 모드", cat:"flow", badge:"popular", stars:"235k",
    desc:"막 코딩하지 않고 계획→테스트→검토 순서로 일하게 만들어요.",
    take:"결과물 퀄이 확 올라가요. <b>입문자 필수템.</b>",
    src:"Jesse Vincent", url:"https://github.com/obra/superpowers",
    install:"/plugin install superpowers@claude-plugins-official" },

  { id:"skill-creator", name:"나만의 스킬 제작", cat:"flow", badge:"official",
    desc:"내가 자주 시키는 일을 ‘나만의 스킬’로 직접 만들어줘요(외울 것 없음).",
    take:"<b>가장 강력한 스킬은 직접 만든 것</b> — 안트로픽 공식.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"prompt-master", name:"프롬프트 대신 써줌", cat:"flow", badge:"pick", stars:"9.66k",
    desc:"어떤 AI 툴에든 ‘정확한 프롬프트’를 대신 작성해줘요.",
    take:"<b>뭐라고 시켜야 할지 막막할 때.</b> 시키는 말부터 잘 만들어줘요.",
    src:"nidhinjs", url:"https://github.com/nidhinjs/prompt-master",
    install:"git clone https://github.com/nidhinjs/prompt-master.git ~/.claude/skills/prompt-master" },

  { id:"claude-mem", name:"기억하는 클로드", cat:"flow", badge:"popular", stars:"83.5k",
    desc:"대화 내용을 자동 기억해, 새 세션에 필요한 것만 다시 꺼내줘요.",
    take:"<b>매번 처음부터 설명하기</b> 지칠 때.",
    src:"thedotmack", url:"https://github.com/thedotmack/claude-mem",
    install:"npx claude-mem install" },

  { id:"karpathy-guidelines", name:"실수 줄이는 규칙", cat:"flow", badge:"pick", stars:"180k",
    desc:"클로드의 흔한 실수를 줄이는 4가지 규칙(질문 먼저·단순하게·시키는 것만).",
    take:"설치 10초, <b>체감은 즉시.</b>",
    src:"Karpathy 가이드라인", url:"https://github.com/multica-ai/andrej-karpathy-skills",
    install:"/plugin marketplace add multica-ai/andrej-karpathy-skills\n/plugin install andrej-karpathy-skills@karpathy-skills" },

  { id:"understand", name:"코드·자료 이해", cat:"research", badge:"popular", stars:"65.3k",
    desc:"코드·문서·PDF를 한눈에 보는 ‘지식 지도’와 대시보드로 정리해요.",
    take:"<b>처음 보는 자료가 막막할 때</b> 길잡이.",
    src:"Egonex-AI", url:"https://github.com/Egonex-AI/Understand-Anything",
    install:"/plugin marketplace add Egonex-AI/Understand-Anything\n/plugin install understand-anything" },

  { id:"watch", name:"유튜브 영상 분석", cat:"research", badge:"pick", stars:"2.2k",
    desc:"유튜브 영상을 클로드가 직접 보고 요약·분석해줘요.",
    take:"긴 영상 안 보고 <b>핵심만</b>. (이 가이드도 영상 보고 만듦)",
    src:"Bradley Bonanno", url:"https://github.com/bradautomates/claude-video",
    install:"/plugin marketplace add bradautomates/claude-video\n/plugin install watch@claude-video" },

  { id:"second-brain-skills", name:"제2의 뇌 만들기", cat:"research", badge:"new", stars:"778",
    desc:"흩어진 메모·자료를 모아 ‘제2의 뇌’처럼 정리하는 스킬 묶음이에요.",
    take:"유명 AI 유튜버(Cole Medin)가 만든 <b>지식 정리 세트.</b>",
    src:"coleam00", url:"https://github.com/coleam00/second-brain-skills" },

  { id:"notebooklm", name:"노트북LM에 자료 정리", cat:"research", badge:"pick", stars:"7.1k",
    desc:"흩어진 자료를 모아 구글 노트북LM(NotebookLM)에 착착 넣어줘요.",
    take:"<b>공부·리서치 자료</b> 한 곳에 모을 때.",
    src:"PleasePrompto", url:"https://github.com/PleasePrompto/notebooklm-skill",
    install:"git clone https://github.com/PleasePrompto/notebooklm-skill ~/.claude/skills/notebooklm" },

  { id:"doc-coauthoring", name:"문서 같이 쓰기", cat:"write", badge:"official",
    desc:"기획서·제안서 같은 문서를 단계별로 같이 써주는 방식이에요.",
    take:"<b>뭐부터 쓸지 막막한 문서</b>에.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"internal-comms", name:"사내 글 작성", cat:"write", badge:"official",
    desc:"공지·보고·뉴스레터를 회사 톤에 맞춰 써줘요.",
    take:"<b>주간보고·공지 쓰기 싫을 때.</b>",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"rampstack-brand", name:"브랜드 만들기", cat:"write", badge:"new", stars:"367",
    desc:"이름·메시지·톤 같은 브랜드 기초를 같이 잡아줘요.",
    take:"<b>1인 창업·사이드프로젝트</b> 브랜딩 막막할 때.",
    src:"rampstackco", url:"https://github.com/rampstackco/claude-skills",
    install:"/plugin marketplace add rampstackco/claude-skills\n/plugin install rampstack-skills@rampstack" },

  { id:"mcp-builder", name:"외부앱 연결(MCP)", cat:"dev", badge:"official",
    desc:"노션·슬랙 같은 외부 서비스를 클로드에 연결하는 다리를 만들어요.",
    take:"<b>내가 쓰는 앱이랑 연결</b>하고 싶을 때.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"webapp-testing", name:"내 웹앱 점검", cat:"dev", badge:"official",
    desc:"만든 웹앱이 잘 도는지 자동으로 눌러보고 스크린샷을 찍어요.",
    take:"<b>내가 만든 거 안 깨졌나</b> 확인.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"web-artifacts-builder", name:"작은 웹앱 만들기", cat:"dev", badge:"official",
    desc:"리액트·디자인 컴포넌트로 진짜 작동하는 웹 화면·도구를 만들어요.",
    take:"<b>계산기·대시보드</b> 같은 내 전용 미니 앱을 뚝딱.",
    src:"Anthropic 공식", url:DOCS, install:I_EX },

  { id:"brand-guidelines", name:"브랜드 톤 적용", cat:"design", badge:"official",
    desc:"브랜드 색·폰트를 결과물에 자동으로 맞춰줘요.",
    take:"<b>브랜드 톤 맞춰야 할 때.</b>",
    src:"Anthropic 공식", url:DOCS, install:I_EX },
];

/* ---------- 렌더링 ---------- */
const grid = document.getElementById("grid");
const chipsEl = document.getElementById("chips");
const searchEl = document.getElementById("search");
const emptyEl = document.getElementById("empty");
document.getElementById("skill-count").textContent = SKILLS.length;

let activeCat = "all";
let query = "";

function buildChips() {
  const cats = [["all", { label: "전체" }], ...Object.entries(CATS)];
  chipsEl.innerHTML = cats.map(([key, c]) =>
    `<button class="chip" role="tab" data-cat="${key}" aria-selected="${key === activeCat}">${c.label}</button>`
  ).join("");
  chipsEl.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => { activeCat = btn.dataset.cat; buildChips(); render(); });
  });
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
  const stars = s.stars ? `<span class="stars">★ <b>${s.stars}</b></span>` : `<span></span>`;
  return `
    <article class="card" style="--cat:${cat.color}; animation-delay:${i * 45}ms">
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
  const list = SKILLS.filter(s => {
    const catOk = activeCat === "all" || s.cat === activeCat;
    const text = (s.name + s.desc + s.take + s.id + CATS[s.cat].label).toLowerCase();
    return catOk && (!q || text.includes(q));
  });
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
render();
