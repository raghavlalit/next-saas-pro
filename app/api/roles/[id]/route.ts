import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'role.view')) {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    const role = await prisma.role.findUnique({
        where: { id: params.id },
        include: {
            permissions: true
        }
    });

    return NextResponse.json(role);
}

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'role.edit')) {
        return new NextResponse('Unauthorized', { status: 403 });
    }
// ... (rest of code logic remains same, just ensuring params is awaited)
    try {
        const body = await req.json();
        const { name, description, permissionIds } = body;

        if (!name) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Update role and its permissions
        const role = await prisma.role.update({
            where: { id: params.id },
            data: {
                name,
                description,
                permissions: {
                    deleteMany: {},
                    create: permissionIds.map((id: string) => ({
                        permission: { connect: { id } }
                    }))
                }
            }
        });

        return NextResponse.json(role);
    } catch (error) {
        console.error('[ROLE_PUT]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'role.delete')) {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    try {
        const role = await prisma.role.findUnique({
            where: { id: params.id }
        });

        if (!role) {
            return new NextResponse('Role not found', { status: 404 });
        }

        if (role.isSystemRole) {
            return new NextResponse('Cannot delete system role', { status: 400 });
        }

        await prisma.role.delete({
            where: { id: params.id }
        });

        return new NextResponse('Deleted', { status: 200 });
    } catch (error) {
        console.error('[ROLE_DELETE]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
