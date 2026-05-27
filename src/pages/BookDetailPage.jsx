import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBook, deleteBook } from "../api/books";
import "../styles/BookDetailPage.css";

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

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

    const liked = localStorage.getItem(`likes_${id}`);
    if (liked) setIsLiked(true);
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("정말 이 도서를 삭제하시겠습니까?")) {
      const success = await deleteBook(id);
      if (success) {
        alert("도서가 삭제되었습니다.");
        navigate("/");
      } else {
        alert("도서 삭제에 실패했습니다.");
      }
    }
  };

  const handleLike = () => {
    if (isLiked) {
      localStorage.removeItem(`likes_${id}`);
      setIsLiked(false);
    } else {
      localStorage.setItem(`likes_${id}`, "true");
      setIsLiked(true);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = book.coverImageUrl;
    link.download = `${book.title}_표지.png`;
    link.click();
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>불러오는 중...</p>
    );
  if (error)
    return <p style={{ textAlign: "center", color: "#e55" }}>{error}</p>;

  return (
    <div className='detail-container'>
      <div className='detail-layout'>
        <div className='detail-cover-wrap'>
          {book.coverImageUrl ? (
            <>
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className='detail-cover'
              />
              <button className='detail-download-btn' onClick={handleDownload}>
                표지 다운로드
              </button>
            </>
          ) : (
            <div className='detail-no-cover'>no image</div>
          )}
        </div>

        <div className='detail-info'>
          <h1>{book.title}</h1>
          <p className='detail-author'>{book.author}</p>
          {book.summary && <p className='detail-summary'>{book.summary}</p>}
          {book.copy && <p className='detail-copy'>{book.copy}</p>}
          <p className='detail-content'>{book.content}</p>
          <p className='detail-date'>
            등록일 {new Date(book.createdAt).toLocaleDateString()}
          </p>
          <p className='detail-date'>
            수정일 {new Date(book.updatedAt).toLocaleDateString()}
          </p>
          <div className='detail-btn-row'>
            <button className='detail-btn' onClick={() => navigate("/")}>
              목록으로
            </button>
            <button
              className='detail-btn'
              onClick={() => navigate(`/books/${id}/edit`)}
            >
              수정
            </button>
            <button className='detail-delete-btn' onClick={handleDelete}>
              삭제
            </button>
            <button
              className='detail-like-btn'
              onClick={handleLike}
              style={{ color: isLiked ? "#e55" : "#aaa" }}
            >
              {isLiked ? "♥" : "♡"} 좋아요
            </button>
          </div>

          {book.tags && book.tags.length > 0 && (
            <div className='detail-tag-wrap'>
              {book.tags.map((tag, i) => (
                <span key={i} className='detail-tag'>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;
