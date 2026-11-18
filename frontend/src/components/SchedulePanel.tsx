import type {
  Certificate,
  CertificateId,
  PracticeLinkConfig,
  Schedule,
} from "../../../domain/models";
import { selectSchedulesForCertificate } from "../../../domain/dashboardSelectors";
import { sourceLabel } from "../../../domain/provenance";
import { ExternalPracticeAction } from "./ExternalPracticeAction";

const OFFICIAL_CONFIRMATION_NOTICE_ID = "official-confirmation-notice";

export interface SchedulePanelProps {
  readonly certificates: readonly Certificate[];
  readonly schedules: readonly Schedule[];
  readonly selectedCertificateId: CertificateId;
  readonly practiceLink: PracticeLinkConfig;
  readonly onShowPracticePlaceholder: (text: string) => void;
  readonly navigateToPractice: (
    destination: string,
    target: "same-tab" | "new-tab",
  ) => void;
}

interface ScheduleDateProps {
  readonly label: string;
  readonly date: string | null;
}

function ScheduleDate({ label, date }: ScheduleDateProps) {
  if (date === null) {
    return null;
  }

  return (
    <div className="schedule-panel__date">
      <dt>{label}</dt>
      <dd>{date}</dd>
    </div>
  );
}

/**
 * Renders only schedules belonging to the primary certificate selection and
 * keeps each schedule linked to the in-body official-confirmation notice.
 */
export function SchedulePanel({
  certificates,
  schedules,
  selectedCertificateId,
  practiceLink,
  onShowPracticePlaceholder,
  navigateToPractice,
}: SchedulePanelProps) {
  const selectedCertificate = certificates.find(
    (certificate) => certificate.id === selectedCertificateId,
  );
  const selectedSchedules = selectSchedulesForCertificate(schedules, selectedCertificateId);

  return (
    <section className="schedule-panel" aria-labelledby="schedule-panel-heading">
      <div className="schedule-panel__heading">
        <h2 id="schedule-panel-heading">시험 일정</h2>
        {selectedCertificate !== undefined && (
          <p className="schedule-panel__certificate">{selectedCertificate.label}</p>
        )}
      </div>

      {selectedSchedules.length > 0 ? (
        <ul className="schedule-panel__list">
          {selectedSchedules.map((schedule) => (
            <li key={schedule.id}>
              <article
                className="schedule-panel__item"
                aria-describedby={OFFICIAL_CONFIRMATION_NOTICE_ID}
              >
                <dl className="schedule-panel__dates">
                  <ScheduleDate label="접수일" date={schedule.applicationDate} />
                  <ScheduleDate label="시험일" date={schedule.examDate} />
                  <ScheduleDate label="발표일" date={schedule.resultDate} />
                </dl>
                <p className="schedule-panel__source">{sourceLabel(schedule.source)}</p>
                <a
                  className="schedule-panel__confirmation-link"
                  href={`#${OFFICIAL_CONFIRMATION_NOTICE_ID}`}
                >
                  공식 확인 안내 보기
                </a>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className="schedule-panel__empty">선택한 종목의 일정이 없습니다.</p>
      )}

      {selectedSchedules.length === 0 && (
        <a
          className="schedule-panel__confirmation-link"
          href={`#${OFFICIAL_CONFIRMATION_NOTICE_ID}`}
        >
          공식 확인 안내 보기
        </a>
      )}
      <ExternalPracticeAction
        config={practiceLink}
        onShowPlaceholder={onShowPracticePlaceholder}
        navigate={navigateToPractice}
      />
    </section>
  );
}
