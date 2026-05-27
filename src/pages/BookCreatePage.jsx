import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBook, updateBookCover } from "../api/books";
import { fetchAiCover, fetchAiCopyAndTags } from "../api/openai";
import useFormValidation from "../hooks/useFormValidation";
import { formStyles } from "../components/book/FormStyles";
import BookForm from "../components/book/BookForm";
import AICopyTagSection from "../components/book/AICopyTagSection";
import AICoverSection from "../components/book/AICoverSection";

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
  const [copyLoading, setCopyLoading] = useState(false);
  const { errors, validate, clearError } = useFormValidation();

  const isFormValid =
    form.title.trim() &&
    form.author.trim() &&
    form.summary.trim() &&
    form.content.trim() &&
    !loading &&
    !copyLoading;

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

    try {
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

      if (!created) {
        throw new Error("등록 실패");
      }

      if (form.coverImageUrl && created.id) {
        await updateBookCover(created.id, form.coverImageUrl);
      }
      alert("등록이 완료되었습니다!");
    } catch (err) {
      console.error(err);
      alert("도서 등록에 실패했습니다.");
    } finally {
      setForm({
        title: "",
        author: "",
        summary: "",
        content: "",
        copy: "",
        tags: [],
        coverImageUrl: "",
      });
      navigate("/");
    }
  };

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
    <div style={formStyles.container}>
      <h1 style={{ fontSize: "22px", fontWeight: "500", marginBottom: "8px" }}>
        새 도서 등록
      </h1>
      <form onSubmit={handleSubmit} style={formStyles.form}>
        <BookForm form={form} errors={errors} onChange={handleChange} />
        <hr style={{ border: "none", borderTop: "1px solid #eee" }} />
        <AICopyTagSection
          copy={form.copy}
          tags={form.tags}
          copyLoading={copyLoading}
          errors={errors}
          onChange={handleChange}
          onAIRequest={handleAICopyAndTags}
          onAdd={(tag) => setForm({ ...form, tags: [...form.tags, tag] })}
          onRemove={(i) =>
            setForm({ ...form, tags: form.tags.filter((_, idx) => idx !== i) })
          }
        />
        <AICoverSection
          showAI={showAI}
          onToggle={() => setShowAI(!showAI)}
          previewImage={previewImage}
          loading={loading}
          onAIRequest={handleAIGenerate}
          onSelectCover={() => {
            setForm({ ...form, coverImageUrl: previewImage });
            setShowAI(false);
          }}
        />
        {form.coverImageUrl && (
          <p style={{ color: "#1976d2", fontSize: "13px", fontWeight: "500" }}>
            표지 적용됨
          </p>
        )}
        <div style={formStyles.btnRow}>
          <button
            type='button'
            onClick={() => navigate("/")}
            style={{ ...formStyles.input, cursor: "pointer" }}
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
