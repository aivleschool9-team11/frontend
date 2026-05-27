import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks } from "../api/books";
import "../styles/BookListPage.css";

function BookListPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const getLikedIds = () => {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith("likes_"))
      .map((key) => key.replace("likes_", ""));
  };

  const [likedIds, setLikedIds] = useState(getLikedIds);

  useEffect(() => {
    async function loadBooks() {
      try {
        const booksData = await getBooks();
        setBooks(booksData);
      } catch (err) {
        console.error(err);
        setError("도서 목록을 불러오지 못했어요");
      }
      setLoading(false);
    }
    loadBooks();
  }, []);

  useEffect(() => {
  const handleFocus = () => setLikedIds(getLikedIds());
  window.addEventListener("focus", handleFocus);
  return () => window.removeEventListener("focus", handleFocus);
}, []);

  // 검색 필터
  const filterdBooks = books.filter(
    (book) =>
      book.title.includes(searchKeyword) ||
      book.author.includes(searchKeyword)
  );

  // 좋아요 필터
  const likedFilteredBooks = sortOrder === "liked"
  ? filterdBooks.filter((book) => likedIds.includes(String(book.id)))
  : filterdBooks;

  // 정렬
  const sortedBooks = [...likedFilteredBooks].sort((a, b) => {
    if (sortOrder === "newest")
      return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOrder === "oldest")
      return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOrder === "title") return a.title.localeCompare(b.title);
    if (sortOrder === "author") return a.author.localeCompare(b.author);
    if (sortOrder === "likes") return (b.likes || 0) - (a.likes || 0);
    return 0;
  });

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>불러오는 중...</p>
    );
  }

  if (error) {
    return (
      <p style={{ textAlign: "center", color: "red" }}>{error}</p>
    );
  }

  return (
    <div className="book-list-page">
      <h1>도서 목록</h1>

      {/* 검색 + 정렬 UI */}
      <div className="search-sort-container">
        <input
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="제목 또는 저자 검색"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="title">제목순</option>
          <option value="author">작가명순</option>
          <option value="likes">좋아요순</option>
          <option value="liked">좋아요한 책</option>
        </select>
      </div>


      {/* 도서 목록 */}
      {sortedBooks.length === 0 ? (
        <p className="empty-text">
          {sortOrder === "liked"
            ? "좋아요한 도서가 없습니다."
            : searchKeyword
            ? "검색 결과가 없습니다."
            : "등록된 도서가 없습니다."}
        </p>
      ) : (
        <div className="bookshelf">
          {sortedBooks.map((book) => (
            <div
              key={book.id}
              className="book-item"
            >
              {/* 표지 이미지 */}
              <div
                style={{
                  width: "140px",
                  height: "180px",
                  backgroundColor: "#f1f1f1",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#888",
                  borderRadius: "8px",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  "no image"
                )}
              </div>

              {/* 도서 정보 */}
              <div>
                <h2>{book.title}</h2>

                <p>저자: {book.author}</p>
                
                <p>{book.summary}</p>

                <p style={{ fontSize: "13px", color: "#e55", margin: "6px 0" }}>
                  {likedIds.includes(String(book.id)) ? "♥" : "♡"} {book.likes || 0}
                </p>

                <Link to={`/books/${book.id}`}>
                  <button>
                    상세 보기
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookListPage;