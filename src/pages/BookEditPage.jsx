import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBook, updateBook } from "../api/books";
import { fetchAiCover } from "../api/openai";

const styles = {
  container: {
    maxWidth: "780px",
    margin: "40px auto",
    padding: "40px 48px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
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

  // AI 표지 관련 state
  const [showAI, setShowAI] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchBookData = async () => {
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
    fetchBookData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBook((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleCancel = () => {
    navigate(`/books/${id}`);
  };

  // AI 표지 생성
  const handleAIGenerate = async () => {
    if (!book.content.trim()) {
      alert("본문 내용을 먼저 입력해주세요!");
      return;
    }
    try {
      setAiLoading(true);
      const imageUrl = await fetchAiCover(
        book.title,
        book.author,
        book.content,
      );
      setPreviewImage(imageUrl);
    } catch (err) {
      alert("표지 생성에 실패했습니다.");
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div>로딩중</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  const isFormValid =
    book.title.trim() &&
    book.author.trim() &&
    book.summary.trim() &&
    book.content.trim();

  return (
    <div style={styles.container}>
      <h1>도서 수정</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldWrap}>
          <label>제목 *</label>
          <input
            name="title"
            value={book.title}
            onChange={handleChange}
            placeholder="제목을 입력하세요 (최대 100자)"
            maxLength={100}
            style={styles.input}
          />
        </div>

        <div style={styles.fieldWrap}>
          <label>저자 *</label>
          <input
            name="author"
            value={book.author}
            onChange={handleChange}
            placeholder="저자를 입력하세요"
            style={styles.input}
          />
        </div>

        <div style={styles.fieldWrap}>
          <label>한줄 요약 *</label>
          <input
            name="summary"
            value={book.summary}
            onChange={handleChange}
            placeholder="한줄 요약을 입력하세요"
            style={styles.input}
          />
        </div>

        <div style={styles.fieldWrap}>
          <label>본문 내용 *</label>
          <textarea
            name="content"
            value={book.content}
            onChange={handleChange}
            placeholder="본문 내용을 입력하세요 (최대 5000자)"
            maxLength={5000}
            style={styles.textarea}
          />
          <p
            style={{
              fontSize: "12px",
              color: "#aaa",
              textAlign: "right",
              margin: 0,
            }}
          >
            {book.content.length} / 5000
          </p>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #eee" }} />

        {/* 현재 표지 미리보기 */}
        {book.coverImageUrl && (
          <div style={styles.fieldWrap}>
            <label>현재 표지</label>
            <div
              style={{
                height: "300px",
                background: "#f5f5f5",
                borderRadius: "6px",
                border: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img
                src={book.coverImageUrl}
                alt="현재 표지"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        )}

        {/* AI 표지 생성 토글 */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => setShowAI(!showAI)}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "#fafafa",
              border: "none",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <span>AI 표지 생성</span>
            <span>{showAI ? "▲" : "▼"}</span>
          </button>

          {showAI && (
            <div
              style={{
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                borderTop: "1px solid #eee",
              }}
            >
              <div
                style={{
                  height: "300px",
                  background: "#f5f5f5",
                  borderRadius: "6px",
                  border: "1px dashed #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="AI 생성 표지"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span style={{ color: "#bbb", fontSize: "13px" }}>
                    표지 생성 후 미리보기
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiLoading}
                style={{
                  ...styles.input,
                  cursor: aiLoading ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  background: aiLoading ? "#f5f5f5" : "#fff",
                }}
              >
                {aiLoading ? "생성 중..." : "AI 표지 생성"}
              </button>
              {previewImage && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={aiLoading}
                    style={{
                      flex: 1,
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    재생성
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBook({ ...book, coverImageUrl: previewImage });
                      setShowAI(false);
                    }}
                    style={{
                      flex: 1,
                      padding: "8px",
                      border: "1px solid #bbb",
                      borderRadius: "6px",
                      background: "#f0f0f0",
                      cursor: "pointer",
                    }}
                  >
                    이 표지 사용
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {book.coverImageUrl && (
          <p style={{ color: "#1976d2", fontSize: "13px", fontWeight: "500" }}>
            표지 적용됨
          </p>
        )}

        <div style={styles.btnRow}>
          <button
            type="button"
            onClick={handleCancel}
            style={{ ...styles.input, cursor: "pointer" }}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            style={{
              padding: "9px 22px",
              border: "none",
              borderRadius: "6px",
              background: isFormValid ? "#333" : "#ccc",
              color: "#fff",
              cursor: isFormValid ? "pointer" : "not-allowed",
              fontSize: "14px",
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
