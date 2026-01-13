'use client';

import { useSession } from 'next-auth/react';
import { hasPermission as checkPermission } from '@/lib/permissions';

export function usePermissions() {
    const { data: session, status } = useSession();
    const permissions = session?.user?.permissions || [];
    const role = session?.user?.role || '';

    const hasPermission = (permission: string) => {
        return checkPermission(permissions, permission);
    };

    const hasAnyPermission = (requiredPermissions: string[]) => {
        return requiredPermissions.some(p => hasPermission(p));
    };

    const hasAllPermissions = (requiredPermissions: string[]) => {
        return requiredPermissions.every(p => hasPermission(p));
    };

    return {
        permissions,
        role,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isLoading: status === 'loading',
        isAuthenticated: status === 'authenticated',
    };
}
