// 백엔드는 context-path /api 사용. API 주소는 환경별 .env 파일에서 주입:
//   .env.development -> http://localhost:8080/api (로컬)
//   .env.production  -> /api (배포, 동일 오리진 -> CORS 불필요)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const SEARCH_API = `${BASE_URL}/search`;

// ────────────────────────────────────────────
// 1. 키워드 검색 (제목/저자/태그/정렬)
// POST /search
// query, sort, tag 모두 선택값 — 없으면 전체 조회
// 검색 로그는 Spring이 자동 저장
// ────────────────────────────────────────────
export async function searchBooks({ query = "", sort = "newest", tag = "" } = {}) {
  try {
    const res = await fetch(SEARCH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, sort, tag }),
    });
    if (!res.ok) throw new Error("키워드 검색 실패");
    return await res.json();
  } catch (err) {
    console.error("searchBooks 에러:", err);
  }
}

// ────────────────────────────────────────────
// 2. AI 의미 검색 (시맨틱 서치)
// POST /search/semantic
// 원본 검색어(query) + OpenAI로 만든 검색어 벡터(queryVector)를 Spring으로 전송
//   ※ query를 함께 보내야 백엔드가 SEMANTIC 검색 로그를 저장 → searchLogId 발급 → 클릭(CTR) 로그까지 연결됨
// Spring이 코사인 유사도 계산 후 유사 도서 반환
// 검색 로그는 Spring이 자동 저장
// ────────────────────────────────────────────
export async function searchBooksSemantic({ query = "", queryVector, topK = 5 }) {
  try {
    const res = await fetch(`${SEARCH_API}/semantic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, queryVector, topK }),
    });
    if (!res.ok) throw new Error("AI 의미 검색 실패");
    return await res.json();
  } catch (err) {
    console.error("searchBooksSemantic 에러:", err);
  }
}

// ────────────────────────────────────────────
// 3. 검색 결과 클릭 로그 저장
// POST /search/{searchLogId}/click
// AI 검색 결과에서 카드 클릭 시에만 호출
// Outcome 측정용: 검색 품질 (rankPosition 낮을수록 좋음)
// ────────────────────────────────────────────
export async function logSearchClick({ searchLogId, bookId, rankPosition, similarityScore }) {
  try {
    const res = await fetch(`${SEARCH_API}/${searchLogId}/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, rankPosition, similarityScore }),
    });
    if (!res.ok) throw new Error("클릭 로그 저장 실패");
    return await res.json();
  } catch (err) {
    console.error("logSearchClick 에러:", err);
  }
}