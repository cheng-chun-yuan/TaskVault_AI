import { PrismaClient } from '@prisma/client'
import { app } from '@/lib/env'

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

// Only create Prisma client if DATABASE_URL is configured
let prisma: PrismaClient | null = null

if (process.env.DATABASE_URL) {
  prisma = globalForPrisma.prisma || new PrismaClient()
  
  if (!app.isProduction) {
    globalForPrisma.prisma = prisma
  }
}

export default prisma