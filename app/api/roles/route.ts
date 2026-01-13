import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET() {
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'role.view')) {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    const roles = await prisma.role.findMany({
        include: {
            _count: {
                select: { users: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(roles);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'role.create')) {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, code, description, permissionIds } = body;

        if (!name || !code) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const role = await prisma.role.create({
            data: {
                name,
                code,
                description,
                permissions: {
                    create: permissionIds.map((id: string) => ({
                        permission: { connect: { id } }
                    }))
                }
            }
        });

        return NextResponse.json(role);
    } catch (error) {
        console.error('[ROLES_POST]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
