import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBook } from "../api/books";

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBook() {
      try {
        const data = await getBook(id);
        if (!data) throw new Error("없음");
        setBook(data);
      } catch (err) {
        setError("도서를 찾을 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "40px" }}>불러오는 중...</p>;
  if (error) return <p style={{ textAlign: "center", color: "#e55" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      {book.coverImageUrl ? (
        <img
          src={book.coverImageUrl}
          alt={book.title}
          style={{ width: "200px", height: "280px", objectFit: "cover", borderRadius: "6px" }}
        />
      ) : (
        <div style={{
          width: "200px", height: "280px", background: "#f5f5f5",
          borderRadius: "6px", display: "flex", alignItems: "center",
          justifyContent: "center", color: "#bbb"
        }}>
          no image
        </div>
      )}

      <h2>{book.title}</h2>
      <p style={{ color: "#666" }}>저자: {book.author}</p>
      <p style={{ lineHeight: "1.7" }}>{book.content}</p>
      <p style={{ fontSize: "12px", color: "#aaa" }}>
        등록일: {new Date(book.createdAt).toLocaleDateString()} ·
        수정일: {new Date(book.updatedAt).toLocaleDateString()}
      </p>

      <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
        <button onClick={() => navigate("/")}>목록으로</button>
        <button onClick={() => navigate(`/books-db/${id}/edit`)}>수정</button>
        <button style={{ color: "#e55" }}>삭제</button>
      </div>
    </div>
  );
}

export default BookDetailPage;