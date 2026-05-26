import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import BookListPage from "./pages/BookListPage";
import BookDetailPage from "./pages/BookDetailPage";
import BookCreatePage from "./pages/BookCreatePage";
import BookEditPage from "./pages/BookEditPage";

function App() {
  return (
    <BrowserRouter>
      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Navbar />
        <main style={{ flex: 1, padding: "32px 40px" }}>
          <Routes>
            <Route path="/" element={<BookListPage />} />
            <Route path="/books-db/new" element={<BookCreatePage />} />
            <Route path="/books-db/:id" element={<BookDetailPage />} />
            <Route path="/books-db/:id/edit" element={<BookEditPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
