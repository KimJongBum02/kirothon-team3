import type { MockProfile } from "../domain/models";

export interface ProfileBoundaryProps {
  readonly profile: MockProfile | null;
}

/**
 * Isolates the current display-only profile fixture from future authentication
 * and user-data providers.
 */
export function ProfileBoundary({ profile }: ProfileBoundaryProps) {
  return (
    <aside className="profile-boundary" aria-label="로그인 정보">
      <h2 className="profile-boundary__heading">로그인 정보</h2>
      {profile ? (
        <p className="profile-boundary__details">
          <span className="profile-boundary__example-label">예시 로그인 정보</span>
          <span className="profile-boundary__name">{profile.displayName}</span>
          <span className="profile-boundary__status">{profile.statusLabel}</span>
        </p>
      ) : (
        <p className="profile-boundary__unavailable">로그인 정보 준비 중</p>
      )}
    </aside>
  );
}
