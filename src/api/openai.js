const OPENAI_IMAGE_API_URL = 'https://api.openai.com/v1/images/generations';

/**
 * OpenAI API를 호출하여 도서 표지 이미지를 생성하는 함수
 * @param {string} title - 도서 제목
 * @param {string} author - 도서 저자
 * @param {string} content - 도서 내용
 * @returns {Promise<string>} Base64 Data URL 형태의 이미지 소스
 */
export const fetchAiCover = async (title, author, content) => {
    console.log("[1/4] 이미지 생성 요청 준비 시작...");
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if(!apiKey){
        console.error('.env 파일에 VITE_OPENAI_API_KEY가 설정되지 않았습니다.');
        throw new Error('API Key가 누락되었습니다.')
    }

    // 당신은 수상 경력에 빛나는 북 커버 디자이너입니다. 다음 세부 정보를 바탕으로 매우 미학적이고 현대적인 도서 표지를 제작해 주세요.
    //
    // [도서 정보]
    // - 제목: "${title}"
    // - 저자: "${author}"
    // - 줄거리: "${content}"
    //
    // [디자인 요구사항]
    // 1. 타이포그래피 (매우 중요): 표지의 메인 제목으로 "${title}"이라는 텍스트를 정확하게 명시해야 합니다. 저자명으로 "${author}"라는 텍스트를 정확하게 명시해야 합니다. 타이포그래피가 우아하고 가독성이 높으며 디자인에 아름답게 조화되도록 하세요.
    // 2. 시각적 테마: "줄거리"를 바탕으로 메인 일러스트레이션이나 배경을 제작하세요. 이야기의 핵심적인 분위기, 배경, 감정을 잘 담아내세요.
    // 3. 아트 스타일: 미니멀리스트, 시네마틱 조명, 고품질 디지털 아트, 베스트셀러 소설에 어울리는 깔끔한 구도.
    // 4. 제한사항: 의미 없는 무작위 알파벳, 외계어 또는 워터마크를 절대 포함하지 마세요. 오직 제공된 정확한 제목과 저자 텍스트만 사용하세요.
    const prompt = `
    You are an award-winning book cover designer. Create a highly aesthetic and modern book cover based on the following details.

    [Book Info]
    - Title: "${title}"
    - Author: "${author}"
    - Synopsis: "${content}"

    [Design Requirements]
    1. TYPOGRAPHY (CRITICAL): You MUST explicitly write the exact text "${title}" as the main title on the cover. You MUST explicitly write the exact text "${author}" as the author's name. Ensure the typography is elegant, highly legible, and beautifully integrated into the design.
    2. VISUAL THEME: Create the main illustration or background based on the "Synopsis". Capture the core mood, setting, and emotion of the story.
    3. ART STYLE: Minimalist, cinematic lighting, high-quality digital art, clean composition suitable for a bestseller novel. 
    4. RESTRICTIONS: Do NOT include any random letters, fake words, or watermarks. Only use the exact Title and Author text provided.
    `;
  

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

        if (!res.ok) {
            throw new Error(`OpenAI 요청 실패: ${res.status}`);
        }

        // 2. 응답 파싱 및 b64_json 추출
        const data = await res.json();
        console.log("[4/4] 데이터 파싱 완료. 이미지 문자열 추출 중...");
        const b64Json = data.data?.[0]?.b64_json;

        // 3. Data URL 형태로 변환하여 반환
        return `data:image/png;base64,${b64Json}`;

    } catch(error){
        console.error("AI 표지 생성 에러: ", error);
        throw error;
    }
};