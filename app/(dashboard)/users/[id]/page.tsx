import { prisma } from "@/lib/db";

import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EditUserForm } from "@/components/users/edit-user-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await prisma.user.findUnique({
        where: { id },
    });

    const roles = await prisma.role.findMany({
        orderBy: { name: 'asc' }
    });

    if (!user) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">
                Edit User
            </h1>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <EditUserForm user={user} roles={roles} />
            </div>
        </div>
    );
}
