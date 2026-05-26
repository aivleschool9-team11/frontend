const styles = {
  footer: {
    borderTop: "1px solid #eee",
    padding: "14px 40px",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: "12px",
    color: "#aaa",
  },
};

function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>©2026 AbleSchool Library, All rights reserved</p>
    </footer>
  );
}

export default Footer;
