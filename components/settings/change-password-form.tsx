"use client"

import { useState, useTransition } from "react"
import { updatePassword } from "@/app/actions"
import { PasswordInput } from "@/components/ui/password-input"
import { SubmitButton } from "@/components/ui/submit-button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ChangePasswordForm() {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
             try {
                const result = await updatePassword(formData)
                if (result && result.success) {
                    toast.success("Password updated successfully")
                    // Optional: Reset form or sign out
                    router.refresh()
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to update password")
            }
        })
    }

    return (
        <form action={handleSubmit} className="mt-4 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                <PasswordInput
                    name="currentPassword"
                    required
                    showStrength={false}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <PasswordInput
                    name="newPassword"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                <PasswordInput
                    name="confirmPassword"
                    required
                    showStrength={false}
                />
            </div>

            <div>
                <SubmitButton>Change Password</SubmitButton>
            </div>
        </form>
    )
}
