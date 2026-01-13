import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'permission.view')) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    const permission = await prisma.permission.findUnique({
        where: { id },
    });

    if (!permission) {
        return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(permission);
}

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'permission.edit')) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    try {
        const body = await req.json();
        const { module, code, name, description, isActive } = body;

        const permission = await prisma.permission.update({
            where: { id },
            data: {
                module,
                code,
                name,
                description,
                isActive,
            },
        });

        return NextResponse.json(permission);
    } catch (error: any) {
        console.error('Error updating permission:', error);
        if (error.code === 'P2002') {
            return new NextResponse('Permission code already exists', { status: 400 });
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'permission.delete')) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    try {
        // Check if permission is in use
        const inUse = await prisma.rolePermission.findFirst({
            where: { permissionId: id }
        });

        if (inUse) {
            return new NextResponse('Cannot delete permission that is assigned to roles', { status: 400 });
        }

        await prisma.permission.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error('Error deleting permission:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
