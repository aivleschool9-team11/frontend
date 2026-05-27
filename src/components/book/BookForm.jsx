import { TextField, Box } from "@mui/material";

/**
 * BookCreatePage / BookEditPage 공통 입력 필드 (한줄 요약 summary는 AICopyTagSection으로 이전됨)
 * Props:
 *   form     — { title, author, content }
 *   errors   — useFormValidation의 errors (없으면 빈 객체)
 *   onChange — handleChange 함수
 */
function BookForm({ form, errors = {}, onChange }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <TextField
        name='title'
        label='제목'
        value={form.title}
        onChange={onChange}
        placeholder='제목을 입력하세요 (최대 100자)'
        slotProps={{
          input: {
            maxLength: 100,
          },
        }}
        error={!!errors.title}
        helperText={errors.title}
        fullWidth
        required
        variant='outlined'
      />

      <TextField
        name='author'
        label='저자'
        value={form.author}
        onChange={onChange}
        placeholder='저자를 입력하세요'
        error={!!errors.author}
        helperText={errors.author}
        fullWidth
        required
        variant='outlined'
      />

      <TextField
        name='content'
        label='본문 내용'
        value={form.content}
        onChange={onChange}
        placeholder='본문 내용을 입력하세요 (최대 5000자)'
        slotProps={{
          input: {
            maxLength: 5000,
          },
        }}
        error={!!errors.content}
        helperText={errors.content || `${form.content.length} / 5000`}
        fullWidth
        multiline
        rows={6}
        required
        variant='outlined'
      />
    </Box>
  );
}

export default BookForm;
