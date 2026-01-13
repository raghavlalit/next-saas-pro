import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { deleteClient } from "@/app/actions";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            invoices: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!client) {
        notFound();
    }

    const totalBilled = client.invoices.reduce((sum: number, inv: any) => sum + inv.amountTotal, 0);
    const totalPaid = client.invoices.filter((inv: any) => inv.status === 'PAID').reduce((sum: number, inv: any) => sum + inv.amountTotal, 0);
    const outstandingBalance = totalBilled - totalPaid;

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {client.companyLogo && (
                         // eslint-disable-next-line @next/next/no-img-element
                        <img src={client.companyLogo} alt={client.name} className="h-16 w-16 object-contain rounded-full bg-white p-1" />
                    )}
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {client.name}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Link href={`/clients/${client.id}/edit`} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        Edit Client
                    </Link>
                    <form action={deleteClient.bind(null, client.id)}>
                        <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                            Delete
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Billed</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{totalBilled.toFixed(2)} {client.currency}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Paid</p>
                    <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{totalPaid.toFixed(2)} {client.currency}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding</p>
                    <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">{outstandingBalance.toFixed(2)} {client.currency}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-medium text-foreground">Client Details</h3>
                    <dl className="mt-4 space-y-4">
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Client Code</dt>
                            <dd className="text-sm font-medium text-foreground">{client.clientCode}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
                            <dd className="text-sm font-medium text-foreground">{client.email}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Phone</dt>
                            <dd className="text-sm font-medium text-foreground">{client.phone || '-'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Company</dt>
                            <dd className="text-sm font-medium text-foreground">{client.companyName || '-'}</dd>
                        </div>
                        {client.companyCode && (
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500 dark:text-gray-400">Company Code</dt>
                                <dd className="text-sm font-medium text-foreground">{client.companyCode}</dd>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
                            <dd className="text-sm font-medium text-foreground">{client.status}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-medium text-foreground">Billing Info</h3>
                    <dl className="mt-4 space-y-4">
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Tax ID</dt>
                            <dd className="text-sm font-medium text-foreground">{client.taxId || '-'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Currency</dt>
                            <dd className="text-sm font-medium text-foreground">{client.currency}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Address</dt>
                            <dd className="mt-1 text-sm text-foreground whitespace-pre-wrap">{client.billingAddress}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">City/State/Zip</dt>
                            <dd className="text-sm font-medium text-foreground">
                                {[client.city, client.state, client.zipcode].filter(Boolean).join(', ') || '-'}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Country</dt>
                            <dd className="text-sm font-medium text-foreground">{client.country || '-'}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-medium text-foreground">Invoices</h3>
                {client.invoices.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No invoices found.</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Number</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Amount</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {client.invoices.map((invoice: any) => (
                                <tr key={invoice.id}>
                                    <td className="px-4 py-2 text-sm text-foreground">{invoice.invoiceNumber}</td>
                                    <td className="px-4 py-2 text-sm text-foreground">{new Date(invoice.issuedDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 text-sm text-foreground">{invoice.amountTotal} {invoice.currency}</td>
                                    <td className="px-4 py-2 text-sm text-foreground">{invoice.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
