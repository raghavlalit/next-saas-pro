import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET() {
    const session = await auth();
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // If user has permission.view, show all permissions. Otherwise, show only active ones.
    const canViewAll = hasPermission(session.user.permissions, 'permission.view');

    const permissions = await prisma.permission.findMany({
        where: canViewAll ? {} : { isActive: true },
        orderBy: [
            { module: 'asc' },
            { name: 'asc' }
        ]
    });

    return NextResponse.json(permissions);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'permission.create')) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    try {
        const body = await req.json();
        const { module, code, name, description, isActive } = body;

        if (!module || !code || !name) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const permission = await prisma.permission.create({
            data: {
                module,
                code,
                name,
                description,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json(permission);
    } catch (error: any) {
        console.error('Error creating permission:', error);
        if (error.code === 'P2002') {
            return new NextResponse('Permission code already exists', { status: 400 });
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
