// @ts-nocheck — Prisma v7 types not fully stable
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

export default defineConfig({
  earlyAccess: true,
  schema: './schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrate: {
    async adapter(env) {
      const { Pool } = await import('pg')
      const connectionString = env.DATABASE_URL
      const pool = new Pool({
        connectionString,
        ssl: connectionString?.includes('sslmode=require')
          ? { rejectUnauthorized: false }
          : false,
      })
      return new PrismaPg(pool)
    },
  },
})
