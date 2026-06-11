import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {searchBooks, searchBooksSemantic, logSearchClick} from "../api/search";
import {getBooksByTag} from "../api/books";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SparklesIcon from "@mui/icons-material/AutoAwesome";
import {fetchAiEmbedding,fetchExpandedQuery,} from "../api/openai";

const fadeUp = {
  "@keyframes fadeUp": {
    from: { opacity: 0, transform: "translateY(12px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
};

function BookListPage() {
  // ── 도서 목록 상태 ──────────────────────────────
  const [books, setBooks] = useState([]);       // Spring에서 받아온 도서 목록
  const [loading, setLoading] = useState(true); // 로딩 중 여부
  const [error, setError] = useState(null);     // 에러 메시지

  // ── 검색 / 정렬 상태 ────────────────────────────
  const [searchKeyword, setSearchKeyword] = useState("");       // 입력창에 타이핑 중인 값 (실시간)
  const [submittedKeyword, setSubmittedKeyword] = useState(""); // Enter 눌렀을 때 실제 검색 실행되는 값
  const [sortOrder, setSortOrder] = useState("newest");         //  정렬 기준 (최신순 등)

  // ── AI 의미 검색 상태 ────────────────────────────
  const [isAiSearch, setIsAiSearch] = useState(false);                 // AI 검색 모드 on/off
  const [aiLoading, setAiLoading] = useState(false);                   // AI 검색 처리 중 여부
  const [similarityScores, setSimilarityScores] = useState({});        // { bookId: 유사도점수 } → 카드에 "AI 유사도: 85%" 표시용
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState("");    // 마지막으로 AI 검색한 검색어
  const [aiInferredInfo, setAiInferredInfo] = useState(null);          // AI가 추론한 도서 정보 (배너에 표시)
  const [currentSearchLogId, setCurrentSearchLogId] = useState(null);  // 클릭 로그 저장할 때 필요한 검색 로그 id
  const [searchResults, setSearchResults] = useState([]);              // AI 검색 결과 원본 (클릭 시 순위 계산용)

  const [searchParams] = useSearchParams(); // URL 파라미터 읽기
  const tagFromUrl = searchParams.get("tag") || ""; // ?tag=소설 꺼냄

  const getLikedIds = () => {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith("likes_"))
      .map((key) => key.replace("likes_", ""));
  };

  const [likedIds, setLikedIds] = useState(getLikedIds);


  // ── 도서 목록 불러오기 ───────────────────────────
  // submittedKeyword(검색어) 또는 sortOrder(정렬) 바뀔 때마다 Spring API 호출
  // Enter 시에만 호출됨 (타이핑 중엔 호출 안 함)
  // 검색 로그는 Spring이 자동 저장
  useEffect(() => {
    async function loadBooks() {
      try {
        if (tagFromUrl) {
          const booksData = await getBooksByTag(tagFromUrl);
          setBooks(booksData || []);
          setCurrentSearchLogId(null);
        } else{
          const response = await searchBooks({
            query: submittedKeyword,
            sort: sortOrder, 
          });
          const booksData = response?.books || [];
          setCurrentSearchLogId(response?.searchLogId); 
          setBooks(booksData);
        } 
      } catch (err) {
        console.error(err);
        setError("도서 목록을 불러오지 못했어요");
      }
      setLoading(false);
    }
    loadBooks();
  }, [submittedKeyword, sortOrder, tagFromUrl]);

  // 다른 탭에서 돌아올 때 좋아요 상태 동기화
  useEffect(() => {
    const handleFocus = () => setLikedIds(getLikedIds());
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);


  // ── AI 의미 검색 핸들러 ──────────────────────────
  // 1) 검색어를 LLM으로 확장 (관련 키워드 추론)
  // 2) 확장된 검색어를 OpenAI로 벡터화
  // 3) 벡터를 Spring으로 전송 → 코사인 유사도 계산 → 유사 도서 반환
  // 4) 검색 로그는 Spring이 자동 저장
  const handleAiSearch = async () => {
    if (!searchKeyword.trim()) {
      setSimilarityScores({});
      setLastSubmittedQuery("");
      setAiInferredInfo(null);
      return;
    }

    setAiLoading(true);
    try {
      // 현재 도서 목록을 컨텍스트로 변환 (LLM이 DB 안의 책만 추론하도록 제한)
      const bookListContext = books
        .map((b) => `'${b.title}' (${b.author})`)
        .join(", ");

      // LLM으로 검색어 확장: 도서명 추론 + 연관 키워드 생성
      const expansion = await fetchExpandedQuery(
        searchKeyword,
        bookListContext,
      );

      // AI가 추론한 도서 정보 있으면 배너에 표시
      if (expansion.inferredTitle) {
        setAiInferredInfo({
          title: expansion.inferredTitle,
          author: expansion.inferredAuthor,
        });
      } else {
        setAiInferredInfo(null);
      }

      // 원본 검색어 + 추론 정보 합쳐서 임베딩 생성
      const expandedText =
        `${searchKeyword} ${expansion.inferredTitle} ${expansion.inferredAuthor} ${expansion.expandedKeywords}`.trim();
  
      const queryEmbedding = await fetchAiEmbedding(expandedText);
      
      const response = await searchBooksSemantic({ queryVector: queryEmbedding, topK: 5 });
      const results = response?.books || [];
      setCurrentSearchLogId(response?.searchLogId); 
      setSearchResults(results);

      // 유사도 점수를 { bookId: score } 형태로 저장 → 카드에 표시용
      const scores = {};
      results.forEach((book)=>{
        scores[book.id] = book.similarityScore;
      });
      setSimilarityScores(scores);
      setBooks(results); 
      setLastSubmittedQuery(searchKeyword);
      
    } catch (err) {
      console.error(err);
      alert("AI 검색 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── 유사도 점수를 화면용 퍼센트로 변환 ───────────
  // 0.12 이하는 0~30%, 0.12~0.5 구간은 30~100%로 보정
  const displaySimilarity = (score) => {
    if (score <= 0) return "0%";
    const min = 0.12;
    const max = 0.5;
    let percent;
    if (score <= min) {
      percent = Math.max(0, Math.round((score / min) * 30));
    } else {
      percent = 30 + ((score - min) / (max - min)) * 70;
    }
    return `${Math.min(100, Math.round(percent))}%`;
  };

  // AI 검색 결과가 화면에 활성화된 상태인지 여부
  const isAiSearchActive = isAiSearch && lastSubmittedQuery.trim() !== "";


  // ── 화면에 표시할 목록 결정 ─────────────────────
  // "좋아요한 도서" 정렬이면 좋아요한 책만, 아니면 전체 books
  const likedFilteredBooks =
    sortOrder === "liked"
      ? books.filter((book) => likedIds.includes(String(book.id))) // ← filterdBooks → books
      : books;

  // 정렬 적용 (AI 검색 활성화 시 유사도 높은 순 우선)
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
            if(e.key === "Enter" && !isAiSearch) {
              setSubmittedKeyword(searchKeyword);
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
              setCurrentSearchLogId(null);
              setSearchResults([]);
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
              <strong>AI 지식 연상 결과:</strong> 입력하신 단서로 볼 때{" "}
              <strong>'{aiInferredInfo.title}'</strong> (
              {aiInferredInfo.author || "저자 미상"})과 가장 유관해 보입니다.
              관련성 높은 매칭 결과를 아래에서 확인해 보세요.
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
                  {isAiSearchActive &&
                    similarityScores[book.id] !== undefined && (
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
                        AI 유사도:{" "}
                        {displaySimilarity(similarityScores[book.id])}
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
                    onClick={() => {
                      if(isAiSearchActive && currentSearchLogId) {
                        const clickedResult = searchResults.find((r) => r.id === book.id);
                        if(clickedResult) {
                          logSearchClick({
                            searchLogId: currentSearchLogId,
                            bookId: book.id,
                            rankPosition: searchResults.indexOf(clickedResult) + 1,
                            similarityScore: similarityScores[book.id],
                          });
                        }
                      }
                    }}
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
 