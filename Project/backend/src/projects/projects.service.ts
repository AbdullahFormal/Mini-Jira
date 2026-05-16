// src/projects/projects.service.ts — database operations for projects

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new project.
   * managerId comes from the logged-in user (req.user.id), not from the request body.
   */
  async create(dto: CreateProjectDto, managerId: string) {
    return this.prisma.project.create({
      data: { ...dto, managerId },
    });
  }

  /**
   * Returns all projects.
   * If managerId is provided, filters to only that manager's projects.
   */
  async findAll(managerId?: string) {
    if (managerId) {
      return this.prisma.project.findMany({ where: { managerId } });
    }
    return this.prisma.project.findMany();
  }

  /**
   * Returns a single project by id.
   * Throws 404 if not found.
   */
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  /**
   * Deletes a project by id.
   * Tasks inside it are deleted automatically (Cascade in schema).
   */
  async remove(id: string) {
    await this.findOne(id); // throws 404 if doesn't exist
    return this.prisma.project.delete({ where: { id } });
  }
}
