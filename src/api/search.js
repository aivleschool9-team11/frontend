const SEARCH_API = "http://localhost:8080/search";

// ────────────────────────────────────────────
// 1. 키워드 검색 (제목/저자/태그/정렬)
// POST /search
// query, sort, tag 모두 선택값 — 없으면 전체 조회
// 검색 로그는 Spring이 자동 저장
// ────────────────────────────────────────────
export async function searchBooks({query ="", sort = "newest", tag = ""} = {}) {
    try{
        const res = await fetch(SEARCH_API, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({query, sort, tag}),
        });
        if(!res.ok) throw new Error("키워드 검색 실패");
        return await res.json();
    } catch (err) {
        console.error("searchBooks 에러:", err);
    }
}

// ────────────────────────────────────────────
// 2. AI 의미 검색 (시맨틱 서치)
// POST /search/semantic
// React에서 OpenAI로 만든 검색어 벡터(queryVector)를 Spring으로 전송
// Spring이 코사인 유사도 계산 후 유사 도서 반환
// 검색 로그는 Spring이 자동 저장
// ────────────────────────────────────────────
export async function searchBooksSemantic({queryVector, topK = 5}){
    try{
        const res = await fetch(`${SEARCH_API}/semantic`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({queryVector, topK}),
        });
        if(!res.ok) throw new Error("AI 의미 검색 실패");
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
export async function logSearchClick({searchLogId, bookId, rankPosition, similarityScore }) {
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