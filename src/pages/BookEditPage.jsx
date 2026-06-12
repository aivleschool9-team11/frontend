import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookById, updateBook, uploadCoverImage } from "../api/books";
import {
  fetchAiCover,
  fetchAiCopyAndTags,
  fetchAiEmbedding,
} from "../api/openai";
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
        const data = await getBookById(id);
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

    // coverImageUrl 변경은 /cover 전용 엔드포인트로 분리 처리
    if(updatedFields.coverImageUrl !== undefined){
      let imageUrl = updatedFields.coverImageUrl;

      if(imageUrl.startsWith("data:")) {
        try{
          imageUrl = await uploadCoverImage(imageUrl);
        } catch(err){
          console.log("표지 이미지 업로드 실패:", err);
          alert("표지 이미지 업로드에 실패했습니다.");
          return;
        }
    }

    try{
      await updateBookCover(id, imageUrl);
    } catch(err){
      console.error("표지 저장 실패:", err);
      alert("표지 저장에 실패했습니다.");
      return;
    }

    const didTextChange =
      updatedFields.title !== undefined ||
      updatedFields.author !== undefined ||
      updatedFields.summary !== undefined ||
      updatedFields.content !== undefined;

    if (didTextChange) {
      try {
        const textToEmbed = `제목: ${book.title}\n저자: ${book.author}\n요약: ${book.summary}\n내용: ${book.content}`;
        const startTime = performance.now();
        updatedFields.embeddingJson = await fetchAiEmbedding(textToEmbed);
        updatedFields.embeddingDurationMs = Math.round(performance.now() - startTime);
      } catch (embErr) {
        console.error("임베딩 수정 실패:", embErr);
      }
    }

    // coverImageUrl만 변경되고 다른 필드는 없으면 PATCH /books/{id} 생략
    if (Object.keys(updatedFields).length > 0) {
      try {
        const updatedBook = await updateBook(id, updatedFields);
        if (!updatedBook) {
          throw new Error("수정 실패");
        }
      } catch (err) {
        console.error(err);
        alert("도서 수정에 실패했습니다.");
        return;
      }
    }

    alert("도서 수정 완료");
    navigate(`/books/${id}`);
  };
}

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
      setBook({
        ...book,
        summary: result.summary,
        copy: result.copy,
        tags: result.tags,
      });
    } catch (err) {
      alert("생성에 실패했습니다.");
      console.error(err);
    } finally {
      setCopyLoading(false);
    }
  };

  if (loading) {
    return (
      <Typography
        variant='body1'
        sx={{ textAlign: "center", marginTop: "40px" }}
      >
        불러오는 중...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography
        variant='body1'
        sx={{ textAlign: "center", color: "#e55", marginTop: "40px" }}
      >
        {error}
      </Typography>
    );
  }

  const isFormValid =
    book.title.trim() &&
    book.author.trim() &&
    book.summary.trim() &&
    book.content.trim() &&
    !aiLoading &&
    !copyLoading;

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 3, md: 5 },
          backgroundColor: "#fffaf3",
          borderRadius: "20px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,0.05), 0 2px 8px rgba(201,141,26,0.12)",
        }}
      >
        <Typography
          variant='h1'
          sx={{
            fontSize: "28px",
            color: "#b87912",
            textAlign: "left",
            mb: 1,
            fontWeight: 500,
          }}
        >
          도서 수정
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
          도서의 정보를 수정하고 필요한 경우 AI 표지나 홍보 카피를 갱신해
          보세요.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <BookForm form={book} onChange={handleChange} />

            <Divider sx={{ borderColor: "#ead7b1", my: 1 }} />

            <AICopyTagSection
              summary={book.summary}
              copy={book.copy}
              tags={book.tags}
              copyLoading={copyLoading}
              onChange={handleChange}
              onAIRequest={handleAICopyAndTags}
              onAdd={(tag) => setBook({ ...book, tags: [...book.tags, tag] })}
              onRemove={(i) =>
                setBook({
                  ...book,
                  tags: book.tags.filter((_, idx) => idx !== i),
                })
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
              <Typography
                variant='body2'
                sx={{ color: "#1976d2", fontWeight: 500 }}
              >
                ✓ AI 표지가 도서에 적용되었습니다.
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1.5,
                mt: 2,
              }}
            >
              <Button
                variant='outlined'
                onClick={() => navigate(`/books/${id}`)}
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
                type='submit'
                variant='contained'
                color='primary'
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

export default BookEditPage;
