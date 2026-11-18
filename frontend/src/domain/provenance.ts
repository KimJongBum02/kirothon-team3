import type { DataSource } from "./models";

/** The only label used when a value is not backed by a confirmed provider. */
export const MOCK_DATA_LABEL = "예시 데이터" as const;

/**
 * Confirmed official providers that may be rendered from the initial local
 * dashboard boundary. Additional providers require an explicit review here.
 */
export const ALLOWED_OFFICIAL_PROVIDERS = [
  "한국산업인력공단",
  "공공데이터포털",
] as const;

/** Identifies whether a provider is approved for display as official data. */
export function isAllowedOfficialProvider(provider: string): boolean {
  return (ALLOWED_OFFICIAL_PROVIDERS as readonly string[]).includes(provider);
}

/**
 * Produces a display-safe source label. Unrecognised official providers are
 * conservatively presented as mock data until they are added to the allowlist.
 */
export function sourceLabel(source: DataSource): string {
  if (source.kind === "official" && isAllowedOfficialProvider(source.provider)) {
    return source.provider;
  }

  return MOCK_DATA_LABEL;
}

/** True when a source is safe to present as explicitly confirmed official data. */
export function hasConfirmedOfficialSource(source: DataSource): boolean {
  return source.kind === "official" && isAllowedOfficialProvider(source.provider);
}
