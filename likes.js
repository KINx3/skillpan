/* ============================================================
   스킬판 — 좋아요(공유 카운트)  ·  Supabase 연결
   ------------------------------------------------------------
   ❤️ 좋아요 = 모든 방문자가 함께 보는 전역 카운트.
   저장은 Supabase(무료) 한 곳에서. 아래 값 2개만 네 것으로 바꾸면 끝.

   ▼▼▼ 여기 2줄만 너의 Supabase 값으로 바꾸세요 ▼▼▼
   (Supabase → 프로젝트 → Settings → API 에서 복사)
     · Project URL          → SUPABASE_URL
     · Project API keys 의 "anon public" 키 → SUPABASE_ANON_KEY
   ⚠️ "service_role" 키는 절대 넣지 마세요(비밀키). 반드시 "anon public".
   값을 안 넣으면 좋아요는 '내 브라우저에만' 표시되고 숫자는 숨겨져요(페이지는 정상).
   ============================================================ */
const SUPABASE_URL = "https://yaowfwadnneaztjxqnzp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhb3dmd2Fkbm5lYXp0anhxbnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDk3NzEsImV4cCI6MjA5Nzc4NTc3MX0.-htzintyJ8WjJfnyp2NdB3LThw913ffFLyjO6n1VQNs";
/* ▲▲▲ 여기까지 ▲▲▲ */

const Likes = (() => {
  const on = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  const headers = () => ({
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  });

  // 한 브라우저당 1회 — 누른 스킬 id를 localStorage에 기억(약한 중복 방지)
  const LS = "skillpan_liked";
  let liked;
  try { liked = new Set(JSON.parse(localStorage.getItem(LS) || "[]")); }
  catch { liked = new Set(); }
  const save = () => { try { localStorage.setItem(LS, JSON.stringify([...liked])); } catch {} };

  const isLiked = id => liked.has(id);

  // 전체 좋아요 수 불러오기 → { skill_id: count }  (실패/미설정 시 null)
  async function fetchAll() {
    if (!on()) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/likes?select=skill_id,count`, { headers: headers() });
      if (!res.ok) return null;
      const rows = await res.json();
      const map = {};
      for (const r of rows) map[r.skill_id] = r.count;
      return map;
    } catch { return null; }
  }

  // 좋아요 토글 → { ok, liking, count }
  // localStorage는 낙관적으로 먼저 바꾸고, 서버 실패 시 되돌림.
  async function toggle(id) {
    const liking = !liked.has(id);
    if (liking) liked.add(id); else liked.delete(id);
    save();
    if (!on()) return { ok: true, liking, count: null };
    try {
      const fn = liking ? "like_skill" : "unlike_skill";
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
        method: "POST", headers: headers(), body: JSON.stringify({ sid: id }),
      });
      if (!res.ok) throw new Error("rpc failed");
      const count = await res.json(); // 함수가 갱신된 count(정수)를 반환
      return { ok: true, liking, count: typeof count === "number" ? count : null };
    } catch {
      if (liking) liked.delete(id); else liked.add(id); // 되돌리기
      save();
      return { ok: false, liking: !liking, count: null };
    }
  }

  return { enabled: on, isLiked, fetchAll, toggle };
})();
