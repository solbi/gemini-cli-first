# Gemini CLI 프로젝트: 대전 여행 가이드 AI

이 프로젝트는 Gemini AI를 기반으로 대한민국 대전의 여행 가이드 역할을 하는 React 기반 웹 애플리케이션입니다.

## 프로젝트 개요

*   **프레임워크:** React
*   **번들러:** Vite
*   **언어:** TypeScript
*   **주요 의존성:**
    *   `@google/genai`: Gemini API와 상호 작용하기 위해 사용합니다.
    *   `react-markdown`: AI의 Markdown 형식 응답을 렌더링하기 위해 사용합니다.
    *   `lucide-react`: 아이콘을 위해 사용합니다.

## 빌드 및 실행

1.  **의존성 설치:**
    ```bash
    npm install
    ```

2.  **환경 변수 설정:**
    프로젝트 루트에 `.env.local` 파일을 만들고 Gemini API 키를 추가합니다:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

3.  **개발 서버 실행:**
    ```bash
    npm run dev
    ```
    애플리케이션은 `http://localhost:3000`에서 사용할 수 있습니다.

4.  **프로덕션 빌드:**
    ```bash
    npm run build
    ```

5.  **프로덕션 빌드 미리보기:**
    ```bash
    npm run preview
    ```

## 개발 컨벤션

*   이 프로젝트는 타입 안전성을 위해 TypeScript를 사용합니다.
*   컴포넌트는 `src/components` 디렉토리에 있습니다.
*   Gemini API와 상호 작용하는 것과 같은 서비스는 `src/services` 디렉토리에 있습니다.
*   이 프로젝트는 ES 모듈을 사용합니다 (`package.json`의 `"type": "module"`).
*   `@` 별칭은 루트 디렉토리 (`.`)를 가리키도록 구성되어 있습니다.