// src/projects/projects.service.ts - Project service

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { logActivity, activityLogs } from '../activity-log';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // Create new project
  async create(dto: CreateProjectDto, managerId: string) {
    const project = await this.prisma.project.create({
      data: { ...dto, managerId },
    });
    logActivity(project.id, `Project "${project.name}" was successfully created.`);
    return project;
  }

  // Find all projects
  async findAll(managerId?: string) {
    if (managerId) {
      return this.prisma.project.findMany({ 
        where: { managerId },
        include: { tasks: true }
      });
    }
    return this.prisma.project.findMany({
      include: { tasks: true }
    });
  }

  // Get project stats
  async getStats(projectId: string) {
    await this.findOne(projectId);
    const tasks = await this.prisma.task.findMany({ where: { projectId } });
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === 'TODO').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const done = tasks.filter(t => t.status === 'DONE').length;
    return { total, todo, inProgress, done };
  }

  // Get project activity logs
  async getActivity(projectId: string) {
    await this.findOne(projectId);
    return activityLogs.filter(log => log.projectId === projectId);
  }

  // Find project by ID
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  // Delete project
  async remove(id: string, userId: string, userRole: string) {
    const project = await this.findOne(id);
    if (project.managerId !== userId) {
      throw new ForbiddenException('Only the project manager is allowed to delete this project.');
    }
    return this.prisma.project.delete({ where: { id } });
  }
}
