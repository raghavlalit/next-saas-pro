import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    providers: [
        // We'll add the credentials provider here, but without the Prisma logic
        // The actual authorization will happen in the main auth.ts
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize() {
                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, token }: { session: any, token: any }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role as string;
                session.user.permissions = token.permissions as string[];
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const protectedRoutes = ["/dashboard", "/users", "/roles", "/billing", "/settings"];
            const isProtected = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));

            if (isProtected) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }

            const isOnAuth = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
            if (isOnAuth && isLoggedIn) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            return true;
        },
    },
} satisfies NextAuthConfig;
