import { prisma } from "@/lib/db"
import Link from "next/link"
import { deleteUser } from "@/app/actions"
import { Edit, Trash2 } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { UserFilters } from "@/components/users/user-filters"
import { PaginationControl } from "@/components/ui/pagination-control"
import { Prisma } from "@prisma/client"

const ITEMS_PER_PAGE = 10;

export const dynamic = 'force-dynamic';

export default async function UsersPage(props: {
    searchParams: Promise<{ search?: string; role?: string; page?: string; name?: string; email?: string }>
}) {
    const searchParams = await props.searchParams;
    const { search, role, name, email } = searchParams;
    const currentPage = Number(searchParams.page) || 1;

    const where: Prisma.UserWhereInput = {
        AND: [
            search ? {
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                ]
            } : {},
            name ? { name: { contains: name } } : {},
            email ? { email: { contains: email } } : {},
            role ? { role: { code: role } } : {},
        ]
    };

    const [users, totalCount, roles] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                role: {
                    select: { name: true, code: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        prisma.user.count({ where }),
        prisma.role.findMany({
            select: { name: true, code: true }
        })
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Users
                </h1>
                <Link href="/users/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    Add User
                </Link>
            </div>

            <UserFilters roles={roles} />

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Joined
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {users.length === 0 ? (
                             <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No users found matching your search.
                                </td>
                            </tr>
                        ) : (
                            users.map((user: any) => (
                                <tr key={user.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                                        {user.name}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {user.email}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {user.role?.name || 'No Role'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/users/${user.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Edit</span>
                                            </Link>
                                            <form action={deleteUser.bind(null, user.id)}>
                                                <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
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
