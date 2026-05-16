// src/auth/dto/login.dto.ts — shape and validation rules for login input

import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string; // ! tells TS it will be set (class-validator ensures this at runtime)

  @IsString()
  password!: string;
}
