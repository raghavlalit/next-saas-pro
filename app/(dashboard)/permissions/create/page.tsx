import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { PermissionForm } from "@/components/permissions/permission-form"

export default async function CreatePermissionPage() {
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'permission.create')) {
        redirect('/permissions');
    }

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Create Permission
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Define a new atomic permission for the system.
                </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <PermissionForm />
            </div>
        </div>
    );
}
