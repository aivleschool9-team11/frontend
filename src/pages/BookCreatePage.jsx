import { useState } from "react";
import { createBook } from "../api/book-api";

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
  errorMsg: {
    fontSize: "12px",
    color: "#e55",
    margin: 0,
  },
  btnRow: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
  },
};

function BookNewPage() {
  const [form, setForm] = useState({
    title: "",
    author: "",
    summary: "",
    content: "",
    coverImageUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [showAI, setShowAI] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "제목을 입력해주세요";
    if (form.title.length > 100)
      newErrors.title = "제목은 100자 이하로 입력해주세요";
    if (!form.author.trim()) newErrors.author = "저자를 입력해주세요";
    if (!form.summary.trim()) newErrors.summary = "한줄 요약을 입력해주세요";
    if (!form.content.trim()) newErrors.content = "본문 내용을 입력해주세요";
    if (form.content.length > 5000)
      newErrors.content = "본문은 5000자 이하로 입력해주세요";
    return newErrors;
  };

  const isFormValid =
    form.title.trim() &&
    form.author.trim() &&
    form.summary.trim() &&
    form.content.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const now = new Date().toISOString();
    await createBook({ ...form, createdAt: now, updatedAt: now });
    alert("등록이 완료되었습니다!");
  };

  return (
    <div style={styles.container}>
      <h1>새 도서 등록</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldWrap}>
          <label>제목 *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="제목을 입력하세요 (최대 100자)"
            maxLength={100}
            style={{
              ...styles.input,
              borderColor: errors.title ? "#e55" : "#ddd",
            }}
          />
          {errors.title && <p style={styles.errorMsg}>{errors.title}</p>}
        </div>

        <div style={styles.fieldWrap}>
          <label>저자 *</label>
          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="저자를 입력하세요"
            style={{
              ...styles.input,
              borderColor: errors.author ? "#e55" : "#ddd",
            }}
          />
          {errors.author && <p style={styles.errorMsg}>{errors.author}</p>}
        </div>

        <div style={styles.fieldWrap}>
          <label>한줄 요약 *</label>
          <input
            name="summary"
            value={form.summary}
            onChange={handleChange}
            placeholder="한줄 요약을 입력하세요"
            style={{
              ...styles.input,
              borderColor: errors.summary ? "#e55" : "#ddd",
            }}
          />
          {errors.summary && <p style={styles.errorMsg}>{errors.summary}</p>}
        </div>

        <div style={styles.fieldWrap}>
          <label>본문 내용 *</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="본문 내용을 입력하세요 (최대 5000자)"
            maxLength={5000}
            style={{
              ...styles.textarea,
              borderColor: errors.content ? "#e55" : "#ddd",
            }}
          />
          <p
            style={{
              fontSize: "12px",
              color: "#aaa",
              textAlign: "right",
              margin: 0,
            }}
          >
            {form.content.length} / 5000
          </p>
          {errors.content && <p style={styles.errorMsg}>{errors.content}</p>}
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #eee" }} />

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
                  height: "180px",
                  background: "#f5f5f5",
                  borderRadius: "6px",
                  border: "1px dashed #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#bbb",
                  fontSize: "13px",
                }}
              >
                {previewImage
                  ? "이미지 미리보기 영역"
                  : "표지 생성 후 미리보기"}
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage("dummy")}
                style={{ ...styles.input, cursor: "pointer", fontSize: "13px" }}
              >
                AI 표지 생성 (연동 예정)
              </button>
              {previewImage && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setPreviewImage("dummy")}
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
                      setForm({ ...form, coverImageUrl: "dummy_cover" });
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

        {form.coverImageUrl && (
          <p style={{ color: "#4caf50", fontSize: "13px" }}>표지 적용됨</p>
        )}

        <div style={styles.btnRow}>
          <button
            type="button"
            onClick={() => alert("취소")}
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

export default BookNewPage;
