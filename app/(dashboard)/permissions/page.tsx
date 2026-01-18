import { prisma } from "@/lib/db"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Plus, Edit } from "lucide-react"
import { DeletePermissionButton } from "@/components/permissions/delete-permission-button"

import { PaginationControl } from "@/components/ui/pagination-control"

export const dynamic = 'force-dynamic';

export default async function PermissionsPage(props: {
    searchParams: Promise<{ page?: string }>
}) {
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'permission.view')) {
        redirect('/dashboard');
    }

    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams.page) || 1;
    const ITEMS_PER_PAGE = 10;

    const [permissions, totalCount] = await Promise.all([
        prisma.permission.findMany({
            orderBy: [
                { module: 'asc' },
                { code: 'asc' }
            ],
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        prisma.permission.count()
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const canCreate = hasPermission(session.user.permissions, 'permission.create');
    const canEdit = hasPermission(session.user.permissions, 'permission.edit');
    const canDelete = hasPermission(session.user.permissions, 'permission.delete');

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Permissions
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage atomic system permissions.
                    </p>
                </div>
                {canCreate && (
                    <Link
                        href="/permissions/create"
                        className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add Permission
                    </Link>
                )}
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Module
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Code
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {permissions.map((permission) => (
                            <tr key={permission.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        {permission.module}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    <code>{permission.code}</code>
                                </td>
                                <td className="px-6 py-4 text-sm text-foreground">
                                    <div className="font-medium">{permission.name}</div>
                                    {permission.description && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</div>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${permission.isActive
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {permission.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <div className="flex justify-end gap-3">
                                        {canEdit && (
                                            <Link
                                                href={`/permissions/${permission.id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        )}
                                        {canDelete && (
                                            <DeletePermissionButton permissionId={permission.id} />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <PaginationControl 
                currentPage={currentPage}
                totalPages={totalPages}
            />
        </div>
    );
}
