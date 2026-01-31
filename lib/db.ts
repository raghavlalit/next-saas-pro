import { PrismaClient } from '@prisma/client'

/**
 * Global variable for Prisma Client to prevent multiple instances in development.
 * This is necessary because Next.js reloads modules in development, which would
 * exhaust the database connection limit.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

/**
 * Exported Prisma Client instance.
 * Reuses existing instance if available (in dev), or creates a new one.
 */
export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

