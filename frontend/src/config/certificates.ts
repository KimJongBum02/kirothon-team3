import type { Certificate } from "../domain/models";

/**
 * Supported certificates use stable IDs for state and associations, while the
 * Korean labels remain presentation-only values.
 */
export const CERTIFICATES = [
  {
    id: "information-processing-industrial-engineer",
    label: "정보처리산업기사",
  },
  {
    id: "information-processing-engineer",
    label: "정보처리기사",
  },
  {
    id: "information-security-engineer",
    label: "정보보안기사",
  },
  {
    id: "information-security-industrial-engineer",
    label: "정보보안산업기사",
  },
] as const satisfies readonly Certificate[];
