import {
  Box,
  Button,
  Typography,
  Collapse,
  CircularProgress,
  Paper,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SparklesIcon from "@mui/icons-material/AutoAwesome";

/**
 * AI 표지 생성 섹션
 * Props:
 *   showAI       — 열림 여부
 *   onToggle     — 토글 함수
 *   previewImage — 현재 미리보기 이미지 URL
 *   loading      — AI 생성 중 여부
 *   onAIRequest  — AI 생성 / 재생성 버튼 클릭 핸들러
 *   onSelectCover — "이 표지 사용" 클릭 핸들러
 */
function AICoverSection({
  showAI,
  onToggle,
  previewImage,
  loading,
  onAIRequest,
  onSelectCover,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "primary.light",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <Button
        type='button'
        onClick={onToggle}
        fullWidth
        sx={{
          padding: "12px 16px",
          background: "background.paper",
          color: "text.secondary",
          borderTopLeftRadius: "11px",
          borderTopRightRadius: "11px",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          "&:hover": {
            background: "rgba(201, 141, 26, 0.08)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SparklesIcon sx={{ fontSize: "18px" }} />
          <Typography
            variant='body2'
            sx={{ fontWeight: "bold", fontSize: "14px", fontFamily: "inherit" }}
          >
            AI 표지 생성
          </Typography>
        </Box>
        {showAI ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </Button>

      <Collapse in={showAI}>
        <Box
          sx={{
            padding: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            borderTop: "1px solid",
            borderColor: "primary.light",
          }}
        >
          <Box
            sx={{
              height: "300px",
              background: "background.paper",
              borderRadius: "8px",
              border: "1px dashed",
              borderColor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              position: "relative",
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
              <Typography variant='body2' sx={{ color: "text.secondary" }}>
                표지 생성 후 미리보기
              </Typography>
            )}
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                }}
              >
                <CircularProgress color='secondary' />
                <Typography
                  variant='body2'
                  sx={{ fontWeight: "bold", color: "secondary.main" }}
                >
                  AI가 표지를 그리는 중...
                </Typography>
              </Box>
            )}
          </Box>

          {!previewImage && (
            <Button
              variant='contained'
              onClick={onAIRequest}
              disabled={loading}
              fullWidth
              color='secondary'
              sx={{ py: 1.2 }}
              startIcon={
                loading ? (
                  <CircularProgress size={16} color='inherit' />
                ) : (
                  <SparklesIcon />
                )
              }
            >
              {loading ? "생성 중..." : "AI 표지 생성"}
            </Button>
          )}

          {previewImage && (
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant='outlined'
                onClick={onAIRequest}
                disabled={loading}
                fullWidth
                sx={{
                  borderColor: "primary.light",
                  color: "text.secondary",
                  "&:hover": {
                    borderColor: "primary.main",
                    background: "rgba(201, 141, 26, 0.08)",
                  },
                }}
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : null
                }
              >
                {loading ? "생성 중..." : "재생성"}
              </Button>
              <Button
                variant='contained'
                onClick={onSelectCover}
                disabled={loading}
                fullWidth
                color='secondary'
              >
                이 표지 사용
              </Button>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default AICoverSection;
