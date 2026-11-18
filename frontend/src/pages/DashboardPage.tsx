import { useState } from "react";
import "../styles/certificationStudyPlanner.css";
import { AiQuestionPreparationBoundary } from "../components/AiQuestionPreparationBoundary";
import { AttributionFooter } from "../components/AttributionFooter";
import { CalendarSection } from "../components/CalendarSection";
import { CertificateSelector } from "../components/CertificateSelector";
import { DashboardHeader } from "../components/DashboardHeader";
import { OfficialConfirmationNotice } from "../components/OfficialConfirmationNotice";
import { SchedulePanel } from "../components/SchedulePanel";
import { SummaryGrid } from "../components/SummaryGrid";
import { MOCK_DATA_SOURCE, mockDashboardDataProvider } from "../config/mockDashboardData";
import { PRACTICE_LINK } from "../config/practiceLink";
import {
  calculateDDay,
  completionPercentage,
  selectSchedulesForCertificate,
} from "../domain/dashboardSelectors";
import type {
  CertificateId,
  CompletionSummary,
  DashboardDataProvider,
  DayAndGoalSummary,
  PracticeLinkConfig,
  Schedule,
} from "../domain/models";

export interface DashboardPageProps {
  readonly dataProvider?: DashboardDataProvider;
  readonly practiceLink?: PracticeLinkConfig;
}

function nextExamSchedule(schedules: readonly Schedule[], now: string): Schedule | undefined {
  return schedules
    .filter((schedule) => {
      const dDay = calculateDDay(schedule.examDate, now);
      return dDay !== null && dDay >= 0;
    })
    .sort((left, right) => (left.examDate ?? "").localeCompare(right.examDate ?? ""))[0];
}

/**
 * Composes the display-safe dashboard fixture into the existing SPA without
 * owning data persistence, authentication, or remote-service state.
 */
export function DashboardPage({
  dataProvider = mockDashboardDataProvider,
  practiceLink = PRACTICE_LINK,
}: DashboardPageProps) {
  const data = dataProvider.getDashboardData();
  const initialCertificateId = data.certificates[0]?.id ?? null;
  const [selectedCertificateId, setSelectedCertificateId] = useState<CertificateId | null>(
    initialCertificateId,
  );
  const [scheduleFilterIds, setScheduleFilterIds] = useState<ReadonlySet<CertificateId>>(
    () => new Set(initialCertificateId === null ? [] : [initialCertificateId]),
  );
  const [externalPlaceholderOpen, setExternalPlaceholderOpen] = useState(false);

  if (selectedCertificateId === null) {
    return (
      <main className="planner-main" aria-label="자격플랜 대시보드">
        <OfficialConfirmationNotice />
        <p>대시보드에 표시할 종목 정보가 없습니다.</p>
      </main>
    );
  }

  const selectedCertificate = data.certificates.find(
    (certificate) => certificate.id === selectedCertificateId,
  );

  if (selectedCertificate === undefined) {
    return (
      <main className="planner-main" aria-label="자격플랜 대시보드">
        <OfficialConfirmationNotice />
        <p>선택한 종목 정보를 찾을 수 없습니다.</p>
      </main>
    );
  }

  const selectedSchedules = selectSchedulesForCertificate(data.schedules, selectedCertificateId);
  const nextSchedule = nextExamSchedule(selectedSchedules, data.now);
  const selectedGoals = data.studyGoals.filter(
    (goal) => goal.certificateId === selectedCertificateId,
  );
  const currentMonth = data.now.slice(0, 7);
  const currentMonthGoals = data.studyGoals.filter((goal) => goal.month === currentMonth);
  const completedCount = currentMonthGoals.filter((goal) => goal.completed).length;

  const dayAndGoal: DayAndGoalSummary = {
    certificate: selectedCertificate,
    nextExamDate: nextSchedule?.examDate ?? null,
    dDay: calculateDDay(nextSchedule?.examDate ?? null, data.now),
    studyGoals: selectedGoals,
    source: nextSchedule?.source ?? selectedGoals[0]?.source ?? MOCK_DATA_SOURCE,
  };
  const completion: CompletionSummary = {
    completedCount,
    totalCount: currentMonthGoals.length,
    percentage: completionPercentage(completedCount, currentMonthGoals.length),
    source: currentMonthGoals[0]?.source ?? MOCK_DATA_SOURCE,
  };

  const handleFilterChange = (certificateId: CertificateId, selected: boolean) => {
    setScheduleFilterIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (selected) {
        nextIds.add(certificateId);
      } else {
        nextIds.delete(certificateId);
      }
      return nextIds;
    });
  };

  const navigateToPractice = (destination: string, target: "same-tab" | "new-tab") => {
    if (target === "new-tab") {
      window.open(destination, "_blank", "noopener,noreferrer");
      return;
    }

    window.location.assign(destination);
  };

  return (
    <div className="planner-shell">
      <DashboardHeader profile={data.profile} />
      <main className="planner-main" aria-label="자격플랜 대시보드">
        <OfficialConfirmationNotice />
        <SummaryGrid dayAndGoal={dayAndGoal} completion={completion} />
        <section className="selection-schedule-layout" aria-label="종목 선택 및 일정">
          <div className="certificate-selection-area">
            <CertificateSelector
              certificates={data.certificates}
              selectedCertificateId={selectedCertificateId}
              onSelect={setSelectedCertificateId}
            />
            {/* AI_QUESTION_GENERATION_INTEGRATION: replace preparation state only after an approved question service and source-safety review. */}
            <AiQuestionPreparationBoundary certificate={selectedCertificate} state="preparing" />
          </div>
          <SchedulePanel
            certificates={data.certificates}
            schedules={data.schedules}
            selectedCertificateId={selectedCertificateId}
            practiceLink={practiceLink}
            onShowPracticePlaceholder={() => setExternalPlaceholderOpen(true)}
            navigateToPractice={navigateToPractice}
          />
        </section>
        {externalPlaceholderOpen && (
          <section className="external-practice-placeholder" role="status">
            <p>{practiceLink.placeholderText}</p>
            <button type="button" onClick={() => setExternalPlaceholderOpen(false)}>
              닫기
            </button>
          </section>
        )}
        <CalendarSection
          certificates={data.certificates}
          schedules={data.schedules}
          selectedCertificateIds={scheduleFilterIds}
          onFilterChange={handleFilterChange}
        />
      </main>
      <AttributionFooter attribution={data.attribution} />
    </div>
  );
}

export default DashboardPage;
