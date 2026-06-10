// Spring Boot 백엔드 기본 포트
const BASE_URL = "http://localhost:8080/books"; // 도서 관련 API
const BASE_API = "http://localhost:8080";      // 검색 로그 등 그 외 API


// ────────────────────────────────────────────
// 1. 도서 등록
// POST /books
// 도서 정보 + AI 임베딩 벡터를 함께 전송 → books + book_embeddings 테이블에 저장
// ────────────────────────────────────────────
export async function createBook(bookData) {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookData),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("서버 에러 응답:", text);
      throw new Error(text);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("createBook 에러:", err);
  }
}


// ────────────────────────────────────────────
// 2. AI 표지 이미지 저장
// PATCH /books/{id}/cover
// AI가 생성한 표지 이미지 URL을 해당 도서에 저장
// ────────────────────────────────────────────
export const updateBookCover = async (bookId, imageUrl) => {
  try {
    const res = await fetch(`${BASE_URL}/${bookId}/cover`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coverImageUrl: imageUrl,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("updateBookCover 에러:", err);
  }
};


// ────────────────────────────────────────────
// 3. 도서 목록 조회 (키워드 검색 + 정렬)
// GET /books?keyword=&sort=
// keyword 없으면 전체 조회, sort 기본값은 최신순
// Enter 눌렀을 때만 호출됨 (타이핑 중엔 호출 안 함)
// ────────────────────────────────────────────
export async function getBooks({keyword = "", sort = "newest", tag = ""} = {}) {
  try {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (sort) params.append("sort", sort);
    if (tag) params.append("tag", tag);

    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!res.ok) throw new Error("도서 목록 조회 실패");
    return await res.json();
  } catch (err) {
    console.error("getBooks 에러:", err);
  }
}


// ────────────────────────────────────────────
// 3-1. AI 의미 검색 (시맨틱 서치)
// POST /books/semantic-search
// React에서 OpenAI로 만든 검색어 벡터(queryVector)를 Spring으로 전송
// Spring이 book_embeddings와 코사인 유사도 계산 후 유사 도서 반환
// ────────────────────────────────────────────
export async function searchBooksBySemantic({queryVector, topK = 5}){
  try{
    const res = await fetch(`${BASE_URL}/semantic-search`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({queryVector, topK}),
    });
    if(!res.ok) throw new Error("AI 검색 실패");
    return await res.json();
  } catch (err) {
    console.error("searchBooksBySemantic 에러:", err);
  }
} 

// ────────────────────────────────────────────
// 3-2. 검색 로그 저장
// POST /search-logs
// 키워드 검색(KEYWORD) / AI 검색(SEMANTIC) 모두 저장
// Outcome 측정용: 인기 검색어, 응답속도 분석에 활용
// ────────────────────────────────────────────
export async function createSearchLog({query, searchType, matchedBookCount, durationMs}){
  try{
    const res = await fetch(`${BASE_API}/search-logs`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({query, searchType, matchedBookCount, durationMs}),
  });
  if(!res.ok) throw new Error("검색 로그 기록 실패");
  return await res.json();
  } catch (err) {
    console.error("createSearchLog 에러:", err);
  }
}

// ────────────────────────────────────────────
// 3-3. 검색 결과 클릭 로그 저장
// POST /search-result-clicks
// AI 검색 시 노출된 결과를 전부 INSERT (clicked_at은 null)
// 사용자가 카드 클릭 시 clicked_at UPDATE → CTR 분석 가능
// Outcome 측정용: 검색 품질 (rank_position 낮을수록 좋음)
// ────────────────────────────────────────────
export async function logSearchClick({searchLogId, bookId, rankPosition, similarityScore}){
  try{
    const res = await fetch(`${BASE_API}/search-result-clicks`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({searchLogId, bookId, rankPosition, similarityScore}),
    });
    if(!res.ok) throw new Error("검색 결과 클릭 기록 실패");
    return await res.json();
  } catch (err) {
    console.error("logSearchClick 에러:", err);
  }
}

// ────────────────────────────────────────────
// 4. 도서 상세 조회
// GET /books/{id}
// ────────────────────────────────────────────
export async function getBookById(bookId) {
  try {
    const res = await fetch(`${BASE_URL}/${bookId}`);
    if (!res.ok) throw new Error("상세 조회 실패");
    return await res.json();
  } catch (err) {
    console.error("getBookById 에러:", err);
  }
}


// ────────────────────────────────────────────
// 5. 도서 삭제
// DELETE /books/{id}
// ────────────────────────────────────────────
export async function deleteBook(bookId) {
  try {
    const res = await fetch(`${BASE_URL}/${bookId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("도서 삭제 실패");
    return true;
  } catch (err) {
    console.error("deleteBook 에러:", err);
    return false;
  }
}

// ────────────────────────────────────────────
// 6. 도서 수정
// PATCH /books/{id}
// 변경된 필드만 전송 (전체 덮어쓰기 아님)
// ────────────────────────────────────────────
export async function updateBook(bookId, updatedFields) {
  try {
    const res = await fetch(`${BASE_URL}/${bookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error("도서 수정 실패");
    return await res.json();
  } catch (err) {
    console.error("updateBook 에러:", err);
    throw err;
  }
}

// ────────────────────────────────────────────
// 7. 좋아요
// PATCH /books/{id}/likes
// 좋아요 수 증가/감소 처리
// ────────────────────────────────────────────
export async function likeBook(bookId, likes){
  try {
    const res = await fetch(`${BASE_URL}/${bookId}/likes`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json" },
      body: JSON.stringify({likes}),
    });
    if (!res.ok) throw new Error("좋아요 실패");
    return await res.json();
  } catch (err) {
    console.error("likeBook 에러:", err);
  }
}
