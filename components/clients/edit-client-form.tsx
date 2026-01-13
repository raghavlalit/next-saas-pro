"use client"

import { updateClient } from "@/app/actions"
import { CustomPhoneInput } from "@/components/ui/phone-input"
import { SubmitButton } from "@/components/ui/submit-button"
import { useState, useTransition } from "react"
import { Country } from "react-phone-number-input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Client } from "@prisma/client"



export function EditClientForm({ client }: { client: any }) {
    const [phone, setPhone] = useState(client.phone || "")
    const [country, setCountry] = useState<Country>((client.phoneCountryCode as Country) || "US")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const updateClientWithId = updateClient.bind(null, client.id)

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            try {
                formData.set("phoneCountryCode", country)
                // Phone is in hidden input
                const result = await updateClientWithId(formData)
                if (result.success) {
                    toast.success("Client updated successfully")
                    router.refresh()
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to update client")
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="phoneCountryCode" value={country} />
            <input type="hidden" name="phone" value={phone} />
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={client.name}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            name="email"
                            defaultValue={client.email}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                        <CustomPhoneInput
                            value={phone}
                            onChange={(val) => setPhone(val || "")}
                            onCountryChange={(c) => setCountry(c || "US")}
                            defaultCountry="US"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select
                            name="status"
                            defaultValue={client.status}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Company Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                        <input
                            type="text"
                            name="companyName"
                            defaultValue={client.companyName || ''}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Logo</label>
                        {client.companyLogo && (
                            <div className="mb-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={client.companyLogo} alt="Company logo" className="h-16 w-16 object-contain" />
                            </div>
                        )}
                        <input
                            type="file"
                            name="companyLogo"
                            accept="image/*"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                        <input type="hidden" name="companyLogo" value={client.companyLogo || ''} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Code</label>
                        <input
                            type="text"
                            name="companyCode"
                            defaultValue={client.companyCode || ''}
                            placeholder="Auto-generated if empty"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Address & Billing</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Billing Address</label>
                    <textarea
                        name="billingAddress"
                        defaultValue={client.billingAddress}
                        rows={3}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                        <input
                            type="text"
                            name="city"
                            defaultValue={client.city || ''}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                        <input
                            type="text"
                            name="state"
                            defaultValue={client.state || ''}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zipcode</label>
                        <input
                            type="text"
                            name="zipcode"
                            defaultValue={client.zipcode || ''}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                        <input
                            type="text"
                            name="country"
                            defaultValue={client.country || ''}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tax ID</label>
                        <input
                            type="text"
                            name="taxId"
                            defaultValue={client.taxId || ''}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                        <select
                            name="currency"
                            defaultValue={client.currency}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </select>
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                    <textarea
                        name="notes"
                        defaultValue={client.notes || ''}
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <SubmitButton>Update Client</SubmitButton>
            </div>
        </form>
    )
}
