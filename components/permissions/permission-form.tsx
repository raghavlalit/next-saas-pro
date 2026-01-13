'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PermissionFormProps {
    initialData?: {
        id: string;
        module: string;
        code: string;
        name: string;
        description: string | null;
        isActive: boolean;
    };
}

export function PermissionForm({ initialData }: PermissionFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            module: formData.get('module'),
            code: formData.get('code'),
            name: formData.get('name'),
            description: formData.get('description'),
            isActive: formData.get('isActive') === 'on',
        };

        try {
            const url = initialData ? `/api/permissions/${initialData.id}` : '/api/permissions';
            const method = initialData ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to save permission');
            }

            router.push('/permissions');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label htmlFor="module" className="block text-sm font-medium text-foreground">
                        Module
                    </label>
                    <input
                        type="text"
                        name="module"
                        id="module"
                        defaultValue={initialData?.module}
                        required
                        placeholder="e.g., clients, billing"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="code" className="block text-sm font-medium text-foreground">
                        Code
                    </label>
                    <input
                        type="text"
                        name="code"
                        id="code"
                        defaultValue={initialData?.code}
                        required
                        placeholder="e.g., client.view"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-foreground">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={initialData?.name}
                        required
                        placeholder="e.g., View Clients"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-foreground">
                        Description
                    </label>
                    <textarea
                        name="description"
                        id="description"
                        rows={3}
                        defaultValue={initialData?.description || ''}
                        placeholder="What does this permission allow?"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        defaultChecked={initialData ? initialData.isActive : true}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                        Active
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : initialData ? 'Update Permission' : 'Create Permission'}
                </button>
            </div>
        </form>
    );
}
