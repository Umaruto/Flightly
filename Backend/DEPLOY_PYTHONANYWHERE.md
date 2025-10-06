# Deploying Backend on PythonAnywhere

## Prerequisites

- Python 3.11 (or matching your local)
- A PythonAnywhere account (free tier is fine for testing)

## Steps

1. Upload code to PythonAnywhere

   - Option A: Push to GitHub and clone in PythonAnywhere Bash console
   - Option B: Zip the `Backend/` folder and upload + unzip in your home directory

2. Create a virtualenv

   - In a Bash console on PythonAnywhere:
     ```bash
     python3.11 -m venv ~/.venvs/flightly
     source ~/.venvs/flightly/bin/activate
     pip install --upgrade pip
     pip install -r Backend/requirements.txt
     ```

3. Configure a Web app

   - In the PythonAnywhere Dashboard → Web → Add a new web app → Manual configuration → Python 3.11
   - Virtualenv: point to `~/.venvs/flightly`
   - WSGI configuration file: edit and set a section to import the WSGI app. Example:

     ```python
     import sys, os
     project_root = os.path.expanduser('~/Flight-ticketing/Backend')
     if project_root not in sys.path:
         sys.path.append(project_root)

     from wsgi import application  # uses Backend/wsgi.py
     ```

4. Environment variables (on the Web app page → Environment variables)

   - `JWT_SECRET` = a secure random string
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = 60
   - `DATABASE_URL` = for SQLite (simple): `sqlite:////home/<youruser>/Flight-ticketing/Backend/dev.db`
     - For PostgreSQL (recommended): `postgresql+psycopg2://<user>:<password>@<host>/<dbname>`
   - `DEPLOY_ORIGIN` = your frontend origin (e.g., `https://<yourfrontend>.pythonanywhere.com`)

5. Initialize the database

   - The app creates tables on startup. You can also run:
     ```bash
     source ~/.venvs/flightly/bin/activate
     cd ~/Flight-ticketing/Backend
     python scripts/db_inspect.py
     ```

6. Reload the web app

   - Click "Reload" on the PythonAnywhere Web dashboard.

7. Test
   - Visit `https://<yourbackend>.pythonanywhere.com/health`
   - API path is prefixed with `/api`, e.g. `/api/auth/login`

## Notes

- Free tier has always-on but limited CPU seconds. For background jobs, consider paid plan or external workers.
- For production, use PostgreSQL (on a managed provider) and Alembic migrations.
