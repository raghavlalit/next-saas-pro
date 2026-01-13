import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Credentials({
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
        async session({ token, session }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role as string;
                session.user.permissions = token.permissions as string[];
            }
            return session;
        },
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
