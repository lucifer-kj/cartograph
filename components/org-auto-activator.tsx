"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface OrgAutoActivatorProps {
  organizationId: string;
}

/**
 * Client component that sets the active organization on the Clerk session
 * when a user signs in for the first time without an active organization claim.
 *
 * Ensures the Clerk session is fully loaded and passes the sessionId directly
 * to setActive to prevent race conditions during OAuth/SSO redirects.
 */
export function OrgAutoActivator({ organizationId }: OrgAutoActivatorProps) {
  const { isLoaded, isSignedIn, sessionId, orgId } = useAuth();
  const { setActive } = useClerk();
  const router = useRouter();
  const activatingRef = useRef(false);

  useEffect(() => {
    // Wait until Clerk client and user session are fully loaded
    if (!isLoaded || !isSignedIn || !sessionId || !setActive) {
      return;
    }

    // If target org is already active, refresh to re-render server component
    if (orgId === organizationId) {
      router.refresh();
      return;
    }

    if (activatingRef.current) return;
    activatingRef.current = true;

    async function activate() {
      try {
        await setActive({
          session: sessionId,
          organization: organizationId,
        });
        router.refresh();
      } catch (err) {
        console.error("Failed to activate organization:", err);
        activatingRef.current = false;
      }
    }

    activate();
  }, [isLoaded, isSignedIn, sessionId, orgId, setActive, organizationId, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground font-mono text-xs">
      <div className="flex flex-col items-center gap-2 border border-surface-border bg-surface p-6 rounded shadow-xs max-w-sm text-center">
        <div className="h-2 w-2 rounded-full bg-accent animate-ping" />
        <div className="text-foreground font-medium">Entering workspace...</div>
        <div className="text-muted text-[11px]">Activating team context</div>
      </div>
    </div>
  );
}
