"use client"

import { createUser } from "@/app/actions"
import { useState } from "react"
import type { Role } from "@prisma/client"
import { PasswordInput } from "@/components/ui/password-input"
import { CustomPhoneInput } from "@/components/ui/phone-input"
import { Country } from "react-phone-number-input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { SubmitButton } from "@/components/ui/submit-button"

export function NewUserForm({ roles }: { roles: any[] }) {
    const [phone, setPhone] = useState("")
    const [country, setCountry] = useState<Country>("US")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            try {
                // Ensure phone country is passed
                formData.set("phoneCountryCode", country)
                // Phone is already in formData from hidden input if using name="phone", 
                // but CustomPhoneInput manages it's own hidden input usually? 
                // Wait, CustomPhoneInput as per previous implementation relies on parent state + hidden input manually added or CustomPhoneInput handles it? 
                // Let's check CustomPhoneInput again or just look at previous implementation.
                // Previous implementation used hidden inputs.
                
                const result = await createUser(formData)
                if (result.success) {
                    toast.success("User created successfully")
                    router.push(result.redirectUrl as string)
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to create user")
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="phoneCountryCode" value={country} />
            <input type="hidden" name="phone" value={phone} />
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                    type="email"
                    name="email"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <PasswordInput
                    name="password"
                    required
                    showStrength
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select
                    name="roleId"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    required
                >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Image</label>
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select
                    name="status"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
            </div>
            <div className="flex justify-end">
                <SubmitButton>Create User</SubmitButton>
            </div>
        </form>
    )
}
