import { prisma } from "@/lib/db"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { RoleForm } from "@/components/roles/role-form"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"

export default async function CreateRolePage() {
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'role.create')) {
        redirect('/roles');
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
                    Create New Role
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Define a new role and assign specific permissions.
                </p>
            </div>

            <RoleForm permissions={permissions} />
        </div>
    );
}
