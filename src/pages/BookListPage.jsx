import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks } from "../api/books";

function BookListPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <p>불러오는 중...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="book-container">
      <h1>작가의 산책</h1>

      <div className="book-list">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <div className="book-image">
              no image
            </div>

            <div className="book-info">
              <h2>{book.title}</h2>

              <p>저자: {book.author}</p>

              <p>{book.summary}</p>

              <Link to={`/books/${book.id}`}>
                <button>상세 보기</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookListPage;