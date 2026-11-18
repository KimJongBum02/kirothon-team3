import type { PracticeLinkConfig } from "../domain/models";

export interface ExternalPracticeActionProps {
  readonly config: PracticeLinkConfig;
  readonly onShowPlaceholder: (text: string) => void;
  readonly navigate: (destination: string, target: "same-tab" | "new-tab") => void;
}

function hasConfiguredHttpsDestination(
  config: PracticeLinkConfig,
): config is Extract<PracticeLinkConfig, { readonly destination: `https://${string}` }> {
  if (config.destination === null || config.target === null) {
    return false;
  }

  if (config.target !== "same-tab" && config.target !== "new-tab") {
    return false;
  }

  try {
    return new URL(config.destination).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Keeps external practice navigation behind an injected, explicitly configured
 * HTTPS destination. Unconfigured or invalid values show a local placeholder.
 */
export function ExternalPracticeAction({
  config,
  onShowPlaceholder,
  navigate,
}: ExternalPracticeActionProps) {
  const handleClick = () => {
    if (!hasConfiguredHttpsDestination(config)) {
      onShowPlaceholder(config.placeholderText);
      return;
    }

    navigate(config.destination, config.target);
  };

  return (
    <button type="button" className="practice-action" onClick={handleClick}>
      시험 더 풀어보기
    </button>
  );
}
