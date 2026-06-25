# 프론트엔드 배포 가이드 — API 호출 통일 & OpenAI 키 주입

> 대상: 팀 전원 (프론트/백엔드/인프라)
> 관련 PR: `fix/api-base-path`, `chore/openai-key-build-injection`

배포 환경에서 **API가 안 되던 문제**와 **OpenAI 키 처리**를 정리했습니다. 아래대로 맞춰주세요.

---

## 1. 개요 — 무엇이 왜 바뀌었나

### 문제
- 기존 프론트가 API를 `http://localhost:8080`으로 **하드코딩** 호출 → 배포 시 방문자 PC의 8080을 부르게 되어 **모든 API 실패**.
- OpenAI 키가 배포 빌드에 없어서 **AI 기능(표지/카피/임베딩/검색) 동작 안 함**.

### 해결 방향
- **API 호출**: 배포는 상대경로 `/api`로 통일 → 프론트(nginx)와 백엔드를 **같은 오리진**으로 호출 (CORS 불필요).
- **OpenAI 키**: 빌드 시 **SSM 파라미터스토어**(`/bookapp/openai_api/key`)에서 가져와 주입.

---

## 2. API 호출 통일 (`/api`)

### 코드 구조
`src/api/books.js`, `src/api/search.js`:
```js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
```
환경별 `.env` 파일로 자동 전환됩니다 (Vite 기능):

| 파일 | 로드 시점 | 값 | 커밋 여부 |
|---|---|---|---|
| `.env.development` | `npm run dev` (로컬) | `http://localhost:8080/api` | ✅ 커밋됨 |
| `.env.production` | `npm run build` (배포) | `/api` (상대경로) | ✅ 커밋됨 |

> 비밀이 아닌 URL이라 두 파일은 `.gitignore` 예외 처리하여 **커밋**합니다. (진짜 비밀키는 `.env`에만 두고 계속 무시)

### 배포 시 호출 흐름
```
브라우저 → /api/books (상대경로, 동일 오리진)
         → nginx (정적 프론트 서빙 + /api 리버스 프록시)
         → Spring 백엔드 (8080)
```

---

## 3. 역할별 할 일 ✅

### 🧑‍💻 프론트 개발자 (로컬에서 돌릴 때)
1. `git pull` — `.env.development`/`.env.production`은 이미 레포에 포함, 따로 안 만들어도 됨.
2. **로컬 AI 기능 쓰려면** `.env` 파일을 직접 만들어 OpenAI 키 입력 (`.env`는 gitignore라 각자 생성):
   ```bash
   # 프로젝트 루트에 .env 생성
   VITE_OPENAI_API_KEY=sk-...본인_또는_공용_키...
   ```
3. `npm run dev` → `http://localhost:5173`. **로컬 백엔드(8080)가 `/api` context-path로 떠 있어야** API가 됨.

### 🛠️ 백엔드 담당
- **Spring `context-path: /api` 적용** (또는 nginx가 `/api`를 떼고 넘기면 context-path 불필요 — 아래 4번 참고).
- CORS는 같은 오리진(nginx 프록시)이면 **불필요**.

### ☁️ 인프라 담당
1. **nginx**: 정적 프론트 서빙 + `/api` 요청을 Spring(**8080**)으로 리버스 프록시.
   - (이전 이슈) nginx가 백엔드를 8000으로 보고 있었음 → **8080으로 수정 필요**.
2. **CodeBuild 서비스 역할 권한** (OpenAI 키 주입용):
   - `ssm:GetParameters`
   - 키가 SecureString이면 `kms:Decrypt`
   - 없으면 빌드가 `parameter-store` 단계에서 **즉시 실패**합니다.

---

## 4. ⚠️ `/api` 경로 합의 (꼭 맞추기)

nginx가 `/api`를 **떼고** 넘기는지 **붙여서** 넘기는지에 따라 Spring 설정이 달라집니다:

| nginx 동작 | 예시 설정 | Spring context-path |
|---|---|---|
| `/api` **떼고** 전달 | `location /api/ { proxy_pass http://localhost:8080/; }` | **없음** (`/books`로 받음) |
| `/api` **붙여서** 전달 | `location /api/ { proxy_pass http://localhost:8080; }` | **`/api`** (`/api/books`로 받음) |

> 프론트는 어느 쪽이든 `/api/...`로 호출하므로 **인프라+백엔드만** 둘 중 하나로 합의하면 됩니다.

---

## 5. OpenAI 키 빌드 주입

### 동작 흐름
```
SSM /bookapp/openai_api/key
  → CodeBuild(env.parameter-store)가 가져옴 → $VITE_OPENAI_API_KEY
  → build 단계에서 .env.production.local 에 기록 (*.local → gitignore)
  → Vite build 가 읽어 번들에 주입
  → 브라우저에서 OpenAI 직접 호출
```
- 코드 변경 없음 (`src/api/openai.js`는 이미 `import.meta.env.VITE_OPENAI_API_KEY` 사용).
- buildspec에 `env.parameter-store` + `.env.production.local` 기록 단계 추가됨.

### ⚠️ 보안 주의 (중요)
- 프론트에서 직접 호출하는 구조라 **키가 JS 번들에 박혀 브라우저에 노출됩니다.** (미니프로젝트용 의도된 trade-off)
- 그래서 **반드시**:
  1. OpenAI 대시보드에서 이 키에 **지출 한도(usage limit) 설정**
  2. **데모/평가 종료 후 키 폐기(rotate)**
- 진짜 비밀로 지키려면 백엔드 프록시(`/api/ai/*`)로 옮겨야 하지만, 이번엔 프론트 호출로 합의함.

---

## 6. 🚦 머지 / 배포 순서 (안 지키면 잠깐 다 깨짐)

1. **백엔드 `/api` (context-path or nginx 라우팅) + nginx 8080 수정** 먼저 배포 (백엔드/인프라)
2. **CodeBuild 역할에 SSM 권한** 부여 확인 (인프라)
3. 그다음 프론트 PR 머지 → 재배포

> 프론트만 먼저 배포되면 `/api/...`를 부르는데 백엔드 경로가 아직 안 맞아 **그 사이엔 API가 깨집니다.**

---

## 7. 트러블슈팅

| 증상 | 원인 | 조치 |
|---|---|---|
| 배포 후 API 404 | nginx `/api` 라우팅 ↔ Spring context-path 불일치 | 4번 합의 확인 |
| 배포 후 API 연결 안 됨 | nginx가 백엔드 8000으로 프록시 | nginx 8080으로 수정 |
| 빌드가 parameter-store에서 실패 | CodeBuild 역할에 SSM 권한 없음 | `ssm:GetParameters`(+`kms:Decrypt`) 부여 |
| AI 기능만 실패 (로컬) | 로컬 `.env`에 `VITE_OPENAI_API_KEY` 없음 | 루트에 `.env` 생성 후 키 입력 |
| 로컬 API 404 | 로컬 백엔드가 `/api` 안 붙음 | 로컬도 `/api` context-path로 실행 |
