import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { deleteInvoice } from "@/app/actions";

import { PayInvoiceButton } from "@/components/pay-invoice-button";
import { DownloadPDFButton } from "@/components/download-pdf-button";
import { Breadcrumb } from "@/components/ui/breadcrumb";

import { auth } from "@/lib/auth";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const isClient = session?.user?.role === 'client';
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            client: true,
            items: true
        }
    });

    if (!invoice) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {invoice.invoiceNumber}
                </h1>
                <div className="flex gap-2">
                    <DownloadPDFButton invoice={invoice} />
                    {isClient && invoice.status === 'PENDING' && (
                        <PayInvoiceButton invoiceId={invoice.id} />
                    )}
                    {!isClient && (
                        <form action={deleteInvoice.bind(null, invoice.id)}>
                            <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                                Delete
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-medium text-foreground">Invoice Details</h3>
                    <dl className="mt-4 space-y-4">
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
                            <dd className="text-sm font-medium text-foreground">{invoice.status}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Issued Date</dt>
                            <dd className="text-sm font-medium text-foreground">{new Date(invoice.issuedDate).toLocaleDateString()}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Due Date</dt>
                            <dd className="text-sm font-medium text-foreground">{new Date(invoice.dueDate).toLocaleDateString()}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Currency</dt>
                            <dd className="text-sm font-medium text-foreground">{invoice.currency}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-medium text-foreground">Client Details</h3>
                    <dl className="mt-4 space-y-4">
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Name</dt>
                            <dd className="text-sm font-medium text-foreground">
                                <Link href={`/clients/${invoice.clientId}`} className="text-indigo-600 hover:underline dark:text-indigo-400">
                                    {invoice.client.name}
                                </Link>
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
                            <dd className="text-sm font-medium text-foreground">{invoice.client.email}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-500 dark:text-gray-400">Address</dt>
                            <dd className="mt-1 text-sm text-foreground whitespace-pre-wrap">{invoice.client.billingAddress}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-medium text-foreground">Items</h3>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Description</th>
                            <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Qty</th>
                            <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Unit Price</th>
                            <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {invoice.items.map((item: any) => (
                            <tr key={item.id}>
                                <td className="px-4 py-2 text-sm text-foreground">{item.description}</td>
                                <td className="px-4 py-2 text-right text-sm text-foreground">{item.quantity}</td>
                                <td className="px-4 py-2 text-right text-sm text-foreground">{item.unitPrice.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right text-sm text-foreground">{item.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} className="px-4 py-2 text-right text-sm font-bold text-foreground">Total</td>
                            <td className="px-4 py-2 text-right text-sm font-bold text-foreground">{invoice.amountTotal.toFixed(2)} {invoice.currency}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
