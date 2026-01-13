"use client"

import { useState } from "react"
import { Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useDebouncedCallback } from "use-debounce"

interface UserFiltersProps {
    roles: { code: string; name: string }[]
}

export function UserFilters({ roles }: UserFiltersProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    // Local state for filter fields
    const [name, setName] = useState(searchParams.get("name") || "")
    const [email, setEmail] = useState(searchParams.get("email") || "")
    const [role, setRole] = useState(searchParams.get("role") || "")

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set("search", term)
        } else {
            params.delete("search")
        }
        router.replace(`?${params.toString()}`)
    }, 300)

    const handleClearAll = () => {
        setName("")
        setEmail("")
        setRole("")
    }

    const handleDiscard = () => {
        setOpen(false)
        // Reset to current URL params
        setName(searchParams.get("name") || "")
        setEmail(searchParams.get("email") || "")
        setRole(searchParams.get("role") || "")
    }

    const handleSubmit = () => {
        const params = new URLSearchParams(searchParams)
        
        // Preserve 'search' param, update filters
        if (name) params.set("name", name)
        else params.delete("name")

        if (email) params.set("email", email)
        else params.delete("email")

        if (role && role !== "all") params.set("role", role)
        else params.delete("role")

        router.replace(`?${params.toString()}`)
        setOpen(false)
    }

    return (
        <div className="flex gap-4">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Search users..."
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get("search")?.toString()}
                    className="pl-9"
                />
            </div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                        <h4 className="font-semibold text-foreground">Filter</h4>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleClearAll}
                            className="h-auto p-0 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            Clear All
                        </Button>
                    </div>
                    
                    <div className="space-y-4 p-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Filter by name..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="Filter by email..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map((r) => (
                                        <SelectItem key={r.code} value={r.code}>
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 p-4 dark:border-gray-800">
                        <Button variant="outline" onClick={handleDiscard}>
                            Discard
                        </Button>
                        <Button onClick={handleSubmit}>
                            Submit
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
