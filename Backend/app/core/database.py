import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .settings import settings

# Fallback to local SQLite for early dev if DATABASE_URL not set
DATABASE_URL = settings.DATABASE_URL or None

# For SQLite need check_same_thread=False if used in single-threaded apps
def _create_engine():
    # 1) Explicit DATABASE_URL provided
    if DATABASE_URL:
        return create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
        )

    # 2) GCP Cloud SQL (no DATABASE_URL) — use Cloud SQL Python Connector if env present
    conn_name = os.getenv("CLOUD_SQL_CONNECTION_NAME")
    db_user = os.getenv("DB_USER")
    db_pass = os.getenv("DB_PASS")
    db_name = os.getenv("DB_NAME")
    if conn_name and db_user and db_name:
        try:
            from google.cloud.sql.connector import Connector, IPTypes  # type: ignore
            import sqlalchemy

            ip_type = os.getenv("DB_IP_TYPE", "PUBLIC").upper()

            connector = Connector()

            def getconn():
                return connector.connect(
                    conn_name,
                    "pg8000",
                    user=db_user,
                    password=db_pass,
                    db=db_name,
                    ip_type=IPTypes.PRIVATE if ip_type == "PRIVATE" else IPTypes.PUBLIC,
                )

            return sqlalchemy.create_engine("postgresql+pg8000://", creator=getconn)
        except Exception:
            # Fall back to local SQLite if connector isn't available
            pass

    # 3) Default local SQLite
    return create_engine(
        "sqlite:///./dev.db",
        connect_args={"check_same_thread": False},
    )


engine = _create_engine()

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
