"""
Quick DB inspector

Lists tables, columns, and row counts using the same DATABASE_URL as the app.
Works for SQLite (default dev) or PostgreSQL.
"""

from __future__ import annotations

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy import inspect as sqla_inspect

try:
    # Reuse app settings to read DATABASE_URL and .env
    from app.core.settings import settings
except Exception:
    # Fallback: default used by app
    class _Settings:
        DATABASE_URL: str | None = None
    settings = _Settings()  # type: ignore


def get_engine() -> Engine:
    url = settings.DATABASE_URL or "sqlite:///./dev.db"
    kwargs = {}
    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
    engine = create_engine(url, **kwargs)
    return engine


def main() -> None:
    engine = get_engine()
    url = str(engine.url)
    print(f"Using DATABASE_URL: {url}")
    insp = sqla_inspect(engine)
    tables = insp.get_table_names()
    if not tables:
        print("No tables found. Have you started the app to create tables? (They are created on startup)")
        return
    print(f"\nTables ({len(tables)}): {', '.join(tables)}\n")
    with engine.connect() as conn:
        for t in tables:
            cols = [c["name"] + ":" + str(c.get("type")) for c in insp.get_columns(t)]
            print(f"- {t}")
            print(f"  columns: {', '.join(cols)}")
            try:
                count = conn.execute(text(f"SELECT COUNT(*) FROM {t}"))
                n = count.scalar() or 0
                print(f"  rows: {n}")
            except Exception as e:
                print(f"  rows: <error reading count: {e}>")
            print("")


if __name__ == "__main__":
    main()
