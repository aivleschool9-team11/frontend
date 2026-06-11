import {
  Box,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
} from "@mui/material";
import SparklesIcon from "@mui/icons-material/AutoAwesome";

/**
 * 한줄 요약 + 한줄 카피 + 태그 입력 섹션 (AI 생성 버튼 포함)
 * Props:
 *   summary     — 한줄 요약
 *   copy        — 한줄 카피
 *   tags        — string[]
 *   copyLoading — AI 생성 중 여부
 *   errors      — 유효성 에러 (없으면 빈 객체)
 *   onChange    — summary/카피 input onChange
 *   onAIRequest — AI 생성 버튼 클릭 핸들러
 *   onAdd       — (tag: string) => void
 *   onRemove    — (index: number) => void
 */
function AICopyTagSection({
  summary,
  copy,
  tags,
  copyLoading,
  errors = {},
  onChange,
  onAIRequest,
  onAdd,
  onRemove,
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* 한줄 요약 필드 (AI 생성 버튼 탑재) */}
      <TextField
        name='summary'
        label='한줄 요약'
        value={summary}
        onChange={onChange}
        placeholder='한줄 요약을 입력하거나 AI로 생성하세요'
        error={!!errors.summary}
        helperText={errors.summary}
        fullWidth
        required
        variant='outlined'
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={onAIRequest}
                  disabled={copyLoading}
                  startIcon={
                    copyLoading ? (
                      <CircularProgress size={12} color='inherit' />
                    ) : (
                      <SparklesIcon />
                    )
                  }
                  sx={{
                    backgroundColor: "background.paper",
                    borderColor: "primary.light",
                    color: "text.secondary",
                    fontSize: "12px",
                    py: 0.5,
                    px: 1.5,
                    borderRadius: "8px",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "rgba(201, 141, 26, 0.08)",
                    },
                  }}
                >
                  {copyLoading ? "생성 중..." : "AI 생성"}
                </Button>
              </InputAdornment>
            ),
          },
        }}
      />

      {/* 한줄 카피 필드 */}
      <TextField
        name='copy'
        label='한줄 카피'
        value={copy}
        onChange={onChange}
        placeholder='한줄 카피를 입력하거나 AI로 생성하세요'
        error={!!errors.copy}
        helperText={errors.copy}
        fullWidth
        variant='outlined'
      />

      {/* 태그 영역 */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {tags.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
            {tags.map((tag, i) => (
              <Chip
                key={i}
                label={tag}
                onDelete={() => onRemove(i)}
                variant='outlined'
                sx={{
                  backgroundColor: "background.paper",
                  color: "text.secondary",
                  fontFamily: "inherit",
                  "& .MuiChip-deleteIcon": {
                    color: "text.secondary",
                    "&:hover": { color: "text.primary" },
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AICopyTagSection;
