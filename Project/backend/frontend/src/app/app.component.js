"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppComponent = void 0;
const core_1 = require("@angular/core");
const api_service_1 = require("./api.service");
let AppComponent = class AppComponent {
    constructor(api) {
        this.api = api;
        this.token = localStorage.getItem('mj_token') || '';
        this.role = null;
        this.projects = [];
        this.currentProject = null;
        this.tasks = [];
        // form fields
        this.email = '';
        this.password = '';
        this.name = '';
        this.roleSelect = 'DEVELOPER';
        this.projectName = '';
        this.projectDesc = '';
        this.taskTitle = '';
        this.taskDesc = '';
        this.applyToken(this.token);
    }
    applyToken(t) {
        this.token = t;
        if (t) {
            localStorage.setItem('mj_token', t);
            try {
                const payload = JSON.parse(atob(t.split('.')[1]));
                this.role = payload.role;
            }
            catch (e) {
                this.role = null;
            }
            this.loadProjects();
        }
        else {
            localStorage.removeItem('mj_token');
            this.role = null;
            this.projects = [];
        }
    }
    async login() {
        try {
            const res = await this.api.login({ email: this.email, password: this.password }).toPromise();
            this.applyToken(res.access_token);
        }
        catch (e) {
            alert('Login failed');
        }
    }
    async register() {
        try {
            await this.api.register({ email: this.email, password: this.password, name: this.name, role: this.roleSelect }).toPromise();
            alert('Registered, now login');
        }
        catch (e) {
            alert('Register failed');
        }
    }
    async loadProjects() {
        try {
            this.projects = await this.api.getProjects().toPromise();
        }
        catch (e) {
            this.projects = [];
        }
    }
    async createProject() {
        await this.api.createProject({ name: this.projectName, description: this.projectDesc }).toPromise();
        this.projectName = '';
        this.projectDesc = '';
        this.loadProjects();
    }
    async openProject(p) { this.currentProject = p; this.loadTasks(p.id); }
    async loadTasks(projectId) { this.tasks = await this.api.getTasks(projectId).toPromise(); }
    async createTask() { await this.api.createTask({ title: this.taskTitle, description: this.taskDesc, projectId: this.currentProject.id }).toPromise(); this.taskTitle = ''; this.taskDesc = ''; this.loadTasks(this.currentProject.id); }
    async updateTask(t) { const next = (t.status === 'TODO') ? 'IN_PROGRESS' : (t.status === 'IN_PROGRESS' ? 'DONE' : 'TODO'); await this.api.updateTask(t.id, { status: next }).toPromise(); this.loadTasks(this.currentProject.id); }
    async deleteTask(t) { await this.api.deleteTask(t.id).toPromise(); this.loadTasks(this.currentProject.id); }
    async deleteProject(p) { if (confirm('Delete?')) {
        await this.api.deleteProject(p.id).toPromise();
        this.loadProjects();
        this.currentProject = null;
    } }
    logout() { this.applyToken(''); }
};
exports.AppComponent = AppComponent;
exports.AppComponent = AppComponent = __decorate([
    (0, core_1.Component)({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.css']
    }),
    __metadata("design:paramtypes", [api_service_1.ApiService])
], AppComponent);
