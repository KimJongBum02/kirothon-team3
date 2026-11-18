import type { MockProfile } from "../domain/models";
import { ProfileBoundary } from "./ProfileBoundary";

export interface DashboardHeaderProps {
  readonly profile: MockProfile | null;
}

/** The service identity and display-safe profile boundary for the dashboard. */
export function DashboardHeader({ profile }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header__identity">
        <h1 className="dashboard-header__title">자격플랜</h1>
      </div>
      <ProfileBoundary profile={profile} />
    </header>
  );
}
