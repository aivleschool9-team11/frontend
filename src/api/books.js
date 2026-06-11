const BASE_URL = "http://localhost:8080";
const BOOKS_API = `${BASE_URL}/books`;  


// ────────────────────────────────────────────
// 1. 도서 등록
// POST /books
// 도서 정보 + AI 임베딩 벡터를 함께 전송 → books + book_embeddings 테이블에 저장
// ────────────────────────────────────────────
export async function createBook(bookData) {
  try {
    const res = await fetch(BOOKS_API, {
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
    const res = await fetch(`${BOOKS_API}/${bookId}/cover`, {
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
// 3. 도서 상세 조회
// GET /books/{id}
// ────────────────────────────────────────────
export async function getBookById(bookId) {
  try {
    const res = await fetch(`${BOOKS_API}/${bookId}`);
    if (!res.ok) throw new Error("상세 조회 실패");
    return await res.json();
  } catch (err) {
    console.error("getBookById 에러:", err);
  }
}


// ────────────────────────────────────────────
// 4. 도서 삭제
// DELETE /books/{id}
// ────────────────────────────────────────────
export async function deleteBook(bookId) {
  try {
    const res = await fetch(`${BOOKS_API}/${bookId}`, {
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
// 5. 도서 수정
// PATCH /books/{id}
// 변경된 필드만 전송 (전체 덮어쓰기 아님)
// ────────────────────────────────────────────
export async function updateBook(bookId, updatedFields) {
  try {
    const res = await fetch(`${BOOKS_API}/${bookId}`, {
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
// 6. 좋아요
// PATCH /books/{id}/likes
// 좋아요 수 증가/감소 처리
// ────────────────────────────────────────────
export async function likeBook(bookId, likes){
  try {
    const res = await fetch(`${BOOKS_API}/${bookId}/likes`, {
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

// ────────────────────────────────────────────
// 7. 태그별 도서 목록 조회
// GET /books?tag={tagName}
// 특정 태그가 달린 도서 목록 반환
// ────────────────────────────────────────────
export async function getBooksByTag(tag){
  try{
    const res = await fetch(`${BOOKS_API}?tag=${encodeURIComponent(tag)}`);
    if(!res.ok) throw new Error("태그별 도서 조회 실패");
    return await res.json();  
  } catch(err){
    console.error("getBooksByTag 에러:", err);
    throw err;
  }
}