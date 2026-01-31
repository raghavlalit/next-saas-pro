import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

/**
 * NextAuth.js Configuration.
 * 
 * This file handles authentication setup, including:
 * - Prisma Adapter: Persists sessions and users to the database.
 * - Credentials Provider: Handles email/password authentication.
 * - Callbacks: Manages session and JWT token enhancements (RBAC).
 * - Events: Logs specific actions like sign-in.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            /**
             * Authorizes a user based on email and password.
             * Verifies credentials against the database and checks for password validity used bcrypt.
             */
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.user.findUnique({
                        where: { email },
                        include: { role: true }
                    });
                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { lastLoginAt: new Date() },
                        });
                        return user;
                    }
                }
                return null;
            },
        }),
    ],
    callbacks: {
        /**
         * Session Callback
         * Populates the session object with additional user details (role, permissions)
         * from the JWT token.
         */
        async session({ token, session }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role as string;
                session.user.permissions = token.permissions as string[];
            }
            return session;
        },
        /**
         * JWT Callback
         * Called whenever a JSON Web Token is created (i.e. at sign in) or updated.
         * Fetches user role and permissions from the database and attaches them to the token.
         */
        async jwt({ token }) {
            if (!token.sub) return token;

            const user = await prisma.user.findUnique({
                where: { id: token.sub },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            });

            if (user && user.role) {
                token.role = user.role.code;
                token.permissions = user.role.permissions.map(rp => rp.permission.code);
            } else {
                token.role = 'user';
                token.permissions = [];
            }

            return token;
        }
    },
    events: {
        /**
         * SignIn Event
         * Triggered on successful sign-in. Used here to log login activities.
         */
        async signIn({ user }) {
            try {
                if (user.id) {
                    await prisma.loginLog.create({
                        data: {
                            userId: user.id,
                            // Note: IP and User Agent extraction in events might be limited depending on environment.
                            // For accurate IP/UA, we would ideally pass this from the callback if possible,
                            // or use headers() if available in this context (requires Next.js headers() support in auth.ts which involves async access).
                            // For now persisting basic log.
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to log login:", error);
            }
        }
    }
})

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role: string;
            permissions: string[];
        }
    }
}
