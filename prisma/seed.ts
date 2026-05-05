import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
})
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('Admin@123', 12)

  const admin = await db.user.upsert({
    where: { email: 'admin@tnsolarsolutions.in' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@tnsolarsolutions.in',
      password,
    },
  })

  console.log('✅ Seeded admin user:', admin.email)
  console.log('🔑 Default password: Admin@123  ← change this immediately')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
