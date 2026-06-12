import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBook, updateBookCover, uploadCoverImage } from "../api/books";
import { fetchAiCover, fetchAiCopyAndTags, fetchAiEmbedding } from "../api/openai";
import useFormValidation from "../hooks/useFormValidation";
import BookForm from "../components/book/BookForm";
import AICopyTagSection from "../components/book/AICopyTagSection";
import AICoverSection from "../components/book/AICoverSection";
import {
  Container,
  Paper,
  Typography,
  Divider,
  Button,
  Box,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

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

    try {
      let embeddingJson = [];
      let embeddingDurationMs = 0;
      try {
        const textToEmbed = `제목: ${form.title}\n저자: ${form.author}\n요약: ${form.summary}\n내용: ${form.content}`;
        const startTime = performance.now();
        embeddingJson = await fetchAiEmbedding(textToEmbed);
        embeddingDurationMs = Math.round(performance.now() - startTime);
      } catch (embErr) {
        console.error("임베딩 생성 실패:", embErr);
      }

      const created = await createBook({
        title: form.title,
        author: form.author,
        summary: form.summary,
        content: form.content,
        copy: form.copy,
        tags: form.tags,
        coverImageUrl: "", 
        embeddingJson,
        embeddingDurationMs,
      });

      if (!created) {
        throw new Error("등록 실패");
      }

      if (form.coverImageUrl && created.id) {
        let imageUrl = form.coverImageUrl;
        if(imageUrl.startsWith("data:")) {
          try{
            imageUrl = await uploadCoverImage(imageUrl);
          } catch(err){
            console.error("표지 이미지 업로드 실패:", err);
            alert("도서는 등록되었지만 표지 이미지 업로드에 실패했습니다.");
            navigate(`/books/${created.id}`);
            return;
          }
        }
        await updateBookCover(created.id, imageUrl);
      }
      alert("등록이 완료되었습니다!");
      navigate(`/books/${created.id}`);
    } catch (err) {
      console.error(err);
      alert("도서 등록에 실패했습니다.");
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
      setForm({ ...form, summary: result.summary, copy: result.copy, tags: result.tags });
    } catch (err) {
      alert("생성에 실패했습니다.");
      console.error(err);
    } finally {
      setCopyLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 3, md: 5 },
          backgroundColor: "#fffaf3",
          borderRadius: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.05), 0 2px 8px rgba(201,141,26,0.12)",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: "28px",
            color: "#b87912",
            textAlign: "left",
            mb: 1,
            fontWeight: 500,
          }}
        >
          새 도서 등록
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          새로운 도서의 정보를 입력하고 AI 표지와 카피를 생성해 보세요.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <BookForm form={form} errors={errors} onChange={handleChange} />

            <Divider sx={{ borderColor: "#ead7b1", my: 1 }} />

            <AICopyTagSection
              summary={form.summary}
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
              <Typography variant="body2" sx={{ color: "#1976d2", fontWeight: 500 }}>
                ✓ AI 표지가 도서에 적용되었습니다.
              </Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/")}
                startIcon={<CancelIcon />}
                sx={{
                  borderColor: "#ead7b1",
                  color: "#6b4f3a",
                  "&:hover": { borderColor: "#c98d1a" },
                }}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isFormValid}
                startIcon={<SaveIcon />}
              >
                저장
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default BookCreatePage;
