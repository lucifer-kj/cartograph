import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { OrgAutoActivator } from "@/components/org-auto-activator";

/**
 * Server component for the primary workspace.
 * 
 * Verifies that:
 * 1. An authenticated session exists (otherwise redirected to /sign-in).
 * 2. An active organization claim is present on the session token.
 *    If missing (e.g. brand new user on first sign-in), auto-creates or auto-selects
 *    the team organization without prompting the user, and activates it on the session.
 * 3. The current organization is read during server rendering and passed to the shell,
 *    ensuring it is rendered in the initial HTML on first paint.
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

    // Activate the organization claim on the client session and refresh
    return <OrgAutoActivator organizationId={targetOrgId} />;
  }

  // Active organization claim is present on the token: read server-side
  const clerk = await clerkClient();
  const org = await clerk.organizations.getOrganization({
    organizationId: orgId,
  });

  return (
    <AppShell
      currentOrg={{
        id: org.id,
        name: org.name,
        slug: org.slug || orgSlug || "",
        role: orgRole || "org:member",
        membersCount: org.membersCount || 1,
      }}
    />
  );
}
