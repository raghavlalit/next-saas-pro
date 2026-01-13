export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    if (userPermissions.includes('super_admin') || userPermissions.includes('*')) {
        return true;
    }

    // Support wildcard module check (e.g., 'client.*')
    if (requiredPermission.endsWith('.*')) {
        const module = requiredPermission.split('.')[0];
        return userPermissions.some(p => p.startsWith(`${module}.`));
    }

    return userPermissions.includes(requiredPermission);
}

export type PermissionGroup = Record<string, string[]>;

export function groupPermissions(permissions: string[]): PermissionGroup {
    return permissions.reduce((acc, p) => {
        const [module] = p.split('.');
        if (!acc[module]) acc[module] = [];
        acc[module].push(p);
        return acc;
    }, {} as PermissionGroup);
}
