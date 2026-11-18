import type {
  CompletionSummary,
  DataSource,
  DayAndGoalSummary,
  StudyGoal,
} from "../domain/models";
import { MOCK_DATA_LABEL, sourceLabel } from "../domain/provenance";

export interface SummaryGridProps {
  /** Already-normalized selector result for the selected certificate. */
  readonly dayAndGoal: DayAndGoalSummary;
  /** Already-normalized selector result for the current-month goals. */
  readonly completion: CompletionSummary;
}

function dDayText(dDay: number | null): string {
  if (dDay === null) {
    return "시험일 정보 없음";
  }

  if (dDay === 0) {
    return "D-day";
  }

  return dDay > 0 ? `D-${dDay}` : `D+${Math.abs(dDay)}`;
}

function goalStatusText(goal: StudyGoal): string {
  return goal.completed ? "완료" : "진행 예정";
}

function SourceLabel({ source }: { readonly source: DataSource }) {
  const label = sourceLabel(source);

  if (label !== MOCK_DATA_LABEL) {
    return null;
  }

  return <span className="summary-card__source">{MOCK_DATA_LABEL}</span>;
}

/**
 * Presents selector-normalized D-day, study-goal, and monthly-completion data.
 * This component intentionally performs no date or completion calculations.
 */
export function SummaryGrid({ dayAndGoal, completion }: SummaryGridProps) {
  return (
    <section className="summary-grid" aria-label="학습 요약">
      <article className="summary-card summary-card--day-and-goal">
        <div className="summary-card__heading">
          <h2>시험 목표</h2>
          <SourceLabel source={dayAndGoal.source} />
        </div>
        <p className="summary-card__certificate">{dayAndGoal.certificate.label}</p>
        <p className="summary-card__d-day" aria-label={`시험까지 ${dDayText(dayAndGoal.dDay)}`}>
          {dDayText(dayAndGoal.dDay)}
        </p>
        {dayAndGoal.nextExamDate !== null && (
          <p className="summary-card__exam-date">다음 시험일: {dayAndGoal.nextExamDate}</p>
        )}

        <h3>학습 목표</h3>
        {dayAndGoal.studyGoals.length > 0 ? (
          <ul className="summary-card__goal-list">
            {dayAndGoal.studyGoals.map((goal) => (
              <li key={goal.id}>
                <span>{goal.title}</span>
                <span className="summary-card__goal-status">{goalStatusText(goal)}</span>
                <SourceLabel source={goal.source} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="summary-card__empty">등록된 학습 목표가 없습니다.</p>
        )}
      </article>

      <article className="summary-card summary-card--completion">
        <div className="summary-card__heading">
          <h2>이번 달 학습 완료 현황</h2>
          <SourceLabel source={completion.source} />
        </div>
        {completion.percentage === null ? (
          <p className="summary-card__empty">학습 목표 없음</p>
        ) : (
          <p className="summary-card__percentage">{completion.percentage}%</p>
        )}
        <p className="summary-card__counts">
          완료 {completion.completedCount}개 / 전체 {completion.totalCount}개
        </p>
      </article>
    </section>
  );
}
