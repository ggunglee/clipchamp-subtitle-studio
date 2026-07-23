# 🎬 Clipchamp Subtitle Studio Pro

> **마이크로소프트 Clipchamp & 주요 동영상 편집 프로그램용 모션 자막, 그래프 & 오디오 음파 생성기**

본 프로젝트는 마이크로소프트 Clipchamp, Adobe Premiere Pro, CapCut, DaVinci Resolve 등의 영상 편집 프로그램 타임라인에 바로 올릴 수 있는 **고화질 투명 PNG 자막**, **60fps 모션 비디오(Alpha WebM)**, **대사 일괄 생성(ZIP)**, **모션 차트 그래프**, 그리고 **실시간 음성 다이내믹 음파 비주얼라이저**를 생성해주는 로컬 스튜디오 웹 앱입니다.

---

## 🚀 1초 만에 실행하기 (1-Click Run)

프로젝트 폴더 안의 **`실행하기.bat`** 파일(또는 **`Run_Studio.bat`**)을 마우스로 더블 클릭하면 자동으로 서버가 구동되며 웹 브라우저가 열립니다!

```bash
# 터미널에서 직접 실행할 경우
npm run dev
```
- 브라우저 접속 주소: `http://localhost:5173/`

---

## 🌟 핵심 기능 안내

### 1. 🎬 모션 자막 & 그래픽 타이틀 생성기
- **실시간 프리뷰**: 유튜브(16:9), 쇼츠/릴스(9:16), 인스타(1:1) 비율 지원
- **디자인 템플릿**: 셜록 딥그린, 시사 뉴스, 핫이슈 3D, 모노크롬, 키치 파스텔 등 프리셋 제공
- **커스텀 조절**: 폰트, 자간, 행간, 회전, 그림자, 테두리, 배경 박스, 위치 슬라이더
- **단일 내보내기**: `투명 PNG` 및 60fps `알파 WebM 모션 비디오` 추출

### 2. 📚 대사 일괄 생성기 (ZIP Batch)
- 여러 줄의 대사를 한 번에 입력하면 개별 자막 이미지로 한 번에 압축 생성하여 ZIP 파일로 추출

### 3. 📊 모션 차트 생성기 (Motion Chart Builder)
- **9가지 차트 지원**: 도넛 링, 파이 차트, 수직 막대, 가로 랭킹, 꺾은선 추세선, 면적 영역, 스파이더 력, 피라미드, 프로그레스 링
- **9가지 디자인 테마**: 셜록, 시사 뉴스, 핫이슈 3D, 모노크롬 시크 블랙, 퓨어 화이트, 키치 파스텔, 사이버 펑크, 레트로 신스웨이브 등
- **디자인 세부 조절**: 메인 타이틀 제목 글자색 개별 지정, 본체 전체 크기 스케일(`chartScale`), 막대/선 두께(`strokeThickness`), 제목/항목 글자 크기 분리 슬라이더
- **배경 포함 여부 선택 (`includeBackground`)**: 체크 해제 시 100% 투명 배경, 체크 시 전용 무드 테마 배경 포함 추출

### 4. 🎵 다이내믹 음파 비주얼라이저 Studio (Audio Waveform Studio)
- **실시간 Web Audio API 분석**: 음성 오디오 파일(`.mp3`, `.wav`, `.m4a`, `.ogg` 등)을 올리면 주파수를 실시간 추적하여 목소리에 맞춰 파형이 dynamic하게 점프
- **5가지 파형 스타일**:
  1. 📊 **클래식 바 이퀄라이저 (`bar-spectrum`)**: 세로 주파수 바 바운싱
  2. 🌊 **오실로스코프 시누소이드 (`oscilloscope-line`)**: 부드러운 사인 파형
  3. ⭕ **라디알 음파 링 (`radial-ring`)**: 방사형 원형 펄스 링
  4. 📈 **팟캐스트 덴스 파형 (`podcast-dense`)**: 방송용 고밀도 대칭 피크 파형
  5. 💡 **네온 구름 아우라 (`neon-aura`)**: 발광 네온 아우라 파형
- **투명 알파 WebM 비디오 추출**: Clipchamp 오버레이 트랙 최적화

---

## 📁 프로젝트 파일 구조 & 역할 설명

문제가 생기거나 코드를 수정할 때 참고할 수 있는 주요 파일 구조입니다:

```
clipchamp-subtitle-studio/
├── 실행하기.bat                   # 🚀 1클릭 자동 실행 스크립트 (Windows Batch)
├── index.html                    # 메인 HTML & 구글 폰트(Noto Serif KR, Nanum Myeongjo 등) 로드
├── package.json                  # 프로젝트 의존성 라이브러리 및 스크립트 설정
├── vite.config.ts                # Vite 빌드 & 서버 개발 환경 설정
├── src/
│   ├── main.tsx                  # React 엔트리 포인트
│   ├── App.tsx                   # 메인 레이아웃 및 모달 상태 관리
│   ├── index.css                 # Tailwind CSS & 전역 스타일 지정
│   │
│   ├── types/                    # 타입 정의 파일 모음
│   │   ├── subtitle.ts           # 자막 템플릿 & 프리뷰 설정 타입
│   │   ├── chart.ts              # 차트 9종, 테마 9종, 슬라이더 Config 타입
│   │   └── waveform.ts           # 음파 파형 5종, Web Audio Config 타입
│   │
│   ├── utils/                    # 캔버스 그래픽 렌더링 & 추출 엔진 모음
│   │   ├── canvasRenderer.ts     # 자막 캔버스 렌더러
│   │   ├── chartCanvasRenderer.ts# 차트 9종 캔버스 애니메이션 렌더러 & WebM 추출
│   │   ├── waveformRenderer.ts   # 실시간 음파 5종 캔버스 렌더러 & WebM 추출
│   │   └── exportUtils.ts        # PNG & WebM 비디오 인코딩 유틸리티
│   │
│   └── components/               # UI 컴포넌트 & 모달 모음
│       ├── Header.tsx            # 상단 헤더 메뉴 및 도구 버튼
│       ├── PreviewCanvas.tsx     # 메인 자막 프리뷰 캔버스
│       ├── SidebarControls.tsx   # 좌측 자막 컨트롤러
│       ├── ChartBuilderModal.tsx # 📊 모션 차트 생성기 모달 UI
│       ├── AudioWaveformModal.tsx# 🎵 음파 비주얼라이저 모달 UI
│       ├── BatchGeneratorModal.tsx# 📚 대사 일괄 생성 모달 UI
│       └── ClipchampGuideModal.tsx# Clipchamp 사용법 안내 가이드 모달
```

---

## 🛠️ 문제 해결 (Troubleshooting Guide)

### Q1. 포트가 사용 중이라고 나오거나 접속이 안 될 때
- 다른 Node 서버가 작동 중인 경우 `http://localhost:5173/` 대신 `5174`, `5175` 등으로 포트가 자동 전환될 수 있습니다. 터미널에 표시된 `Local: http://localhost:XXXX/` 주소를 확인하세요.

### Q2. 음성 파일 재생 시 파형이 반응하지 않을 때
- 브라우저 보안 정책상 사용자가 화면을 한 번 클릭하거나 `음성 재생 시연` 버튼을 누르면 Web Audio API (`AudioContext`)가 활성화됩니다.

### Q3. WebM 비디오 추출 시 브라우저가 느려질 때
- 60fps 고화질 렌더링 과정에서 CPU 연산이 이루어집니다. 렌더링 진행률(`%`)이 100%가 될 때까지 잠시 기다려 주시면 자동으로 비디오 파일이 다운로드됩니다.

### Q4. 개발용 컴파일 및 빌드 검증 명령어
```bash
# 개발 서버 구동
npm run dev

# 프로덕션 빌드 테스트
npm run build

# 빌드 결과물 미리보기
npx vite preview
```
