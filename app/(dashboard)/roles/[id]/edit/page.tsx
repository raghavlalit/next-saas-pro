import { prisma } from "@/lib/db"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { RoleForm } from "@/components/roles/role-form"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { redirect, notFound } from "next/navigation"

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'role.edit')) {
        redirect('/roles');
    }

    const role = await prisma.role.findUnique({
        where: { id },
        include: {
            permissions: true
        }
    });

    if (!role) {
        notFound();
    }

    const permissions = await prisma.permission.findMany({
        where: { isActive: true },
        orderBy: [
            { module: 'asc' },
            { code: 'asc' }
        ]
    });

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Edit Role: {role.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Modify role details and permissions.
                </p>
            </div>

            <RoleForm initialData={role} permissions={permissions} />
        </div>
    );
}
