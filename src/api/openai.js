import { getCoverDesignerPrompt, MARKETER_SYSTEM_PROMPT, getQueryExpansionPrompt } from "./prompts";

const OPENAI_IMAGE_API_URL = 'https://api.openai.com/v1/images/generations';
const OPENAI_TEXT_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_EMBEDDING_API_URL = 'https://api.openai.com/v1/embeddings';
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * OpenAI API를 호출하여 입력 텍스트의 1536차원 벡터 임베딩을 가져오는 함수
 * @param {string} text - 임베딩할 대상 텍스트
 * @returns {Promise<number[]>} 1536차원 임베딩 벡터 배열
 */
export const fetchAiEmbedding = async (text) => {
  if (!text || !text.trim()) return [];

  if (!apiKey) {
    console.error('.env 파일에 VITE_OPENAI_API_KEY가 설정되지 않았습니다.');
    throw new Error('API Key가 누락되었습니다.');
  }

  try {
    const res = await fetch(OPENAI_EMBEDDING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.trim(),
      }),
    });

    if (!res.ok) throw new Error(`OpenAI Embedding 요청 실패: ${res.status}`);

    const data = await res.json();
    return data.data?.[0]?.embedding || [];
  } catch (err) {
    console.error("AI 임베딩 생성 에러: ", err.message);
    throw err;
  }
};

/**
 * OpenAI API를 호출하여 도서 표지 이미지를 생성하는 함수
 * @param {string} title - 도서 제목
 * @param {string} author - 도서 저자
 * @param {string} content - 도서 내용
 * @returns {Promise<string>} Base64 Data URL 형태의 이미지 소스
 */
export const fetchAiCover = async (title, author, content) => {

  if (!apiKey) {
    console.error('.env 파일에 VITE_OPENAI_API_KEY가 설정되지 않았습니다.');
    throw new Error('API Key가 누락되었습니다.')
  }

  const prompt = getCoverDesignerPrompt(title, author, content);

  try {
    const res = await fetch(OPENAI_IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,

      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt,
        n: 1,
        size: '1024x1536',
        quality: 'low',
        output_format: 'png'
      }),
    });

    if (!res.ok) throw new Error(`OpenAI 요청 실패: ${res.status}`);

    const data = await res.json();
    const b64Json = data.data?.[0]?.b64_json;

    return `data:image/png;base64,${b64Json}`;

  } catch (err) {
    console.error("AI 표지 생성 에러: ", err.message);
    throw err;
  }
};

/**
 * AI 마케터: 책 제목과 줄거리를 바탕으로 한 줄 요약, 홍보 카피, 태그를 생성.
 * @param {string} title - 도서 제목
 * @param {string} content - 도서 내용
 * @returns {object} { summary: "객관적 요약", copy: "홍보용 카피", tags: ["#태그1", "#태그2"] }
 */
export const fetchAiCopyAndTags = async (title, content) => {

  if (!apiKey) {
    console.error('.env 파일에 VITE_OPENAI_API_KEY가 설정되지 않았습니다.');
    throw new Error('API Key가 누락되었습니다.')
  }

  try {
    const res = await fetch(OPENAI_TEXT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: MARKETER_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: `Title: ${title}\nSynopsis: ${content}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI 요청 실패: ${res.status}`);

    const data = await res.json();

    try {
      return JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error("AI가 JSON 형식을 지키지 않았습니다:", data.choices[0].message.content);
      throw new Error("데이터 파싱 실패", { cause: parseError });
    }

  } catch (err) {
    console.error("AI 마케터 생성 에러", err.message);
    throw err;
  }
};

/**
 * 사용자의 단서 검색어를 받아 LLM의 자체 지식으로 도서명/작가/연관 키워드를 추론(Query Expansion)하는 함수.
 * 데이터베이스 내에 존재하는 책 목록을 함께 받아 추론 범위를 제한합니다.
 * @param {string} query - 사용자의 자연어 검색 쿼리
 * @param {string} bookListContext - 현재 DB에 등록된 도서 목록 정보
 * @returns {Promise<{inferredTitle: string, inferredAuthor: string, expandedKeywords: string}>}
 */
export const fetchExpandedQuery = async (query, bookListContext = "") => {
  if (!query || !query.trim()) {
    return { inferredTitle: "", inferredAuthor: "", expandedKeywords: "" };
  }

  if (!apiKey) {
    console.error('.env 파일에 VITE_OPENAI_API_KEY가 설정되지 않았습니다.');
    throw new Error('API Key가 누락되었습니다.');
  }

  try {
    const res = await fetch(OPENAI_TEXT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: getQueryExpansionPrompt(bookListContext)
          },
          {
            role: "user",
            content: `사용자 검색어: ${query}`
          }
        ],
        temperature: 0.2, // 일관된 판단을 위해 온도를 낮춤
      }),
    });

    if (!res.ok) throw new Error(`OpenAI Chat 요청 실패: ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.error("Query Expansion 실패:", err);
    return { inferredTitle: "", inferredAuthor: "", expandedKeywords: "" };
  }
};