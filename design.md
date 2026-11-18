# 설계: 자격증 시험 일정 & 학습 플랜

## 1. 범위와 원칙

데모 종목은 **정보처리기사**와 **정보처리산업기사** 두 개다. 화면은 목록, 상세+일정, 플랜, 연습문제 네 개로 제한한다.

- 자격증 정보는 사용자가 공공데이터포털에서 직접 내려받은 한국산업인력공단 **종목별 시험정보 현황** 파일을 `data/qualifications.json`으로 저장해 사용한다.
- 시험 일정은 공공데이터포털 **한국산업인력공단_국가자격 시험일정 조회 서비스**만 사용한다. Lambda가 `https://apis.data.go.kr/B490007/qualExamSchd/getQualExamSchdList`를 호출한다.
- 시험 일정과 자격증 정보는 AI가 생성하거나 추정하지 않는다. 원본 데이터에 없는 자격증 정보는 `null`로 유지하고 UI에서 `공식 사이트에서 확인`을 표시한다.
- 큐넷 API 응답 샘플과 자격증 정보 파일이 아직 제공되지 않았으므로, 외부 데이터의 필드명, API 요청 파라미터명, 코드값, 응답 구조를 추측하지 않는다.
- Bedrock은 학습 플랜 생성에만 사용하며, Lambda 하나가 Converse API를 호출한다. 브라우저는 AWS 자격 증명, `QNET_SERVICE_KEY`, `MODEL_ID`를 알 수 없다.
- 사용자 플랜과 완료 상태는 `localStorage`만 사용한다. DB, 로그인, 결제는 구현하지 않는다.
- 실제 기출문제 또는 복원문제는 저장하지 않는다. 정적 문제 풀은 공개 출제 범위를 바탕으로 새로 작성한 문제만 담는다.

모든 화면에는 다음 문구를 표시한다.

> 공식 사이트에서 최종 확인 필요

연습문제 화면에는 다음 문구도 표시한다.

> AI 생성 연습문제 (기출 아님), 오류 가능

## 2. 최소 아키텍처

```text
React SPA
  ├─ data/certificates.config.json       # 종목과 데이터 소스 설정
  ├─ data/qualifications.json            # 사용자가 내려받은 종목별 시험정보 현황
  ├─ data/fallback/schedules.json        # 검증된 일정 폴백
  ├─ data/questions/*.json               # 새로 작성한 정적 연습문제
  ├─ localStorage                         # 플랜과 완료 상태
  └─ API Gateway
       └─ 단일 Lambda
            ├─ GET  /certificates/{certificateId}/detail
            │    ├─ QualificationRepository → qualifications.json
            │    ├─ ScheduleService → 메모리 TTL 캐시 → QnetAdapter → 큐넷 일정 API
            │    └─ 일정 API 실패 시 schedules.json
            └─ POST /ai
                 └─ Bedrock Converse API
```

Lambda 패키지에는 `certificates.config.json`, `qualifications.json`, `fallback/schedules.json`을 포함한다. 프론트엔드는 외부 큐넷 API를 호출하지 않고 상세 응답만 Lambda에서 받는다.

## 3. 화면 및 사용자 흐름

| 화면 | 경로 예시 | 주요 내용 | 원천 |
|---|---|---|---|
| 목록 | `/` | 두 종목 카드와 상세 이동 | `certificates.config.json`의 `displayName` |
| 상세+일정 | `/certificates/:certificateId` | 개요, 수행직무, 변천과정, 취득방법, 응시 자격, 과목, 합격 기준, 출처, 접수·시험·발표일, D-day | Lambda 통합 상세 응답 |
| 플랜 | `/certificates/:certificateId/plan` | 시험일, 학습 시간, 수준, 취약 과목, 주차별 플랜, 완료 체크, 진행률 | 과목: 상세 응답. 플랜: Lambda. 완료 상태: localStorage |
| 연습문제 | `/certificates/:certificateId/practice` | 랜덤 문제, 정답, 해설 | `data/questions/*.json` |

상세 화면은 정보와 일정을 별도 카드로 표시한다. 한 카드가 실패해도 다른 카드의 성공 데이터를 계속 보여준다.

- `qualification.status`가 `unavailable`이거나 개별 필드가 `null`이면 해당 정보 위치에 `공식 사이트에서 확인`을 표시한다.
- `schedule.status`가 `fallback`이면 폴백 일정을 표시하고 `저장된 일정 정보` 상태를 표시한다.
- `schedule.status`가 `unavailable`이면 일정 카드에 오류와 재시도 동작을 표시한다.
- D-day는 응답에 실제로 존재하는 미래 또는 오늘의 `examDate` 중 가장 가까운 날짜로만 계산한다. 해당 날짜가 없으면 D-day를 표시하지 않는다.
- 접수 마감일이 오늘부터 7일 이내이고 지나지 않은 회차에만 `마감 임박` 배지를 표시한다.

## 4. Lambda API와 데이터 결합

### 4.1 경로

단일 Lambda 핸들러가 method와 path를 분기한다.

| 경로 | 목적 |
|---|---|
| `GET /certificates/{certificateId}/detail` | 자격증 정적 정보와 시험 일정 결과를 결합해 반환 |
| `POST /ai` | 필수 기능인 학습 플랜 생성. 선택 기능인 문제 생성도 추후 같은 경로에 추가 가능 |

`certificateId`는 `certificates.config.json`에 등록된 ID만 받는다. 등록되지 않은 ID에는 `404 CERTIFICATE_NOT_FOUND`를 반환한다.

### 4.2 상세 통합 응답

```json
{
  "certificateId": "engineer-information-processing",
  "qualification": {
    "status": "available",
    "source": {
      "type": "manual-json",
      "provider": "한국산업인력공단",
      "portal": "공공데이터포털"
    },
    "data": {
      "name": "정보처리기사",
      "overview": null,
      "jobDescription": null,
      "history": null,
      "howToAcquire": null,
      "eligibility": null,
      "subjects": null,
      "passingCriteria": null,
      "officialSourceUrl": null
    }
  },
  "schedule": {
    "status": "live",
    "source": {
      "type": "qnet-api",
      "provider": "한국산업인력공단",
      "portal": "공공데이터포털"
    },
    "sessions": []
  },
  "fetchedAt": "2026-01-01T00:00:00.000Z"
}
```

`qualification.status`는 `available` 또는 `unavailable`이다. `schedule.status`는 `live`, `fallback`, `unavailable` 중 하나다. `qualification.data`와 `schedule.sessions`는 서로 독립적으로 반환한다.

- `qualifications.json`을 읽거나 대상 종목을 찾지 못하면 `qualification.status: "unavailable"`과 `data: null`을 반환한다.
- 일정 API가 성공하면 `schedule.status: "live"`와 정규화한 API 값을 반환한다.
- 일정 API 또는 API 응답 매핑이 실패하면 `data/fallback/schedules.json`에서 해당 종목 값을 찾아 `schedule.status: "fallback"`으로 반환한다.
- 일정 API와 폴백 모두 실패하면 `schedule.status: "unavailable"`, `sessions: []`를 반환한다.
- 한쪽이 `unavailable`이어도 다른 쪽이 성공하거나 폴백이면 HTTP 200으로 부분 응답을 반환한다. 두 부분이 모두 `unavailable`일 때만 표준 오류 응답을 반환한다.

표준 오류 형식은 아래와 같다.

```json
{
  "error": {
    "code": "DETAIL_SOURCES_UNAVAILABLE",
    "message": "자격증 정보와 시험 일정을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요."
  }
}
```

### 4.3 환경 변수와 권한

| 이름 | 사용 위치 | 용도 |
|---|---|---|
| `QNET_SERVICE_KEY` | Lambda 환경 변수 | 큐넷 일정 API 인증. 로그에 기록하지 않는다. |
| `MODEL_ID` | Lambda 환경 변수 | Bedrock Converse 모델 ID. |
| `QNET_CACHE_TTL_SECONDS` | Lambda 환경 변수, 선택 | 일정 캐시 TTL. 미설정 시 300초. |

Lambda 실행 역할에는 지정 모델에 필요한 Bedrock Converse 최소 권한만 둔다. 프론트엔드 코드, 브라우저 저장소, API 응답, 로그에는 서비스 키나 AWS 자격 증명을 넣지 않는다.

## 5. 자격증별 데이터 소스 설정

`data/certificates.config.json`이 자격증별 소스 종류와 큐넷 코드값을 관리하는 유일한 위치다. 종목 코드와 자격구분 값은 이 파일 외에 작성하지 않는다.

```json
{
  "certificates": [
    {
      "id": "engineer-information-processing",
      "displayName": "정보처리기사",
      "qualificationSource": "manual-json",
      "scheduleSource": "qnet-api",
      "qualificationDataPath": "data/qualifications.json",
      "scheduleFallbackPath": "data/fallback/schedules.json",
      "qnet": {
        "itemCode": "<사용자 확인 후 입력>",
        "qualificationTypeCode": "<사용자 확인 후 입력>"
      }
    },
    {
      "id": "industrial-engineer-information-processing",
      "displayName": "정보처리산업기사",
      "qualificationSource": "manual-json",
      "scheduleSource": "qnet-api",
      "qualificationDataPath": "data/qualifications.json",
      "scheduleFallbackPath": "data/fallback/schedules.json",
      "qnet": {
        "itemCode": "<사용자 확인 후 입력>",
        "qualificationTypeCode": "<사용자 확인 후 입력>"
      }
    }
  ]
}
```

자리표시자는 실제 코드가 아니다. 큐넷 API 응답 샘플과 사용자가 확인한 코드값을 받은 뒤 이 파일에서만 값으로 교체한다.

향후 종목은 `qualificationSource`와 `scheduleSource`를 각각 `manual-json` 또는 `qnet-api`로 설정할 수 있다. 예를 들어 일정도 수동 관리할 종목은 `scheduleSource: "manual-json"`으로 두고 같은 폴백 파일에서 읽는다. `manual-json` 소스에는 `qnet` 객체를 두지 않는다.

## 6. 데이터 저장 구조와 스키마

### 6.1 `data/qualifications.json`: 원본 자격증 정보

이 파일은 사용자가 프로젝트에 넣는 **종목별 시험정보 현황** 다운로드 파일을 JSON으로 보관한 것이다. 파일을 받기 전에는 실제 열 이름, 레코드 식별 방식, 과목·합격 기준의 존재 여부를 알 수 없으므로 원본 스키마와 매핑을 확정하지 않는다.

파일이 제공되면 다음 순서로 처리한다.

1. 실제 최상위 구조와 열 이름을 확인한다.
2. 정보처리기사와 정보처리산업기사 행을 구분할 실제 식별 열을 확인한다.
3. 원본의 각 열을 `QualificationInfo`의 대응 필드에 문서화한다.
4. 없는 열은 변환 과정에서 `null`로 둔다. 유사한 값이나 AI 생성값으로 채우지 않는다.
5. 원본 파일의 출처 메타데이터가 없다면 UI 응답의 출처는 고정 표기 `한국산업인력공단 · 공공데이터포털`로 제공한다.

외부 파일 구조와 분리하기 위한 내부 정규화 스키마는 다음과 같다. 이 스키마는 API 응답과 UI의 계약이며, 원본 열 이름을 의미하지 않는다.

```json
{
  "certificateId": "engineer-information-processing",
  "name": "정보처리기사",
  "overview": null,
  "jobDescription": null,
  "history": null,
  "howToAcquire": null,
  "eligibility": null,
  "subjects": null,
  "passingCriteria": null,
  "officialSourceUrl": null
}
```

`subjects`는 원본 파일에 과목 정보가 확인될 때에만 다음 배열 구조로 정규화한다. 과목 열이 없거나 구조를 확정할 수 없으면 빈 배열을 추정해 만들지 않고 `null`을 유지한다.

```json
[
  {
    "id": "원본 식별값 또는 확정된 안정 ID",
    "name": "원본에 있는 과목명"
  }
]
```

### 6.2 `data/fallback/schedules.json`: 일정 폴백

폴백 파일은 큐넷 API 응답 원문이 아니라 화면에서 사용할 정규화된 일정만 저장한다. 실제 값은 공식 자료를 확인한 뒤 입력한다.

```json
{
  "schedules": [
    {
      "certificateId": "engineer-information-processing",
      "sessions": [
        {
          "id": "원본 회차 식별값 또는 안정 ID",
          "applicationOpenDate": null,
          "applicationCloseDate": null,
          "examDate": null,
          "resultDate": null,
          "officialSourceUrl": null
        }
      ]
    }
  ]
}
```

날짜는 `YYYY-MM-DD`로 정규화한다. 원본에 없는 날짜는 `null`이며, 회차나 날짜를 계산해서 만들지 않는다.

### 6.3 `data/questions/*.json`: 연습문제

```json
{
  "id": "ip-engineer-001",
  "certificateId": "engineer-information-processing",
  "subject": null,
  "difficulty": "easy",
  "question": "공개 출제 범위를 바탕으로 새로 작성한 문제",
  "choices": ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
  "answerIndex": 0,
  "explanation": "새로 작성한 해설"
}
```

`subject`는 원본 자격증 정보에서 과목 식별값을 확정한 후에만 사용한다. 과목 정보가 없으면 `null`을 허용한다. 선택지는 정확히 네 개이며 `answerIndex`는 0부터 3까지의 정수다.

### 6.4 학습 플랜 및 localStorage

```json
{
  "certificateId": "engineer-information-processing",
  "examDate": "2026-02-01",
  "dailyStudyMinutes": 120,
  "level": "beginner",
  "weakSubjects": [],
  "weeks": [
    {
      "week": 1,
      "goal": "주간 학습 목표",
      "tasks": [
        {
          "id": "week-1-task-1",
          "subject": null,
          "title": "학습 항목",
          "estimatedMinutes": 60,
          "completed": false
        }
      ]
    }
  ],
  "generatedAt": "2026-01-01T00:00:00.000Z"
}
```

저장 키는 `cert-plan:v1:{certificateId}`다. `subjects`가 `null`이면 플랜 화면은 취약 과목 선택 대신 `과목 정보는 공식 사이트에서 확인`을 보이고 `weakSubjects: []`만 허용한다. 이 경우 Bedrock은 없는 과목명이나 과목 구조를 사실처럼 만들면 안 된다.

## 7. 일정 API 어댑터와 캐시

`QnetAdapter`는 큐넷 일정 API의 외부 계약을 내부 일정 스키마와 분리한다. 제공된 URL은 어댑터에 사용하되, 요청 파라미터명, 요청 값 형식, 응답 필드 매핑은 샘플을 받기 전까지 구현하지 않는다.

```ts
interface QnetAdapter {
  fetchSchedule(input: {
    certificateId: string;
    itemCode: string;
    qualificationTypeCode: string;
  }): Promise<ScheduleSession[]>;
}

interface ScheduleSession {
  id: string;
  applicationOpenDate: string | null;
  applicationCloseDate: string | null;
  examDate: string | null;
  resultDate: string | null;
  officialSourceUrl: string | null;
}
```

일정 처리 순서:

1. Lambda가 설정 파일에서 대상 종목과 `scheduleSource`를 읽는다.
2. `manual-json`이면 `schedules.json`의 해당 종목 일정을 반환한다.
3. `qnet-api`이면 `certificateId` 키의 Lambda 메모리 캐시를 먼저 확인한다.
4. 캐시가 없거나 만료되면 `QnetAdapter`가 `QNET_SERVICE_KEY`로 지정된 일정 API를 호출한다.
5. 샘플 수령 후 구현할 어댑터 매핑과 스키마 검증이 성공하면 정규화 일정만 캐시하고 `live` 상태로 반환한다.
6. 호출, 파싱, 매핑, 검증 중 하나라도 실패하면 `schedules.json`의 해당 종목을 `fallback` 상태로 반환한다.
7. 해당 폴백도 없거나 검증에 실패하면 `unavailable` 상태를 반환한다.

캐시는 다음 구조의 Lambda 메모리 `Map`을 사용한다.

```ts
Map<string, { expiresAt: number; value: ScheduleSession[] }>
```

- 캐시 키는 `certificateId`다.
- TTL 기본값은 300초이며 `QNET_CACHE_TTL_SECONDS`로 조정할 수 있다.
- 캐시는 warm Lambda 실행 환경에서만 유효하며 인스턴스 간 공유되지 않는다.
- 만료 후 API가 실패하면 오래된 캐시를 일정의 최신값처럼 보여주지 않고 검증된 폴백만 사용한다.
- 캐시와 로그에는 서비스 키, 인증 헤더, 불필요한 원본 응답 전체를 넣지 않는다.

종목별 시험정보 API, 수수료 API, 그 밖의 큐넷 API는 이번 범위에서 호출하지 않는다. 필요 시 `backend/src/adapters/`에 별도 어댑터를 추가할 수 있지만 Lambda 경로나 현재 상세 응답에는 포함하지 않는다.

## 8. Bedrock Converse 처리

`POST /ai`의 필수 요청은 학습 플랜 생성이다.

```json
{
  "operation": "plan",
  "certificateId": "engineer-information-processing",
  "examDate": "2026-02-01",
  "dailyStudyMinutes": 120,
  "level": "beginner",
  "weakSubjects": []
}
```

Lambda는 `MODEL_ID`를 환경 변수에서 읽어 Converse API를 호출한다.

1. `certificateId`, 시험일, 학습 시간, 수준을 검증한다. 오늘 이전 시험일과 0 이하 시간은 거부한다.
2. 자격증 정보 파일에서 확인된 과목만 `weakSubjects`로 허용한다. `subjects: null`이면 빈 목록만 허용한다.
3. Bedrock 프롬프트에는 검증한 입력과 확인된 과목 목록만 넣는다. 일정, 응시 자격, 합격 기준을 생성하도록 요청하지 않는다.
4. 응답 텍스트를 학습 플랜 JSON으로 파싱하고 스키마를 검증한다.
5. 파싱 또는 스키마 검증 실패 시 JSON만 반환하라는 보정 지시로 **한 번만** 재호출한다.
6. 두 번째 응답도 실패하면 `502 AI_RESPONSE_INVALID`를 반환한다. 유효하지 않은 플랜은 브라우저나 localStorage에 저장하지 않는다.

## 9. 폴더 구조

```text
.
├─ design.md
├─ tasks.md
├─ data/
│  ├─ certificates.config.json
│  ├─ qualifications.json                # 사용자가 제공할 다운로드 파일
│  ├─ fallback/
│  │  └─ schedules.json
│  └─ questions/
│     ├─ engineer-information-processing.json
│     └─ industrial-engineer-information-processing.json
├─ frontend/src/
│  ├─ pages/
│  │  ├─ CertificateListPage.tsx
│  │  ├─ CertificateDetailPage.tsx
│  │  ├─ StudyPlanPage.tsx
│  │  └─ PracticePage.tsx
│  ├─ components/
│  │  ├─ OfficialNotice.tsx
│  │  ├─ QualificationInfo.tsx
│  │  ├─ ScheduleList.tsx
│  │  ├─ PlanForm.tsx
│  │  ├─ PlanProgress.tsx
│  │  └─ QuestionCard.tsx
│  └─ services/
│     ├─ apiClient.ts
│     ├─ questionService.ts
│     └─ localPlanStorage.ts
└─ backend/src/
   ├─ handler.ts
   ├─ adapters/
   │  └─ qnetAdapter.ts                  # 응답 샘플 수령 후 구현
   ├─ repositories/
   │  └─ qualificationRepository.ts      # 파일 열 이름 확인 후 매핑 구현
   ├─ services/
   │  ├─ detailService.ts
   │  ├─ scheduleCache.ts
   │  └─ bedrockService.ts
   └─ schemas/
      └─ domain.ts
```
