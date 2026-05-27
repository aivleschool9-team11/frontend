import { formStyles } from "./FormStyles";

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
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <button
        type='button'
        onClick={onToggle}
        style={{
          ...formStyles.btn,
          width: "100%",
          padding: "10px 14px",
          background: "#f5f0ff",
          border: "none",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
          color: "#7c3aed",
        }}
      >
        <span>AI 표지 생성</span>
        <span>{showAI ? "▲" : "▼"}</span>
      </button>

      {showAI && (
        <div
          style={{
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            borderTop: "1px solid #eee",
          }}
        >
          <div
            style={{
              height: "300px",
              background: "#f5f5f5",
              borderRadius: "6px",
              border: "1px dashed #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
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
              <span style={{ color: "#bbb", fontSize: "13px" }}>
                표지 생성 후 미리보기
              </span>
            )}
          </div>
          {!previewImage && (
            <button
              type='button'
              onClick={onAIRequest}
              disabled={loading}
              style={{
                ...formStyles.btn,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "13px",
                background: loading ? "#f5f5f5" : "#fff",
              }}
            >
              {loading ? "--- 생성 중 ---" : "AI 표지 생성"}
            </button>
          )}
          {previewImage && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type='button'
                onClick={onAIRequest}
                disabled={loading}
                style={{
                  ...formStyles.btn,
                  flex: 1,
                  padding: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: loading ? "#f5f5f5" : "#fff",
                }}
              >
                {loading ? "--- 생성 중 ---" : "재생성"}
              </button>
              <button
                type='button'
                onClick={onSelectCover}
                disabled={loading}
                style={{
                  ...formStyles.btn,
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #bbb",
                  background: loading ? "#e0e0e0" : "#f0f0f0",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                이 표지 사용
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AICoverSection;
