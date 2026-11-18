import type { Certificate, CertificateId } from "../../../domain/models";

export interface CertificateSelectorProps {
  readonly certificates: readonly Certificate[];
  readonly selectedCertificateId: CertificateId;
  readonly onSelect: (certificateId: CertificateId) => void;
}

/**
 * Provides the dashboard's single certificate-selection control group.
 */
export function CertificateSelector({
  certificates,
  selectedCertificateId,
  onSelect,
}: CertificateSelectorProps) {
  return (
    <section className="certificate-selector" aria-labelledby="certificate-selector-heading">
      <h2 id="certificate-selector-heading" className="certificate-selector__heading">
        학습 종목 선택
      </h2>
      <div className="certificate-selector__buttons" role="group" aria-label="자격증 종목 선택">
        {certificates.map((certificate) => {
          const selected = certificate.id === selectedCertificateId;

          return (
            <button
              key={certificate.id}
              type="button"
              className="certificate-selector__button"
              aria-pressed={selected}
              onClick={() => onSelect(certificate.id)}
            >
              {certificate.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
