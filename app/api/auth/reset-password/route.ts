import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ message: "Token and password are required" }, { status: 400 });
        }

        const existingToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!existingToken) {
            return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
        }

        if (new Date() > existingToken.expires) {
            await prisma.passwordResetToken.delete({ where: { id: existingToken.id } });
            return NextResponse.json({ message: "Token expired" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { email: existingToken.email },
            data: { password: hashedPassword },
        });

        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id },
        });

        return NextResponse.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
