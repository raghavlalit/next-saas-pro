import { prisma } from "@/lib/db"
import Link from "next/link"
import { Plus, Eye } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { auth } from "@/lib/auth"
import { PaginationControl } from "@/components/ui/pagination-control"
import { InvoiceStatusSelect } from "@/components/invoices/invoice-status-select"

const ITEMS_PER_PAGE = 10;

export default async function InvoicesPage(props: {
    searchParams: Promise<{ page?: string }>
}) {
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams.page) || 1;
    const session = await auth();
    const isClient = session?.user?.role === 'client'; 

    let whereClause = {};
    if (isClient && session?.user?.id) {
        const client = await prisma.client.findFirst({
            where: { userId: session.user.id }
        });
        if (client) {
            whereClause = { clientId: client.id };
        } else {
             // If client record not found for client user, show nothing
             whereClause = { clientId: 'x' }; 
        }
    }

    const [invoices, totalCount] = await Promise.all([
        prisma.invoice.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                client: {
                    select: { name: true }
                }
            },
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        prisma.invoice.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Invoices
                </h1>
                {!isClient && (
                    <Link href="/invoices/create" className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        <Plus className="h-4 w-4" />
                        New Invoice
                    </Link>
                )}
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Number
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Client
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Date
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
                        {invoices.map((invoice: any) => (
                            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                                    <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                                        {invoice.invoiceNumber}
                                    </Link>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {invoice.client.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {invoice.amountTotal.toFixed(2)} {invoice.currency}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(invoice.issuedDate).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <InvoiceStatusSelect 
                                        invoiceId={invoice.id} 
                                        currentStatus={invoice.status} 
                                        readonly={session?.user?.role !== 'super_admin'}
                                    />
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <Link href={`/invoices/${invoice.id}`} className="inline-flex items-center gap-1 rounded-md p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/50">
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">View</span>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    No invoices found. Create one to get started.
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
