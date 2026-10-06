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
 * Minimal developer tool shell matching image 3.
 * Clean, lightweight top navigation and plain text workspace info.
 */
export function AppShell({ currentOrg, children }: AppShellProps) {
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

      {/* Main minimal workspace content */}
      <main className="flex-1 p-6">
        {children ? (
          children
        ) : (
          <div className="flex flex-col">
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
        )}
      </main>
    </div>
  );
}
