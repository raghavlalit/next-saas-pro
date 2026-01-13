'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export function Breadcrumb({ items }: { items?: BreadcrumbItem[] }) {
    const pathname = usePathname();

    // Auto-generate items if not provided
    const defaultItems = items || pathname
        .split('/')
        .filter(Boolean)
        .map((segment, index, array) => {
            const href = `/${array.slice(0, index + 1).join('/')}`;
            const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
            return { label, href };
        });

    return (
        <nav className="mb-4 flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                <li>
                    <div>
                        <Link href="/dashboard" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <Home className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </div>
                </li>
                {defaultItems.map((item, index) => (
                    <li key={item.href || index}>
                        <div className="flex items-center">
                            <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            {index === defaultItems.length - 1 ? (
                                <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href || '#'}
                                    className="ml-2 text-sm font-medium text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
