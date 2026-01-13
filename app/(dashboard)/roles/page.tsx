import { prisma } from "@/lib/db"
import Link from "next/link"
import { Plus, Shield, Users, Edit, Trash2 } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { redirect } from "next/navigation"

import { PaginationControl } from "@/components/ui/pagination-control"

export default async function RolesPage(props: {
    searchParams: Promise<{ page?: string }>
}) {
    const session = await auth();
    if (!session || !hasPermission(session.user.permissions, 'role.view')) {
        redirect('/dashboard');
    }

    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams.page) || 1;
    const ITEMS_PER_PAGE = 10;

    const [roles, totalCount] = await Promise.all([
        prisma.role.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        prisma.role.count()
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const canCreateRole = hasPermission(session.user.permissions, 'role.create');
    const canEditRole = hasPermission(session.user.permissions, 'role.edit');
    const canDeleteRole = hasPermission(session.user.permissions, 'role.delete');

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Roles & Permissions
                    </h1>
                </div>
                {canCreateRole && (
                    <Link href="/roles/create" className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        <Plus className="h-4 w-4" />
                        New Role
                    </Link>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                    <div key={role.id} className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
                            {role.isSystemRole && (
                                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                    System
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">
                            {role.description || 'No description provided.'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{role._count.users} Users</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                <span>{role.code}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                            {canEditRole && (
                                <Link
                                    href={`/roles/${role.id}/edit`}
                                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Link>
                            )}
                            {canDeleteRole && !role.isSystemRole && (
                                <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {roles.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                    <Shield className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No roles found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get started by creating a new role.</p>
                </div>
            )}

            <PaginationControl 
                currentPage={currentPage}
                totalPages={totalPages}
            />
        </div>
    );
}
