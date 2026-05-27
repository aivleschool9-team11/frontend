import { getCoverDesignerPrompt, MARKETER_SYSTEM_PROMPT } from "./prompts";

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
    } catch (e) {
      console.error("AI가 JSON 형식을 지키지 않았습니다:", data.choices[0].message.content);
      throw new Error("데이터 파싱 실패");
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
            content: `너는 사용자가 도서 데이터베이스를 검색할 때 검색어를 풍부하게 확장해주는 AI 검색 도우미야.

[중요 지침]
현재 도서관 데이터베이스에 실제로 소장(등록)된 도서 리스트는 다음과 같아:
${bookListContext || "소장 도서 없음"}

사용자가 책 제목을 기억하지 못하고 기억나는 줄거리, 인물, 분위기, 혹은 오타가 섞인 키워드 등으로 검색할 때, 위 [소장 도서 리스트]에서 사용자가 찾으려고 하는 실제 책의 유력한 제목(inferredTitle), 저자(inferredAuthor)를 매칭해줘.
★반드시 제공된 [소장 도서 리스트]에 존재하는 책만 inferredTitle과 inferredAuthor로 매칭해서 반환해야 해. 목록에 없는 다른 고전이나 유명 작품(예: 사랑의 불시착 등)을 지어내거나 추론해서 매칭해서는 안 돼! 만약 리스트에서 연관 도서를 찾을 수 없다면 inferredTitle과 inferredAuthor는 빈 문자열("")로 채워줘.

또한 시맨틱 검색 성능을 높이기 위해, 입력받은 검색어 및 소장 도서의 키워드들과 관련된 핵심 동의어 및 연상 키워드들(expandedKeywords)은 네 지식을 자유롭게 덧붙여서 채워줘.
JSON 형식 예시:
{
  "inferredTitle": "노인과 바다",
  "inferredAuthor": "어니스트 헤밍웨이",
  "expandedKeywords": "청새치, 바다, 어부, 사투, 상어, 헤밍웨이"
}
또는 매칭되는 책이 소장 도서 리스트에 없는 경우 예시:
{
  "inferredTitle": "",
  "inferredAuthor": "",
  "expandedKeywords": "사랑, 군인, 북한, 불시착, 로맨스"
}`
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

/**
 * 두 1536차원 벡터 간의 코사인 유사도(dot product)를 계산하는 함수
 * (OpenAI 임베딩은 이미 정규화되어 있으므로 단순 내적으로 계산 가능)
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} 유사도 점수 (-1 ~ 1)
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  if (vecA.length !== vecB.length) return 0;
  return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
};