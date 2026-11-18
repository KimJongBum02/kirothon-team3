/**
 * The shared official-data confirmation path. Schedule components reference
 * this stable ID through aria-describedby.
 */
export function OfficialConfirmationNotice() {
  return (
    <section
      id="official-confirmation-notice"
      className="official-confirmation-notice"
      aria-labelledby="official-confirmation-notice-heading"
    >
      <h2 id="official-confirmation-notice-heading">일정 확인 안내</h2>
      <p>공식 사이트에서 최종 확인 필요</p>
    </section>
  );
}
