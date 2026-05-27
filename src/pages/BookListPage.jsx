import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks } from "../api/books";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Paper,
  Button,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

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

  const filterdBooks = books.filter(
    (book) =>
      book.title.includes(searchKeyword) || book.author.includes(searchKeyword),
  );

  const likedFilteredBooks =
    sortOrder === "liked"
      ? filterdBooks.filter((book) => likedIds.includes(String(book.id)))
      : filterdBooks;

  const sortedBooks = [...likedFilteredBooks].sort((a, b) => {
    if (sortOrder === "newest")
      return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOrder === "oldest")
      return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOrder === "title") return a.title.localeCompare(b.title);
    if (sortOrder === "author") return a.author.localeCompare(b.author);
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
          gap: 1.5,
          mb: 4.5,
          maxWidth: "800px",
          mx: "auto",
        }}
      >
        <TextField
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder='제목 또는 저자 검색'
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
            },
          }}
        />
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
          <MenuItem value='liked'>좋아요한 책</MenuItem>
        </Select>
      </Box>

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
                      좋아요
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
