import type { PracticeLinkConfig } from "../domain/models";

/**
 * External practice navigation remains deliberately unconfigured until an
 * approved HTTPS destination and tab policy are supplied.
 */
export const PRACTICE_LINK = {
  destination: null,
  target: null,
  placeholderText: "연습문제 링크는 아직 설정되지 않았습니다.",
} as const satisfies PracticeLinkConfig;
