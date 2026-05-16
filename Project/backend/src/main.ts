// src/main.ts — entry point, boots the NestJS app

import { join } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '..', '.env') });

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  // Create the app as a NestExpressApplication so we can serve static files without extra deps
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // The frontend is now decoupled. We only serve the API.

  // Automatically validate incoming request bodies using class-validator rules
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Allow requests from any origin (needed for local frontend development)
  app.enableCors();

  const port = process.env.PORT || 7860;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();
