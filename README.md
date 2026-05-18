# MiniJira — README

This repository contains MiniJira, a compact task-management demo application implementing a full-stack TypeScript workflow. It features a NestJS backend with Prisma ORM and an Angular frontend. The project is intentionally small and readable while following real-world decoupled architecture patterns, making it suitable for demonstrations, teaching, and light prototyping.

## Live Deployments
- **Frontend (Vercel)**: [https://mini-jira-one.vercel.app/](https://mini-jira-one.vercel.app/)
- **Backend API (Hugging Face)**: [https://abdullahformal-mini-jira.hf.space](https://abdullahformal-mini-jira.hf.space)
- **Database**: Hosted securely on [Supabase](https://supabase.com/)

**Repository structure (high level)**
- `Project/` — application entry folder and orchestrating `package.json` scripts.
  - `backend/` — NestJS application, Prisma schema, migrations, and backend-specific scripts.
  - `frontend/` — Angular application (SPA), fully decoupled from the backend.

**Tech stack**
- Node.js + TypeScript
- NestJS (server framework)
- Prisma (ORM) + PostgreSQL (Supabase recommended)
- Angular (frontend SPA)
- JWT for authentication, `bcrypt` for password hashing

## Quick Start (development)
Prerequisites: Node.js (v18+), npm, PostgreSQL or Supabase database.

1. Install root dependencies and run the dev stack (from repository root):

```powershell
cd Project
npm run install-all
npm run start:dev
```

- `start:dev` launches the Angular dev server (port 4200) and the Nest backend dev server (port 10000) concurrently. The frontend proxies `/api` to the backend in development.

## Production Deployment (Decoupled)
The application is designed to be deployed as two separate services:
- **Backend**: Deploy the `Project/backend/` folder to **Hugging Face Spaces** (Docker Blank SDK). It will automatically run database migrations on startup.
- **Frontend**: Deploy the `Project/frontend/` folder to **Vercel**. Ensure you update `Project/frontend/src/environments/environment.prod.ts` and `environment.ts` with your Hugging Face Space API URL before deploying.

See `DEPLOYMENT.md` for a full step-by-step guide.

## Configuration (environment)
Create `Project/backend/.env` with values for:

```text
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
JWT_SECRET=your_secret_here
PORT=10000
```

- `DATABASE_URL` is required by Prisma.
- `JWT_SECRET` secures JWT tokens — do not share in production.

## Database (Prisma)
From `Project/backend` run:

```powershell
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

- `prisma generate` creates the TypeScript client.
- `migrate dev` applies schema migrations.
- `npm run seed` populates demo users (`manager` and `dev`) and sample data.

Schema and data model: see [Project/backend/prisma/schema.prisma](Project/backend/prisma/schema.prisma).

## Authentication
- **Registration**: `POST /auth/register` — Allows users to sign up using their own Full Name, Email, and Password, alongside selecting either a `MANAGER` or `DEVELOPER` role.
- **Login**: `POST /auth/login` — validates credentials and returns a signed JWT (and `name`, `email`, `role` in the response).
- Protected routes use a `JwtAuthGuard` to validate tokens.

Frontend stores the JWT in `localStorage` as `mj_token` and includes it as `Authorization: Bearer <token>` on API requests.

## API (overview)
- `POST /auth/register` — register new account
- `POST /auth/login` — login
- `GET /auth/users` — list registered team members
- `GET /projects` — list projects for the user
- `POST /projects` — create project (manager only)
- `GET /projects/:id/stats` — calculate project task metrics
- `GET /projects/:id/activity` — fetch project audit log history
- `DELETE /projects/:id` — delete project
- `GET /tasks?projectId=...` — list tasks
- `POST /tasks` — create a task
- `PATCH /tasks/:id` — update task (status/title/desc)
- `DELETE /tasks/:id` — delete task

See controllers in [Project/backend/src](Project/backend/src) for DTOs and validation rules.

## Frontend notes
- Entry: [Project/frontend/src/app/app.component.ts](Project/frontend/src/app/app.component.ts)
- API wrapper: [Project/frontend/src/app/api.service.ts](Project/frontend/src/app/api.service.ts)
- Routing: Handled client-side via `vercel.json` in production.

## Troubleshooting
- PrismaClient errors about `DATABASE_URL`: confirm `Project/backend/.env` exists and contains `DATABASE_URL`.
- If Prisma fails on Alpine Docker images (Hugging Face), ensure `apk add --no-cache openssl` is in the Dockerfile.

## Development notes & rationale
- The project is intentionally compact to make it easy to read and explain.
- Design choices: NestJS + Prisma provide clear server-side structure and a typed DB client; Angular demonstrates a full-featured SPA interacting with a decoupled typed API.

## License
This demo is published under MIT License
