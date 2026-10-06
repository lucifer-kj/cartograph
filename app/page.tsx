import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { OrgAutoActivator } from "@/components/org-auto-activator";
import { createServerClient } from "@/lib/supabase/server";

export interface AnalysisRecord {
  id: string;
  commit_hash: string | null;
  status: string;
  stage: string | null;
  error_message: string | null;
  created_at: string;
  projects: {
    name: string;
    repo_url: string;
  } | null;
}

/**
 * Phase 2 Dashboard Page.
 *
 * Requirements:
 * - Queries analyses belonging to the active organization.
 * - DOES NOT filter by organization in application code. RLS policies in Postgres
 *   filter rows based on the organization claim in the auth token.
 * - Displays the list of analyses, each one's status/state, or an empty state
 *   for an organization that has never run one.
 */
export default async function HomePage() {
  const { userId, orgId, orgRole, orgSlug } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Handle first sign-in or inactive organization state
  if (!orgId) {
    const clerk = await clerkClient();
    const memberships = await clerk.users.getOrganizationMembershipList({
      userId,
      limit: 10,
    });

    let targetOrgId = memberships.data[0]?.organization.id;

    if (!targetOrgId) {
      // First sign-in: provision team workspace automatically without prompting
      const user = await clerk.users.getUser(userId);
      const identifier =
        user.firstName ||
        user.username ||
        (user.emailAddresses[0]?.emailAddress
          ? user.emailAddresses[0].emailAddress.split("@")[0]
          : "Workspace");

      const newOrg = await clerk.organizations.createOrganization({
        name: `${identifier}'s Team`,
        createdBy: userId,
      });

      targetOrgId = newOrg.id;
    }

    return <OrgAutoActivator organizationId={targetOrgId} />;
  }

  // Active organization claim is present on the token: read server-side
  const clerk = await clerkClient();
  const org = await clerk.organizations.getOrganization({
    organizationId: orgId,
  });

  // Query analyses. No application-level org filtering: Postgres RLS policy filters rows.
  const supabase = await createServerClient();
  const { data: analyses, error } = await supabase
    .from("analyses")
    .select(`
      id,
      commit_hash,
      status,
      stage,
      error_message,
      created_at,
      projects (
        name,
        repo_url
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <AppShell
      currentOrg={{
        id: org.id,
        name: org.name,
        slug: org.slug || orgSlug || "",
        role: orgRole || "org:member",
        membersCount: org.membersCount || 1,
      }}
      analyses={(analyses as unknown as AnalysisRecord[]) || []}
      queryError={error ? error.message : null}
    />
  );
}
