// src/auth/dto/register.dto.ts — shape and validation rules for registration input

import { Role } from '@prisma/client';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string; // ! tells TS it will be set (class-validator ensures this at runtime)

  @IsString()
  @MinLength(6) // password must be at least 6 characters
  password!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role; // defaults to DEVELOPER if not provided
}
