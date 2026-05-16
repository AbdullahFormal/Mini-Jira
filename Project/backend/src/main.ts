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

  // Serve the frontend static files from /frontend
  app.useStaticAssets(join(__dirname, '..', 'frontend'));

  // Fallback to index.html for client-side routing (serve index for GET requests without a file extension)
  // Do not intercept API routes (auth, projects, tasks, or /api) so backend endpoints remain reachable.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const apiPrefixes = ['/api', '/auth', '/projects', '/tasks'];
    const isApi = apiPrefixes.some((p) => req.path.startsWith(p));
    if (req.method === 'GET' && !req.path.includes('.') && !isApi) {
      return res.sendFile(join(__dirname, '..', 'frontend', 'index.html'));
    }
    next();
  });

  // Automatically validate incoming request bodies using class-validator rules
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Allow requests from any origin (needed for local frontend development)
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();
