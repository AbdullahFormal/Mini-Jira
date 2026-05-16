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
  projects: any[] = [];
  currentProject: any = null;
  tasks: any[] = [];
  error = '';

  email = '';
  password = '';
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
      void this.loadProjects();
      return;
    }

    localStorage.removeItem('mj_token');
    this.role = null;
    this.userName = null;
    this.projects = [];
    this.currentProject = null;
    this.tasks = [];
  }

  async login() {
    this.clearError();
    try {
      const res = await firstValueFrom(this.api.login({ email: this.email, password: this.password }));
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
      if (!this.name.trim()) {
        this.error = 'Please enter a name to register.';
        return;
      }
      const generatedEmail = this.name.trim().toLowerCase().replace(/\s+/g, '') + '@example.com';
      const defaultPassword = 'password';

      await firstValueFrom(this.api.register({ email: generatedEmail, password: defaultPassword, name: this.name, role: this.roleSelect }));
      this.error = `Registered! You can now log in with Email: ${generatedEmail} and Password: ${defaultPassword}`;
    } catch {
      this.error = 'Register failed. This name might already be taken.';
    }
  }

  async loadProjects() {
    try {
      this.projects = await firstValueFrom(this.api.getProjects());
      this.clearError();
    } catch {
      this.projects = [];
      this.error = 'Could not load projects. Make sure the backend is running and you are logged in.';
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

    await firstValueFrom(this.api.createTask({ title: this.taskTitle, description: this.taskDesc, projectId: this.currentProject.id }));
    this.taskTitle = '';
    this.taskDesc = '';
    await this.loadTasks(this.currentProject.id);
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
  }

  async deleteTask(task: any) {
    if (!this.currentProject) {
      return;
    }

    await firstValueFrom(this.api.deleteTask(task.id));
    await this.loadTasks(this.currentProject.id);
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
}
