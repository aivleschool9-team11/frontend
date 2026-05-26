import { useState } from "react";

function useFormValidation() {
  const [errors, setErrors] = useState({});

  const validate = (form) => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "제목을 입력해주세요";
    if (form.title.length > 100)
      newErrors.title = "제목은 100자 이하로 입력해주세요";
    if (!form.author.trim()) newErrors.author = "저자를 입력해주세요";
    if (!form.summary.trim()) newErrors.summary = "한줄 요약을 입력해주세요";
    if (!form.content.trim()) newErrors.content = "본문 내용을 입력해주세요";
    if (form.content.length > 5000)
      newErrors.content = "본문은 5000자 이하로 입력해주세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (name) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return { errors, validate, clearError };
}

export default useFormValidation;
