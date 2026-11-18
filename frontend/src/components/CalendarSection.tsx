import { createCalendarEntries, parseIsoDateUtc } from "../domain/dashboardSelectors";
import type {
  CalendarEntry,
  Certificate,
  CertificateId,
  IsoDate,
  IsoMonth,
  Schedule,
} from "../domain/models";
import { sourceLabel } from "../domain/provenance";
import { ScheduleFilter } from "./ScheduleFilter";

const OFFICIAL_CONFIRMATION_NOTICE_ID = "official-confirmation-notice";
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export interface CalendarSectionProps {
  readonly certificates: readonly Certificate[];
  readonly schedules: readonly Schedule[];
  readonly selectedCertificateIds: ReadonlySet<CertificateId>;
  readonly onFilterChange: (certificateId: CertificateId, selected: boolean) => void;
  /** An optional fixed month for future calendar navigation. */
  readonly month?: IsoMonth;
}

interface CalendarDay {
  readonly date: IsoDate;
  readonly dayOfMonth: number;
}

function allCertificateIds(certificates: readonly Certificate[]): ReadonlySet<CertificateId> {
  return new Set(certificates.map((certificate) => certificate.id));
}

function calendarMonthFor(
  schedules: readonly Schedule[],
  certificates: readonly Certificate[],
  requestedMonth: IsoMonth | undefined,
): IsoMonth | null {
  if (requestedMonth !== undefined && parseIsoDateUtc(`${requestedMonth}-01`) !== null) {
    return requestedMonth;
  }

  const earliestDate = createCalendarEntries(schedules, allCertificateIds(certificates))
    .map((entry) => entry.date)
    .sort()[0];

  return earliestDate === undefined ? null : (earliestDate.slice(0, 7) as IsoMonth);
}

function daysInMonth(month: IsoMonth): readonly CalendarDay[] {
  const monthStart = parseIsoDateUtc(`${month}-01`);

  if (monthStart === null) {
    return [];
  }

  const year = monthStart.getUTCFullYear();
  const monthIndex = monthStart.getUTCMonth();
  const totalDays = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  return Array.from({ length: totalDays }, (_, index) => {
    const dayOfMonth = index + 1;
    const date = new Date(Date.UTC(year, monthIndex, dayOfMonth));
    const isoDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
      date.getUTCDate(),
    ).padStart(2, "0")}` as IsoDate;

    return { date: isoDate, dayOfMonth };
  });
}

function entriesByDate(entries: readonly CalendarEntry[]): ReadonlyMap<IsoDate, readonly CalendarEntry[]> {
  const groupedEntries = new Map<IsoDate, CalendarEntry[]>();

  for (const entry of entries) {
    const entriesOnDate = groupedEntries.get(entry.date) ?? [];
    entriesOnDate.push(entry);
    groupedEntries.set(entry.date, entriesOnDate);
  }

  return groupedEntries;
}

function scheduleEventLabels(schedule: Schedule, date: IsoDate): readonly string[] {
  const labels: string[] = [];

  if (schedule.applicationDate === date) {
    labels.push("접수일");
  }
  if (schedule.examDate === date) {
    labels.push("시험일");
  }
  if (schedule.resultDate === date) {
    labels.push("발표일");
  }

  return labels;
}

function monthHeading(month: IsoMonth): string {
  const [year, monthNumber] = month.split("-");
  return `${year}년 ${Number(monthNumber)}월`;
}

function ScheduleEntry({
  entry,
  certificateLabel,
}: {
  readonly entry: CalendarEntry;
  readonly certificateLabel: string;
}) {
  const eventLabels = scheduleEventLabels(entry.schedule, entry.date);

  return (
    <li className="calendar-section__entry" aria-describedby={OFFICIAL_CONFIRMATION_NOTICE_ID}>
      <span className="calendar-section__entry-certificate">{certificateLabel}</span>
      <span className="calendar-section__entry-type">{eventLabels.join(" · ")}</span>
      <span className="calendar-section__entry-source">{sourceLabel(entry.schedule.source)}</span>
      <a
        className="calendar-section__confirmation-link"
        href={`#${OFFICIAL_CONFIRMATION_NOTICE_ID}`}
      >
        공식 확인 안내 보기
      </a>
    </li>
  );
}

function CalendarGrid({
  month,
  entries,
  certificates,
}: {
  readonly month: IsoMonth;
  readonly entries: readonly CalendarEntry[];
  readonly certificates: readonly Certificate[];
}) {
  const calendarDays = daysInMonth(month);
  const firstDayOffset = parseIsoDateUtc(`${month}-01`)?.getUTCDay() ?? 0;
  const cells = [...Array<CalendarDay | null>(firstDayOffset).fill(null), ...calendarDays];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const certificateLabels = new Map(
    certificates.map((certificate) => [certificate.id, certificate.label]),
  );
  const datedEntries = entriesByDate(entries);

  return (
    <table className="calendar-section__calendar">
      <caption>{monthHeading(month)} 시험 일정 달력</caption>
      <thead>
        <tr>
          {WEEKDAY_LABELS.map((weekday) => (
            <th key={weekday} scope="col">
              {weekday}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: cells.length / 7 }, (_, weekIndex) => (
          <tr key={`${month}-week-${weekIndex}`}>
            {cells.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => {
              if (day === null) {
                return <td key={`${month}-empty-${weekIndex}-${dayIndex}`} aria-hidden="true" />;
              }

              const entriesOnDate = datedEntries.get(day.date) ?? [];

              return (
                <td key={day.date} className="calendar-section__day">
                  <time dateTime={day.date}>{day.dayOfMonth}</time>
                  {entriesOnDate.length > 0 && (
                    <ul className="calendar-section__entries">
                      {entriesOnDate.map((entry, index) => (
                        <ScheduleEntry
                          key={`${entry.schedule.id}-${entry.date}-${index}`}
                          entry={entry}
                          certificateLabel={
                            certificateLabels.get(entry.schedule.certificateId) ?? "알 수 없는 종목"
                          }
                        />
                      ))}
                    </ul>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Renders a fixed monthly calendar and an independent multi-certificate filter.
 * It never widens an empty filter result or changes the primary certificate selection.
 */
export function CalendarSection({
  certificates,
  schedules,
  selectedCertificateIds,
  onFilterChange,
  month: requestedMonth,
}: CalendarSectionProps) {
  const calendarMonth = calendarMonthFor(schedules, certificates, requestedMonth);
  const filteredEntries = createCalendarEntries(schedules, selectedCertificateIds);
  const entriesForMonth =
    calendarMonth === null
      ? []
      : filteredEntries.filter((entry) => entry.date.startsWith(`${calendarMonth}-`));

  const emptyState =
    schedules.length === 0
      ? "표시할 시험 일정이 없습니다."
      : calendarMonth === null
        ? "표시할 일정 날짜가 없습니다."
        : filteredEntries.length === 0
          ? "선택한 필터와 일치하는 일정이 없습니다."
          : entriesForMonth.length === 0
            ? "선택한 종목의 일정이 이 달에 없습니다."
            : null;

  return (
    <section className="calendar-section" aria-labelledby="calendar-section-heading">
      <div className="calendar-section__heading">
        <h2 id="calendar-section-heading">월간 시험 일정</h2>
        {calendarMonth !== null && <p>{monthHeading(calendarMonth)}</p>}
      </div>
      <div className="calendar-filter-layout">
        <div className="calendar-section__content">
          {calendarMonth !== null && (
            <CalendarGrid month={calendarMonth} entries={entriesForMonth} certificates={certificates} />
          )}
          {emptyState !== null && <p className="calendar-section__empty">{emptyState}</p>}
        </div>
        <ScheduleFilter
          certificates={certificates}
          selectedCertificateIds={selectedCertificateIds}
          onChange={onFilterChange}
        />
      </div>
    </section>
  );
}
