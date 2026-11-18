import type { DataSource } from "../domain/models";
import { sourceLabel } from "../domain/provenance";

export interface AttributionFooterProps {
  readonly attribution: readonly DataSource[];
}

/** Renders only allow-listed, display-safe source labels. */
export function AttributionFooter({ attribution }: AttributionFooterProps) {
  const sourceLabels = [...new Set(attribution.map(sourceLabel))];

  return (
    <footer className="attribution-footer" aria-labelledby="attribution-footer-heading">
      <h2 id="attribution-footer-heading">데이터 출처</h2>
      {sourceLabels.length > 0 ? (
        <ul className="attribution-footer__sources">
          {sourceLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      ) : (
        <p className="attribution-footer__empty">출처 정보 준비 중</p>
      )}
      <p className="attribution-footer__confirmation">공식 사이트에서 최종 확인 필요</p>
    </footer>
  );
}
