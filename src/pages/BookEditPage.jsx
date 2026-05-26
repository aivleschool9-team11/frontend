import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
const BASE_URL = "http://localhost:3000/books";

function BookEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState({
    title: "",
    author: "",
    summary: "",
    content: "",
    coverImageUrl: "",
  });

  const [originalBook, setOriginalBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => { 
      try {
        const res = await fetch(`${BASE_URL}/${id}`);
        const data = await res.json();

        setBook({
          title: data.title || "",
          author: data.author || "",
          summary: data.summary || "",
          content: data.content || "",
          coverImageUrl: data.coverImageUrl || "",
        });

        setOriginalBook(data);
      } catch (err) {
        console.error(err);
        setError("도서 정보 불러오기 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBook((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!book.title.trim()) {
      alert("제목을 입력해주세요");
      return false;
    }
    if (!book.author.trim()) {
      alert("저자를 입력해주세요");
      return false;
    }
    if (!book.summary.trim()) {
      alert("한줄 요약을 입력해주세요");
      return false;
    }
    if (!book.content.trim()) {
      alert("내용을 입력해주세요");
      return false;
    }
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!originalBook) return;

    const updatedFields = {};

    Object.keys(book).forEach((key) => {
      if (book[key] !== originalBook[key]) {
        updatedFields[key] = book[key];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    updatedFields.updatedAt = new Date().toISOString();

    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) {
        throw new Error("도서 수정 실패");
      }

      const updatedBook = await res.json();
      console.log("수정 완료:", updatedBook);
      alert("도서 수정 완료");

      navigate(`/books/${id}`);
    } catch (err) {
      console.error(err);
      alert("도서 수정에 실패했습니다.");
    }
  };


  const handleCancel = () => {
    navigate(`/books/${id}`);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }



  
  return (
    <div>
      <h1>Book Edit Page</h1>
    </div>
  );
} 

export default BookEditPage;
