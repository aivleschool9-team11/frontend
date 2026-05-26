const BASE_URL = "http://localhost:3000/books";

// 1. 도서 등록
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

// 2. 도서 표지 수정
export const updateBookCover = async (bookId, imageUrl) => {
  try {
    const res = await fetch(`${BASE_URL}/${bookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coverImageUrl: imageUrl,
        updatedAt: new Date().toISOString(),
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("updateBookCover 에러:", err);
  }
};

// 3. 도서 목록 조회
export async function getBooks() {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("도서 목록 조회 실패");
    return await res.json();
  } catch (err) {
    console.error("getBooks 에러:", err);
  }
}

// 4. 도서 상세 조회
export async function getBook(id) {
  try {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error("상세 조회 실패");
    return await res.json();
  } catch (err) {
    console.error("getBook 에러:", err);
  }
}

// 5. 도서 삭제
export async function deleteBook(id) {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("도서 삭제 실패");
    return true;
  } catch (err) {
    console.error("deleteBook 에러:", err);
    return false;
  }
}

// 6. 도서 수정
export async function updateBook(id, updatedFields) {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
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

// 7. 도서 좋아요
export async function likeBook(id, likes) {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ likes }),
    });
    return await res.json();
  } catch (err) {
    console.error("likeBook 에러:", err);
  }
}