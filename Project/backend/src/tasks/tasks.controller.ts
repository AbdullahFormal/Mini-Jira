// src/tasks/tasks.controller.ts — HTTP routes for /tasks

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard) // all task routes require a valid JWT
export class TasksController {
  constructor(private tasksService: TasksService) {}

  /**
   * POST /tasks
   * Creates a new task. Body must include projectId.
   */
  @Post()
  async create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  /**
   * GET /tasks?projectId=<id>
   * Returns all tasks for a project.
   */
  @Get()
  async getByProject(@Query('projectId') projectId: string) {
    return this.tasksService.findByProject(projectId);
  }

  /**
   * GET /tasks/:id
   * Returns a single task by its id.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  /**
   * PATCH /tasks/:id
   * Updates status, title, description, or assignee.
   * Only send the fields you want to change.
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  /**
   * DELETE /tasks/:id
   * Deletes a task by id.
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
