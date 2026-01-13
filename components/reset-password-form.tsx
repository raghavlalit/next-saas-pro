"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { resetPassword } from "@/app/actions"
import { PasswordInput } from "@/components/ui/password-input"
import { passwordSchema } from "@/lib/validations"

export function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!token) {
            setStatus('error')
            setMessage("Invalid or missing token")
            return
        }

        if (password !== confirmPassword) {
            setStatus('error')
            setMessage("Passwords do not match")
            return
        }

        const validation = passwordSchema.safeParse(password);
        if (!validation.success) {
            setStatus('error')
            setMessage(validation.error.issues[0].message)
            return
        }

        setStatus('loading')
        try {
            await resetPassword(token, password)
            setStatus('success')
            setMessage("Password successfully reset! Redirecting to login...")
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (error: any) {
            setStatus('error')
            setMessage(error.message || "Failed to reset password")
        }
    }

    if (!token) {
        return <div className="text-red-600">Invalid or missing reset token.</div>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <PasswordInput
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                <PasswordInput
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    showStrength={false}
                />
            </div>
            
            {status === 'error' && (
                <div className="text-sm text-red-600">{message}</div>
            )}
            
            {status === 'success' && (
                <div className="text-sm text-green-600">{message}</div>
            )}

            <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
                {status === 'loading' ? 'Resetting...' : 'Set Password'}
            </button>
        </form>
    )
}
