import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EditClientForm } from "@/components/clients/edit-client-form";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await prisma.client.findUnique({
        where: { id },
    });

    if (!client) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Breadcrumb />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Edit Client
            </h1>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <EditClientForm client={client} />
            </div>
        </div>
    );
}
