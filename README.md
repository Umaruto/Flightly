# Flightly — Deployed App and API

Flightly is a flight ticketing web application with a FastAPI backend (Render) and a React frontend (Vercel).

## Live

- Web App (Vercel): https://flightly-aruqsckz3-umars-projects-9160e705.vercel.app/
- API Base (Render): https://flight-ticketing-api.onrender.com
- Health: https://flight-ticketing-api.onrender.com/health
- API Docs (Swagger): https://flight-ticketing-api.onrender.com/docs

## How it connects

- Frontend calls the backend via the environment variable VITE_API_BASE_URL.
- In production on Vercel, VITE_API_BASE_URL is set to the Render API URL.
- CORS on the backend is configured to allow the Vercel domain (and optional preview domains).

## Project structure

- Backend — FastAPI app (deployed to Render)
- Frontend — React app (deployed to Vercel)
- Docs — Guides and notes

## Local development

Backend (FastAPI)

- Requirements: Python 3.11
- Steps:

  ```powershell
  cd Backend
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  pip install -r requirements.txt

  # Optionally create Backend\.env (copy from .env.example if present)
  # Run dev server
  uvicorn app.main:app --reload
  ```

- Test: http://127.0.0.1:8000/health

Frontend (React + Vite)

- Requirements: Node.js LTS
- Steps:

  ```powershell
  cd Frontend
  npm i
  # Point frontend to your local API
  $env:VITE_API_BASE_URL = "http://127.0.0.1:8000"
  npm run dev
  ```

## Deployment summary

- Backend on Render

  - Python 3.11 (pinned for psycopg2 compatibility)
  - Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
  - Key env vars:
    - DATABASE_URL (Render Postgres)
    - JWT_SECRET (random string)
    - CORS_ALLOW_ORIGINS (JSON array, e.g. ["https://your-vercel-domain.vercel.app","http://localhost:5173"])
    - Optional: CORS_ALLOW_ORIGIN_REGEX for Vercel previews (e.g. ^https://.\*\.vercel\.app$)

- Frontend on Vercel
  - Root Directory: Frontend
  - Build: npm run build
  - Output: dist
  - Env: VITE_API_BASE_URL = https://flight-ticketing-api.onrender.com

## Admin user / User / Company manager

Name: admin
email: admin@example.com
password: 123456

Name: manager
email: manager@example.com
password: 123456

Name: user
email: user@example.com
password: 123456

## Troubleshooting

- CORS: If the browser blocks requests, ensure your Vercel domain is listed in CORS_ALLOW_ORIGINS on Render (valid JSON).
- 404 from API calls on Vercel: ensure VITE_API_BASE_URL is set to the Render API URL.
- DB tables: The app creates tables on startup; to initialize manually:

  ```powershell
  $env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
  python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine); print('Tables created')"
  ```

## Links

- Project overview (YouTube): https://youtu.be/g1PAxwXe5Y0?si=qw3mSLzoGExkuyD_
- Live web page: https://flightly-aruqsckz3-umars-projects-9160e705.vercel.app/
