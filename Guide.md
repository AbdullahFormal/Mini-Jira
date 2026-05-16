# Sample Task Manager — Student-Friendly Overview

This repository is a compact task-management demo built with NestJS (backend), Prisma (ORM + DB), and Angular (frontend). It was intentionally written to be small, readable, and easy to explain for learners who are new to these technologies.

This single README replaces other project docs and explains the whole stack, how it works, how to run it, and how the parts fit together.

## Summary
- **Backend:** NestJS (TypeScript) + Prisma connecting to a PostgreSQL database. Auth uses JWT and bcrypt for password hashing.
- **Frontend:** Angular SPA using `HttpClient` to talk to the backend API. The app stores a JWT in `localStorage` and sends it on requests.
- **Dev vs Production:** In development you run two servers (Angular dev server on 4200 and Nest backend on 10000). In production the backend serves the built frontend static files.

## Quick Prerequisites
- Node.js (v18+ recommended)
- npm
- PostgreSQL (or a compatible DB) accessible from your machine

## Repository Layout (important files)
- [Project/package.json](Project/package.json) — root scripts that build/run the project
- [Project/backend/package.json](Project/backend/package.json) — backend scripts and dependencies
- [Project/backend/src/main.ts](Project/backend/src/main.ts) — server bootstrap; loads `.env` and configures static serving
- [Project/backend/src/prisma.module.ts](Project/backend/src/prisma.module.ts) — shared Prisma provider
- [Project/backend/prisma/schema.prisma](Project/backend/prisma/schema.prisma) — DB schema (User, Project, Task)
- [Project/backend/src/auth](Project/backend/src/auth) — auth controller/service/strategies and DTOs
- [Project/backend/frontend/src/app/app.component.ts](Project/backend/frontend/src/app/app.component.ts) — simplified Angular UI
- [Project/backend/frontend/src/app/api.service.ts](Project/backend/frontend/src/app/api.service.ts) — HTTP wrapper used by frontend

Paths above are workspace-relative. Open the files to follow the code after reading this guide.

## How the System Works (conceptual)

1. The Angular SPA (dev server on port 4200) provides the UI where a user can register/login and manage projects and tasks.
2. When logging in, the frontend POSTs credentials to `/auth/login`. The backend validates the password (bcrypt) and responds with a JWT.
3. The frontend stores the JWT in `localStorage` and sends it in the `Authorization: Bearer <token>` header on subsequent requests.
4. Backend endpoints are protected with a `JwtAuthGuard` which verifies the token (using the same `JWT_SECRET` from `.env`).
5. Backend uses Prisma as the database client. Prisma queries map directly to the models in `schema.prisma`.
6. In production the backend serves the compiled frontend from the `frontend/dist` folder and falls back to `index.html` for SPA routing.

## Environment Variables
Create a `.env` file in `Project/backend/` (the repository already contains a sample). The backend expects at least:

```
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
JWT_SECRET=your_jwt_secret_here
PORT=10000
```

- `DATABASE_URL` — Prisma reads this to connect to the DB. If this is missing you will see a PrismaClientInitializationError.
- `JWT_SECRET` — used to sign and verify JWTs. Keep this secret for any real deployment.
- `PORT` — server port (defaults to 10000 in the repo `.env`).

Important: the backend code explicitly loads `Project/backend/.env` at runtime, so running the server from the repository root still picks up the `.env` correctly.

## Setup & Run (Development)

Open a terminal and run these commands from the `Project` folder.

```powershell
cd "Project"
npm install
npm run start:dev
```

- `npm run start:dev` runs both the Angular dev server (port 4200) and the Nest backend dev server (ts-node-dev) concurrently. Use this for interactive development.

If you prefer to run backend and frontend separately:

```powershell
cd "Project/backend"
npm install
npm run start:dev   # backend dev (ts-node-dev)

cd "Project/backend/frontend"
npm install
npm run start      # angular dev server on 4200
```

Open the frontend at http://localhost:4200 and the backend at http://localhost:10000 (or whatever `PORT` you set).

## Setup & Run (Production build)

From the `Project` folder run:

```powershell
cd "Project"
npm install
npm start
```

- `npm start` builds the frontend (`ng build`) and the backend (`tsc`) and then starts the compiled backend (`node backend/dist/main.js`). The backend serves the built frontend assets.

## Prisma (DB) — migration and seed

Commands you will use from `Project/backend`:

```powershell
cd Project/backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

- `prisma generate` creates the Prisma client based on `schema.prisma`.
- `prisma migrate dev` applies schema migrations (creates a `_prisma_migrations` folder and updates the DB). The repo may already have an initial migration.
- `npm run seed` runs the repo's seed script which populates example users and some demo data.

If you see `Environment variables loaded from .env` when running prisma commands, that means Prisma read `Project/backend/.env` correctly.

## Authentication Flow (detailed)

- Registration: frontend POSTs to `/auth/register`. Backend hashes the password with `bcrypt` and creates a `User` record via Prisma.
- Login: frontend POSTs to `/auth/login`. Backend compares the password with `bcrypt.compare` and signs a JWT with `JWT_SECRET`.
- Protected routes: controllers annotated with `@UseGuards(JwtAuthGuard)` accept requests with `Authorization: Bearer <token>` and the guard validates the token and attaches the user payload to the request.

## Frontend specifics

- The Angular app is intentionally simple: a single component handles login/register and project/task CRUD to keep the code small for learning.
- The `ApiService` sets the `Authorization` header by reading the token from `localStorage` on each request.
- `polyfills.ts` includes `zone.js`, which Angular requires; if the page appears blank in the browser, check the console for an Angular runtime error complaining about missing Zone.js (NG0908).

## Troubleshooting (common issues)

- PrismaClientInitializationError: `Environment variable not found: DATABASE_URL` — Ensure `Project/backend/.env` exists and `DATABASE_URL` is set. If running the compiled server directly, confirm `dotenv` is loading the `.env` file in `main.ts`.
- Blank frontend page / NG0908 — Add `import 'zone.js'` to `Project/backend/frontend/src/polyfills.ts` and rebuild.
- `concurrently` not found when running `npm run start:dev` — the repo uses `npx --yes concurrently` in scripts; run `npm install` in `Project` to refresh dependencies or run the script directly via npx.

## Key Code Walkthrough (where to look)

- Server bootstrap: [Project/backend/src/main.ts](Project/backend/src/main.ts) — shows how the backend loads environment variables, sets up CORS, validation pipes, and serves the frontend static files in production.
- Prisma client: [Project/backend/src/prisma.module.ts](Project/backend/src/prisma.module.ts) and [Project/backend/prisma/schema.prisma](Project/backend/prisma/schema.prisma).
- Auth: check [Project/backend/src/auth](Project/backend/src/auth) for `AuthController`, `AuthService`, `JwtStrategy`, `JwtAuthGuard`, and DTOs.
- Frontend API: [Project/backend/frontend/src/app/api.service.ts](Project/backend/frontend/src/app/api.service.ts)
- Frontend UI: [Project/backend/frontend/src/app/app.component.ts](Project/backend/frontend/src/app/app.component.ts)

## Why these choices? (educational rationale)

- NestJS: provides a familiar, testable structure for controllers/services and integrates well with decorators and dependency injection — good for students learning server-side TypeScript.
- Prisma: easy-to-read schema, generated TypeScript client, and simple migrations make DB work approachable for beginners.
- Angular: a complete front-end framework with clear separation of templates and logic; the Angular CLI also streamlines builds and dev server usage.
- JWT + bcrypt: common, real-world authentication pattern that students should recognize and understand.

## Notes for instructors / graders

- The code is simplified on purpose: fewer abstractions, single-file UI, and explicit, small services make it easier to read and explain within a short course or demo timeframe.
- The README intentionally documents both dev and production flows and explains why environment variables must be present.

## Next steps or optional improvements

- Add tests (unit + e2e) to teach testing practices.
- Split frontend into components for maintainability as the project grows.
- Add Docker and a `docker-compose` setup to standardize DB and environment for students.

---

If anything in this README is unclear or you want this doc to target a different audience (absolute beginner vs. intermediate), tell me how you'd like it rephrased and I'll update it.
