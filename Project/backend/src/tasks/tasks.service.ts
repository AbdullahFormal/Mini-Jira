// src/tasks/tasks.service.ts - Task service

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { logActivity } from '../activity-log';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // Create task
  async create(dto: CreateTaskDto, userId: string, userRole: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (userRole !== 'MANAGER' && dto.assigneeId && dto.assigneeId !== userId) {
      throw new ForbiddenException('Developers can only assign tasks to themselves.');
    }

    if (dto.assigneeId) {
      const assigneeExists = await this.prisma.user.findUnique({
        where: { id: dto.assigneeId },
      });
      if (!assigneeExists) throw new NotFoundException('Assignee user not found.');
    }

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
  async update(id: string, dto: UpdateTaskDto, userId: string, userRole: string) {
    const task = await this.findOne(id);
    const project = await this.prisma.project.findUnique({
      where: { id: task.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const isProjectManager = project.managerId === userId;
    const isAssignee = task.assigneeId === userId;

    if (!isProjectManager) {
      // 1. If assigned, only project manager or assignee can update/change status
      if (task.assigneeId && !isAssignee) {
        throw new ForbiddenException(
          'Only the project manager or the assigned personnel can modify this task.',
        );
      }

      // 2. Developers cannot edit task requirements (title or description)
      if (dto.title !== undefined || dto.description !== undefined) {
        throw new ForbiddenException(
          'Only the project manager can update the task title or description.',
        );
      }

      // 3. Developers can only assign to themselves (or leave unassigned)
      if (dto.assigneeId && dto.assigneeId !== userId) {
        throw new ForbiddenException(
          'Developers can only assign tasks to themselves.',
        );
      }
    }

    if (dto.assigneeId) {
      const assigneeExists = await this.prisma.user.findUnique({
        where: { id: dto.assigneeId },
      });
      if (!assigneeExists) throw new NotFoundException('Assignee user not found.');
    }

    const updated = await this.prisma.task.update({ where: { id }, data: dto });

    if (dto.status && dto.status !== task.status) {
      logActivity(task.projectId, `Task "${task.title}" status changed to ${dto.status}.`);
    } else {
      logActivity(task.projectId, `Task "${task.title}" was updated.`);
    }

    return updated;
  }

  // Delete task
  async remove(id: string, userId: string, userRole: string) {
    const task = await this.findOne(id);
    const project = await this.prisma.project.findUnique({
      where: { id: task.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (project.managerId !== userId) {
      throw new ForbiddenException('Only the project manager can delete this task.');
    }

    const deleted = await this.prisma.task.delete({ where: { id } });
    logActivity(task.projectId, `Task "${task.title}" was deleted.`);
    return deleted;
  }
}
