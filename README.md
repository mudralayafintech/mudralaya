# Mudralya Frontend (Vite + React)

Production build is ready without changing the visible design. This project outputs static assets to `build/` for hosting.

## Quick Start
- `npm install`
- Copy `.env.example` to `.env` and set real values (see Environment).
- `npm run dev` for local, `npm run build` for production output in `build/`.

## Environment
Set these at deploy time (don’t commit secrets):

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL | `https://api.yourdomain.com` |
| `VITE_SHOW_DASHBOARD_LINK` | Show/hide dashboard nav link | `false` |
| `VITE_DASHBOARD_USER` | Optional default username for admin login | `admin` |
| `VITE_DASHBOARD_API_KEY` | Legacy; unused in UI | leave empty |

## Azure Static Web Apps (recommended)
1) Build command: `npm run build`  
2) App location: `.`  
3) Output location: `build`  
4) API location: leave empty (backend is separate).  
`staticwebapp.config.json` is included to route unknown paths to `index.html` while excluding `/api/*` and static assets.

## Azure App Service / Blob static hosting
- Serve the `build/` folder.
- Enable SPA fallback/rewrite to `/index.html` so client-side routes (`/advisor`, `/plans`, etc.) work on refresh.
- Ensure HTTPS and CORS allow the frontend origin; enable cookies for `/api/admin/*` if using the dashboard.

## Scripts
- `npm run dev` – start Vite dev server.
- `npm run build` – create production build in `build/`.
- `npm run preview` – serve the built assets locally.
