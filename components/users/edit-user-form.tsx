"use client"

import { updateUser } from "@/app/actions"
import { CustomPhoneInput } from "@/components/ui/phone-input"
import { SubmitButton } from "@/components/ui/submit-button"
import { useState, useTransition } from "react"
import { Country } from "react-phone-number-input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { User, Role } from "@prisma/client"

interface EditUserFormProps {
    user: User
    roles: Role[]
}

export function EditUserForm({ user, roles }: EditUserFormProps) {
    const [phone, setPhone] = useState(user.phone || "")
    const [country, setCountry] = useState<Country>((user.phoneCountryCode as Country) || "US")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const updateUserWithId = updateUser.bind(null, user.id)

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            try {
                formData.set("phoneCountryCode", country)
                const result = await updateUserWithId(formData)
                if (result && result.success) {
                    toast.success("User updated successfully")
                    router.refresh()
                } else {
                    toast.error("Failed to update user")
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to update user")
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
                    defaultValue={user.name || ''}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                    type="email"
                    name="email"
                    defaultValue={user.email || ''}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password (Leave blank to keep current)</label>
                <input
                    type="password"
                    name="password"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select
                    name="roleId"
                    defaultValue={user.roleId || ''}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    required
                >
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
                {user.image && (
                    <div className="mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={user.image} alt="Current profile" className="h-16 w-16 rounded-full object-cover" />
                    </div>
                )}
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
                <input type="hidden" name="image" value={user.image || ''} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select
                    name="status"
                    defaultValue={user.status}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
            </div>
            <div className="flex justify-end">
                <SubmitButton>Update User</SubmitButton>
            </div>
        </form>
    )
}
