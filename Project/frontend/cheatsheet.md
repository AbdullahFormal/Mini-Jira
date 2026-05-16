Frontend Cheat Sheet — Angular

Quick commands (from this folder)

```powershell
# install deps (if not installed at repo root)
npm install

# run Angular dev server (port 4200)
npm run start

# build production bundle
npm run build
```

Proxy
- `proxy.conf.json` forwards `/api` to `http://localhost:10000` in dev so frontend can call `/api/...` without CORS issues.

Demo credentials (seeded backend)
- Manager: manager@example.com / password
- Developer: dev@example.com / password

Important files
- `src/app/app.component.ts` — single-page UI and login/register flows
- `src/app/api.service.ts` — API wrapper; uses `Authorization: Bearer <token>` header
- `src/app/app.component.html` — UI template (login, projects, tasks)

Common issues
- Blank page / NG0908: ensure `zone.js` is imported in `src/polyfills.ts`.
- API requests failing: confirm backend running on http://localhost:10000 and proxy is active.

Notes
- In production the Nest backend serves the built frontend from `backend/dist/frontend` (see backend `main.ts`).

