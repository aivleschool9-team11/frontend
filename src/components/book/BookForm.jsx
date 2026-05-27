import { formStyles } from "./FormStyles";

/**
 * BookCreatePage / BookEditPage 공통 입력 필드
 * Props:
 *   form     — { title, author, summary, content }
 *   errors   — useFormValidation의 errors (없으면 빈 객체)
 *   onChange — handleChange 함수
 */
function BookForm({ form, errors = {}, onChange }) {
  return (
    <>
      <div style={formStyles.fieldWrap}>
        <label>
          제목 <span style={{ color: "#e55" }}>*</span>
        </label>
        <input
          name='title'
          value={form.title}
          onChange={onChange}
          placeholder='제목을 입력하세요 (최대 100자)'
          maxLength={100}
          style={{
            ...formStyles.input,
            borderColor: errors.title ? "#e55" : "#ddd",
          }}
        />
        {errors.title && <p style={formStyles.errorMsg}>{errors.title}</p>}
      </div>

      <div style={formStyles.fieldWrap}>
        <label>
          저자 <span style={{ color: "#e55" }}>*</span>
        </label>
        <input
          name='author'
          value={form.author}
          onChange={onChange}
          placeholder='저자를 입력하세요'
          style={{
            ...formStyles.input,
            borderColor: errors.author ? "#e55" : "#ddd",
          }}
        />
        {errors.author && <p style={formStyles.errorMsg}>{errors.author}</p>}
      </div>

      <div style={formStyles.fieldWrap}>
        <label>
          한줄 요약 <span style={{ color: "#e55" }}>*</span>
        </label>
        <input
          name='summary'
          value={form.summary}
          onChange={onChange}
          placeholder='한줄 요약을 입력하세요'
          style={{
            ...formStyles.input,
            borderColor: errors.summary ? "#e55" : "#ddd",
          }}
        />
        {errors.summary && <p style={formStyles.errorMsg}>{errors.summary}</p>}
      </div>

      <div style={formStyles.fieldWrap}>
        <label>
          본문 내용 <span style={{ color: "#e55" }}>*</span>
        </label>
        <textarea
          name='content'
          value={form.content}
          onChange={onChange}
          placeholder='본문 내용을 입력하세요 (최대 5000자)'
          maxLength={5000}
          style={{
            ...formStyles.textarea,
            borderColor: errors.content ? "#e55" : "#ddd",
          }}
        />
        <p
          style={{
            fontSize: "12px",
            color: "#aaa",
            textAlign: "right",
            margin: 0,
          }}
        >
          {form.content.length} / 5000
        </p>
        {errors.content && <p style={formStyles.errorMsg}>{errors.content}</p>}
      </div>
    </>
  );
}

export default BookForm;
