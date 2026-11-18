import { CERTIFICATES } from "./certificates";
import type {
  DashboardData,
  DashboardDataProvider,
  DataSource,
  MockProfile,
  Schedule,
  StudyGoal,
} from "../domain/models";

/** All initial dashboard values are deliberately marked as development fixtures. */
export const MOCK_DATA_SOURCE = {
  kind: "mock",
  label: "예시 데이터",
} as const satisfies DataSource;

/**
 * This date is a fixture input, not the viewer's clock, so D-day calculations
 * remain deterministic until an approved data provider replaces this module.
 */
export const MOCK_NOW = "2026-03-10" as const;

/** Display-safe example profile. Set this to null to exercise the unavailable state. */
export const MOCK_PROFILE: MockProfile | null = {
  displayName: "김자격",
  statusLabel: "학습 중",
  source: "mock",
};

/** Schedules are examples only and are not confirmed official exam dates. */
export const MOCK_SCHEDULES = [
  {
    id: "mock-ip-industrial-engineer-2026-04",
    certificateId: "information-processing-industrial-engineer",
    applicationDate: "2026-03-16",
    examDate: "2026-04-18",
    resultDate: "2026-06-12",
    source: MOCK_DATA_SOURCE,
  },
  {
    id: "mock-ip-engineer-2026-05",
    certificateId: "information-processing-engineer",
    applicationDate: "2026-04-06",
    examDate: "2026-05-16",
    resultDate: "2026-07-03",
    source: MOCK_DATA_SOURCE,
  },
  {
    id: "mock-security-engineer-2026-06",
    certificateId: "information-security-engineer",
    applicationDate: "2026-05-04",
    examDate: "2026-06-13",
    resultDate: "2026-08-07",
    source: MOCK_DATA_SOURCE,
  },
  {
    id: "mock-security-industrial-engineer-2026-07",
    certificateId: "information-security-industrial-engineer",
    applicationDate: "2026-06-01",
    examDate: "2026-07-18",
    resultDate: "2026-09-11",
    source: MOCK_DATA_SOURCE,
  },
] as const satisfies readonly Schedule[];

/** Goal completion is fixture data and supplies the initial completion summary. */
export const MOCK_STUDY_GOALS = [
  {
    id: "mock-ip-industrial-engineer-network-review",
    certificateId: "information-processing-industrial-engineer",
    title: "네트워크 기초 복습",
    completed: true,
    month: "2026-03",
    source: MOCK_DATA_SOURCE,
  },
  {
    id: "mock-ip-engineer-algorithm-practice",
    certificateId: "information-processing-engineer",
    title: "알고리즘 문제 풀이",
    completed: false,
    month: "2026-03",
    source: MOCK_DATA_SOURCE,
  },
  {
    id: "mock-security-engineer-security-review",
    certificateId: "information-security-engineer",
    title: "정보보호 관리 체계 정리",
    completed: true,
    month: "2026-03",
    source: MOCK_DATA_SOURCE,
  },
  {
    id: "mock-security-industrial-engineer-system-review",
    certificateId: "information-security-industrial-engineer",
    title: "시스템 보안 핵심 개념 복습",
    completed: false,
    month: "2026-03",
    source: MOCK_DATA_SOURCE,
  },
] as const satisfies readonly StudyGoal[];

/**
 * The dashboard's only initial provider. It imports neither runtime services
 * nor browser state, and all mutable future integrations stay outside it.
 */
export const MOCK_DASHBOARD_DATA = {
  profile: MOCK_PROFILE,
  certificates: CERTIFICATES,
  schedules: MOCK_SCHEDULES,
  studyGoals: MOCK_STUDY_GOALS,
  attribution: [MOCK_DATA_SOURCE],
  now: MOCK_NOW,
} as const satisfies DashboardData;

export const mockDashboardDataProvider: DashboardDataProvider = {
  getDashboardData(): DashboardData {
    return MOCK_DASHBOARD_DATA;
  },
};
