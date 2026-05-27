import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks, updateBook } from "../api/books";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Paper,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SparklesIcon from "@mui/icons-material/AutoAwesome";
import { fetchAiEmbedding, cosineSimilarity, fetchExpandedQuery } from "../api/openai";

const fadeUp = {
  "@keyframes fadeUp": {
    from: { opacity: 0, transform: "translateY(12px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
};

function BookListPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // AI 시맨틱 검색 관련 상태
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [similarityScores, setSimilarityScores] = useState({});
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState("");
  const [backfilling, setBackfilling] = useState(false);
  const [aiInferredInfo, setAiInferredInfo] = useState(null); // LLM 지식 추론 정보

  const getLikedIds = () => {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith("likes_"))
      .map((key) => key.replace("likes_", ""));
  };

  const [likedIds, setLikedIds] = useState(getLikedIds);

  useEffect(() => {
    async function loadBooks() {
      try {
        const booksData = await getBooks();
        setBooks(booksData);
      } catch (err) {
        console.error(err);
        setError("도서 목록을 불러오지 못했어요");
      }
      setLoading(false);
    }
    loadBooks();
  }, []);

  useEffect(() => {
    const handleFocus = () => setLikedIds(getLikedIds());
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // AI 검색어 입력 후 제출 핸들러 (Query Expansion 적용)
  const handleAiSearch = async () => {
    if (!searchKeyword.trim()) {
      setSimilarityScores({});
      setLastSubmittedQuery("");
      setAiInferredInfo(null);
      return;
    }

    setAiLoading(true);
    try {
      // 1. 소장된 도서 목록을 텍스트 콘텍스트로 변환
      const bookListContext = books.map((b) => `'${b.title}' (${b.author})`).join(', ');

      // 2. LLM 지식을 활용하여 검색 쿼리 확장 (목록 내 도서와 우선 매칭)
      const expansion = await fetchExpandedQuery(searchKeyword, bookListContext);
      
      // 유추된 도서 정보 저장
      if (expansion.inferredTitle) {
        setAiInferredInfo({
          title: expansion.inferredTitle,
          author: expansion.inferredAuthor,
        });
      } else {
        setAiInferredInfo(null);
      }

      // 원래 검색어와 LLM의 추론/확장 정보를 함께 결합한 텍스트로 임베딩 생성
      const expandedText = `${searchKeyword} ${expansion.inferredTitle} ${expansion.inferredAuthor} ${expansion.expandedKeywords}`.trim();
      console.log("[RAG] 확장된 검색어:", expandedText);

      const queryEmbedding = await fetchAiEmbedding(expandedText);
      const scores = {};
      books.forEach((book) => {
        if (book.embedding && book.embedding.length > 0) {
          scores[book.id] = cosineSimilarity(queryEmbedding, book.embedding);
        } else {
          scores[book.id] = 0;
        }
      });
      setSimilarityScores(scores);
      setLastSubmittedQuery(searchKeyword);
    } catch (err) {
      console.error(err);
      alert("AI 검색 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  // 기존 도서들 중 임베딩 데이터가 없는 건에 대한 일괄 생성(백필) 핸들러
  const handleBackfill = async () => {
    setBackfilling(true);
    try {
      let count = 0;
      for (const book of books) {
        if (!book.embedding || book.embedding.length === 0) {
          const textToEmbed = `제목: ${book.title}\n저자: ${book.author}\n요약: ${book.summary}\n내용: ${book.content}`;
          const embedding = await fetchAiEmbedding(textToEmbed);
          await updateBook(book.id, { embedding });
          count++;
        }
      }
      alert(`${count}개 도서의 AI 임베딩이 성공적으로 생성되었습니다!`);
      const booksData = await getBooks();
      setBooks(booksData);
    } catch (err) {
      console.error(err);
      alert("임베딩 백필 중 오류가 발생했습니다.");
    } finally {
      setBackfilling(false);
    }
  };

  // 일반 키워드 검색 필터링
  const filterdBooks = books.filter(
    (book) =>
      book.title.includes(searchKeyword) || book.author.includes(searchKeyword),
  );

  // 코사인 유사도를 직관적인 백분율 점수로 변환하는 보정 함수
  const displaySimilarity = (score) => {
    if (score <= 0) return "0%";
    const min = 0.12;
    const max = 0.50;
    let percent;
    if (score <= min) {
      percent = Math.max(0, Math.round((score / min) * 30));
    } else {
      percent = 30 + ((score - min) / (max - min)) * 70;
    }
    return `${Math.min(100, Math.round(percent))}%`;
  };

  const isAiSearchActive = isAiSearch && lastSubmittedQuery.trim() !== "";

  // 검색 결과에 따른 노출 대상 목록 설정
  const likedFilteredBooks =
    sortOrder === "liked"
      ? (isAiSearchActive ? books.filter((book) => likedIds.includes(String(book.id))) : filterdBooks.filter((book) => likedIds.includes(String(book.id))))
      : (isAiSearchActive ? books : filterdBooks);

  // 정렬 순서 계산 (AI 검색 활성화 시 유사도 순 정렬 우선)
  const sortedBooks = [...likedFilteredBooks].sort((a, b) => {
    if (isAiSearchActive) {
      const scoreA = similarityScores[a.id] || 0;
      const scoreB = similarityScores[b.id] || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
    }

    if (sortOrder === "newest")
      return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOrder === "oldest")
      return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOrder === "title") return a.title.localeCompare(b.title);
    if (sortOrder === "author") return a.author.localeCompare(b.author);
    if (sortOrder === "likes") return (b.likes || 0) - (a.likes || 0);
    return 0;
  });

  const hasBooksWithoutEmbedding =
    books.length > 0 && books.some((book) => !book.embedding || book.embedding.length === 0);

  if (loading) {
    return (
      <Typography
        variant='body1'
        sx={{ textAlign: "center", marginTop: "60px", color: "text.secondary" }}
      >
        불러오는 중...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography
        variant='body1'
        sx={{ textAlign: "center", color: "error.main", marginTop: "60px" }}
      >
        {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: "60px 40px",
        backgroundColor: "background.default",
        backgroundImage:
          "radial-gradient(rgba(201, 141, 26, 0.04) 1.5px, transparent 1.5px)",
        backgroundSize: "32px 32px",
      }}
    >
      <Typography
        variant='h1'
        sx={{
          textAlign: "center",
          mb: 6,
          fontSize: "32px",
          fontWeight: 700,
          letterSpacing: "2px",
          textShadow: "1px 1px 3px rgba(141, 92, 14, 0.1)",
        }}
      >
        도서 목록
      </Typography>

      {/* 백필 안내 배너 */}
      {hasBooksWithoutEmbedding && (
        <Alert
          severity='warning'
          action={
            <Button
              color='inherit'
              size='small'
              onClick={handleBackfill}
              disabled={backfilling}
              sx={{ fontWeight: "bold", fontFamily: "inherit" }}
            >
              {backfilling ? "백필 중..." : "일괄 생성"}
            </Button>
          }
          sx={{
            maxWidth: "800px",
            mx: "auto",
            mb: 3,
            borderRadius: "12px",
            fontFamily: "inherit",
          }}
        >
          {backfilling
            ? "일부 도서의 AI 임베딩 벡터를 추출하여 데이터베이스를 업데이트하는 중입니다..."
            : "일부 도서에 AI 임베딩 데이터가 없습니다. 원활한 의미 검색을 위해 아래 일괄 생성 버튼을 클릭하세요."}
        </Alert>
      )}

      {/* 검색 + 정렬 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          mb: 4.5,
          maxWidth: "800px",
          mx: "auto",
        }}
      >
        <TextField
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isAiSearch) {
              handleAiSearch();
            }
          }}
          placeholder={
            isAiSearch
              ? "책 내용이나 특징으로 검색 (예: 노인이 고래와 싸움) + Enter"
              : "제목 또는 저자 검색"
          }
          size='small'
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon
                    sx={{ color: "text.secondary", fontSize: "18px" }}
                  />
                </InputAdornment>
              ),
              endAdornment: isAiSearch && (
                <InputAdornment position='end'>
                  {aiLoading ? (
                    <CircularProgress size={18} color='inherit' />
                  ) : (
                    <IconButton onClick={handleAiSearch} size='small'>
                      <SearchIcon sx={{ color: "#8A6A44" }} />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant={isAiSearch ? "contained" : "outlined"}
          onClick={() => {
            setIsAiSearch(!isAiSearch);
            if (isAiSearch) {
              setSimilarityScores({});
              setLastSubmittedQuery("");
              setAiInferredInfo(null);
            }
          }}
          startIcon={<SparklesIcon />}
          sx={{
            minWidth: "140px",
            borderColor: "#ead7b1",
            backgroundColor: isAiSearch ? "#8A6A44" : "#F8F3EA",
            color: isAiSearch ? "#fff" : "#8A6A44",
            py: 1,
            px: 2,
            fontFamily: "inherit",
            "&:hover": {
              borderColor: "#8A6A44",
              backgroundColor: isAiSearch ? "#705332" : "#eee7db",
            },
          }}
        >
          AI 의미 검색
        </Button>
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          size='small'
          sx={{ minWidth: "140px" }}
        >
          <MenuItem value='newest'>최신순</MenuItem>
          <MenuItem value='oldest'>오래된순</MenuItem>
          <MenuItem value='title'>제목순</MenuItem>
          <MenuItem value='author'>작가명순</MenuItem>
          <MenuItem value='likes'>좋아요순</MenuItem>
          <MenuItem value='liked'>좋아요한 도서</MenuItem>
        </Select>
      </Box>

      {/* AI 지식 연상 결과 안내 배너 */}
      {isAiSearchActive && aiInferredInfo && (
        <Box
          sx={{
            maxWidth: "800px",
            mx: "auto",
            mb: 3.5,
            p: 2,
            backgroundColor: "#fffdf8",
            border: "1px dashed #ead7b1",
            borderRadius: "12px",
            animation: "fadeUp 0.4s ease-out",
            ...fadeUp,
          }}
        >
          <Typography
            variant='body2'
            sx={{
              color: "#8A6A44",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <SparklesIcon sx={{ fontSize: "16px", color: "#8A6A44" }} />
            <span>
              <strong>AI 지식 연상 결과:</strong> 입력하신 단서로 볼 때 <strong>'{aiInferredInfo.title}'</strong> ({aiInferredInfo.author || "저자 미상"})과 가장 유관해 보입니다. 관련성 높은 매칭 결과를 아래에서 확인해 보세요.
            </span>
          </Typography>
        </Box>
      )}

      {/* 도서 목록 */}
      {sortedBooks.length === 0 ? (
        <Typography
          sx={{
            textAlign: "center",
            color: "text.secondary",
            mt: 7.5,
            fontSize: "16px",
          }}
        >
          {sortOrder === "liked"
            ? "좋아요한 도서가 없습니다."
            : searchKeyword
              ? "검색 결과가 없습니다."
              : "등록된 도서가 없습니다."}
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          {sortedBooks.map((book) => (
            <Paper
              key={book.id}
              elevation={0}
              sx={{
                display: "flex",
                gap: 3,
                borderRadius: "12px",
                padding: "24px",
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "primary.light",
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                animation: "fadeUp 0.4s ease-out",
                ...fadeUp,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow:
                    "0 10px 24px rgba(75,54,33,0.06), 0 3px 8px rgba(201,141,26,0.08)",
                },
                "&:hover h2": { color: "secondary.main" },
              }}
            >
              {/* 표지 이미지 */}
              <Box
                sx={{
                  width: "120px",
                  height: "160px",
                  backgroundColor: "background.default",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "6px",
                  flexShrink: 0,
                  overflow: "hidden",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                {book.coverImageUrl ? (
                  <Box
                    component='img'
                    src={book.coverImageUrl}
                    alt={book.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s ease",
                      "&:hover": { transform: "scale(1.03)" },
                    }}
                  />
                ) : (
                  <Typography variant='caption' sx={{ color: "text.disabled" }}>
                    no image
                  </Typography>
                )}
              </Box>

              {/* 도서 정보 */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  {isAiSearchActive && similarityScores[book.id] !== undefined && (
                    <Box
                      sx={{
                        display: "inline-block",
                        backgroundColor: "#F8F3EA",
                        color: "#8A6A44",
                        border: "1px solid #ead7b1",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        py: 0.25,
                        px: 1,
                        mb: 1,
                      }}
                    >
                      AI 유사도: {displaySimilarity(similarityScores[book.id])}
                    </Box>
                  )}
                  <Typography
                    component='h2'
                    sx={{
                      color: "text.primary",
                      fontSize: "20px",
                      fontWeight: 700,
                      mt: 0,
                      mb: 1,
                      transition: "color 0.2s ease",
                    }}
                  >
                    {book.title}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ color: "text.secondary", mb: 0.75 }}
                  >
                    저자: {book.author}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ color: "text.secondary", lineHeight: 1.6, mb: 1.5 }}
                  >
                    {book.summary}
                  </Typography>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    {likedIds.includes(String(book.id)) ? (
                      <FavoriteIcon
                        sx={{ fontSize: "14px", color: "error.main" }}
                      />
                    ) : (
                      <FavoriteBorderIcon
                        sx={{ fontSize: "14px", color: "error.main" }}
                      />
                    )}
                    <Typography variant='caption' sx={{ color: "error.main" }}>
                      좋아요 {book.likes || 0}
                    </Typography>
                  </Box>
                  <Link
                    to={`/books/${book.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      variant='contained'
                      color='secondary'
                      size='small'
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        fontFamily: "inherit",
                      }}
                    >
                      상세 보기
                    </Button>
                  </Link>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default BookListPage;
