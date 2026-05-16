// src/prisma.service.ts — thin wrapper around Prisma client
// Connects on app start and disconnects cleanly on shutdown

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /** Open the database connection when the module loads */
  async onModuleInit() {
    await this.$connect();
  }

  /** Close the database connection when the app shuts down */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
