import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    const isOnAuth = pathname.startsWith("/login") || pathname.startsWith("/register");
    const publicRoutes = ["/", "/api/webhook/stripe"]; // Add other public routes here
    const isPublic = publicRoutes.includes(pathname);

    // Redirect logged-in users away from auth pages
    if (isOnAuth) {
        if (isLoggedIn) {
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return; // Allow access to auth pages if not logged in
    }

    // Require authentication for all other routes (except static files handled by matcher)
    if (!isLoggedIn && !isPublic) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }
        return Response.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
    }

    // Role-Based Access Control (RBAC) Logic
    if (isLoggedIn) {
        const user = req.auth?.user;
        const role = user?.role;
        const permissions = user?.permissions || [];

        // Admin-only routes (simple check for now, can be expanded)
        // You can use permissions here if available in the session
        const adminRoutes = ["/users", "/roles", "/permissions"];
        
        // Check if the current path is an admin route
        const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

        if (isAdminRoute) {
            // Check for 'super_admin' role or specific permissions if implemented
            // Assuming 'super_admin' has all access, or checking strictly for now
            // If you have specific permissions like 'user.view', check that.
            
            const hasAdminAccess = role === 'super_admin' || permissions.includes('*') || 
                                   (pathname.startsWith("/users") && permissions.includes('user.view')) ||
                                   (pathname.startsWith("/roles") && permissions.includes('role.view')) ||
                                   (pathname.startsWith("/permissions") && permissions.includes('permission.view'));

            if (!hasAdminAccess) {
                 return Response.redirect(new URL("/dashboard", nextUrl));
            }
        }
    }

    return;
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
