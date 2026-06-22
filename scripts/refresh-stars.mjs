// 스킬판 별(star) 자동 갱신 — GitHub Action이 매일 실행.
// app.js의 repo:"owner/name" 필드를 모두 긁어 GitHub API로 별 수를 조회하고 stars.json에 쓴다.
// 사이트(app.js)는 로드 시 stars.json을 읽어 내장 폴백값을 덮어쓴다.
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const app = await readFile(new URL("app.js", root), "utf8");

// repo 목록 추출 (중복 제거) — 이 패턴이 단일 출처
const repos = [...new Set([...app.matchAll(/repo:\s*"([^"]+)"/g)].map(m => m[1]))];

const headers = { Accept: "application/vnd.github+json", "User-Agent": "skillpan-star-refresh" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const out = {};
for (const repo of repos) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
    if (!res.ok) { console.error(`skip ${repo}: HTTP ${res.status}`); continue; }
    const j = await res.json();
    if (typeof j.stargazers_count === "number") out[repo] = j.stargazers_count;
  } catch (e) {
    console.error(`error ${repo}: ${e.message}`);
  }
}

// diff 최소화를 위해 키 정렬
const sorted = Object.fromEntries(Object.keys(out).sort().map(k => [k, out[k]]));
await writeFile(new URL("stars.json", root), JSON.stringify(sorted, null, 2) + "\n");
console.log(`stars.json updated: ${Object.keys(sorted).length}/${repos.length} repos`);
