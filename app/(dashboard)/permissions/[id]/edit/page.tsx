import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { redirect, notFound } from "next/navigation"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { PermissionForm } from "@/components/permissions/permission-form"

export default async function EditPermissionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'permission.edit')) {
        redirect('/permissions');
    }

    const permission = await prisma.permission.findUnique({
        where: { id },
    });

    if (!permission) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Edit Permission: {permission.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Modify permission details.
                </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <PermissionForm initialData={permission} />
            </div>
        </div>
    );
}
