// 자격증 관련 타입
export interface CertificateConfig {
  id: string;
  displayName: string;
  qualificationSource: 'manual-json' | 'qnet-api';
  scheduleSource: 'manual-json' | 'qnet-api';
  qualificationDataPath: string;
  scheduleFallbackPath: string;
  qnet?: {
    itemCode: string;
    qualificationTypeCode: string;
  };
}

export interface CertificateInfo {
  certificateId: string;
  name: string;
  overview: string | null;
  jobDescription: string | null;
  history: string | null;
  howToAcquire: string | null;
  eligibility: string | null;
  subjects: Subject[] | null;
  passingCriteria: string | null;
  officialSourceUrl: string | null;
}

export interface Subject {
  id: string;
  name: string;
}

export interface ScheduleSession {
  id: string;
  applicationOpenDate: string | null;
  applicationCloseDate: string | null;
  examDate: string | null;
  resultDate: string | null;
  officialSourceUrl: string | null;
}

export interface ScheduleSource {
  type: string;
  provider: string;
  portal: string;
}

export interface QualificationResponse {
  status: 'available' | 'unavailable';
  source: ScheduleSource;
  data: CertificateInfo | null;
}

export interface ScheduleResponse {
  status: 'live' | 'fallback' | 'unavailable';
  source: ScheduleSource;
  sessions: ScheduleSession[];
}

export interface CertificateDetailResponse {
  certificateId: string;
  qualification: QualificationResponse;
  schedule: ScheduleResponse;
  fetchedAt: string;
}

export interface Question {
  id: string;
  certificateId: string;
  subject: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  choices: [string, string, string, string];
  answerIndex: number;
  explanation: string;
}

export interface PlanRequest {
  operation: 'plan';
  certificateId: string;
  examDate: string; // YYYY-MM-DD
  dailyStudyMinutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  weakSubjects: string[];
}

export interface PlanTask {
  id: string;
  subject: string | null;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface PlanWeek {
  week: number;
  goal: string;
  tasks: PlanTask[];
}

export interface StudyPlan {
  certificateId: string;
  examDate: string;
  dailyStudyMinutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  weakSubjects: string[];
  weeks: PlanWeek[];
  generatedAt: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}