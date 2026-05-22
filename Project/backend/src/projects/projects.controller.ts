// src/projects/projects.controller.ts — HTTP routes for /projects

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard) // all routes here require a valid JWT
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  /**
   * POST /projects
   * Creates a project. The logged-in user becomes the manager automatically.
   */
  @Post()
  async create(@Body() dto: CreateProjectDto, @Request() req: any) {
    if (req.user.role !== 'MANAGER') {
      throw new ForbiddenException('Only managers are allowed to create projects.');
    }
    return this.projectsService.create(dto, req.user.id);
  }

  /**
   * GET /projects
   * Returns all projects.
   * Add ?mine=true to get only the current user's projects.
   */
  @Get()
  async findAll(@Request() req: any, @Query('mine') mine?: string) {
    const managerId = mine === 'true' ? req.user.id : undefined;
    return this.projectsService.findAll(managerId);
  }

  /**
   * GET /projects/:id/stats
   * Returns project task metrics summary.
   */
  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    return this.projectsService.getStats(id);
  }

  /**
   * GET /projects/:id/activity
   * Returns recent project activity logs.
   */
  @Get(':id/activity')
  async getActivity(@Param('id') id: string) {
    return this.projectsService.getActivity(id);
  }

  /**
   * GET /projects/:id
   * Returns a single project. Throws 404 if not found.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  /**
   * DELETE /projects/:id
   * Deletes a project and all its tasks (cascade).
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.remove(id, req.user.id, req.user.role);
  }
}
