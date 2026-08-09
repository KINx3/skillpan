// 디자인 스킬 자동 선택 교통정리 — description 패치.
// ------------------------------------------------------------
// taste-skill / ui-ux-pro-max / impeccable 을 설치하면 곁가지 스킬이 18개쯤 함께 깔린다.
// 이들 description(= 클로드가 스킬을 고를 때 읽는 문장)이 전부 "디자인"이라 크게 겹쳐서,
// "웹페이지 예쁘게 해줘" 같은 요청에 어느 스킬이 걸릴지 매번 달라진다.
//
// 이 스크립트는 각 SKILL.md 의 description 끝에 경계선 한 문장을 덧붙여 역할을 갈라준다.
//
// 핵심은 "하나만 골라라"가 아니다. 실제 디자인 작업은 여러 스킬이 겹쳐 돌아가는 게 정상이라
// (브루탈리즘 랜딩 = 방향 + 미감 + 팔레트), 배타적인 축과 쌓이는 축을 구분해서 적는다.
//
//   ■ 작업 주인 (배타) — 한 작업에 하나만. 이게 갈리지 않아서 매번 결과가 달랐다.
//       · 새로 만들 때    → design-taste-frontend
//       · 만든 걸 다듬을 때 → impeccable
//
//   ■ 얹히는 층 (스택) — 주인 위에 함께 켜진다. "대신"이 아니라 "밑에".
//       · 참조 DB    → ui-ux-pro-max (팔레트·폰트 조합·스택별 디테일)
//       · 미감 프리셋 → minimalist-ui, industrial-brutalist-ui
//       · 규칙집     → high-end-visual-design
//       · 구현 층    → ui-styling (shadcn·Radix·Tailwind)
//       · 산출물 층  → design-system (토큰·컴포넌트 스펙)
//       · 모션 층    → gpt-taste (GSAP 스크롤)
//
//   ■ 딴 물건 (양보) — 프론트 작업으로 오해받지만 결과물이 다르다. 범위를 좁힌다.
//       · 이미지 생성 → imagegen-frontend-web/mobile, brandkit, banner-design, image-to-code
//       · 브랜드 자산 → design (로고·CI·아이콘)
//       · 특수 대상  → stitch-design-taste (Google Stitch), design-taste-frontend-v1 (구버전)
//       · 중복       → redesign-existing-projects (impeccable 과 사실상 같은 일)
//
// 디자인과 무관하거나 겹치지 않는 스킬은 일부러 건드리지 않는다:
//   full-output-enforcement(출력 길이), slides(발표자료), brand(브랜드 보이스·메시징)
//
// 스킬을 재설치·업데이트하면 SKILL.md 가 덮어써져 패치가 날아간다. 그래서 이 파일을
// 리포에 둔다 — 재설치 후 다시 실행하면 원상복구된다. 여러 번 실행해도 안전(멱등).
//
// 사용법:
//   node scripts/patch-skill-descriptions.mjs           # 패치 적용
//   node scripts/patch-skill-descriptions.mjs --check   # 적용 여부만 확인 (쓰기 없음)
//   node scripts/patch-skill-descriptions.mjs --revert  # 패치 제거

import { readFileSync, writeFileSync, existsSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

// 덧붙일 문장에 ": "(콜론+공백)를 쓰지 않는다 — YAML 평문 스칼라에서 매핑으로 오해된다.
// 어차피 아래에서 큰따옴표로 감싸 쓰지만, 원문이 어떤 형태든 안전하도록 이중으로 방어.
// 모든 항목이 같은 마커를 쓰므로 --revert 가 한 갈래 코드로 전부 되돌린다.
const MARKER = "Routing —";

// ■ 작업 주인 — 한 작업에 하나만. 배타적인 축은 여기뿐이다.
const OWNERS = {
  "design-taste-frontend":
    `${MARKER} owns CREATING a new surface from scratch (new landing page, portfolio, marketing site, ` +
    `a screen that does not exist yet). For refining an interface that already exists prefer impeccable ` +
    `instead. Stacking is expected, not an exception — pull in ui-ux-pro-max for concrete palettes and ` +
    `font pairings, and a style preset when the brief names one.`,

  "impeccable":
    `${MARKER} owns REFINING an interface that already exists — critique, audit, polish, animate, ` +
    `clarify, harden, adapt. For building a new surface from scratch prefer design-taste-frontend ` +
    `instead. Stacking is expected, not an exception — pull in ui-ux-pro-max when the fix needs ` +
    `concrete colors or font pairings.`,
};

// ■ 얹히는 층 — 주인 위에 함께 켜진다. "대신"이 아니라 "밑에".
const LAYERS = {
  "ui-ux-pro-max":
    `${MARKER} a reference database, not a workflow — it STACKS with the workflow skills rather than ` +
    `replacing them. Load it whenever a task needs concrete colors, palettes, font pairings, chart ` +
    `types, or stack-specific detail, including while design-taste-frontend is building a new surface ` +
    `or impeccable is refining an existing one. On its own it answers "which colors and fonts", not ` +
    `"build me a page".`,

  "high-end-visual-design":
    `${MARKER} a supporting style rulebook that STACKS, not a primary router. Prefer ` +
    `design-taste-frontend when building a new surface and impeccable when refining an existing one, ` +
    `and apply this skill's rules underneath those rather than instead of them.`,

  "gpt-taste":
    `${MARKER} the GSAP scroll-motion layer, and it STACKS. When a page genuinely needs pinning, ` +
    `scrubbing, or stacked scroll sequences, run it alongside design-taste-frontend or impeccable ` +
    `rather than instead of them. Skip it when no scroll choreography is wanted.`,

  "ui-styling":
    `${MARKER} the implementation layer for shadcn/ui, Radix, and Tailwind, and it STACKS. On such a ` +
    `stack, run it under design-taste-frontend or impeccable — they own the visual direction, this ` +
    `owns how it is expressed in components. Skip it on projects that use none of those.`,

  "design-system":
    `${MARKER} owns token architecture and component specs, and it STACKS. Run it alongside ` +
    `design-taste-frontend or impeccable when the work should leave behind reusable tokens or specs. ` +
    `On its own it does not design a surface — for that, defer to those two.`,

  // 미감 프리셋 — 브리프가 그 미감을 부를 때 주인 위에 얹는다.
  "minimalist-ui":
    `${MARKER} a style preset that STACKS. When the brief calls for a minimalist, editorial, or quiet ` +
    `monochrome look, run it alongside design-taste-frontend (building new) or impeccable (refining) ` +
    `as the aesthetic layer, not instead of them. Skip it when the brief calls for a different look.`,

  "industrial-brutalist-ui":
    `${MARKER} a style preset that STACKS. When the brief calls for a brutalist, industrial, terminal, ` +
    `or blueprint look, run it alongside design-taste-frontend (building new) or impeccable (refining) ` +
    `as the aesthetic layer, not instead of them. Skip it when the brief calls for a different look.`,
};

// ■ 딴 물건 — 프론트 작업으로 오해받지만 결과물이 다르다. 범위를 좁혀 양보시킨다.
const NARROWED = {
  "redesign-existing-projects":
    `${MARKER} overlaps heavily with impeccable. Prefer impeccable for auditing or refining an ` +
    `interface that already exists. Use this skill only when the user explicitly asks for a full ` +
    `visual upgrade of a legacy project.`,

  "design-taste-frontend-v1":
    `${MARKER} superseded. Prefer design-taste-frontend (v2) unless the user explicitly asks for v1 behavior.`,

  "design":
    `${MARKER} use only for brand identity deliverables — logos, corporate identity, icons, social ` +
    `images, banners. For frontend interface work prefer design-taste-frontend when building new and ` +
    `impeccable when refining, with ui-ux-pro-max layered in for colors and fonts.`,

  "stitch-design-taste":
    `${MARKER} use only for Google Stitch, or when the user explicitly asks to generate a DESIGN.md. ` +
    `For ordinary frontend work prefer design-taste-frontend or impeccable.`,

  // 코드가 아니라 이미지를 만드는 것들 — 디자인 요청으로 오해되기 쉽다.
  "imagegen-frontend-web":
    `${MARKER} generates reference IMAGES, not code. Use only when the user explicitly wants design ` +
    `mockups or reference boards. If they want a working page prefer design-taste-frontend.`,

  "imagegen-frontend-mobile":
    `${MARKER} generates reference IMAGES, not code. Use only when the user explicitly wants mobile ` +
    `screen mockups. If they want a working interface prefer design-taste-frontend.`,

  "image-to-code":
    `${MARKER} an image-first workflow that generates mockups before coding. Use only when the user ` +
    `explicitly asks for that workflow. Otherwise prefer design-taste-frontend for building new surfaces.`,

  "brandkit":
    `${MARKER} generates brand-guideline IMAGES. Use only when the user explicitly asks for a brand ` +
    `board, logo system, or identity deck. Not for frontend interface work.`,

  "banner-design":
    `${MARKER} use only for banners and ad creatives. For frontend interface work prefer ` +
    `design-taste-frontend, ui-ux-pro-max, or impeccable.`,
};

const PATCHES = { ...OWNERS, ...LAYERS, ...NARROWED };

const skillsRoot = process.env.CLAUDE_SKILLS_DIR || join(homedir(), ".claude", "skills");
const mode = process.argv.includes("--revert") ? "revert"
  : process.argv.includes("--check") ? "check"
  : "patch";

// frontmatter 의 단일 행 description 을 읽고 쓴다. 따옴표가 있든 없든 받아준다.
function readDescription(lines) {
  const i = lines.findIndex(l => /^description:\s/.test(l));
  if (i === -1) return null;
  const raw = lines[i].replace(/^description:\s*/, "").trim();
  if (raw.startsWith('"')) {
    try { return { index: i, value: JSON.parse(raw) }; } catch { return null; }
  }
  return { index: i, value: raw };
}

// 항상 큰따옴표 스칼라로 다시 쓴다 — 본문에 콜론·따옴표가 섞여도 깨지지 않는다.
const writeDescription = value => `description: ${JSON.stringify(value)}`;

const changed = [], skipped = [], absent = [], failed = [];

for (const [skill, patch] of Object.entries(PATCHES)) {
  const link = join(skillsRoot, skill);
  if (!existsSync(link)) { absent.push(skill); continue; }

  // 심볼릭 링크로 깔리는 스킬이 있다(.claude/skills → .agents/skills). 실체를 고쳐야 한다.
  const file = join(realpathSync(link), "SKILL.md");
  if (!existsSync(file)) { absent.push(skill); continue; }

  const lines = readFileSync(file, "utf8").split("\n");
  const desc = readDescription(lines);
  if (!desc) { failed.push(skill); continue; }

  const has = desc.value.includes(MARKER);
  let next;

  if (mode === "revert") {
    if (!has) { skipped.push(skill); continue; }
    next = desc.value.slice(0, desc.value.indexOf(MARKER)).trimEnd();
  } else {
    if (has) { skipped.push(skill); continue; }
    if (mode === "check") { changed.push(skill); continue; }
    next = `${desc.value.trimEnd()} ${patch}`;
  }

  lines[desc.index] = writeDescription(next);
  writeFileSync(file, lines.join("\n"));
  changed.push(skill);
}

const verb = mode === "revert" ? "패치 제거" : mode === "check" ? "미적용" : "패치 적용";
for (const s of changed) console.log(`${mode === "revert" ? "-" : "+"} ${s}: ${verb}`);
for (const s of skipped) console.log(`= ${s}: ${mode === "revert" ? "패치 없음" : "이미 적용됨"}`);
if (absent.length) console.log(`\n설치되어 있지 않아 건너뜀 (${absent.length}개): ${absent.join(", ")}`);
for (const s of failed) console.error(`! ${s}: description 을 읽지 못함 — 수동 확인 필요`);

console.log(`\n${mode} 완료 — 변경 ${changed.length} · 그대로 ${skipped.length} · 없음 ${absent.length}${failed.length ? ` · 실패 ${failed.length}` : ""}`);
if (mode !== "check" && changed.length > 0) console.log("클로드 코드를 재시작하거나 /reload-skills 로 반영하세요.");
