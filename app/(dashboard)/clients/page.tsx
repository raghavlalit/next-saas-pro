import { prisma } from "@/lib/db"
import Link from "next/link"
import { Plus, Eye } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { PaginationControl } from "@/components/ui/pagination-control"

const ITEMS_PER_PAGE = 10;

export default async function ClientsPage(props: {
    searchParams: Promise<{ page?: string }>
}) {
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams.page) || 1;

    const session = await auth();
    const userPermissions = session?.user?.permissions || [];
    const canCreateClient = hasPermission(userPermissions, 'client.create');

    const where = { deletedAt: null };

    const [clients, totalCount] = await Promise.all([
        prisma.client.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { invoices: true }
                }
            },
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        prisma.client.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Clients
                </h1>
                {canCreateClient && (
                    <Link href="/clients/create" className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        <Plus className="h-4 w-4" />
                        New Client
                    </Link>
                )}
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Code
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Company
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Invoices
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {clients.map((client: any) => (
                            <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                                    <Link href={`/clients/${client.id}`} className="hover:underline">
                                        {client.clientCode}
                                    </Link>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="font-medium text-foreground">{client.name}</div>
                                    <div className="text-xs">{client.email}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {client.companyName || '-'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${client.status === 'ACTIVE'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                        }`}>
                                        {client.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {client._count.invoices}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <Link href={`/clients/${client.id}`} className="inline-flex items-center gap-1 rounded-md p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/50">
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">View</span>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {clients.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    No clients found. Create one to get started.
                                </td>
                            </tr>
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
