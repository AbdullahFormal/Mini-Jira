// prisma/seed.ts - Seed database with generic demo data
// Run with: npm run seed

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database (wiping all tasks, projects, and users)...');
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🌱 Database cleared! Seeding premium portfolio users...');

  // Hash shared password
  const hashedPassword = await bcrypt.hash('password', 10);

  // Create seed users
  const sarah = await prisma.user.create({
    data: {
      email: 'manager1@example.com',
      name: 'Manager 1',
      password: hashedPassword,
      role: 'MANAGER',
    },
  });

  const alex = await prisma.user.create({
    data: {
      email: 'dev1@example.com',
      name: 'Developer 1',
      password: hashedPassword,
      role: 'DEVELOPER',
    },
  });

  const elena = await prisma.user.create({
    data: {
      email: 'dev2@example.com',
      name: 'Developer 2',
      password: hashedPassword,
      role: 'DEVELOPER',
    },
  });

  console.log('📁 Creating portfolio projects...');

  // 2. Project 1
  const apollo = await prisma.project.create({
    data: {
      name: 'Project 1',
      description: 'This is a description of Project 1',
      managerId: sarah.id,
    },
  });

  // 3. Project 2
  const phoenix = await prisma.project.create({
    data: {
      name: 'Project 2',
      description: 'This is a description of Project 2',
      managerId: sarah.id,
    },
  });

  console.log('📋 Seeding tasks & assigning team members...');

  // 4. Tasks for Project 1
  await prisma.task.createMany({
    data: [
      {
        title: 'Task 1',
        description: 'This is the description for Task 1',
        status: 'DONE',
        projectId: apollo.id,
        assigneeId: alex.id,
      },
      {
        title: 'Task 2',
        description: 'This is the description for Task 2',
        status: 'IN_PROGRESS',
        projectId: apollo.id,
        assigneeId: elena.id,
      },
      {
        title: 'Task 3',
        description: 'This is the description for Task 3',
        status: 'TODO',
        projectId: apollo.id,
        assigneeId: elena.id,
      },
      {
        title: 'Task 4',
        description: 'This is the description for Task 4',
        status: 'TODO',
        projectId: apollo.id,
        assigneeId: alex.id,
      },
      {
        title: 'Task 8 (Unassigned)',
        description: 'This is an unassigned task to test developer self-assignment.',
        status: 'TODO',
        projectId: apollo.id,
      },
    ],
  });

  // 5. Tasks for Project 2
  await prisma.task.createMany({
    data: [
      {
        title: 'Task 5',
        description: 'This is the description for Task 5',
        status: 'DONE',
        projectId: phoenix.id,
        assigneeId: elena.id,
      },
      {
        title: 'Task 6',
        description: 'This is the description for Task 6',
        status: 'DONE',
        projectId: phoenix.id,
        assigneeId: sarah.id,
      },
      {
        title: 'Task 7',
        description: 'This is the description for Task 7',
        status: 'IN_PROGRESS',
        projectId: phoenix.id,
        assigneeId: alex.id,
      },
      {
        title: 'Task 9 (Unassigned)',
        description: 'This is another unassigned task in Project 2 to test picking it up.',
        status: 'TODO',
        projectId: phoenix.id,
      },
    ],
  });

  console.log('✅ Portfolio seeding complete! Database is primed and ready to present.');
  console.log('--------------------------------------------------');
  console.log('Manager Credentials:  manager@example.com / password');
  console.log('Developer 1:          dev1@example.com    / password');
  console.log('Developer 2:          dev2@example.com    / password');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
