import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            const token = crypto.randomBytes(32).toString("hex");
            const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // 15 minutes

            await prisma.passwordResetToken.create({
                data: {
                    email,
                    token,
                    expires,
                },
            });

            await sendPasswordResetEmail(email, token);
        }

        // Always return success to prevent email enumeration
        return NextResponse.json({ message: "If an account exists, a reset email has been sent." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
