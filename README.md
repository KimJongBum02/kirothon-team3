# 자격증 시험 정보 및 학습 플랜 시스템

정보처리기사 및 정보처리산업기사 시험 정보와 개인 맞춤형 학습 플랜을 제공하는 웹 애플리케이션입니다.

## 기능

### 필수 기능
1. **자격증 정보 조회** - 한국산업인력공단 데이터 기반 정보 제공
2. **시험 일정 조회** - 큐넷 API 및 폴백 데이터 제공
3. **학습 플랜 생성** - Bedrock AI 기반 개인 맞춤형 플랜
4. **연습문제** - 정적 문제 풀이 제공

### 선택 기능
1. **ICS 내보내기** - 학습 일정 캘린더 연동
2. **새 문제 생성** - AI 기반 추가 문제 생성

## 기술 스택

### 프론트엔드
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router DOM

### 백엔드 (구현 예정)
- AWS Lambda
- API Gateway
- Bedrock AI

## 프로젝트 구조

```
kirothon-team3/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── components/      # 공용 컴포넌트
│   │   ├── services/        # API 및 로컬 스토리지 서비스
│   │   ├── types/           # TypeScript 타입 정의
│   │   ├── hooks/           # 커스텀 훅
│   │   └── utils/           # 유틸리티 함수
│   ├── public/
│   └── package.json
├── backend/                  # Lambda 백엔드
│   ├── src/
│   │   ├── adapters/        # 외부 API 어댑터
│   │   ├── repositories/    # 데이터 저장소
│   │   ├── services/        # 비즈니스 로직
│   │   ├── schemas/         # 도메인 스키마
│   │   └── handlers/        # Lambda 핸들러
│   └── package.json
├── data/                     # 정적 데이터
│   ├── certificates.config.json
│   ├── qualifications.json
│   ├── fallback/
│   │   └── schedules.json
│   └── questions/
│       ├── engineer-information-processing.json
│       └── industrial-engineer-information-processing.json
├── design.md                 # 시스템 설계 문서
├── tasks.md                  # 구현 작업 목록
└── README.md
```

## 설치 및 실행

### 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

애플리케이션은 http://localhost:3000 에서 실행됩니다.

### 백엔드 설정 (구현 예정)

```bash
cd backend
npm install
# Lambda 배포 스크립트
```

## 데이터 출처

- 자격증 정보: 한국산업인력공단 · 공공데이터포털
- 시험 일정: 한국산업인력공단_국가자격 시험일정 조회 서비스

## 주의사항

- 모든 정보는 공식 사이트에서 최종 확인 필요
- 연습문제는 AI 생성 문제이며 기출문제가 아님
- 일정 정보는 최신 정보가 아닐 수 있음

## 라이센스

MIT