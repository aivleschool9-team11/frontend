import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBook, updateBook } from "../api/books";

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
  subTitle: {
    fontSize: "14px",
    color: "#aaa",
    marginBottom: "28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  input: {
    padding: "9px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
  },
  textarea: {
    padding: "9px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    height: "150px",
    resize: "vertical",
  },
  btnRow: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
    marginTop: "8px",
  },
};

function BookEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState({
    title: "",
    author: "",
    summary: "",
    content: "",
    coverImageUrl: "",
  });

  const [originalBook, setOriginalBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBook(id);
        setBook({
          title: data.title || "",
          author: data.author || "",
          summary: data.summary || "",
          content: data.content || "",
          coverImageUrl: data.coverImageUrl || "",
        });
        setOriginalBook(data);
      } catch (err) {
        console.error(err);
        setError("도서 정보 불러오기 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!book.title.trim()) {
      alert("제목을 입력해주세요");
      return false;
    }
    if (!book.author.trim()) {
      alert("저자를 입력해주세요");
      return false;
    }
    if (!book.summary.trim()) {
      alert("한줄 요약을 입력해주세요");
      return false;
    }
    if (!book.content.trim()) {
      alert("내용을 입력해주세요");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!originalBook) return;

    const updatedFields = {};
    Object.keys(book).forEach((key) => {
      if (book[key] !== originalBook[key]) {
        updatedFields[key] = book[key];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    updatedFields.updatedAt = new Date().toISOString();

    try {
      const updatedBook = await updateBook(id, updatedFields);
      console.log("수정 완료:", updatedBook);
      alert("도서 수정 완료");
      navigate(`/books/${id}`);
    } catch (err) {
      console.error(err);
      alert("도서 수정에 실패했습니다.");
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
      <h1>도서 수정</h1>
      <p style={styles.subTitle}>내용을 수정하고 저장해주세요</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldWrap}>
          <label>
            제목 <span style={{ color: "#e55" }}>*</span>
          </label>
          <input
            type='text'
            name='title'
            value={book.title}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.fieldWrap}>
          <label>
            저자 <span style={{ color: "#e55" }}>*</span>
          </label>
          <input
            type='text'
            name='author'
            value={book.author}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.fieldWrap}>
          <label>
            한줄 요약 <span style={{ color: "#e55" }}>*</span>
          </label>
          <textarea
            name='summary'
            value={book.summary}
            onChange={handleChange}
            style={{ ...styles.textarea, height: "80px" }}
          />
        </div>

        <div style={styles.fieldWrap}>
          <label>
            본문 내용 <span style={{ color: "#e55" }}>*</span>
          </label>
          <textarea
            name='content'
            value={book.content}
            onChange={handleChange}
            style={styles.textarea}
          />
        </div>

        <div style={styles.fieldWrap}>
          <label>표지 이미지 URL</label>
          <input
            type='text'
            name='coverImageUrl'
            value={book.coverImageUrl}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        {book.coverImageUrl && (
          <div style={styles.fieldWrap}>
            <label>현재 표지</label>
            <img
              src={book.coverImageUrl}
              alt='표지 미리보기'
              style={{ width: "120px", borderRadius: "6px" }}
            />
          </div>
        )}

        <div style={styles.btnRow}>
          <button
            type='button'
            onClick={() => navigate(`/books/${id}`)}
            style={{
              padding: "10px 28px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#fff",
              fontSize: "14px",
              color: "#555",
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            type='submit'
            style={{
              padding: "10px 28px",
              border: "none",
              borderRadius: "6px",
              background: "#7c3aed",
              color: "#fff",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookEditPage;
