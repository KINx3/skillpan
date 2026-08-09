// 디자인 스킬 3종 자동 선택 교통정리 — description 패치.
// ------------------------------------------------------------
// taste-skill · ui-ux-pro-max · impeccable 은 셋 다 "프론트엔드 디자인"을 담당해서
// description(= 클로드가 스킬을 고를 때 읽는 문장)이 크게 겹친다. 그래서 "웹페이지 예쁘게
// 해줘" 같은 요청에 어느 스킬이 걸릴지 매번 달라진다.
//
// 이 스크립트는 각 SKILL.md 의 description 끝에 경계선 한 문장을 덧붙여 역할을 갈라준다.
//   · 새로 만들 때        → design-taste-frontend (taste-skill)
//   · 색·폰트·스타일 고를 때 → ui-ux-pro-max
//   · 만든 걸 다듬을 때     → impeccable
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
const MARKER = "Routing —";

const PATCHES = {
  "design-taste-frontend":
    `${MARKER} prefer this skill when CREATING a new surface from scratch (new landing page, ` +
    `portfolio, marketing site, a screen that does not exist yet). For picking colors, palettes, ` +
    `or font pairings prefer ui-ux-pro-max. For refining an interface that already exists prefer impeccable.`,

  "ui-ux-pro-max":
    `${MARKER} prefer this skill when CHOOSING the visual vocabulary — colors, palettes, font ` +
    `pairings, style direction, chart types, or stack-specific implementation details. For building ` +
    `a new surface from scratch prefer design-taste-frontend. For refining an interface that already ` +
    `exists prefer impeccable.`,

  "impeccable":
    `${MARKER} prefer this skill when REFINING an interface that already exists — critique, audit, ` +
    `polish, animate, clarify, harden, adapt. For building a new surface from scratch prefer ` +
    `design-taste-frontend. For picking colors or font pairings prefer ui-ux-pro-max.`,
};

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

let changed = 0, skipped = 0, missing = 0;

for (const [skill, patch] of Object.entries(PATCHES)) {
  const link = join(skillsRoot, skill);
  if (!existsSync(link)) {
    console.log(`- ${skill}: 설치되어 있지 않음 (건너뜀)`);
    missing++;
    continue;
  }

  // 심볼릭 링크로 깔리는 스킬이 있다(.agents/skills → .claude/skills). 실체를 고쳐야 한다.
  const file = join(realpathSync(link), "SKILL.md");
  if (!existsSync(file)) {
    console.log(`- ${skill}: SKILL.md 없음 (건너뜀)`);
    missing++;
    continue;
  }

  const lines = readFileSync(file, "utf8").split("\n");
  const desc = readDescription(lines);
  if (!desc) {
    console.error(`! ${skill}: description 을 읽지 못함 — 수동 확인 필요`);
    missing++;
    continue;
  }

  const has = desc.value.includes(MARKER);
  let next;

  if (mode === "revert") {
    if (!has) { console.log(`= ${skill}: 패치 없음`); skipped++; continue; }
    next = desc.value.slice(0, desc.value.indexOf(MARKER)).trimEnd();
  } else {
    if (has) { console.log(`= ${skill}: 이미 적용됨`); skipped++; continue; }
    if (mode === "check") { console.log(`~ ${skill}: 미적용`); changed++; continue; }
    next = `${desc.value.trimEnd()} ${patch}`;
  }

  lines[desc.index] = writeDescription(next);
  writeFileSync(file, lines.join("\n"));
  console.log(`${mode === "revert" ? "-" : "+"} ${skill}: ${mode === "revert" ? "패치 제거" : "패치 적용"}`);
  changed++;
}

console.log(`\n${mode} 완료 — 변경 ${changed} · 그대로 ${skipped} · 없음 ${missing}`);
if (mode !== "check" && changed > 0) console.log("클로드 코드를 재시작하거나 /reload-skills 로 반영하세요.");
