import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { validateEnv } from "./lib/env";

// Ensure environment configuration is valid at boot time; fail loudly if incomplete
validateEnv();

// Public routes accessible without authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all non-public routes. Unauthenticated requests are immediately redirected
  // before any page HTML renders or is transmitted over the network.
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
