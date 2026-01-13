"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"

export function DateRangePicker() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Get existing dates or default
    const defaultFrom = searchParams.get('from') || ''
    const defaultTo = searchParams.get('to') || ''

    const [from, setFrom] = useState(defaultFrom)
    const [to, setTo] = useState(defaultTo)

    const updateParams = useDebouncedCallback((newFrom: string, newTo: string) => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (newFrom) params.set('from', newFrom)
        else params.delete('from')
        
        if (newTo) params.set('to', newTo)
        else params.delete('to')
        
        router.push(`?${params.toString()}`)
    }, 500)

    const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFrom(e.target.value)
        updateParams(e.target.value, to)
    }

    const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTo(e.target.value)
        updateParams(from, e.target.value)
    }

    return (
        <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <input 
                type="date" 
                value={from}
                onChange={handleFromChange}
                className="bg-transparent focus:outline-none dark:text-white"
                placeholder="From"
            />
            <span className="text-gray-400">-</span>
            <input 
                type="date" 
                value={to}
                onChange={handleToChange}
                className="bg-transparent focus:outline-none dark:text-white"
                placeholder="To"
            />
        </div>
    )
}
