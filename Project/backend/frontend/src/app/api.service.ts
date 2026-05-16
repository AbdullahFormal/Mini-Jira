import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiService {
  private base = '/api';
  constructor(private http: HttpClient) {}

  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post(this.base + '/auth/login', payload);
  }

  register(payload: { email: string; password: string; name: string; role: string }): Observable<any> {
    return this.http.post(this.base + '/auth/register', payload);
  }

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(this.base + '/projects', this.authOptions());
  }

  createProject(payload: { name: string; description: string }): Observable<any> {
    return this.http.post(this.base + '/projects', payload, this.authOptions());
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(this.base + '/projects/' + id, this.authOptions());
  }

  createTask(payload: { title: string; description: string; projectId: string }): Observable<any> {
    return this.http.post(this.base + '/tasks', payload, this.authOptions());
  }

  getTasks(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(this.base + '/tasks?projectId=' + projectId, this.authOptions());
  }

  updateTask(id: string, payload: { status?: string; title?: string; description?: string; assigneeId?: string }) {
    return this.http.patch(this.base + '/tasks/' + id, payload, this.authOptions());
  }

  deleteTask(id: string) {
    return this.http.delete(this.base + '/tasks/' + id, this.authOptions());
  }

  private authOptions() {
    const token = localStorage.getItem('mj_token');
    if (!token) {
      return {};
    }
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
  }
}
