# **📚 AIVLE Book Manager: AI 기반 지능형 도서 관리 플랫폼**

**AIVLE Book Manager**는 단순한 도서 기록을 넘어, 생성형 AI 기술을 통해 도서의 가치를 재발견하고 사용자에게 최적화된 콘텐츠 경험을 제공하는 지능형 도서 관리 플랫폼입니다.


📋 **프로젝트 문서**:[ [노션 페이지](노션링크)](https://www.notion.so/4-368830fac55f8042af32c8b0be19e2f0?source=copy_link)

---

## **🌟 핵심 기능**

### **1. 도서 정보 CRUD 관리**

- 도서의 기본 정보(제목, 저자, 줄거리) 등록, 수정, 조회 및 삭제 기능을 수행합니다.
- 조건별 실시간 검색 및 필터링(최신순, 오래된순, 제목순, 작가명순) 옵션을 제공합니다.

### **2. AI 크리에이티브 콘텐츠 엔진**

- OpenAI API를 연동하여 도서별 AI 핵심 요약본, 감성 광고 카피, SNS 맞춤형 추천 해시태그를 실시간으로 생성합니다.
- OpenAI 이미지 생성 모델(`gpt-image-2`)을 통해 도서의 문맥을 시각화한 맞춤형 북 커버 디자인을 빌드합니다.

### **3. 미디어 및 데이터 영속화**

- 생성된 AI 텍스트 데이터와 Base64 포맷의 커버 이미지를 로컬 가상 DB(`db.json`)에 무결성 있게 저장하여 영속성을 유지합니다.

---

## **🚀 기술적 고도화 포인트**

### **📊 의미론적 맥락 검색 및 쿼리 확장 (Semantic Search & Query Expansion)**

- 단순한 키워드 매칭(`LIKE` 연산자) 검색의 한계를 극복하기 위해, **OpenAI의 Embedding API와 가상 임베딩 행렬(Vector Matrix)을 활용한 시맨틱 검색 및 LLM 쿼리 확장(Query Expansion)** 구조를 구현했습니다.
- 사용자가 "우울할 때 위로가 되는 책"과 같이 문장형 자연어로 검색하면, 입력된 쿼리를 벡터 공간으로 변환한 뒤 줄거리 데이터와의 코사인 유사도를 연산하여 맥락적으로 가장 부합하는 도서 목록을 정렬 및 반환합니다.
- `src/api/openai.js` 엔진과 독립된 프롬프트 모듈 `src/api/prompts.js`를 구조화하여 AI 페르소나와 검색 컨텍스트 주입 로직을 분리 관리합니다.

### **🤖 안정적인 AI 데이터 추출을 위한 JSON Mode 적용**

- `gpt-4o-mini` 모델을 연동하여 단 한 번의 API 호출만으로 브랜드 홍보 카피와 트렌디한 추천 해시태그 조합을 동시에 동적 생성하는 높은 연산 효율성을 가집니다.
- 자연어 출력의 불안정성을 제어하고 프론트엔드 단에서의 파싱 에러(Parsing Error)를 차단하기 위해 OpenAI의 **JSON Mode(`response_format: { type: "json_object" }`)**를 적용했습니다. 시스템 프롬프트 상에 명확한 데이터 스키마를 정의하여 데이터베이스(`db.json`)에 안정적으로 저장되도록 구현했습니다.

### **💾 LocalStorage 찜 상태 및 백엔드 좋아요 카운트 동기화**

- 단순히 클라이언트 단에서만 토글되는 일차원적인 LocalStorage 활용에서 벗어나, 가상 백엔드 데이터와 실시간으로 연동되는 동기화 로직을 구현했습니다.
- 사용자가 좋아요를 클릭하면 프론트엔드의 `state` 변화와 동시에 `LocalStorage`에 사용자별 위시리스트 상태(Wishlist 플래그)를 업데이트하고, Express 백엔드로 `PATCH` 비동기 요청을 보내 전체 좋아요 카운트 데이터를 실시간으로 일치시킵니다.

### **📥 Base64 Data URL 활용 미디어 다운로드**

- OpenAI 이미지 생성 API를 통해 반환받은 고해상도 이미지 데이터를 **Base64 인코딩 스트링(Data URL)** 형태로 가상 데이터베이스에 영속화했습니다.
- 저장된 데이터는 클라이언트 단에서 HTML5 `<a>` 태그의 `download` 속성을 활용해 별도의 추가 서버 네트워크 비용이나 복잡한 바이너리 변환 과정 없이, 클릭 한 번으로 즉시 로컬 환경에 안전하게 다운로드되도록 유연한 UX를 구축했습니다.

### **🎨 MUI v9 테마 시스템 기반 전역 디자인 시스템 구축**

- 개별 컴포넌트에 스타일 속성을 하드코딩하는 방식을 배제하고, 차세대 프론트엔드 스타일 스펙인 **Material-UI (MUI v9) 라이브러리의 `ThemeProvider` 아키텍처**를 도입했습니다.
- 디자인 시스템 관리 파일인 `src/theme.js`에서 애플리케이션 전체의 스타일 토큰(Color Palette, Typography, Elevation Shadow, Border-radius 등)을 중앙 집중식으로 통제합니다.
- 구조와 유효성 검사 커스텀 훅(`useFormValidation.js`)이 완벽히 동일한 등록/수정 화면 레이아웃을 단일 `BookForm.jsx` 공통 컴포넌트로 통합 구현하여 컴포넌트 재사용성을 높였습니다.

---

## **🛠 기술 스택**

| **구분** | **기술 스택** |
| --- | --- |
| **Frontend** | React 19, Vite, React Router DOM (v7) |
| **Backend** | Node.js, Express, JSON-Server |
| **AI API** | OpenAI (GPT-image-2, gpt-4o-mini) |
| **Infrastructure** | LocalStorage, Custom Data Pipeline |

---

## **🏃 시작하기**

### **1. 환경 변수 설정**

루트 디렉토리에 `.env` 파일을 생성하고 OpenAI API 키를 설정합니다.

```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### **2. 설치 및 실행**

```bash
# 의존성 설치
npm install

# 백엔드 서버 실행 (Port: 3000)
npm run server

# 프론트엔드 개발 서버 실행 (Port: 5173)
npm run dev
```

---

## **📂 프로젝트 구조 (Project Structure)**

```
src/
├── api/          # API 통신 로직 및 OpenAI 프롬프트 정의
│   ├── books.js      # 도서 관련 API (CRUD)
│   ├── openai.js     # OpenAI 호출 엔진
│   └── prompts.js    # AI 페르소나 및 프롬프트 템플릿
├── components/   # 공통 레이아웃 컴포넌트
├── hooks/        # 유효성 검사 등 재사용 로직
├── pages/        # 주요 서비스 페이지
│   ├── BookListPage.jsx    # 검색/정렬/필터링 기능 포함
│   ├── BookDetailPage.jsx  # 좋아요/삭제 기능 포함
│   ├── BookCreatePage.jsx  # AI 콘텐츠 생성 기능 포함
│   └── BookEditPage.jsx    # 정보 수정 및 이미지 업데이트
└── App.jsx       # 라우팅 및 전역 레이아웃 설정
```

---
## **📷시연 영상 및 스크린샷**

https://github.com/user-attachments/assets/d9667dda-47a5-4042-9896-a0064c6a7414

<H3>도서 목록</H3>
<img width="1920" height="2569" alt="도서 목록" src="https://github.com/user-attachments/assets/6610d7cd-9de4-4acc-9759-3345310d8098" />
<H3>도서 등록</H3>
<img width="1920" height="1254" alt="도서 등록" src="https://github.com/user-attachments/assets/6c0e1df4-c6b3-4d61-bbf1-5b953f2d83ff" />
<H3>도서 입력 후</H3>
<img width="1920" height="1319" alt="도서 등록 입력 후 (1)" src="https://github.com/user-attachments/assets/2d771b48-c881-4cae-9b49-221b4560f7d4" />
<img width="1920" height="1319" alt="도서 등록 입력 후" src="https://github.com/user-attachments/assets/ecde1448-92bd-4cfb-b899-ce4e9f0ccbf7" />
<H3>도서 수정</H3>
<img width="1920" height="1319" alt="도서 수정" src="https://github.com/user-attachments/assets/29ab82d9-55db-4f23-9125-239608b97e3f" />

