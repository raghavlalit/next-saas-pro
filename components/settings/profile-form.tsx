"use client"

import { updateProfile } from "@/app/actions"
import { CustomPhoneInput } from "@/components/ui/phone-input"
import { SubmitButton } from "@/components/ui/submit-button"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Country } from "react-phone-number-input"
import type { User } from "@prisma/client"

interface ProfileFormProps {
    user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [phone, setPhone] = useState(user.phone || "")
    const [country, setCountry] = useState<Country>((user.phoneCountryCode as Country) || "US")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            try {
                formData.set("phoneCountryCode", country)
                const result = await updateProfile(formData)
                if (result.success) {
                    toast.success("Profile updated successfully")
                    router.refresh()
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to update profile")
            }
        })
    }

    return (
        <form action={handleSubmit} className="mt-4 space-y-4">
            <input type="hidden" name="phoneCountryCode" value={country} />
            <input type="hidden" name="phone" value={phone} />
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                    type="text"
                    name="name"
                    defaultValue={user.name || ''}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                    type="email"
                    defaultValue={user.email || ''}
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 sm:text-sm"
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
                <SubmitButton>Save Changes</SubmitButton>
            </div>
        </form>
    )
}
