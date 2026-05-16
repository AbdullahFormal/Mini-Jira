// src/auth/auth.service.ts — handles register and login logic

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Creates a new user account.
   * Hashes the password before saving — never store plain text passwords.
   * Returns the user object without the password field.
   */
  async register(dto: RegisterDto) {
    try {
      const hashed = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.user.create({
        data: { ...dto, password: hashed },
      });

      // Remove password before returning to the client
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safe } = user;
      return safe;
    } catch (err: any) {
      // Prisma error code P2002 = unique constraint failed (duplicate email)
      if (err.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }
      throw err;
    }
  }

  /**
   * Validates credentials and returns a signed JWT access token.
   * Returns 401 for both "user not found" and "wrong password"
   * (same message keeps it secure — don't reveal which one failed).
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    // Sign a JWT with user id, email, and role as the payload
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const token = await this.jwtService.signAsync(payload);
    return { access_token: token, name: user.name, role: user.role, email: user.email };
  }
}
