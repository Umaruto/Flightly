from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.settings import settings
from .api.router import api_router
from .core.database import Base, engine
# Import models so they are registered with SQLAlchemy's Base
from . import models  # noqa: F401

app = FastAPI(title="Flight Ticketing API", version="0.1.0")

# Create tables on startup for early development (replace with Alembic later)
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

"""CORS configuration: allow local dev origins and optional DEPLOY_ORIGIN from env"""
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
deploy_origin = getattr(settings, "DEPLOY_ORIGIN", None)
if deploy_origin:
    origins.append(deploy_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"]) 
def health_check(): 
    return {"status": "ok"}

# Mount versioned API router
app.include_router(api_router, prefix="/api")
