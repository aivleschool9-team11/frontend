import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBook, deleteBook, likeBook } from "../api/books";

const styles = {
  container: {
    maxWidth: "780px",
    margin: "40px auto",
    padding: "40px 48px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  layout: {
    display: "flex",
    gap: "32px",
    alignItems: "flex-start",
  },
  cover: {
    width: "180px",
    height: "250px",
    objectFit: "cover",
    borderRadius: "6px",
    flexShrink: 0,
  },
  noCover: {
    width: "180px",
    height: "250px",
    background: "#f5f5f5",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#bbb",
    fontSize: "13px",
    flexShrink: 0,
  },
  info: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  author: {
    fontSize: "14px",
    color: "#666",
  },
  summary: {
    fontSize: "14px",
    color: "#888",
    fontStyle: "italic",
  },
  content: {
    fontSize: "14px",
    lineHeight: "1.8",
    color: "#333",
  },
  date: {
    fontSize: "12px",
    color: "#e55",
  },
  btnRow: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },
  btn: {
    padding: "8px 20px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "#fff",
    fontSize: "13px",
    color: "#444",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "8px 20px",
    border: "1px solid #f09595",
    borderRadius: "6px",
    background: "#fff",
    fontSize: "13px",
    color: "#e55",
    cursor: "pointer",
  },
};

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

  // 로컬 스토리지에서 좋아요 여부 확인
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

  const handleLike = async () => {
    try {
      if (isLiked) {
        const newLikes = Math.max((book.likes || 1) -1, 0);
        const updated = await likeBook(id, newLikes);
        setBook(updated);
        localStorage.removeItem(`likes_${id}`);
        setIsLiked(false);
      } else {
        const newLikes = (book.likes || 0) + 1;
        const updated = await likeBook(id, newLikes);
        setBook(updated);
        localStorage.setItem(`likes_${id}`, "true");
        setIsLiked(true);
      }
    } catch (err) {
      console.error("좋아요 에러: ", err);
    }
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>불러오는 중...</p>
    );
  if (error)
    return <p style={{ textAlign: "center", color: "#e55" }}>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.layout}>
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title} style={styles.cover} />
        ) : (
          <div style={styles.noCover}>no image</div>
        )}

        <div style={styles.info}>
          <h1>{book.title}</h1>
          <p style={styles.author}>{book.author}</p>
          <p style={styles.summary}>{book.summary}</p>
          <p style={styles.content}>{book.content}</p>
          <p style={styles.date}>
            등록일 {new Date(book.createdAt).toLocaleDateString()}
          </p>
          <p style={styles.date}>
            수정일 {new Date(book.updatedAt).toLocaleDateString()}
          </p>
          <div style={styles.btnRow}>
            <button style={styles.btn} onClick={() => navigate("/")}>
              목록으로
            </button>
            <button
              style={styles.btn}
              onClick={() => navigate(`/books/${id}/edit`)}
            >
              수정
            </button>
            <button style={styles.deleteBtn} onClick={handleDelete}>
              삭제
            </button>

            <button
              onClick={handleLike}
              style={{
                padding: "8px 16px",
                border: "1px solid #ffb3b3",
                borderRadius: "6px",
                background: "#fff",
                fontSize: "16px",
                color: "#e55",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {isLiked ? "♥" : "♡"} 좋아요 {book.likes || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;