// src/tasks/dto/update-task.dto.ts — validation for updating a task
// All fields are optional — send only what you want to change

import { IsOptional, IsEnum, IsString } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus) // must be TODO, IN_PROGRESS, or DONE
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}
