import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding HotelLink database...')

  const hashedPassword = await bcrypt.hash('Password123!', 12)

  const superAdmin = await db.user.upsert({
    where: { email: 'admin@hotellink.com' },
    update: {},
    create: {
      email: 'admin@hotellink.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Super admin created:', superAdmin.email)

  console.log('\n✨ Database seeded successfully!')
  console.log('\n📋 Login credentials:')
  console.log('   Admin: admin@hotellink.com / Password123!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
