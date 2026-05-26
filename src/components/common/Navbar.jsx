import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        borderBottom: "1px solid #e5e5e5",
        position: "relative",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "28px",
          fontWeight: "bold",
          flex: 1,
          textAlign: "center",
        }}
      >
        작가의 산책
      </h1>

      <div
        style={{
          display: "flex",
          gap: "12px",
          position: "absolute",
          right: "40px",
        }}
      >
        <Link to="/">
          <button>도서 목록</button>
        </Link>

        <Link to="/books/new">
          <button>도서 등록</button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;