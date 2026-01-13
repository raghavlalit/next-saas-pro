'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeletePermissionButtonProps {
    permissionId: string;
}

export function DeletePermissionButton({ permissionId }: DeletePermissionButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this permission? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/permissions/${permissionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to delete permission');
            }

            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
            title="Delete Permission"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}
