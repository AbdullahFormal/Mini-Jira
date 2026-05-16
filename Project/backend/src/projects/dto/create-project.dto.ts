// src/projects/dto/create-project.dto.ts — validation for creating a project

import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(2) // project name must be at least 2 characters
  name!: string; // ! tells TS it will be set at runtime by class-validator

  @IsOptional()
  @IsString()
  description?: string;
}
