import { Breadcrumb } from "@/components/ui/breadcrumb"
import { prisma } from "@/lib/db"
import { NewUserForm } from "@/components/users/new-user-form"

export default async function NewUserPage() {
    const roles = await prisma.role.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">
                Add New User
            </h1>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <NewUserForm roles={roles} />
            </div>
        </div>
    )
}
