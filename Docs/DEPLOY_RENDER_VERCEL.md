# Deploy: Backend (Render) + Database (Render PostgreSQL) + Frontend (Vercel)

This guide deploys the FastAPI backend + Postgres on Render and the Vite/React frontend on Vercel.

## Prereqs

- Accounts: Render.com and Vercel.com
- This repo pushed to GitHub

## 1) Backend + DB on Render

Option A — One-click blueprint

- In Render, create a new Blueprint from repo root (render.yaml included).
- Render will provision:
  - PostgreSQL: `flight-ticketing-db`
  - Web service: `flight-ticketing-api`
- No manual DB URL needed — `DATABASE_URL` is wired from the DB.
- Other env vars are set:
  - `JWT_SECRET` (auto-generated)
  - `CORS_ALLOW_ORIGINS` (defaults to ["http://localhost:5173"]). Update after frontend is live.
  - Optional: `CORS_ALLOW_ORIGIN_REGEX` to allow Vercel previews, e.g. `https://.*-yourapp.vercel.app`

Option B — Manual service

- Create a PostgreSQL database in Render.
- Create a Web Service from `Backend/` folder.
  - Build: `pip install -r requirements.txt`
  - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Add env vars:
    - `DATABASE_URL` = Render DB connection string
    - `JWT_SECRET` = a long random string
    - `CORS_ALLOW_ORIGINS` = JSON array, e.g. `["https://<your-vercel-domain>", "http://localhost:5173"]`

Wait until health check `/health` returns OK. Note the Render URL, e.g. `https://flight-ticketing-api.onrender.com`.

## 2) Frontend on Vercel

- Import the `Frontend/` as a Vercel project (monorepo: set Root Directory = `Frontend`).
- Build settings (Vite React):
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm ci` (or default)
- Environment variables:
  - `VITE_API_BASE_URL` = your Render backend base URL (e.g., `https://flight-ticketing-api.onrender.com`)

Deploy, then you will get a Vercel URL like `https://flight-frontend.vercel.app`.

## 3) Finish CORS

- Go back to Render service env vars and set `CORS_ALLOW_ORIGINS` to include Vercel domain:
  - Example: `["https://flight-frontend.vercel.app", "http://localhost:5173"]`
- Re-deploy (Render will auto-restart on env change).

## 4) Create Admin User

- In Render dashboard > Shell, run (working directory: `Backend`):
  - `python -m scripts.create_admin --name "Admin" --email admin@example.com --password <StrongPass>`

## 5) Local sanity check (optional)

- Backend locally (from `Backend/`):
  - `pip install -r requirements.txt`
  - Set `.env` with a local Postgres URL or omit to use `sqlite:///./dev.db`
  - `uvicorn app.main:app --reload`
- Frontend locally (from `Frontend/`):
  - `npm i`
  - `npm run dev`
  - Set `Frontend/.env` with `VITE_API_BASE_URL` for local tests if needed.

## Notes

- DB migrations: The backend creates tables at startup automatically for now. Consider Alembic later.
- Tokens: JWT secret is required; rotate if leaked.
- With axios baseURL fallback to `window.location.origin`, you can host frontend and backend on same domain if desired.
