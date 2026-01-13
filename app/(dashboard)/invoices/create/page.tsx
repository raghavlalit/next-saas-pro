import { prisma } from "@/lib/db";
import { InvoiceForm } from "@/components/invoice-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewInvoicePage() {
    const session = await auth();
    if (session?.user?.role === 'client') {
        redirect("/invoices");
    }

    const clients = await prisma.client.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Create Invoice
            </h1>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <InvoiceForm clients={clients} />
            </div>
        </div>
    );
}
