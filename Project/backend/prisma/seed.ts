// prisma/seed.ts — populates the database with test users for development
// Run with: npm run seed

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash a shared password for both test users
  const hashedPassword = await bcrypt.hash('password', 10);

  // Create test users — skipDuplicates so re-running seed is safe
  await prisma.user.createMany({
    data: [
      {
        email: 'manager@example.com',
        name: 'Alice Manager',
        password: hashedPassword,
        role: 'MANAGER',
      },
      {
        email: 'dev@example.com',
        name: 'Bob Developer',
        password: hashedPassword,
        role: 'DEVELOPER',
      },
    ],
    skipDuplicates: true,
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
