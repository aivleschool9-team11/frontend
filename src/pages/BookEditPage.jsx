import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBook, updateBook } from "../api/books";
import { fetchAiCover, fetchAiCopyAndTags } from "../api/openai";
import { formStyles } from "../components/book/formStyles";
import BookForm from "../components/book/BookForm";
import AICopyTagSection from "../components/book/AICopyTagSection";
import AICoverSection from "../components/book/AICoverSection";

function BookEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState({
    title: "",
    author: "",
    summary: "",
    content: "",
    copy: "",
    tags: [],
    coverImageUrl: "",
  });

  const [originalBook, setOriginalBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const data = await getBook(id);
        setBook({
          title: data.title || "",
          author: data.author || "",
          summary: data.summary || "",
          content: data.content || "",
          copy: data.copy || "",
          tags: data.tags || [],
          coverImageUrl: data.coverImageUrl || "",
        });
        setOriginalBook(data);
        setPreviewImage(data.coverImageUrl || "");
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
      if (!updatedBook) {
        throw new Error("수정 실패");
      }
      console.log("수정 완료:", updatedBook);
      alert("도서 수정 완료");
    } catch (err) {
      console.error(err);
      alert("도서 수정에 실패했습니다.");
    } finally {
      navigate("/");
    }
  };

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

  const handleAICopyAndTags = async () => {
    if (!book.title.trim() || !book.content.trim()) {
      alert("제목과 본문 내용을 먼저 입력해주세요!");
      return;
    }
    try {
      setCopyLoading(true);
      const result = await fetchAiCopyAndTags(book.title, book.content);
      setBook({ ...book, copy: result.copy, tags: result.tags });
    } catch (err) {
      alert("생성에 실패했습니다.");
      console.error(err);
    } finally {
      setCopyLoading(false);
    }
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>불러오는 중...</p>
    );
  if (error)
    return <p style={{ textAlign: "center", color: "#e55" }}>{error}</p>;

  const isFormValid =
    book.title.trim() &&
    book.author.trim() &&
    book.summary.trim() &&
    book.content.trim() &&
    !aiLoading &&
    !copyLoading;

  return (
    <div style={formStyles.container}>
      <h1>도서 수정</h1>
      <p style={formStyles.subTitle}>내용을 수정하고 저장해주세요</p>
      <form onSubmit={handleSubmit} style={formStyles.form}>
        <BookForm form={book} onChange={handleChange} />
        <hr style={{ border: "none", borderTop: "1px solid #eee" }} />
        <AICopyTagSection
          copy={book.copy}
          tags={book.tags}
          copyLoading={copyLoading}
          onChange={handleChange}
          onAIRequest={handleAICopyAndTags}
          onAdd={(tag) => setBook({ ...book, tags: [...book.tags, tag] })}
          onRemove={(i) =>
            setBook({ ...book, tags: book.tags.filter((_, idx) => idx !== i) })
          }
        />
        <AICoverSection
          showAI={showAI}
          onToggle={() => setShowAI(!showAI)}
          previewImage={previewImage}
          loading={aiLoading}
          onAIRequest={handleAIGenerate}
          onSelectCover={() => {
            setBook({ ...book, coverImageUrl: previewImage });
            setShowAI(false);
          }}
        />
        {book.coverImageUrl && (
          <p style={{ color: "#1976d2", fontSize: "13px", fontWeight: "500" }}>
            표지 적용됨
          </p>
        )}
        <div style={formStyles.btnRow}>
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
            disabled={!isFormValid}
            style={{
              padding: "10px 28px",
              border: "none",
              borderRadius: "6px",
              background: isFormValid ? "#7c3aed" : "#ccc",
              color: "#fff",
              fontSize: "14px",
              cursor: isFormValid ? "pointer" : "not-allowed",
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
