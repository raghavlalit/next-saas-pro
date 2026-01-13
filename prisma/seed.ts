import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('Admin@123', 10)

    // 1. Define Permissions
    const permissions = [
        // Clients
        { module: 'clients', code: 'client.view', name: 'View Clients' },
        { module: 'clients', code: 'client.create', name: 'Create Client' },
        { module: 'clients', code: 'client.edit', name: 'Edit Client' },
        { module: 'clients', code: 'client.delete', name: 'Delete Client' },
        // Invoices
        { module: 'billing', code: 'invoice.view', name: 'View Invoices' },
        { module: 'billing', code: 'invoice.create', name: 'Create Invoice' },
        { module: 'billing', code: 'invoice.edit', name: 'Edit Invoice' },
        { module: 'billing', code: 'invoice.pay', name: 'Pay Invoice' },
        { module: 'billing', code: 'invoice.delete', name: 'Delete Invoice' },
        // Users
        { module: 'users', code: 'user.view', name: 'View Users' },
        { module: 'users', code: 'user.create', name: 'Create User' },
        { module: 'users', code: 'user.edit', name: 'Edit User' },
        { module: 'users', code: 'user.delete', name: 'Delete User' },
        // Roles
        { module: 'roles', code: 'role.view', name: 'View Roles' },
        { module: 'roles', code: 'role.create', name: 'Create Role' },
        { module: 'roles', code: 'role.edit', name: 'Edit Role' },
        // Permissions
        { module: 'permissions', code: 'permission.view', name: 'View Permissions' },
        { module: 'permissions', code: 'permission.create', name: 'Create Permission' },
        { module: 'permissions', code: 'permission.edit', name: 'Edit Permission' },
        { module: 'permissions', code: 'permission.delete', name: 'Delete Permission' },
    ]

    console.log('Seeding permissions...')
    const createdPermissions = []
    for (const p of permissions) {
        const permission = await prisma.permission.upsert({
            where: { code: p.code },
            update: p,
            create: p,
        })
        createdPermissions.push(permission)
    }

    // 2. Define Roles
    const roles = [
        {
            name: 'Super Admin',
            code: 'super_admin',
            description: 'Full system access',
            isSystemRole: true,
            permissions: createdPermissions.map(p => p.id)
        },
        {
            name: 'Admin',
            code: 'admin',
            description: 'Administrative access',
            isSystemRole: true,
            permissions: createdPermissions
                .filter(p => !p.code.startsWith('role.'))
                .map(p => p.id)
        },
        {
            name: 'User',
            code: 'user',
            description: 'Standard user access',
            isSystemRole: true,
            permissions: createdPermissions
                .filter(p => p.code === 'client.view' || p.code === 'invoice.view' || p.code === 'invoice.pay')
                .map(p => p.id)
        },
        {
            name: 'Client',
            code: 'client',
            description: 'Client access',
            isSystemRole: true,
            permissions: createdPermissions
                .filter(p => p.code === 'invoice.view' || p.code === 'invoice.pay')
                .map(p => p.id)
        }
    ]

    console.log('Seeding roles...')
    const roleMap: Record<string, any> = {}
    for (const r of roles) {
        const { permissions: rolePerms, ...roleData } = r
        const role = await prisma.role.upsert({
            where: { code: r.code },
            update: roleData,
            create: roleData,
        })
        roleMap[r.code] = role

        // Assign permissions to role
        for (const permissionId of rolePerms) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: role.id,
                        permissionId
                    }
                },
                update: {},
                create: {
                    roleId: role.id,
                    permissionId
                }
            })
        }
    }

    // 3. Seed Users
    console.log('Seeding users...')
    const admin = await prisma.user.upsert({
        where: { email: 'admin@demo.com' },
        update: {
            roleId: roleMap['super_admin'].id
        },
        create: {
            email: 'admin@demo.com',
            name: 'Admin User',
            password,
            roleId: roleMap['super_admin'].id,
        },
    })

    const user = await prisma.user.upsert({
        where: { email: 'user@demo.com' },
        update: {
            roleId: roleMap['user'].id
        },
        create: {
            email: 'user@demo.com',
            name: 'Demo User',
            password,
            roleId: roleMap['user'].id,
        },
    })

    console.log('Seeding completed successfully.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
