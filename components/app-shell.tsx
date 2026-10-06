import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./theme-toggle";

export interface CurrentOrgInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
  membersCount: number;
}

interface AppShellProps {
  currentOrg: CurrentOrgInfo;
  children?: React.ReactNode;
}

/**
 * Dense developer tool shell for Cartograph.
 * 
 * Provides:
 * - Top control bar: app identifier, organization switcher with invitation access, theme toggle, and account button.
 * - Workspace area: renders server-side verified team context and acts as the container for subsequent phases.
 */
export function AppShell({ currentOrg, children }: AppShellProps) {
  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden font-sans">
      {/* Top control bar: dense 40px height */}
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-surface-border bg-surface px-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-wider uppercase text-foreground">
              CARTOGRAPH
            </span>
            <span className="font-mono text-[10px] text-muted border border-surface-border px-1 py-0.2 rounded">
              phase-01
            </span>
          </div>

          <span className="text-surface-border">/</span>

          {/* Organization Switcher: personal accounts hidden, team management & invites built-in */}
          <div className="flex items-center">
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
                    "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono text-foreground hover:bg-surface-border/50 border border-surface-border transition-colors cursor-pointer",
                  organizationPreviewTextContainer: "text-xs font-mono",
                },
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <div className="h-4 w-px bg-surface-border" />
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
      <main className="flex flex-1 flex-col overflow-auto bg-background p-4">
        {children ? (
          children
        ) : (
          <div className="flex flex-col gap-4 max-w-4xl">
            {/* Server Render Verification Panel */}
            <div className="rounded border border-surface-border bg-surface p-4">
              <div className="flex items-center justify-between border-b border-surface-border pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-inflow" />
                  <span className="font-mono text-xs font-semibold text-foreground uppercase tracking-wide">
                    Workspace Context
                  </span>
                </div>
                <span className="font-mono text-[11px] text-muted">
                  Server-rendered on first paint
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex flex-col gap-1 rounded border border-surface-border/60 bg-background p-2.5">
                  <span className="text-[10px] text-muted uppercase">Active Team</span>
                  <span className="font-semibold text-foreground">{currentOrg.name}</span>
                  <span className="text-[11px] text-muted">{currentOrg.id}</span>
                </div>

                <div className="flex flex-col gap-1 rounded border border-surface-border/60 bg-background p-2.5">
                  <span className="text-[10px] text-muted uppercase">Membership Role</span>
                  <span className="font-semibold text-foreground">{currentOrg.role}</span>
                  <span className="text-[11px] text-muted">
                    {currentOrg.membersCount} {currentOrg.membersCount === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-surface-border/60 text-[11px] font-mono text-muted flex flex-col gap-1">
                <div>
                  • <span className="text-foreground">Identity & Claims:</span> Token carries active org{" "}
                  <code className="text-foreground">{currentOrg.id}</code>.
                </div>
                <div>
                  • <span className="text-foreground">Database Client:</span> Configured with Clerk Bearer token without secondary session cookies.
                </div>
                <div>
                  • <span className="text-foreground">Invitations & Switching:</span> Managed through the team switcher in the top bar.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
