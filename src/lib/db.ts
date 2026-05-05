import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : false,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
