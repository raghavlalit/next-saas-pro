'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { ModeToggle } from './mode-toggle';

export function Header() {
    const { data: session } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-background px-6 dark:border-gray-800">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8">
                     <img src="/logo.jpg" alt="Invofy Logo" className="h-full w-full object-contain rounded-lg" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                    Invofy
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <ModeToggle />

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center gap-2 focus:outline-none"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                            {session?.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || 'User'}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : (
                                <User className="h-5 w-5" />
                            )}
                        </div>
                        <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-200 md:block">
                            {session?.user?.name || 'User'}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {session?.user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate uppercase">
                                    {session?.user?.role} • {session?.user?.email}
                                </p>
                            </div>

                            <Link
                                href="/settings"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                            <Link
                                href="/settings"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
