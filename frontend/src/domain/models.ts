/** A calendar date supplied in normalized YYYY-MM-DD form. */
export type IsoDate = `${number}-${number}-${number}`;

/** A calendar month supplied in normalized YYYY-MM form. */
export type IsoMonth = `${number}-${number}`;

/** The stable certificate identifiers used for selection and associations. */
export type CertificateId =
  | "information-processing-industrial-engineer"
  | "information-processing-engineer"
  | "information-security-engineer"
  | "information-security-industrial-engineer";

/** The Korean display labels for the supported certificates. */
export type CertificateLabel =
  | "정보처리산업기사"
  | "정보처리기사"
  | "정보보안기사"
  | "정보보안산업기사";

/** A display-safe supported certificate. */
export interface Certificate {
  readonly id: CertificateId;
  readonly label: CertificateLabel;
}

/** Provenance that is safe to render in cards and attribution. */
export type DataSource =
  | {
      readonly kind: "mock";
      readonly label: "예시 데이터";
    }
  | {
      readonly kind: "official";
      readonly provider: string;
    };

/** A display-safe study item associated with one supported certificate. */
export interface StudyGoal {
  readonly id: string;
  readonly certificateId: CertificateId;
  readonly title: string;
  readonly completed: boolean;
  readonly month: IsoMonth;
  readonly source: DataSource;
}

/** A normalized, display-safe certificate examination schedule. */
export interface Schedule {
  readonly id: string;
  readonly certificateId: CertificateId;
  readonly applicationDate: IsoDate | null;
  readonly examDate: IsoDate | null;
  readonly resultDate: IsoDate | null;
  readonly source: DataSource;
}

/** The display-only placeholder used until an authenticated profile exists. */
export interface MockProfile {
  readonly displayName: string;
  readonly statusLabel: string;
  readonly source: "mock";
}

/** Typed local fixture data consumed by the dashboard boundary. */
export interface DashboardData {
  readonly profile: MockProfile | null;
  readonly certificates: readonly Certificate[];
  readonly schedules: readonly Schedule[];
  readonly studyGoals: readonly StudyGoal[];
  readonly attribution: readonly DataSource[];
  readonly now: IsoDate;
}

/** Local or future normalized dashboard-data provider boundary. */
export interface DashboardDataProvider {
  getDashboardData(): DashboardData;
}

/** Normalized model for the D-day and study-goal summary panel. */
export interface DayAndGoalSummary {
  readonly certificate: Certificate;
  readonly nextExamDate: IsoDate | null;
  readonly dDay: number | null;
  readonly studyGoals: readonly StudyGoal[];
  readonly source: DataSource;
}

/** Normalized model for the current-month completion summary panel. */
export interface CompletionSummary {
  readonly completedCount: number;
  readonly totalCount: number;
  readonly percentage: number | null;
  readonly source: DataSource;
}

/** Explicitly configured HTTPS practice-link destination. */
export type PracticeLinkConfig =
  | {
      readonly destination: null;
      readonly target: null;
      readonly placeholderText: string;
    }
  | {
      readonly destination: `https://${string}`;
      readonly target: "same-tab" | "new-tab";
      readonly placeholderText: string;
    };

/** A calendar item that keeps its normalized schedule association. */
export interface CalendarEntry {
  readonly date: IsoDate;
  readonly schedule: Schedule;
}
