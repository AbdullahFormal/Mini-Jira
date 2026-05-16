# Deployment Guide — Split Architecture (Vercel + HF Spaces)

We are deploying MiniJira using a decoupled architecture:
- **Frontend**: Vercel
- **Backend API**: Hugging Face Spaces (Docker)
- **Database**: Supabase PostgreSQL

## Prerequisites
1. **GitHub account** — push this repo to your GitHub.
2. **Supabase Database** — you should already have a Supabase PostgreSQL database and its `DATABASE_URL`.
3. **Hugging Face Account** — sign up at [huggingface.co](https://huggingface.co).
4. **Vercel Account** — sign up at [vercel.com](https://vercel.com) with GitHub.

---

## Step 1: Push Code to GitHub

Initialize a git repo (if not already done) and push to your repo:

```bash
git init
git add .
git commit -m "Initial commit: MiniJira split architecture"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Mini-Jira.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Hugging Face Spaces

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. **Space name:** `mini-jira-api` (or similar).
3. **License:** MIT.
4. **Select the Space SDK:** Choose **Docker** -> **Blank**.
5. **Space Hardware:** Free (CPU basic).
6. Click **Create Space**.

### Configure the Space
1. Click the **Settings** tab in your Space.
2. Scroll down to **Variables and secrets**.
3. Click **New secret** and add:
   - `DATABASE_URL` = `postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true` (Use your actual Supabase URL. Port 6543 with `?pgbouncer=true` or port 5432).
   - `JWT_SECRET` = `your_secure_random_string_here` (Use a strong random string).
   *(Note: Hugging Face automatically exposes port `7860`, which our Dockerfile is configured to use).*

### Connect your GitHub Repo to the Space
The easiest way is to add HF as a git remote and push your code:
```bash
# From your local repository root:
git remote add hf https://huggingface.co/spaces/YOUR_HF_USERNAME/mini-jira-api
# You may need to generate a HF Access Token (Write permission) to use as your password
git push hf main
```
Alternatively, you can copy the contents of your `Project/backend` folder directly into the Space files using the HF Web UI. Ensure the `Dockerfile` is at the root of the Space!

Once uploaded, the Space will build the Docker container and start. The build logs will show Prisma migrating your Supabase database automatically.

**Copy your Space URL:**
Click the `Embed this Space` button (three dots menu) or right click the App frame and copy the Direct URL. It usually looks like:
`https://yourusername-mini-jira-api.hf.space`

---

## Step 3: Configure the Frontend

Before deploying the frontend to Vercel, tell Angular where to find your new backend.

1. Open `Project/backend/frontend/src/environments/environment.prod.ts`.
2. Update the `apiUrl` to your Hugging Face Space URL:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://yourusername-mini-jira-api.hf.space'
   };
   ```
3. Commit and push this change to your GitHub repo:
   ```bash
   git add .
   git commit -m "Configure production API URL"
   git push origin main
   ```

---

## Step 4: Deploy Frontend to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** -> **Project**.
3. Import your `Mini-Jira` GitHub repository.
4. **Configure Project:**
   - **Framework Preset:** Angular
   - **Root Directory:** Click Edit and select `Project/frontend`.
5. Click **Deploy**.

Vercel will build the Angular application and assign it a public URL (e.g., `https://mini-jira-front.vercel.app`).

---

## Step 5: Test the Application

1. Open your Vercel URL.
2. The Angular app should load.
3. Try registering a user and creating a project. The requests will be routed to your Hugging Face API, which writes to your Supabase database!

---

Happy deploying! 🚀
