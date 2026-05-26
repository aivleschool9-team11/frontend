import { useState } from "react";
import { createBook, updateBookCover } from "../api/books";
import { fetchAiCover, fetchAiCopyAndTags } from "../api/openai";
import useFormValidation from "../hooks/useFormValidation";
import { useNavigate } from "react-router-dom";

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
  errorMsg: {
    fontSize: "12px",
    color: "#e55",
    margin: 0,
  },
  btnRow: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
    marginTop: "8px",
  },
  aiBtn: {
    width: "100%",
    padding: "10px 14px",
    background: "#f5f0ff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#7c3aed",
  },
};

function BookCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    author: "",
    summary: "",
    content: "",
    copy: "",
    tags: [],
    coverImageUrl: "",
  });

  const [showAI, setShowAI] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const { errors, validate, clearError } = useFormValidation();
  const [copyLoading, setCopyLoading] = useState(false);

  const isFormValid =
    form.title.trim() &&
    form.author.trim() &&
    form.summary.trim() &&
    form.content.trim() &&
    !loading && // 표지 생성 중
    !copyLoading; // 카피/태그 생성 중

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    clearError(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validate(form);
    if (!isValid) return;

    const now = new Date().toISOString();

    // 1. coverImageUrl 빼고 먼저 등록
    const created = await createBook({
      title: form.title,
      author: form.author,
      summary: form.summary,
      content: form.content,
      copy: form.copy,
      tags: form.tags,
      coverImageUrl: "",
      createdAt: now,
      updatedAt: now,
    });

    // 2. 표지 있으면 바로 업데이트
    if (form.coverImageUrl && created?.id) {
      await updateBookCover(created.id, form.coverImageUrl);
    }
    // form 초기화
    setForm({
      title: "",
      author: "",
      summary: "",
      content: "",
      copy: "",
      tags: [],
      coverImageUrl: "",
    });
    alert("등록이 완료되었습니다!");
    navigate("/");
  };

  // AI 표지 생성 핸들러
  const handleAIGenerate = async () => {
    if (!form.content.trim()) {
      alert("본문 내용을 먼저 입력해주세요!");
      return;
    }
    try {
      setLoading(true);
      const imageUrl = await fetchAiCover(
        form.title,
        form.author,
        form.content,
      );
      setPreviewImage(imageUrl);
    } catch (err) {
      alert("표지 생성에 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // AI 카피 및 태그 생성 핸들러
  const handleAICopyAndTags = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert("제목과 본문 내용을 먼저 입력해주세요!");
      return;
    }
    try {
      setCopyLoading(true);
      const result = await fetchAiCopyAndTags(form.title, form.content);
      setForm({ ...form, copy: result.copy, tags: result.tags });
    } catch (err) {
      alert("생성에 실패했습니다.");
      console.error(err);
    } finally {
      setCopyLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{ fontSize: "22px", fontWeight: "500", marginBottom: "8px" }}>
        새 도서 등록
      </h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldWrap}>
          <label>
            제목 <span style={{ color: "#e55" }}>*</span>
          </label>
          <input
            name='title'
            value={form.title}
            onChange={handleChange}
            placeholder='제목을 입력하세요 (최대 100자)'
            maxLength={100}
            style={{
              ...styles.input,
              borderColor: errors.title ? "#e55" : "#ddd",
            }}
          />
          {errors.title && <p style={styles.errorMsg}>{errors.title}</p>}
        </div>

        <div style={styles.fieldWrap}>
          <label>
            저자 <span style={{ color: "#e55" }}>*</span>
          </label>
          <input
            name='author'
            value={form.author}
            onChange={handleChange}
            placeholder='저자를 입력하세요'
            style={{
              ...styles.input,
              borderColor: errors.author ? "#e55" : "#ddd",
            }}
          />
          {errors.author && <p style={styles.errorMsg}>{errors.author}</p>}
        </div>

        <div style={styles.fieldWrap}>
          <label>
            한줄 요약 <span style={{ color: "#e55" }}>*</span>
          </label>
          <input
            name='summary'
            value={form.summary}
            onChange={handleChange}
            placeholder='한줄 요약을 입력하세요'
            style={{
              ...styles.input,
              borderColor: errors.summary ? "#e55" : "#ddd",
            }}
          />
          {errors.summary && <p style={styles.errorMsg}>{errors.summary}</p>}
        </div>

        <div style={styles.fieldWrap}>
          <label>
            본문 내용 <span style={{ color: "#e55" }}>*</span>
          </label>
          <textarea
            name='content'
            value={form.content}
            onChange={handleChange}
            placeholder='본문 내용을 입력하세요 (최대 5000자)'
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

        <div style={styles.fieldWrap}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label>
              한줄 카피 <span style={{ color: "#e55" }}>*</span>
            </label>
            <button
              type='button'
              onClick={handleAICopyAndTags}
              disabled={copyLoading}
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                background: "#fff",
                cursor: copyLoading ? "not-allowed" : "pointer",
                color: "#7c3aed",
              }}
            >
              {copyLoading ? "생성 중..." : "AI 생성"}
            </button>
          </div>
          <input
            name='copy'
            value={form.copy}
            onChange={handleChange}
            placeholder='한줄 카피를 입력하거나 AI로 생성하세요'
            style={{
              ...styles.input,
              borderColor: errors.copy ? "#e55" : "#ddd",
            }}
          />
        </div>

        <div style={styles.fieldWrap}>
          <label>태그</label>
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              marginBottom: "6px",
            }}
          >
            {form.tags.map((tag, i) => (
              <span
                key={i}
                onClick={() =>
                  setForm({
                    ...form,
                    tags: form.tags.filter((_, idx) => idx !== i),
                  })
                }
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  background: "#f5f0ff",
                  borderRadius: "999px",
                  color: "#7c3aed",
                  cursor: "pointer",
                }}
              >
                {tag} ✕
              </span>
            ))}
          </div>
          <input
            placeholder='#태그 입력 후 Enter'
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const tag = e.target.value.trim();
                if (tag && !form.tags.includes(tag)) {
                  setForm({ ...form, tags: [...form.tags, tag] });
                  e.target.value = "";
                }
              }
            }}
            style={styles.input}
          />
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <button
            type='button'
            onClick={() => setShowAI(!showAI)}
            style={styles.aiBtn}
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
                    alt='AI 생성 표지'
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
              {!previewImage && (
                <button
                  type='button'
                  onClick={handleAIGenerate}
                  disabled={loading}
                  style={{
                    ...styles.input,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    background: loading ? "#f5f5f5" : "#fff",
                  }}
                >
                  {loading ? "생성 중..." : "AI 표지 생성"}
                </button>
              )}
              {previewImage && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type='button'
                    onClick={handleAIGenerate}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      cursor: loading ? "not-allowed" : "pointer",
                      background: loading ? "#f5f5f5" : "#fff",
                    }}
                  >
                    {loading ? "생성 중..." : "재생성"}
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setForm({ ...form, coverImageUrl: previewImage });
                      setShowAI(false);
                    }}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "8px",
                      border: "1px solid #bbb",
                      borderRadius: "6px",
                      background: loading ? "#e0e0e0" : "#f0f0f0",
                      cursor: loading ? "not-allowed" : "pointer",
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
          <p style={{ color: "#1976d2", fontSize: "13px", fontWeight: "500" }}>
            표지 적용됨
          </p>
        )}

        <div style={styles.btnRow}>
          <button
            type='button'
            onClick={() => navigate("/")}
            style={{ ...styles.input, cursor: "pointer" }}
          >
            취소
          </button>
          <button
            type='submit'
            disabled={!isFormValid}
            style={{
              padding: "10px 28px",
              border: "none",
              borderRadius: "6px",
              background: isFormValid ? "#7c3aed" : "#ccc",
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

export default BookCreatePage;
