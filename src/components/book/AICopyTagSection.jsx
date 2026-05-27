import { formStyles } from "./formStyles";

/**
 * 한줄 카피 + 태그 입력 섹션 (AI 생성 버튼 포함)
 * Props:
 *   summary     — 한줄 요약
 *   copy        — 한줄 카피
 *   tags        — string[]
 *   copyLoading — AI 생성 중 여부
 *   errors      — 유효성 에러 (없으면 빈 객체)
 *   onChange    — 카피 input onChange
 *   onAIRequest  — AI 생성 버튼 클릭 핸들러
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
    <>
      <div style={formStyles.fieldWrap}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <label>
            한줄 요약 <span style={{ color: "#e55" }}>*</span>
          </label>
          <button
            type='button'
            onClick={onAIRequest}
            disabled={copyLoading}
            style={{
              fontSize: "12px",
              padding: "4px 10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: "#fff",
              cursor: copyLoading ? "not-allowed" : "pointer",
              color: "#7c3aed",
            }}
          >
            {copyLoading ? "생성 중..." : "AI 생성"}
          </button>
        </div>
        <input
          name='summary'
          value={summary}
          onChange={onChange}
          placeholder='한줄 요약을 입력하거나 AI로 생성하세요'
          style={{
            ...formStyles.input,
            borderColor: errors.summary ? "#e55" : "#ddd",
          }}
        />
        {errors.summary && <p style={formStyles.errorMsg}>{errors.summary}</p>}
      </div>

      <div style={formStyles.fieldWrap}>
        <label>한줄 카피</label>
        <input
          name='copy'
          value={copy}
          onChange={onChange}
          placeholder='한줄 카피를 입력하거나 AI로 생성하세요'
          style={{
            ...formStyles.input,
            borderColor: errors.copy ? "#e55" : "#ddd",
          }}
        />
        {errors.copy && <p style={formStyles.errorMsg}>{errors.copy}</p>}
      </div>

      <div style={formStyles.fieldWrap}>
        <label>태그</label>
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginBottom: "6px",
          }}
        >
          {tags.map((tag, i) => (
            <span
              key={i}
              onClick={() => onRemove(i)}
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                background: "#f5f0ff",
                borderRadius: "999px",
                color: "#7c3aed",
                cursor: "pointer",
              }}
            >
              {tag} ✕
            </span>
          ))}
        </div>
        <input
          placeholder='#태그 입력 후 Enter'
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const tag = e.target.value.trim();
              if (tag && !tags.includes(tag)) {
                onAdd(tag);
                e.target.value = "";
              }
            }
          }}
          style={formStyles.input}
        />
      </div>
    </>
  );
}

export default AICopyTagSection;
