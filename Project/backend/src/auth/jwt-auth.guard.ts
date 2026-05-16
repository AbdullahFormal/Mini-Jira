// src/auth/jwt-auth.guard.ts — simple guard that protects routes with JWT
// Add @UseGuards(JwtAuthGuard) to any controller method to require a valid token

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
