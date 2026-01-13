"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <div className="flex gap-2">
            <button
                onClick={() => setTheme("light")}
                className="rounded-md border p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Light</span>
            </button>
            <button
                onClick={() => setTheme("dark")}
                className="rounded-md border p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <Moon className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Dark</span>
            </button>
        </div>
    )
}
