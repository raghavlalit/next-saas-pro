'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionGuardProps {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    fallback?: ReactNode;
    children: ReactNode;
}

export function PermissionGuard({
    permission,
    permissions,
    requireAll = false,
    fallback = null,
    children,
}: PermissionGuardProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    let isAllowed = false;

    if (permission) {
        isAllowed = hasPermission(permission);
    } else if (permissions) {
        if (requireAll) {
            isAllowed = hasAllPermissions(permissions);
        } else {
            isAllowed = hasAnyPermission(permissions);
        }
    } else {
        // If no permission is specified, allow by default or handle as needed
        isAllowed = true;
    }

    if (!isAllowed) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
