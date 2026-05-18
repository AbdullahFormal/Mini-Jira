// src/tasks/tasks.service.ts - Task service

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { logActivity } from '../activity-log';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // Create task
  async create(dto: CreateTaskDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const task = await this.prisma.task.create({ data: dto });
    logActivity(task.projectId, `Task "${task.title}" was added.`);
    return task;
  }

  // Find tasks by project ID
  async findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // Find task by ID
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

  // Update task
  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.findOne(id);
    const updated = await this.prisma.task.update({ where: { id }, data: dto });

    if (dto.status && dto.status !== task.status) {
      logActivity(task.projectId, `Task "${task.title}" status changed to ${dto.status}.`);
    } else {
      logActivity(task.projectId, `Task "${task.title}" was updated.`);
    }

    return updated;
  }

  // Delete task
  async remove(id: string) {
    const task = await this.findOne(id);
    const deleted = await this.prisma.task.delete({ where: { id } });
    logActivity(task.projectId, `Task "${task.title}" was deleted.`);
    return deleted;
  }
}
