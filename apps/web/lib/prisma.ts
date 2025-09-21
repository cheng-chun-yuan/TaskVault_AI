import { PrismaClient } from '@prisma/client'
import { app } from '@/lib/env'

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma || new PrismaClient()

if (!app.isProduction) {
  globalForPrisma.prisma = prisma
}

export default prisma