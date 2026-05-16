// src/tasks/dto/create-task.dto.ts — validation for creating a task

import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(2)
  title!: string; // ! tells TS it will be set at runtime by class-validator

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  projectId!: string; // the project this task belongs to

  @IsOptional()
  @IsString()
  assigneeId?: string; // optional: which user is assigned
}
