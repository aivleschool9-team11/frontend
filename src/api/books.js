const BASE_URL = "http://localhost:3000/books-db";

export async function createBook(bookData) {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookData),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("createBook 에러:", err);
  }
}

export async function getBooks(){
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("도서 목록 조회 실패");
    return await res.json();
  } catch (err) {
    console.error("getBooks 에러:", err);
  }
}

export async function getBook(id){
  try {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error("상세 조회 실패");
    return await res.json();
  } catch (err) {
    console.error("getBook 에러:", err);
  }

}
