import { getCoverDesignerPrompt, MARKETER_SYSTEM_PROMPT } from "./prompts";

const OPENAI_IMAGE_API_URL = 'https://api.openai.com/v1/images/generations';
const OPENAI_TEXT_API_URL = 'https://api.openai.com/v1/chat/completions';
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * OpenAI API를 호출하여 도서 표지 이미지를 생성하는 함수
 * @param {string} title - 도서 제목
 * @param {string} author - 도서 저자
 * @param {string} content - 도서 내용
 * @returns {Promise<string>} Base64 Data URL 형태의 이미지 소스
 */
export const fetchAiCover = async (title, author, content) => {
    console.log("[1/4] 이미지 생성 요청 준비 시작...");
    
    if(!apiKey){
        console.error('.env 파일에 VITE_OPENAI_API_KEY가 설정되지 않았습니다.');
        throw new Error('API Key가 누락되었습니다.')
    }

    const prompt = getCoverDesignerPrompt(title, author, content);
  
    try{
        console.log("[2/4] OpenAI 서버에 POST 요청 전송 중...");
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

        console.log("[3/4] 응답 수신 완료 (Status):", res.status);

        if (!res.ok) throw new Error(`OpenAI 요청 실패: ${res.status}`);
        

        // 2. 응답 파싱 및 b64_json 추출
        const data = await res.json();
        console.log("[4/4] 데이터 파싱 완료. 이미지 문자열 추출 중...");
        const b64Json = data.data?.[0]?.b64_json;

        // 3. Data URL 형태로 변환하여 반환
        return `data:image/png;base64,${b64Json}`;

    } catch(err){
        console.error("AI 표지 생성 에러: ", err.message);
        throw error;
    }
};

/**
 * AI 마케터: 책 제목과 줄거리를 바탕으로 한 줄 요약, 홍보 카피, 태그를 생성.
 * @param {string} title - 도서 제목
 * @param {string} content - 도서 내용
 * @returns {object} { summary: "객관적 요약", copy: "홍보용 카피", tags: ["#태그1", "#태그2"] }
 */
export const fetchAiCopyAndTags = async (title, content) => {
  console.log(`\n[AI 마케터] '${title}' 도서의 요약, 카피 및 태그 생성 요청 중... (약 2~5초 소요)`);
  
  if(!apiKey){
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