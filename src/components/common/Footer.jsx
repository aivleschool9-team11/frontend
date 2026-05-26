const styles = {
  footer: {
    borderTop: "1px solid #eee",
    padding: "16px 40px",
    textAlign: "left",
    marginTop: "auto",
  },
  text: {
    fontSize: "12px",
    color: "#aaa",
  },
};

function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>©2026 AbleSchool Library, Allright reserved</p>
    </footer>
  );
}

export default Footer;