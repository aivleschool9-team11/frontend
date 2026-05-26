import {useState, useEffect} from "react";
import {getBooks} from "../api/books";
import { useNavigate } from "react-router-dom";

function BookListPage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

  useEffect(() => {
    async function loadBooks() {
      try {
        const booksData = await getBooks();
        setBooks(booksData);
      } catch (err) {
        console.error(err);
        setError('도서 목록을 불러오지 못했어요');
      }
      setLoading(false);
    }
    loadBooks();
  }, []);


  if (loading) return <p style={{ textAlign: "center", marginTop: "40px" }}>불러오는 중...</p>;
  if (error) return <p style={{ textAlign: "center", color: "#e55" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h2>도서 목록</h2>

      {books.length === 0 ? (
        <p>등록된 도서가 없습니다.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/books-db/${book.id}`)}
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "16px",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "4px" }}
                />
              ) : (
                <div style={{
                  width: "100%", height: "160px", background: "#f5f5f5",
                  borderRadius: "4px", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#bbb", fontSize: "13px"
                }}>
                  no image
                </div>
              )}
              <h3 style={{ margin: "12px 0 4px", fontSize: "15px" }}>{book.title}</h3>
              <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#666" }}>{book.author}</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>{book.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookListPage;