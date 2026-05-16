# Deployment Guide — MiniJira on Koyeb (Free)

Deploy MiniJira to Koyeb using a single Docker container that includes both the backend API and the built Angular frontend. We will connect it to your existing Supabase PostgreSQL database.

## Why Koyeb?
- ✅ Generous "Eco" free tier (512MB RAM)
- ✅ **No credit card required** for the free tier
- ✅ Simple Docker deployment (builds directly from your repo)
- ✅ GitHub integration (auto-deploy on push)

## Prerequisites
1. **GitHub account** — push this repo to your GitHub.
2. **Koyeb account** — free account at [koyeb.com](https://www.koyeb.com/). Sign up with GitHub.
3. **Supabase Database** — you should already have a Supabase PostgreSQL database and its `DATABASE_URL`.

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

## Step 2: Create Web Service on Koyeb

1. Go to your [Koyeb Dashboard](https://app.koyeb.com/).
2. Click **Create Service** (or **Deploy**).
3. **Connect your GitHub repo:**
   - Choose **GitHub** as the deployment method.
   - Authorize Koyeb to access your GitHub repositories.
   - Select your `Mini-Jira` repo.
   - Branch: `main` (or whichever branch you pushed to).
4. **Configure the build:**
   - **Builder:** Select **Dockerfile**.
   - **Dockerfile location:** Enter `/backend/Dockerfile`. (Make sure this matches your repo structure).
   - **Privileged:** Off.
5. **Environment Variables:**
   - Add the following variables:
     - `DATABASE_URL` = `postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true` (Use your actual Supabase URL. Port 6543 with `?pgbouncer=true` is recommended for Koyeb, or port 5432).
     - `JWT_SECRET` = `your_secure_random_string_here` (Use a strong random string).
     - `PORT` = `8000` (Koyeb's default port, which we configured in the Dockerfile).
6. **Instance & Region:**
   - Choose the **Eco (Free)** instance type.
   - Select a region closest to you.
7. **Expose your service:**
   - **Port:** `8000`
   - **Protocol:** `HTTP`
   - **Path:** `/`
8. **Name your service:** Give it a name like `mini-jira`.
9. Click **Deploy**.

Koyeb will now clone your repo, build the Docker image (which includes compiling Angular and NestJS), and start the container. The build process typically takes 3-5 minutes.

---

## Step 3: Database Migrations & Seeding

The provided `Dockerfile` is configured to run `npx prisma migrate deploy` automatically before starting the Node.js server. This means **your Supabase database will be automatically migrated** as soon as the Koyeb container starts.

*(Note: If you want to seed the database with sample data, you can temporarily connect your local terminal to the Supabase database and run `npm run seed`, or run a one-off command in Koyeb).*

---

## Step 4: Test the Deployment

1. Open the public URL assigned by Koyeb (e.g., `https://mini-jira-something.koyeb.app`).
2. You should see the MiniJira Angular application load.
3. Try registering a new user or logging in to confirm database connectivity.

---

## Troubleshooting

### Build fails
- Check the **Build Logs** in the Koyeb dashboard.
- Ensure the Dockerfile path is correct (`/backend/Dockerfile` or `Project/backend/Dockerfile` depending on your repo root).

### App runs but frontend doesn't load
- Check the **Runtime Logs** in Koyeb.
- Ensure that the static asset path in `src/main.ts` correctly points to the built Angular folder (`frontend-angular`). This should already be fixed in the code.

### Database connection error
- Verify `DATABASE_URL` is correctly formatted in your Koyeb Environment Variables.
- Supabase enforces SSL, so ensure `?sslmode=require` (or `?pgbouncer=true` for pooled connections) is in the URL.
- Make sure your Supabase project is active and not paused.

---

## Optional: Auto-redeploy on Git push

Koyeb automatically redeploys when you push to your connected branch. To test:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

Watch the Koyeb dashboard to see the new deployment start.

---

Happy deploying! 🚀
