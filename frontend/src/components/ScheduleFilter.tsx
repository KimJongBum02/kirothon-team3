import type { Certificate, CertificateId } from "../domain/models";

export interface ScheduleFilterProps {
  readonly certificates: readonly Certificate[];
  readonly selectedCertificateIds: ReadonlySet<CertificateId>;
  readonly onChange: (certificateId: CertificateId, selected: boolean) => void;
}

/**
 * Provides an independent multi-select filter for the monthly schedule view.
 * Native labels give each checkbox its Korean accessible name.
 */
export function ScheduleFilter({
  certificates,
  selectedCertificateIds,
  onChange,
}: ScheduleFilterProps) {
  return (
    <fieldset className="schedule-filter">
      <legend className="schedule-filter__heading">일정 종목 필터</legend>
      <div className="schedule-filter__controls">
        {certificates.map((certificate) => {
          const controlId = `schedule-filter-${certificate.id}`;

          return (
            <div key={certificate.id} className="schedule-filter__control">
              <input
                id={controlId}
                type="checkbox"
                checked={selectedCertificateIds.has(certificate.id)}
                onChange={(event) => onChange(certificate.id, event.currentTarget.checked)}
              />
              <label htmlFor={controlId}>{certificate.label}</label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
