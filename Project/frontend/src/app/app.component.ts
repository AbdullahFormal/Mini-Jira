import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showHelp = false;
  token = localStorage.getItem('mj_token') || '';
  role: string | null = null;
  userName: string | null = null;
  userId: string | null = null;
  projects: any[] = [];
  currentProject: any = null;
  tasks: any[] = [];
  error = '';
  users: any[] = [];
  taskAssigneeId = '';
  activeProjectStats: any = null;
  activeProjectActivity: any[] = [];

  email = '';
  password = '';
  registerEmail = '';
  registerPassword = '';
  name = '';
  roleSelect = 'DEVELOPER';

  projectName = '';
  projectDesc = '';
  taskTitle = '';
  taskDesc = '';

  constructor(private api: ApiService) {
    this.applyToken(this.token);
  }

  clearError() {
    this.error = '';
  }

  openHelp() {
    this.showHelp = true;
  }

  closeHelp() {
    this.showHelp = false;
  }

  applyToken(t: string) {
    this.token = t;

    if (t) {
      this.clearError();
      localStorage.setItem('mj_token', t);
      this.role = this.decodeRole(t);
      this.userName = this.decodeName(t);
      this.userId = this.decodeUserId(t);
      void this.loadProjects();
      void this.loadUsers();
      return;
    }

    localStorage.removeItem('mj_token');
    this.role = null;
    this.userName = null;
    this.userId = null;
    this.projects = [];
    this.currentProject = null;
    this.tasks = [];
    this.users = [];
    this.activeProjectStats = null;
    this.activeProjectActivity = [];
  }

  async login() {
    this.clearError();
    try {
      const res = await firstValueFrom(this.api.login({ email: this.email.trim(), password: this.password }));
      this.applyToken(res.access_token || res.accessToken);
      if (res.name) {
        this.userName = res.name;
      }
    } catch {
      this.error = 'Login failed. Check your email and password.';
    }
  }

  async register() {
    this.clearError();
    try {
      if (!this.name.trim() || !this.registerEmail.trim() || !this.registerPassword) {
        this.error = 'Please enter name, email, and password to register.';
        return;
      }

      if (this.registerPassword.length < 6) {
        this.error = 'Password must be at least 6 characters.';
        return;
      }

      await firstValueFrom(this.api.register({ email: this.registerEmail.trim(), password: this.registerPassword, name: this.name, role: this.roleSelect }));
      this.error = `Registered successfully! You can now log in.`;
      
      this.registerEmail = '';
      this.registerPassword = '';
      this.name = '';
    } catch (err: any) {
      if (err.error?.message) {
        const msg = Array.isArray(err.error.message)
          ? err.error.message.join(', ')
          : err.error.message;
        this.error = `Register failed: ${msg}`;
      } else {
        this.error = 'Register failed. This email or name might already be taken.';
      }
    }
  }

  async loadProjects() {
    try {
      this.projects = await firstValueFrom(this.api.getProjects());
      if (this.currentProject) {
        const updated = this.projects.find(p => p.id === this.currentProject.id);
        if (updated) {
          this.currentProject = updated;
        }
      }
      this.clearError();
    } catch {
      this.projects = [];
      this.error = 'Could not load projects. Make sure the backend is running and you are logged in.';
    }
  }

  async loadUsers() {
    try {
      this.users = await firstValueFrom(this.api.getUsers());
    } catch {
      this.users = [];
    }
  }

  async createProject() {
    await firstValueFrom(this.api.createProject({ name: this.projectName, description: this.projectDesc }));
    this.projectName = '';
    this.projectDesc = '';
    await this.loadProjects();
  }

  async openProject(project: any) {
    this.currentProject = project;
    await this.loadTasks(project.id);
    await this.loadProjectStats(project.id);
    await this.loadProjectActivity(project.id);
  }

  async loadProjectStats(projectId: string) {
    try {
      this.activeProjectStats = await firstValueFrom(this.api.getProjectStats(projectId));
    } catch {
      this.activeProjectStats = null;
    }
  }

  async loadProjectActivity(projectId: string) {
    try {
      this.activeProjectActivity = await firstValueFrom(this.api.getProjectActivity(projectId));
    } catch {
      this.activeProjectActivity = [];
    }
  }

  async loadTasks(projectId: string) {
    try {
      this.tasks = await firstValueFrom(this.api.getTasks(projectId));
      this.clearError();
    } catch {
      this.tasks = [];
      this.error = 'Could not load tasks for this project.';
    }
  }

  async createTask() {
    if (!this.currentProject) {
      return;
    }

    try {
      await firstValueFrom(this.api.createTask({
        title: this.taskTitle,
        description: this.taskDesc,
        projectId: this.currentProject.id,
        assigneeId: this.taskAssigneeId ? this.taskAssigneeId : undefined
      }));
      this.taskTitle = '';
      this.taskDesc = '';
      this.taskAssigneeId = '';
      await this.loadTasks(this.currentProject.id);
      await this.loadProjects();
      await this.loadProjectStats(this.currentProject.id);
      await this.loadProjectActivity(this.currentProject.id);
    } catch {
      // standard silent fail matching original design
    }
  }

  async updateTask(task: any) {
    if (!this.currentProject) {
      return;
    }

    if (task.status === 'DONE') {
      return;
    }

    const next = task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE';
    await firstValueFrom(this.api.updateTask(task.id, { status: next }));
    await this.loadTasks(this.currentProject.id);
    await this.loadProjects();
    await this.loadProjectStats(this.currentProject.id);
    await this.loadProjectActivity(this.currentProject.id);
  }

  async deleteTask(task: any) {
    if (!this.currentProject) {
      return;
    }

    await firstValueFrom(this.api.deleteTask(task.id));
    await this.loadTasks(this.currentProject.id);
    await this.loadProjects();
    await this.loadProjectStats(this.currentProject.id);
    await this.loadProjectActivity(this.currentProject.id);
  }

  async deleteProject(project: any) {
    if (!confirm('Delete this project?')) {
      return;
    }

    await firstValueFrom(this.api.deleteProject(project.id));
    this.currentProject = null;
    this.tasks = [];
    await this.loadProjects();
  }

  logout() {
    this.applyToken('');
  }

  getDoneTasksCount(project: any): number {
    if (!project || !project.tasks) return 0;
    return project.tasks.filter((t: any) => t.status === 'DONE').length;
  }

  getTotalTasksCount(project: any): number {
    if (!project || !project.tasks) return 0;
    return project.tasks.length;
  }

  getProgressPercentage(project: any): number {
    if (!project || !project.tasks || project.tasks.length === 0) return 0;
    const done = this.getDoneTasksCount(project);
    const total = this.getTotalTasksCount(project);
    return Math.round((done / total) * 100);
  }

  private decodeRole(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }

  private decodeName(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.name) {
        return payload.name;
      }
      if (payload.email) {
        return payload.email;
      }
      return null;
    } catch {
      return null;
    }
  }

  private decodeUserId(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  }
}
