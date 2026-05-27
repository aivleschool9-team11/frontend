import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBook, deleteBook } from "../api/books";
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

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
        sx={{ textAlign: "center", color: "error.main", marginTop: "40px" }}
      >
        {error}
      </Typography>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 3, md: 5 },
          backgroundColor: "background.paper",
          borderRadius: "20px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,0.05), 0 2px 8px rgba(201,141,26,0.12)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "flex-start",
          }}
        >
          {/* 표지 영역 */}
          {book.coverImageUrl ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                width: { xs: "100%", md: "200px" },
                alignSelf: { xs: "center", md: "flex-start" },
                flexShrink: 0,
              }}
            >
              <Box
                component='img'
                src={book.coverImageUrl}
                alt={book.title}
                sx={{
                  width: "100%",
                  height: { xs: "auto", md: "280px" },
                  maxHeight: { xs: "300px", md: "none" },
                  objectFit: "cover",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Button
                variant='outlined'
                size='small'
                onClick={handleDownload}
                startIcon={<DownloadIcon />}
                sx={{
                  borderColor: "primary.light",
                  color: "text.secondary",
                  width: "100%",
                  py: 0.8,
                  fontFamily: "inherit",
                  "&:hover": {
                    borderColor: "primary.main",
                    backgroundColor: "rgba(201, 141, 26, 0.08)",
                  },
                }}
              >
                표지 다운로드
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                width: "200px",
                height: "280px",
                background: "background.default",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.disabled",
                fontSize: "13px",
                border: "1px dashed",
                borderColor: "primary.light",
                alignSelf: { xs: "center", md: "flex-start" },
                flexShrink: 0,
              }}
            >
              no image
            </Box>
          )}

          {/* 도서 정보 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
            }}
          >
            <Typography
              variant='h1'
              sx={{
                fontSize: { xs: "28px", md: "36px" },
                textAlign: "left",
                mb: 0.5,
                fontWeight: 500,
                letterSpacing: "0px",
              }}
            >
              {book.title}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 1,
              }}
            >
              <Typography
                variant='body1'
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                저자: {book.author}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: "block", whiteSpace: "nowrap" }}
                >
                  등록일 {new Date(book.createdAt).toLocaleDateString()}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: "block", whiteSpace: "nowrap" }}
                >
                  수정일 {new Date(book.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 0.5, borderColor: "primary.light" }} />

            {book.summary && (
              <Box
                sx={{
                  borderLeft: "3px solid",
                  borderColor: "primary.light",
                  pl: 2,
                  py: 0.5,
                  my: 1,
                }}
              >
                <Typography
                  variant='body2'
                  sx={{ fontStyle: "italic", color: "text.secondary" }}
                >
                  {book.summary}
                </Typography>
              </Box>
            )}

            <Typography
              variant='body1'
              sx={{
                lineHeight: "1.8",
                color: "text.primary",
                whiteSpace: "pre-line",
                minHeight: "100px",
              }}
            >
              {book.content}
            </Typography>

            {book.copy && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  backgroundColor: "background.paper",
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: "primary.light",
                }}
              >
                <Typography
                  variant='body2'
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  AI 홍보 카피: {book.copy}
                </Typography>
              </Box>
            )}

            {book.tags && book.tags.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                {book.tags.map((tag, i) => (
                  <Box
                    key={i}
                    sx={{
                      fontSize: "12px",
                      padding: "4px 10px",
                      backgroundColor: "background.paper",
                      borderRadius: "999px",
                      color: "text.secondary",
                      border: "1px solid",
                      borderColor: "primary.light",
                    }}
                  >
                    {tag}
                  </Box>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 1.5, borderColor: "primary.light" }} />

            {/* 액션 버튼 영역 */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                mt: 1.5,
              }}
            >
              <Button
                variant='outlined'
                size='small'
                onClick={() => navigate("/")}
                startIcon={<ArrowBackIcon />}
                sx={{
                  borderColor: "primary.light",
                  color: "text.secondary",
                  py: 0.8,
                  px: 1.5,
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                목록으로
              </Button>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant='contained'
                  color='primary'
                  size='small'
                  onClick={() => navigate(`/books/${id}/edit`)}
                  startIcon={<EditIcon />}
                  sx={{ py: 0.8, px: 1.5 }}
                >
                  수정
                </Button>
                <Button
                  variant='outlined'
                  color='error'
                  size='small'
                  onClick={handleDelete}
                  startIcon={<DeleteIcon />}
                  sx={{ py: 0.8, px: 1.5 }}
                >
                  삭제
                </Button>
                <Button
                  variant={isLiked ? "contained" : "outlined"}
                  color='error'
                  size='small'
                  onClick={handleLike}
                  startIcon={
                    isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />
                  }
                  sx={{ py: 0.8, px: 1.5 }}
                >
                  좋아요
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default BookDetailPage;
