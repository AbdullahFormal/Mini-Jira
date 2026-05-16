# Deployment Guide — MiniJira on Render

Deploy MiniJira to Render using a single Docker container that includes both the backend API and the built Angular frontend, plus a managed PostgreSQL database.

## Why Render?
- ✅ Free tier with managed PostgreSQL
- ✅ Simple Docker deployment (no Docker Hub required)
- ✅ GitHub integration (auto-deploy on push)
- ✅ Web UI for environment variables and secrets

## Prerequisites
1. **GitHub account** — push this repo to your GitHub.
2. **Render account** — free account at [render.com](https://render.com).

---

## Step 1: Push Code to GitHub

Initialize a git repo (if not already done) and push to your repo:

```bash
git init
git add .
git commit -m "Initial commit: MiniJira full-stack app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Mini-Jira.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Your code is now on GitHub.

---

## Step 2: Create Managed PostgreSQL on Render

1. Go to [render.com/dashboard](https://render.com/dashboard).
2. Click **New +** → **PostgreSQL**.
3. Fill in:
   - **Name:** `mini-jira-db` (or similar)
   - **Database:** `minijiiradb` (or any name)
   - **User:** `postgres` (default is fine)
   - Leave other fields as defaults.
4. Click **Create Database** and wait (2–3 minutes).
5. Once created, copy the **Internal Database URL** (starts with `postgresql://...`).
   - Store this safely — you'll use it in Step 3.

---

## Step 3: Create Web Service on Render

1. Back in the dashboard, click **New +** → **Web Service**.
2. **Connect your GitHub repo:**
   - Click **GitHub** if prompted, authorize Render to access your GitHub.
   - Select your `Mini-Jira` repo.
   - Leave the branch as `main`.
3. **Configure the service:**
   - **Name:** `mini-jira-backend` (or similar)
   - **Region:** Pick the closest to your users (e.g., `N. Virginia` for US).
   - **Runtime:** Select **Docker**.
   - **Build Command:** Leave empty (Render auto-detects `Dockerfile`).
   - **Dockerfile path:** Enter `Project/backend/Dockerfile`.
   - **Start Command:** Leave empty (uses `CMD` from Dockerfile).

4. **Add Environment Variables:**
   - Scroll down to **Environment** section.
   - Click **Add Environment Variable** and add:
     ```
     DATABASE_URL = postgresql://postgres:PASSWORD@HOST:5432/minijiiradb
     ```
     (Replace `PASSWORD` and `HOST` with values from your PostgreSQL service URL.)
   - Add another:
     ```
     JWT_SECRET = your_secure_random_string_here
     ```
     (Use a strong random string, or just `dev-secret` for testing.)
   - Optionally:
     ```
     PORT = 3000
     ```

5. Click **Create Web Service**. Render will:
   - Clone your repo.
   - Build the Docker image (compile Angular + TypeScript backend).
   - Deploy the container.
   - Assign a public URL (e.g., `https://mini-jira-backend.render.com`).

   Build takes ~3–5 minutes. Watch the **Logs** tab.

---

## Step 4: Run Database Migrations (one-time setup)

Once the service is deployed and running:

1. In the Render dashboard, click your Web Service.
2. Click the **Shell** tab at the top.
3. In the shell, run:
   ```bash
   npx prisma migrate deploy --schema=Project/backend/prisma/schema.prisma
   npx prisma generate --schema=Project/backend/prisma/schema.prisma
   npm run seed --prefix=Project/backend
   ```

   This:
   - Applies all pending migrations to your Postgres DB.
   - Generates the Prisma client.
   - Seeds the database with demo users (optional; skip `npm run seed` if you don't want sample data).

---

## Step 5: Test the Deployment

1. Open the public URL assigned by Render (shown in the service dashboard, e.g., `https://mini-jira-backend.render.com`).
2. You should see the MiniJira Angular app.
3. Try registering a new user or logging in with demo credentials (if you ran seed):
   - **Email:** `manager@example.com` **Password:** `password123`
   - **Email:** `dev@example.com` **Password:** `password456`

---

## Troubleshooting

### Build fails
- Check the **Logs** in the Render dashboard.
- Ensure `Dockerfile` path is correct: `Project/backend/Dockerfile`.
- Verify `DATABASE_URL` and `JWT_SECRET` are set.

### App runs but frontend doesn't load
- Ensure the Angular build completed in the Docker image.
- Check that `/api` routes work: open the browser DevTools console and verify API calls are reaching the backend.

### Database connection error
- Verify `DATABASE_URL` is correctly formatted and matches your PostgreSQL service details.
- Check that the PostgreSQL service is **running** (not paused) in the Render dashboard.

### Forgot to seed?
- Run migrations + seed again from the Shell:
  ```bash
  npx prisma migrate deploy --schema=Project/backend/prisma/schema.prisma
  npm run seed --prefix=Project/backend
  ```

---

## Optional: Auto-redeploy on Git push

Render automatically redeploys when you push to `main` (or your connected branch). To test:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

Watch the **Deployments** tab in your Render service to see the new build start.

---

## Environment Variables Reference

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ Yes | `postgresql://...` | Copy from your Render PostgreSQL service. |
| `JWT_SECRET` | ✅ Yes | `my-secret-key-123` | Keep this secret. Use a strong random string. |
| `PORT` | ❌ Optional | `3000` | Defaults to 3000 if not set. |

---

## Next Steps

- **Monitor logs** — Check the **Logs** tab regularly for errors.
- **Scale up** — If you outgrow the free tier, upgrade your plan.
- **Custom domain** — Add a custom domain in **Settings** → **Custom Domain**.
- **Local development** — See [Guide.md](./Guide.md) for running locally.

---

## Deployment Diagram

```
GitHub Repo (Mini-Jira)
    ↓
Render (connected)
    ├─ Web Service (Docker: backend + built frontend)
    │  ├─ Listens on port 3000
    │  └─ Serves /api & static frontend
    │
    └─ PostgreSQL (managed)
       └─ DATABASE_URL provided to Web Service
```

Happy deploying! 🚀
