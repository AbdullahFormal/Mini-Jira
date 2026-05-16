// src/tasks/tasks.service.ts — database operations for tasks

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new task inside a project.
   * Verifies the project exists first; throws 404 if not.
   */
  async create(dto: CreateTaskDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.task.create({ data: dto });
  }

  /**
   * Returns all tasks for a given project.
   * Includes the assignee's name and email for display.
   */
  async findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Returns a single task by id.
   * Throws 404 if not found.
   */
  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  /**
   * Updates allowed fields (title, description, status, assigneeId).
   * ValidationPipe + UpdateTaskDto handles bad input before it gets here.
   */
  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id); // throws 404 if task doesn't exist
    return this.prisma.task.update({ where: { id }, data: dto });
  }

  /**
   * Deletes a task by id.
   */
  async remove(id: string) {
    await this.findOne(id); // throws 404 if task doesn't exist
    return this.prisma.task.delete({ where: { id } });
  }
}
