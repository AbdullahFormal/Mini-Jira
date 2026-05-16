# MiniJira — README

This repository contains MiniJira, a compact task-management demo application implementing a full-stack TypeScript workflow: a NestJS backend with Prisma ORM and an Angular frontend. The project is intentionally small and readable while following real-world patterns (JWT auth, database migrations, environment configuration), making it suitable for demonstrations, teaching, and light prototyping.

**Repository structure (high level)**
- `Project/` — application entry folder and orchestrating `package.json` scripts.
  - `backend/` — NestJS application, Prisma schema, migrations, and backend-specific scripts.
  - `backend/frontend/` — Angular application (SPA) served in production by the backend.

**Tech stack**
- Node.js + TypeScript
- NestJS (server framework)
- Prisma (ORM) + PostgreSQL (recommended)
- Angular (frontend SPA)
- JWT for authentication, `bcrypt` for password hashing

## Quick Start (development)
Prerequisites: Node.js (v18+), npm, PostgreSQL or compatible database.

1. Install root dependencies and run the dev stack (from repository root):

```powershell
cd Project
npm install
npm run start:dev
```

- `start:dev` launches the Angular dev server (port 4200) and the Nest backend dev server concurrently.

2. Alternatively run parts separately:

```powershell
cd Project/backend
npm install
npm run start:dev     # backend dev (ts-node-dev)

cd Project/backend/frontend
npm install
npm run start         # angular dev server (4200)
```

Open the frontend at http://localhost:4200. The frontend proxies `/api` to the backend on port `10000` in development.

## Production build & run
From the `Project` folder:

```powershell
cd Project
npm install
npm start
```

This builds the frontend and backend, then starts the compiled backend (`node backend/dist/main.js`). The backend serves the built frontend assets and exposes the API at the same host/port.

## Configuration (environment)
Create `Project/backend/.env` with values for:

```text
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"
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
- `npm run seed` populates demo users and sample data.

Schema and data model: see [Project/backend/prisma/schema.prisma](Project/backend/prisma/schema.prisma).

## Authentication
- Registration endpoint: `POST /auth/register` — validates input (`RegisterDto`), hashes the password, creates a user via Prisma.
- Login endpoint: `POST /auth/login` — validates credentials and returns a signed JWT (and `name`, `email`, `role` in the response).
- Protected routes use a `JwtAuthGuard` to validate tokens.

Frontend stores the JWT in `localStorage` as `mj_token` and includes it as `Authorization: Bearer <token>` on API requests.

## API (overview)
- `POST /auth/register` — register new account
- `POST /auth/login` — login
- `GET /projects` — list projects for the user
- `POST /projects` — create project (manager only)
- `DELETE /projects/:id` — delete project
- `GET /tasks?projectId=...` — list tasks
- `POST /tasks` — create a task
- `PATCH /tasks/:id` — update task (status/title/desc)
- `DELETE /tasks/:id` — delete task

See controllers in [Project/backend/src](Project/backend/src) for exact DTOs and validation rules.

## Frontend notes
- Entry: [Project/backend/frontend/src/app/app.component.ts](Project/backend/frontend/src/app/app.component.ts)
- API wrapper: [Project/backend/frontend/src/app/api.service.ts](Project/backend/frontend/src/app/api.service.ts)
- Zone.js is required for Angular runtime — ensure `polyfills.ts` imports it.

## Troubleshooting
- PrismaClient errors about `DATABASE_URL`: confirm `Project/backend/.env` exists and contains `DATABASE_URL`.
- Blank frontend page (NG0908): ensure `zone.js` is imported in `polyfills.ts`.
- If `npm run start:dev` fails due to missing `concurrently`, run `npm install` in `Project` or run the script via `npx --yes concurrently`.

## Development notes & rationale
- The project is intentionally compact to make it easy to read and explain; it omits some production concerns (rate limiting, detailed logging, CI) to maintain clarity for teaching.
- Design choices: NestJS + Prisma provide clear server-side structure and a typed DB client; Angular demonstrates a full-featured SPA interacting with a typed API.

## Contributing
- Make changes on a branch, open a PR, and include a brief description and any relevant run steps.

## License
This demo is published under MIT License
