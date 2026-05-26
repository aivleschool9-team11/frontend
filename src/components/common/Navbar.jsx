import { Link } from "react-router-dom";

const styles = {
  nav: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "14px 40px",
    borderBottom: "1px solid #eee",
    backgroundColor: "#fff",
    position: "relative",
  },
  logo: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#222",
    textDecoration: "none",
  },
  btnWrap: {
    display: "flex",
    gap: "8px",
    position: "absolute",
    right: "40px",
  },
  btn: {
    padding: "6px 16px",
    border: "1px solid #ddd",
    borderRadius: "999px",
    background: "#fff",
    fontSize: "13px",
    color: "#444",
    textDecoration: "none",
    display: "inline-block",
  },
};

function Navbar() {
  return (
    <nav style={styles.nav}>
      <Link to='/' style={styles.logo}>
        작가의 산책
      </Link>
      <div style={styles.btnWrap}>
        <Link to='/' style={styles.btn}>
          도서 목록
        </Link>
        <Link to='/books/new' style={styles.btn}>
          도서 등록
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
