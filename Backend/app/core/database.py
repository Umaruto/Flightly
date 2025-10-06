from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .settings import settings

# Fallback to local SQLite for early dev if DATABASE_URL not set
DATABASE_URL = settings.DATABASE_URL or "sqlite:///./dev.db"

# For SQLite need check_same_thread=False if used in single-threaded apps
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
from typing import Generator

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
