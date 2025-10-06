# Deploy FastAPI Backend to Google Cloud Platform (Cloud Run + Cloud SQL)

This guide deploys the backend to Cloud Run (serverless) and uses Cloud SQL for Postgres. No Dockerfiles are needed locally—`gcloud` will build from source.

## Prerequisites

- gcloud CLI installed and authenticated
- A GCP project selected: `gcloud config set project <PROJECT_ID>`
- Enable APIs:
  - Cloud Run Admin API
  - Cloud Build API
  - Cloud SQL Admin API
- A Google Cloud SQL Postgres instance created

## 1) Create Cloud SQL (PostgreSQL)

- Create an instance and database (e.g., DB name: `flightly`). Take note of:
  - Instance connection name: `<PROJECT>:<REGION>:<INSTANCE>`
  - DB user, password

## 2) Set backend environment variables

The app accepts either a direct `DATABASE_URL` or Cloud SQL connector envs.

Option A — Use DATABASE_URL (public IP):

```
DATABASE_URL=postgresql+psycopg2://<USER>:<PASS>@<PUBLIC_IP>:5432/flightly
```

Option B — Use Cloud SQL Python Connector (recommended for private IP):

```
CLOUD_SQL_CONNECTION_NAME=<PROJECT>:<REGION>:<INSTANCE>
DB_USER=<USER>
DB_PASS=<PASS>
DB_NAME=flightly
DB_IP_TYPE=PRIVATE   # or PUBLIC
```

Also configure CORS to allow your frontend origin:

```
CORS_ALLOW_ORIGINS=["https://<your-frontend-domain>", "http://localhost:5173"]
```

## 3) Deploy to Cloud Run

From the `Backend/` folder:

```
gcloud run deploy flightly-api \
  --source . \
  --region <REGION> \
  --allow-unauthenticated \
  --set-env-vars JWT_SECRET=<changeme>,ACCESS_TOKEN_EXPIRE_MINUTES=60 \
  --set-env-vars CORS_ALLOW_ORIGINS='["https://<your-frontend>","http://localhost:5173"]' \
  --set-env-vars CLOUD_SQL_CONNECTION_NAME=<PROJECT>:<REGION>:<INSTANCE>,DB_USER=<USER>,DB_PASS=<PASS>,DB_NAME=flightly,DB_IP_TYPE=PRIVATE
```

If you prefer a direct DATABASE_URL instead of the connector, replace the last line with:

```
  --set-env-vars DATABASE_URL='postgresql+psycopg2://<USER>:<PASS>@<HOST>:5432/flightly'
```

Cloud Run will build the service and give you a URL like `https://flightly-api-xxxx-uc.a.run.app`.

## 4) Verify

- Health check: `GET https://<cloud-run-url>/health`
- API: `GET https://<cloud-run-url>/api/ping`

Tables are auto-created on first start. For migrations/Alembic in the future, run them in Cloud Build or as an init step.

## 5) Frontend configuration

In the frontend `.env` (Vite):

```
VITE_API_BASE_URL=https://<cloud-run-url>
```

Rebuild and deploy your frontend (e.g., Firebase Hosting, Netlify, Vercel, or Cloud Run static).

## Notes

- The backend also supports SQLite for local dev.
- For private IP access to Cloud SQL from Cloud Run, ensure a Serverless VPC Connector and proper egress settings, or use public IP with authorized networks or IAM DB auth.
- Consider adding Alembic migrations for production environments.
