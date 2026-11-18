import type {
  CalendarEntry,
  CertificateId,
  IsoDate,
  Schedule,
} from "../../../domain/models";

const MILLISECONDS_PER_DAY = 86_400_000;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses an exact calendar date as UTC without accepting locale-dependent or
 * browser-inferred date formats. Invalid calendar dates return null.
 */
export function parseIsoDateUtc(value: string | null | undefined): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  if (year < 1 || monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(0);
  date.setUTCFullYear(year, monthIndex, day);
  date.setUTCHours(0, 0, 0, 0);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

/** Returns true only for a real calendar date in exact YYYY-MM-DD form. */
export function isValidIsoDate(value: string | null | undefined): value is IsoDate {
  return parseIsoDateUtc(value) !== null;
}

/**
 * Calculates the UTC calendar-day difference between an exam and the supplied
 * deterministic current date. A malformed or missing date is unavailable.
 */
export function calculateDDay(
  examDate: IsoDate | string | null,
  now: IsoDate | string,
): number | null {
  const exam = parseIsoDateUtc(examDate);
  const current = parseIsoDateUtc(now);

  if (!exam || !current) {
    return null;
  }

  return Math.ceil((exam.getTime() - current.getTime()) / MILLISECONDS_PER_DAY);
}

/**
 * Calculates a rounded completion percentage when the counts form a valid
 * completed subset. Zero totals and malformed counts are unavailable.
 */
export function completionPercentage(completed: number, total: number): number | null {
  if (
    !Number.isInteger(completed) ||
    !Number.isInteger(total) ||
    total <= 0 ||
    completed < 0 ||
    completed > total
  ) {
    return null;
  }

  return Math.round((completed / total) * 100);
}

/** Projects only the schedule rows associated with the primary selection. */
export function selectSchedulesForCertificate(
  schedules: readonly Schedule[],
  certificateId: CertificateId,
): readonly Schedule[] {
  return schedules.filter((schedule) => schedule.certificateId === certificateId);
}

/** Projects only the schedule rows associated with one or more calendar filters. */
export function filterSchedules(
  schedules: readonly Schedule[],
  certificateIds: ReadonlySet<CertificateId>,
): readonly Schedule[] {
  return schedules.filter((schedule) => certificateIds.has(schedule.certificateId));
}

/**
 * Creates calendar entries for every valid application, examination, and
 * result date belonging to the active certificate filters.
 */
export function createCalendarEntries(
  schedules: readonly Schedule[],
  certificateIds: ReadonlySet<CertificateId>,
): readonly CalendarEntry[] {
  return filterSchedules(schedules, certificateIds).flatMap((schedule) =>
    [schedule.applicationDate, schedule.examDate, schedule.resultDate].flatMap(
      (date): CalendarEntry[] => (isValidIsoDate(date) ? [{ date, schedule }] : []),
    ),
  );
}
