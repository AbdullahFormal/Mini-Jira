// prisma/seed.ts — populates the database with test users for development
// Run with: npm run seed

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash a shared password for both test users
  const hashedPassword = await bcrypt.hash('password', 10);

  await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: { name: 'manager', password: hashedPassword, role: 'MANAGER' },
    create: { email: 'manager@example.com', name: 'manager', password: hashedPassword, role: 'MANAGER' },
  });

  await prisma.user.upsert({
    where: { email: 'dev@example.com' },
    update: { name: 'dev', password: hashedPassword, role: 'DEVELOPER' },
    create: { email: 'dev@example.com', name: 'dev', password: hashedPassword, role: 'DEVELOPER' },
  });

  console.log('✅ Seed complete');
  console.log('   manager@example.com / password  (role: MANAGER)');
  console.log('   dev@example.com     / password  (role: DEVELOPER)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
