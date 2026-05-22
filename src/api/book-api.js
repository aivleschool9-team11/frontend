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
