export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    if (userPermissions.includes('super_admin') || userPermissions.includes('*')) {
        return true;
    }

    // Support wildcard module check (e.g., 'client.*')
    if (requiredPermission.endsWith('.*')) {
        const moduleName = requiredPermission.split('.')[0];
        return userPermissions.some(p => p.startsWith(`${moduleName}.`));
    }

    return userPermissions.includes(requiredPermission);
}

export type PermissionGroup = Record<string, string[]>;

export function groupPermissions(permissions: string[]): PermissionGroup {
    return permissions.reduce((acc, p) => {
        const [moduleName] = p.split('.');
        if (!acc[moduleName]) acc[moduleName] = [];
        acc[moduleName].push(p);
        return acc;
    }, {} as PermissionGroup);
}
