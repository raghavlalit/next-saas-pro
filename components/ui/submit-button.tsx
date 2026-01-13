"use client"

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

interface SubmitButtonProps {
    children: React.ReactNode
    className?: string
    disabled?: boolean
}

export function SubmitButton({ children, className, disabled }: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending || disabled}
            className={`flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                </>
            ) : (
                children
            )}
        </button>
    )
}
