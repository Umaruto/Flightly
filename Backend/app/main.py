from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.router import api_router
from .core.database import Base, engine
from .core.settings import settings
# Import models so they are registered with SQLAlchemy's Base
from . import models  # noqa: F401

app = FastAPI(title="Flight Ticketing API", version="0.1.0")

# Create tables on startup for early development (replace with Alembic later)
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

"""CORS for local dev: allow frontend at Vite dev server and file:// origins"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_origin_regex=settings.CORS_ALLOW_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"]) 
def health_check(): 
    return {"status": "ok"}

# Mount versioned API router
app.include_router(api_router, prefix="/api")
