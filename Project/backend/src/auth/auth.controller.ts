// src/auth/auth.controller.ts — exposes POST /auth/register and POST /auth/login

import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /** POST /auth/register — create a new user account */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** POST /auth/login — returns a JWT access_token on success */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** GET /auth/users — lists all users (requires login to view team directory) */
  @Get('users')
  @UseGuards(JwtAuthGuard)
  async getUsers() {
    return this.authService.findAllUsers();
  }
}
