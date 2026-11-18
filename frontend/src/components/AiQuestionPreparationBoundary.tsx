import type { Certificate } from "../domain/models";

export interface AiQuestionPreparationBoundaryProps {
  readonly certificate: Certificate;
  readonly state: "preparing";
}

/**
 * Keeps future AI question generation isolated from the current dashboard UI.
 */
export function AiQuestionPreparationBoundary({
  certificate,
  state,
}: AiQuestionPreparationBoundaryProps) {
  return (
    <section
      className="ai-question-preparation-boundary"
      aria-label={`${certificate.label} AI 예상문제`}
      data-state={state}
    >
      {/* AI_QUESTION_GENERATION_INTEGRATION: replace preparation state only after an approved question service and source-safety review. */}
      <p className="ai-question-preparation-boundary__status">준비중</p>
    </section>
  );
}
