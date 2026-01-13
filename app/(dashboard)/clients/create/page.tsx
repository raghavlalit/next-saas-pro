import { Breadcrumb } from "@/components/ui/breadcrumb"
import { NewClientForm } from "@/components/clients/new-client-form"

export default function NewClientPage() {
    return (
        <div className="space-y-6">
            <Breadcrumb />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Add New Client
            </h1>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
                <NewClientForm />
            </div>
        </div>
    )
}
