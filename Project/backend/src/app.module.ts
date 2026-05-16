// src/app.module.ts — root module, wires together all feature modules

import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,    // handles register & login
    ProjectsModule, // CRUD for projects
    TasksModule,    // CRUD for tasks
  ],
})
export class AppModule {}
