import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./theme-toggle";
import type { AnalysisRecord } from "@/app/page";

export interface CurrentOrgInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
  membersCount: number;
}

interface AppShellProps {
  currentOrg: CurrentOrgInfo;
  analyses?: AnalysisRecord[];
  queryError?: string | null;
  children?: React.ReactNode;
}

/**
 * Minimal developer tool shell with Phase 2 Dashboard.
 *
 * Displays:
 * - Top control bar: app identifier, team switcher, theme control, user button.
 * - Active organization information in plain text.
 * - List of analyses belonging to the current organization or an empty state.
 */
export function AppShell({ currentOrg, analyses = [], queryError, children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Top Header */}
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4">
        <div className="flex items-center gap-2.5">
          <span className="rounded bg-blue-500/10 dark:bg-blue-600/20 px-2 py-0.5 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
            cartograph
          </span>

          <span className="text-zinc-400 dark:text-zinc-600 text-sm font-light">/</span>

          <OrganizationSwitcher
            hidePersonal={true}
            createOrganizationMode="modal"
            organizationProfileMode="modal"
            afterCreateOrganizationUrl="/"
            afterSelectOrganizationUrl="/"
            afterLeaveOrganizationUrl="/"
            appearance={{
              elements: {
                rootBox: "flex items-center",
                organizationSwitcherTrigger:
                  "flex items-center gap-1.5 text-xs text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity cursor-pointer font-sans",
                organizationPreviewTextContainer: "text-xs font-medium",
              },
            }}
          />
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-6 w-6",
              },
            }}
          />
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 p-6">
        {children ? (
          children
        ) : (
          <div className="flex flex-col">
            {/* Organization Identity */}
            <div className="flex flex-col mb-8">
              <span className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">
                Organization
              </span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                {currentOrg.name}
              </span>
              <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                {currentOrg.id}
              </span>
            </div>

            {/* Dashboard: Analyses belonging to active organization */}
            <div className="flex flex-col max-w-2xl">
              <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                Analyses
              </div>

              {queryError && (
                <div className="text-xs font-mono text-amber-600 dark:text-amber-400 mb-4">
                  Note: {queryError}
                </div>
              )}

              {analyses.length === 0 ? (
                <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                  No analyses have been run for this team.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900 border-t border-b border-zinc-200 dark:border-zinc-800">
                  {analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="py-3 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {analysis.projects?.name || "unnamed"}
                        </span>
                        {analysis.commit_hash && (
                          <span className="text-zinc-400 dark:text-zinc-500">
                            {analysis.commit_hash.slice(0, 7)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={
                            analysis.status === "complete"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : analysis.status === "failed"
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-amber-600 dark:text-amber-400"
                          }
                        >
                          {analysis.status}
                          {analysis.stage ? ` (${analysis.stage})` : ""}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-600">
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
