function App() {
  return (
    <div style={{ padding: "30px" }}>
      <h1>작가의 산책</h1>

      <h2>도서 목록</h2>

      {/* 가로 스크롤 영역 */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          overflowX: "scroll",
          paddingBottom: "20px",
        }}
      >
        {/* 첫 번째 카드 */}
        <div
          style={{
            minWidth: "250px",
            border: "1px solid lightgray",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          {/* no image */}
          <div
            style={{
              width: "100%",
              height: "250px",
              backgroundColor: "#f1f1f1",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "15px",
              borderRadius: "8px",
              color: "gray",
              fontWeight: "bold",
            }}
          >
            NO IMAGE
          </div>

          <h3>어린 왕자</h3>

          <p>저자 : 생텍쥐페리</p>

          <p>어른들을 위한 따뜻한 이야기</p>

          <button>상세보기</button>
        </div>

        {/* 두 번째 카드 */}
        <div
          style={{
            minWidth: "250px",
            border: "1px solid lightgray",
            borderRadius: "10px",
            padding: "20px",
          }}
        >      <section id="next-steps">        <div id="docs">          <svg className="icon" role="presentation" aria-hidden="true">            <use href="/icons.svg#documentation-icon"></use>          </svg>          <h2>Documentation</h2>          <p>Your questions, answered</p>          <ul>            <li>
          {/* no image */}
          <div
            style={{
              width: "100%",
              height: "250px",
              backgroundColor: "#f1f1f1",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "15px",
              borderRadius: "8px",
              color: "gray",
              fontWeight: "bold",
            }}
          >
            NO IMAGE
          </div>

          <h3>데미안</h3>

          <p>저자 : 헤르만 헤세</p>

          <p>자아를 찾아가는 성장 이야기</p>

          <button>상세보기</button>
        </div>

        {/* 세 번째 카드 */}
        <div
          style={{
            minWidth: "250px",
            border: "1px solid lightgray",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          {/* no image */}
          <div
            style={{
              width: "100%",
              height: "250px",
              backgroundColor: "#f1f1f1",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "15px",
              borderRadius: "8px",
              color: "gray",
              fontWeight: "bold",
            }}
          >
            NO IMAGE
          </div>

          <h3>죄와 벌</h3>

          <p>저자 : 도스토예프스키</p>

          <p>인간의 죄와 양심을 다룬 소설</p>

          <button>상세보기</button>
        </div>
      </div>

      <footer style={{ marginTop: "40px" }}>
        작가의 산책 ©2026 Team 9
      </footer>
    </div>
  );
}

export default App;
