# Flight Ticketing — Monorepo

This project implements a flight ticketing web application.

## Structure

- `backend/` — FastAPI app
- `frontend/` — (to be added) React app
- `Docs/` — Specs and implementation guide

## Prerequisites

- Python 3.11+
- Windows PowerShell or CMD

## Backend: run locally (no Docker)

1. Create and activate a virtual environment:
   - PowerShell:
     ```powershell
     cd backend
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   - CMD:
     ```cmd
     cd backend
     python -m venv .venv
     .venv\Scripts\activate.bat
     ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment:
   - In repo root, copy `.env.example` to `.env` and adjust values.

4. Run the API:
   ```bash
   uvicorn backend.app.main:app --reload
   ```

5. Test:
   - Health: http://127.0.0.1:8000/health
   - Ping: http://127.0.0.1:8000/api/ping

## Next steps

Follow `Docs/Guide.md` Phase 1+ for auth, models, search, booking, dashboards, and deployment.
