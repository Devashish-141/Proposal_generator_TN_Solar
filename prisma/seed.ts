import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

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
