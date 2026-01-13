'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Shield, Key, CreditCard, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { signOut } from 'next-auth/react';
import clsx from 'clsx';
import { usePermissions } from '@/hooks/use-permissions';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: '*' },
    { name: 'Clients', href: '/clients', icon: Users, permission: 'client.view' },
    { name: 'Invoices', href: '/invoices', icon: CreditCard, permission: 'invoice.view' },
    { name: 'Users', href: '/users', icon: Users, permission: 'user.view' },
    { name: 'Roles', href: '/roles', icon: Shield, permission: 'role.view' },
    { name: 'Permissions', href: '/permissions', icon: Key, permission: 'permission.view' },
    { name: 'Billing', href: '/billing', icon: CreditCard, permission: 'billing.view' }, // Assuming billing.view for now
    { name: 'Settings', href: '/settings', icon: Settings, permission: '*' },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { hasPermission } = usePermissions();

    const filteredNavigation = navigation.filter(item =>
        item.permission === '*' || hasPermission(item.permission)
    );

    return (
        <div
            className={clsx(
                'flex h-full flex-col bg-gray-900 text-white transition-all duration-300',
                isCollapsed ? 'w-20' : 'w-64'
            )}
        >
            <div className="flex h-16 items-center justify-center border-b border-gray-800">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white">N</span>
                    </div>
                    {!isCollapsed && <span className="transition-opacity duration-300">NextSaaS</span>}
                </div>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {filteredNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                isActive
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                                'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                                isCollapsed ? 'justify-center' : ''
                            )}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <item.icon
                                className={clsx(
                                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
                                    'h-6 w-6 flex-shrink-0',
                                    !isCollapsed && 'mr-3'
                                )}
                                aria-hidden="true"
                            />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-gray-800 p-4 flex justify-center">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none"
                >
                    {isCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
                </button>
            </div>
        </div>
    );
}
