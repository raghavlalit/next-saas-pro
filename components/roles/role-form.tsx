'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Save, X, Check } from 'lucide-react';
import { groupPermissions } from '@/lib/permissions';

export function RoleForm({ initialData, permissions }: { initialData?: any, permissions: any[] }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        code: initialData?.code || '',
        description: initialData?.description || '',
        permissionIds: initialData?.permissions?.map((p: any) => p.permissionId) || []
    });

    const groupedPermissions = groupPermissions(permissions.map(p => p.code));
    // We need to map back the grouped codes to their IDs
    const permissionMap = permissions.reduce((acc, p) => {
        acc[p.code] = p.id;
        return acc;
    }, {} as Record<string, string>);

    const handlePermissionToggle = (permissionId: string) => {
        setFormData(prev => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(permissionId)
                ? prev.permissionIds.filter(id => id !== permissionId)
                : [...prev.permissionIds, permissionId]
        }));
    };

    const handleModuleToggle = (module: string, codes: string[]) => {
        const modulePermissionIds = codes.map(code => permissionMap[code]);
        const allSelected = modulePermissionIds.every(id => formData.permissionIds.includes(id));

        if (allSelected) {
            setFormData(prev => ({
                ...prev,
                permissionIds: prev.permissionIds.filter(id => !modulePermissionIds.includes(id))
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                permissionIds: Array.from(new Set([...prev.permissionIds, ...modulePermissionIds]))
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = initialData ? `/api/roles/${initialData.id}` : '/api/roles';
            const method = initialData ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push('/roles');
                router.refresh();
            } else {
                console.error('Failed to save role');
            }
        } catch (error) {
            console.error('Error saving role:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Role Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600"
                            placeholder="e.g. Manager"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Role Code</label>
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600"
                            placeholder="e.g. manager"
                            disabled={!!initialData}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-foreground">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600"
                            placeholder="What can this role do?"
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    Permissions
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                    {Object.entries(groupedPermissions).map(([module, codes]) => {
                        const modulePermissionIds = codes.map(code => permissionMap[code]);
                        const isAllSelected = modulePermissionIds.every(id => formData.permissionIds.includes(id));

                        return (
                            <div key={module} className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between dark:bg-gray-700/50 dark:border-gray-700">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">{module}</h3>
                                    <button
                                        type="button"
                                        onClick={() => handleModuleToggle(module, codes)}
                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                                    >
                                        {isAllSelected ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="p-4 space-y-3">
                                    {codes.map(code => {
                                        const id = permissionMap[code];
                                        const isSelected = formData.permissionIds.includes(id);
                                        return (
                                            <label key={id} className="flex items-center gap-3 cursor-pointer group">
                                                <div
                                                    onClick={() => handlePermissionToggle(id)}
                                                    className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${isSelected
                                                            ? 'bg-indigo-600 border-indigo-600'
                                                            : 'border-gray-300 bg-transparent group-hover:border-indigo-500 dark:border-gray-600'
                                                        }`}
                                                >
                                                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                                </div>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{code.split('.')[1]}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    <X className="h-4 w-4" />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {isLoading ? 'Saving...' : 'Save Role'}
                </button>
            </div>
        </form>
    );
}
